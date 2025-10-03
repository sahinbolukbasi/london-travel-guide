// ===========================
// Google Maps Configuration
// ===========================

let map;
let markers = [];
let activeCategory = 'all';
let locationsCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache
let retryCount = 0;
const MAX_RETRIES = 3;

// Londra merkez koordinatları
const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };

// Session ve cookie yönetimi
const SessionManager = {
    set: (key, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
    },
    
    get: (key) => {
        const name = key + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                try {
                    return JSON.parse(c.substring(name.length, c.length));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    },
    
    remove: (key) => {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    },
    
    // Kullanıcı tercihlerini kaydet
    saveUserPreferences: (prefs) => {
        SessionManager.set('userPrefs', prefs, 30); // 30 gün
    },
    
    // Kullanıcı tercihlerini yükle
    loadUserPreferences: () => {
        return SessionManager.get('userPrefs') || {
            lastActiveCategory: 'all',
            mapZoom: 11,
            mapCenter: LONDON_CENTER,
            visitedLocations: [],
            favoriteLocations: []
        };
    }
};

// Marker kategorileri ve renkleri (Font Awesome ikonları ile eşleştirildi)
const CATEGORIES = {
    museums: { color: '#e74c3c', icon: 'fa-landmark' },
    restaurants: { color: '#f39c12', icon: 'fa-utensils' },
    attractions: { color: '#3498db', icon: 'fa-star' },
    parks: { color: '#27ae60', icon: 'fa-tree' },
    shopping: { color: '#9b59b6', icon: 'fa-shopping-bag' },
    entertainment: { color: '#e91e63', icon: 'fa-music' },
    cafes: { color: '#795548', icon: 'fa-coffee' }
};

// Lokasyonlar - locations.json dosyasından yüklenecek
let locations = [];

// ===========================
// Loading Message Update
// ===========================

function updateLoadingMessage(message) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

// ===========================
// Map Initialization
// ===========================

async function initMap() {
    try {
        // Kullanıcı tercihlerini yükle
        const userPrefs = SessionManager.loadUserPreferences();
        
        updateLoadingMessage('Lokasyonlar yükleniyor...');
        
        // Lokasyonları JSON'dan yükle
        await loadLocations();
        
        if (locations.length === 0) {
            throw new Error('Lokasyon verisi bulunamadı');
        }

        // Loading mesajını güncelle
        updateLoadingMessage('Harita oluşturuluyor...');
        
        // Harita oluştur - kullanıcı tercihlerini kullan
        map = new google.maps.Map(document.getElementById('map'), {
            center: userPrefs.mapCenter || LONDON_CENTER,
            zoom: userPrefs.mapZoom || 11,
            styles: getMapStyles(),
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            gestureHandling: 'greedy'
        });
        
        // Harita değişikliklerini dinle ve kaydet
        map.addListener('zoom_changed', () => {
            const prefs = SessionManager.loadUserPreferences();
            prefs.mapZoom = map.getZoom();
            SessionManager.saveUserPreferences(prefs);
        });
        
        map.addListener('center_changed', () => {
            const prefs = SessionManager.loadUserPreferences();
            prefs.mapCenter = {
                lat: map.getCenter().lat(),
                lng: map.getCenter().lng()
            };
            SessionManager.saveUserPreferences(prefs);
        });

        // Loading mesajını güncelle
        updateLoadingMessage('Marker\'lar ekleniyor...');
        
        // Marker'ları ekle
        createMarkers();
        
        // Kullanıcının son aktif kategorisini uygula
        if (userPrefs.lastActiveCategory && userPrefs.lastActiveCategory !== 'all') {
            setTimeout(() => {
                filterMarkers(userPrefs.lastActiveCategory);
                const activeBtn = document.querySelector(`[data-category="${userPrefs.lastActiveCategory}"]`);
                if (activeBtn) {
                    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                    activeBtn.classList.add('active');
                }
            }, 500);
        }

        // Filter butonlarını dinle (DOM hazır olduktan sonra)
        setTimeout(() => {
            initFilterButtons();
        }, 1000);

        // Loading overlay'i gizle
        const loadingOverlay = document.getElementById('mapLoading');
        if (loadingOverlay) {
            updateLoadingMessage('Harita tamamlanıyor...');
            
            // Harita tiles yüklenene kadar bekle
            google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
                hideLoadingOverlay(loadingOverlay);
            });
            
            // Maksimum 5 saniye bekle, sonra zorla gizle
            setTimeout(() => {
                if (loadingOverlay.style.display !== 'none') {
                    hideLoadingOverlay(loadingOverlay);
                }
            }, 5000);
        }

        trackEvent('Map', 'loaded', 'Custom map loaded successfully');
        console.log('✅ Harita başarıyla yüklendi. Filtreler başlatılıyor...');
        
    } catch (error) {
        console.error('❌ Harita başlatılırken hata:', error);
        showErrorMessage('Harita yüklenemedi. Sayfa yenileniyor...');
        
        // 3 saniye sonra sayfayı yenile
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}

// ===========================
// Load Locations from JSON
// ===========================

async function loadLocations() {
    // Cache kontrolü
    const now = Date.now();
    if (locationsCache && lastCacheTime && (now - lastCacheTime) < CACHE_DURATION) {
        locations = locationsCache;
        console.log(`✅ Cache'den ${locations.length} lokasyon yüklendi`);
        return;
    }
    
    try {
        updateLoadingMessage('Lokasyonlar yükleniyor...');
        
        // Cache busting için timestamp ekle
        const timestamp = new Date().getTime();
        const response = await fetch(`locations.json?v=${timestamp}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.locations || !Array.isArray(data.locations)) {
            throw new Error('Geçersiz veri formatı');
        }
        
        locations = data.locations;
        locationsCache = locations;
        lastCacheTime = now;
        retryCount = 0;
        
        console.log(`✅ ${locations.length} lokasyon başarıyla yüklendi`);
        updateLoadingMessage(`${locations.length} lokasyon yüklendi`);
        
    } catch (error) {
        console.error('❌ Lokasyonlar yüklenirken hata:', error);
        
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
            updateLoadingMessage(`Yeniden deneniyor... (${retryCount}/${MAX_RETRIES})`);
            console.log(`🔄 Yeniden deneme ${retryCount}/${MAX_RETRIES}`);
            
            // Exponential backoff ile yeniden dene
            setTimeout(() => {
                loadLocations();
            }, Math.pow(2, retryCount) * 1000);
            return;
        }
        
        // Maksimum deneme sayısına ulaşıldı
        updateLoadingMessage('Lokasyonlar yüklenemedi. Sayfa yenileniyor...');
        showErrorMessage('Lokasyon verileri yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
        
        // Fallback: boş array kullan
        locations = [];
        
        // 5 saniye sonra sayfayı yenile
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
}

// ===========================
// Custom Marker Icon Creation
// ===========================

function createCustomMarkerIcon(iconClass, color) {
    // Basit SVG pin marker
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
            <!-- Pin gölgesi -->
            <ellipse cx="16" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
            <!-- Pin gövdesi -->
            <path d="M16 0 C7.2 0 0 7.2 0 16 C0 28 16 44 16 44 S32 28 32 16 C32 7.2 24.8 0 16 0 Z" 
                  fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
            <!-- İç daire (ikon için arka plan) -->
            <circle cx="16" cy="14" r="9" fill="rgba(255,255,255,0.9)"/>
            <!-- İkon emoji -->
            <text x="16" y="19" font-size="12" text-anchor="middle" fill="${color}">${getIconEmoji(iconClass)}</text>
        </svg>
    `;
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// İkon emoji mapping
function getIconEmoji(iconClass) {
    const emojiMap = {
        'fa-landmark': '🏛',      // Müzeler
        'fa-utensils': '🍽',      // Restoranlar
        'fa-star': '⭐',          // Turistik
        'fa-tree': '🌳',          // Parklar
        'fa-shopping-bag': '🛍',  // Alışveriş
        'fa-music': '🎵',         // Eğlence
        'fa-coffee': '☕'          // Kahveciler
    };
    return emojiMap[iconClass] || '📍';
}

// ===========================
// Marker Creation
// ===========================

function createMarkers() {
    locations.forEach((location, index) => {
        // Font Awesome ikonu ile özel marker oluştur
        const iconUrl = createCustomMarkerIcon(
            CATEGORIES[location.category].icon,
            CATEGORIES[location.category].color
        );

        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.name,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(32, 44),
                anchor: new google.maps.Point(16, 44)
            },
            optimized: true
        });

        // Category'yi marker'a özel property olarak ekle
        marker.category = location.category;

        // Info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 15px; max-width: 280px; font-family: 'Space Grotesk', sans-serif;">
                    <h3 style="margin: 0 0 12px 0; color: ${CATEGORIES[location.category].color}; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                        <i class="fas ${CATEGORIES[location.category].icon}" style="font-size: 1.3rem;"></i>
                        ${location.name}
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 0.95rem; line-height: 1.6; color: #333;">
                        ${location.description}
                    </p>
                    <div style="font-size: 0.9rem; color: #666; line-height: 1.8; border-top: 1px solid #eee; padding-top: 10px;">
                        ${location.info}
                    </div>
                </div>
            `
        });

        marker.addListener('click', () => {
            // Diğer info window'ları kapat
            markers.forEach(m => {
                if (m.infoWindow) m.infoWindow.close();
            });
            
            infoWindow.open(map, marker);
            
            // Ziyaret edilen lokasyonları kaydet
            const userPrefs = SessionManager.loadUserPreferences();
            if (!userPrefs.visitedLocations.includes(location.name)) {
                userPrefs.visitedLocations.push(location.name);
                SessionManager.saveUserPreferences(userPrefs);
            }
            
            trackEvent('Map', 'marker_click', location.name);
        });

        marker.infoWindow = infoWindow;
        markers.push(marker);
    });
}

// ===========================
// Filter Functionality
// ===========================

function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log(`🎛️ ${filterButtons.length} filtre butonu bulundu ve bağlanıyor...`);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            console.log(`🖱️ Butona tıklandı: ${category}`);
            
            // Aktif butonu güncelle
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Marker'ları filtrele
            filterMarkers(category);
            
            trackEvent('Map', 'filter', category);
        });
    });
    
    console.log('✅ Tüm filtre butonları event listener ile bağlandı');
}

function filterMarkers(category) {
    console.log(`🔍 Filtreleme başladı: ${category}`);
    console.log(`📊 Toplam marker sayısı: ${markers.length}`);
    
    activeCategory = category;
    
    // Kullanıcı tercihlerini güncelle
    const userPrefs = SessionManager.loadUserPreferences();
    userPrefs.lastActiveCategory = category;
    SessionManager.saveUserPreferences(userPrefs);
    
    let visibleCount = 0;
    let hiddenCount = 0;
    
    markers.forEach((marker, index) => {
        if (category === 'all') {
            marker.setVisible(true);
            visibleCount++;
        } else {
            const markerCategory = marker.category;
            const isVisible = markerCategory === category;
            marker.setVisible(isVisible);
            
            if (isVisible) {
                visibleCount++;
            } else {
                hiddenCount++;
            }
            
            // İlk 3 marker için debug
            if (index < 3) {
                console.log(`  Marker ${index}: ${marker.title} - Kategori: ${markerCategory} - Görünür: ${isVisible}`);
            }
        }
    });
    
    console.log(`✅ Sonuç: ${visibleCount} görünür, ${hiddenCount} gizli`);
    
    // Filtreleme sonucunu kullanıcıya göster
    showFilterResult(category, visibleCount);
}

// ===========================
// Map Styles (Retro Theme)
// ===========================

function getMapStyles() {
    return [
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#c9e6f2" }]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": "#e5e5e5" }]
        }
    ];
}

// ===========================
// Analytics (from existing script.js)
// ===========================

function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
    console.log('Event tracked:', category, action, label);
}

// ===========================
// Helper Functions
// ===========================

// Loading overlay'i gizle
function hideLoadingOverlay(loadingOverlay) {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }
}

// Hata mesajı göster
function showErrorMessage(message) {
    // Mevcut error container'ı kontrol et
    let errorContainer = document.getElementById('errorContainer');
    
    if (!errorContainer) {
        // Error container oluştur
        errorContainer = document.createElement('div');
        errorContainer.id = 'errorContainer';
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 400px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.9rem;
            line-height: 1.4;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(errorContainer);
        
        // CSS animasyon ekle
        if (!document.getElementById('errorAnimationCSS')) {
            const style = document.createElement('style');
            style.id = 'errorAnimationCSS';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    errorContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 5 saniye sonra gizle
    setTimeout(() => {
        if (errorContainer && errorContainer.parentNode) {
            errorContainer.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (errorContainer.parentNode) {
                    errorContainer.parentNode.removeChild(errorContainer);
                }
            }, 300);
        }
    }, 5000);
}

// Filtreleme sonucunu göster
function showFilterResult(category, count) {
    // Mevcut result container'ı kontrol et
    let resultContainer = document.getElementById('filterResultContainer');
    
    if (!resultContainer) {
        // Result container oluştur
        resultContainer = document.createElement('div');
        resultContainer.id = 'filterResultContainer';
        resultContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #2c3e50;
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.85rem;
            font-weight: 500;
            animation: slideInLeft 0.3s ease;
        `;
        document.body.appendChild(resultContainer);
        
        // CSS animasyon ekle
        if (!document.getElementById('resultAnimationCSS')) {
            const style = document.createElement('style');
            style.id = 'resultAnimationCSS';
            style.textContent = `
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const categoryNames = {
        'all': 'Tüm Lokasyonlar',
        'museums': 'Müzeler',
        'restaurants': 'Restoranlar',
        'attractions': 'Turistik Yerler',
        'parks': 'Parklar',
        'shopping': 'Alışveriş',
        'entertainment': 'Eğlence',
        'cafes': 'Kahveciler'
    };
    
    resultContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-filter" style="font-size: 1rem;"></i>
            <span>${categoryNames[category] || category}: ${count} lokasyon</span>
        </div>
    `;
    
    // 3 saniye sonra gizle
    setTimeout(() => {
        if (resultContainer && resultContainer.parentNode) {
            resultContainer.style.animation = 'slideInLeft 0.3s ease reverse';
            setTimeout(() => {
                if (resultContainer.parentNode) {
                    resultContainer.parentNode.removeChild(resultContainer);
                }
            }, 300);
        }
    }, 3000);
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
window.addEventListener('load', () => {
    // Service Worker kaydı (cache yönetimi için)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker kaydı başarısız (normal)');
        });
    }
    
    // Sayfa görünürlük değişikliklerini dinle
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Sayfa tekrar görünür olduğunda cache'i kontrol et
            const now = Date.now();
            if (lastCacheTime && (now - lastCacheTime) > CACHE_DURATION) {
                console.log('🔄 Cache süresi doldu, yeniden yüklenecek');
                locationsCache = null;
                lastCacheTime = null;
            }
        }
    });
});
