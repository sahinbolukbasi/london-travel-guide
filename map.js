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
            favoriteLocations: [],
            locationListCollapsed: false
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

// Location List Panel variables
let isLocationListCollapsed = false;
let filteredLocations = [];
let activeLocationItem = null;
let currentInfoWindow = null;

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
            initLocationListPanel();
            updateFavoritesCount();
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
        
        // Update location list if panel is initialized
        setTimeout(() => {
            updateLocationList();
        }, 100);
        
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
// Enhanced Info Window Creation
// ===========================

function createEnhancedInfoWindow(location) {
    const categoryInfo = CATEGORIES[location.category];
    const categoryNames = {
        'museums': 'Müze',
        'restaurants': 'Restoran',
        'attractions': 'Turistik Yer',
        'parks': 'Park',
        'shopping': 'Alışveriş Merkezi',
        'entertainment': 'Eğlence Merkezi',
        'cafes': 'Kafe'
    };

    // Parse info for better display
    const infoLines = location.info.split('<br>');
    let address = '', price = '', hours = '', transport = '';
    
    infoLines.forEach(line => {
        if (line.includes('📍')) address = line.replace('📍 ', '');
        if (line.includes('🎫')) price = line.replace('🎫 ', '');
        if (line.includes('⏰')) hours = line.replace('⏰ ', '');
        if (line.includes('🚇')) transport = line.replace('🚇 ', '');
    });

    return `
        <div class="enhanced-info-window">
            <div class="info-header">
                <div class="header-content">
                    <div class="category-badge" style="background: ${categoryInfo.color};">
                        <i class="fas ${categoryInfo.icon}"></i>
                        <span>${categoryNames[location.category]}</span>
                    </div>
                    <h3 class="location-title">${location.name}</h3>
                </div>
                <button class="custom-close-btn" id="closeInfoWindowBtn" aria-label="Kapat">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="info-content">
                <p class="location-description">${location.description}</p>
                
                <div class="info-details">
                    ${address ? `
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${address}</span>
                        </div>
                    ` : ''}
                    
                    ${price ? `
                        <div class="detail-item">
                            <i class="fas fa-ticket-alt"></i>
                            <span>${price}</span>
                        </div>
                    ` : ''}
                    
                    ${hours ? `
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${hours}</span>
                        </div>
                    ` : ''}
                    
                    ${transport ? `
                        <div class="detail-item">
                            <i class="fas fa-subway"></i>
                            <span>${transport}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="info-actions">
                <button class="action-btn directions-btn" id="directionsBtn">
                    <i class="fas fa-route"></i>
                    Yol Tarifi
                </button>
                <button class="action-btn share-btn" id="shareBtn">
                    <i class="fas fa-share-alt"></i>
                    Paylaş
                </button>
                <button class="action-btn favorite-btn" id="favoriteBtn">
                    <i class="fas fa-heart"></i>
                    ${getFavoriteButtonText(location.name)}
                </button>
            </div>
        </div>
    `;
}

// Helper function for favorite button text
function getFavoriteButtonText(locationName) {
    const userPrefs = SessionManager.loadUserPreferences();
    const favorites = userPrefs.favoriteLocations || [];
    return favorites.includes(locationName) ? 'Favorilerden Çıkar' : 'Favorile';
}

// ===========================
// Info Window Action Functions
// ===========================

function getDirections(name, lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
    trackEvent('InfoWindow', 'directions', name);
}

function shareLocation(name, lat, lng) {
    const url = `https://www.google.com/maps/place/${lat},${lng}`;
    const text = `${name} - Londra Gezi Rehberi`;
    
    if (navigator.share) {
        navigator.share({
            title: text,
            text: `${name} konumunu keşfedin!`,
            url: url
        });
    } else {
        navigator.clipboard.writeText(`${text}: ${url}`).then(() => {
            alert('Konum linki kopyalandı!');
        });
    }
    trackEvent('InfoWindow', 'share', name);
}

function toggleFavorite(name) {
    const userPrefs = SessionManager.loadUserPreferences();
    const favorites = userPrefs.favoriteLocations || [];
    const wasRemoved = favorites.includes(name);
    
    if (wasRemoved) {
        userPrefs.favoriteLocations = favorites.filter(fav => fav !== name);
        showFavoriteNotification(`${name} favorilerden çıkarıldı!`, 'removed');
    } else {
        userPrefs.favoriteLocations = [...favorites, name];
        showFavoriteNotification(`${name} favorilere eklendi!`, 'added');
    }
    
    SessionManager.saveUserPreferences(userPrefs);
    updateFavoritesCount();
    updateFavoriteButtonInInfoWindow(name, userPrefs.favoriteLocations.includes(name));
    
    // If currently viewing favorites and item was removed, update map instantly
    if (wasRemoved && activeCategory === 'favorites') {
        updateMapAfterFavoriteRemoval();
    }
    
    trackEvent('InfoWindow', 'favorite_toggle', name);
}

// Close current info window function
function closeCurrentInfoWindow() {
    if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null;
        removeMapClickListener();
    }
}

// Map click listener for closing info windows
let mapClickListener = null;

function addMapClickListener() {
    if (mapClickListener) {
        google.maps.event.removeListener(mapClickListener);
    }
    
    mapClickListener = map.addListener('click', function(event) {
        // Check if click was on a marker
        if (event.placeId || event.latLng) {
            // Small delay to prevent immediate closing when clicking marker
            setTimeout(() => {
                // Check if the click was outside the info window
                const infoWindowElement = document.querySelector('.gm-style-iw-c');
                if (infoWindowElement && currentInfoWindow) {
                    closeCurrentInfoWindow();
                }
            }, 50);
        }
    });
}

function removeMapClickListener() {
    if (mapClickListener) {
        google.maps.event.removeListener(mapClickListener);
        mapClickListener = null;
    }
}

// Attach button events to info window - called when DOM is ready
function attachInfoWindowButtonEvents(location, infoWindow) {
    console.log('🔧 Attaching button events for:', location.name);
    
    // Close button - by ID
    const closeBtn = document.getElementById('closeInfoWindowBtn');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔴 Close button clicked - closing info window');
            if (infoWindow) {
                infoWindow.close();
                currentInfoWindow = null;
                removeMapClickListener();
            }
        };
        console.log('✅ Close button attached');
    } else {
        console.warn('❌ Close button not found in DOM');
    }
    
    // Directions button - by ID
    const directionsBtn = document.getElementById('directionsBtn');
    if (directionsBtn) {
        directionsBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🗺️ Opening directions for:', location.name);
            getDirections(location.name, location.position.lat, location.position.lng);
        };
        console.log('✅ Directions button attached');
    }
    
    // Share button - by ID
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📤 Sharing location:', location.name);
            shareLocation(location.name, location.position.lat, location.position.lng);
        };
        console.log('✅ Share button attached');
    }
    
    // Favorite button - by ID
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❤️ Toggling favorite:', location.name);
            toggleFavorite(location.name);
        };
        console.log('✅ Favorite button attached');
    }
    
    console.log('✅ All button events attached successfully for:', location.name);
}

// Favorites management functions
function updateFavoritesCount() {
    const userPrefs = SessionManager.loadUserPreferences();
    const favoritesCount = (userPrefs.favoriteLocations || []).length;
    const countElement = document.getElementById('favoritesCount');
    const favoritesBtn = document.getElementById('favoritesBtn');
    
    if (countElement) {
        countElement.textContent = favoritesCount;
        if (favoritesCount === 0) {
            countElement.classList.add('zero');
        } else {
            countElement.classList.remove('zero');
        }
    }
    
    // Hide/show favorites button based on count
    if (favoritesBtn) {
        if (favoritesCount === 0) {
            favoritesBtn.style.display = 'none';
        } else {
            favoritesBtn.style.display = 'flex';
        }
    }
}

function showFavoriteNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `favorite-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'added' ? 'fa-heart' : 'fa-heart-broken'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'added' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateFavoriteButtonInInfoWindow(name, isFavorite) {
    const favoriteBtn = document.querySelector('.favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.innerHTML = `
            <i class="fas fa-heart"></i>
            ${isFavorite ? 'Favorilerden Çıkar' : 'Favorile'}
        `;
        favoriteBtn.style.background = isFavorite ? '#ff6b6b' : '#e8e8e8';
        favoriteBtn.style.color = isFavorite ? 'white' : 'var(--text-dark)';
    }
}

function showFavoritesOnly() {
    const userPrefs = SessionManager.loadUserPreferences();
    const favorites = userPrefs.favoriteLocations || [];
    
    if (favorites.length === 0) {
        showFavoriteNotification('Henüz favori lokasyon eklenmemiş!', 'removed');
        return;
    }
    
    // Filter markers to show only favorites
    let visibleCount = 0;
    markers.forEach(marker => {
        const isVisible = favorites.includes(marker.getTitle());
        marker.setVisible(isVisible);
        if (isVisible) visibleCount++;
    });
    
    // Focus map on favorites
    focusMapOnFilteredLocations('favorites');
    
    // Update location list
    updateLocationListOnFilter();
    
    // Show email option if there are favorites
    if (favorites.length > 0) {
        showEmailFavoritesOption();
    }
    
    console.log(`✅ Showing ${visibleCount} favorite locations`);
}

function showEmailFavoritesOption() {
    const emailBtn = document.createElement('button');
    emailBtn.className = 'email-favorites-btn';
    emailBtn.innerHTML = `
        <i class="fas fa-envelope"></i>
        Favorileri E-posta ile Gönder
    `;
    
    emailBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        animation: slideInUp 0.3s ease;
    `;
    
    emailBtn.addEventListener('click', () => {
        openEmailModal();
        document.body.removeChild(emailBtn);
    });
    
    emailBtn.addEventListener('mouseenter', () => {
        emailBtn.style.transform = 'translateY(-2px)';
        emailBtn.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
    });
    
    emailBtn.addEventListener('mouseleave', () => {
        emailBtn.style.transform = 'translateY(0)';
        emailBtn.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
    });
    
    document.body.appendChild(emailBtn);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (emailBtn.parentNode) {
            emailBtn.style.animation = 'slideInUp 0.3s ease reverse';
            setTimeout(() => {
                if (emailBtn.parentNode) {
                    document.body.removeChild(emailBtn);
                }
            }, 300);
        }
    }, 10000);
}

function updateMapAfterFavoriteRemoval() {
    const userPrefs = SessionManager.loadUserPreferences();
    const favorites = userPrefs.favoriteLocations || [];
    
    // Close current info window since the location was removed from favorites
    closeCurrentInfoWindow();
    
    if (favorites.length === 0) {
        // No favorites left, immediately switch to "Tümü Göster"
        showFavoriteNotification('Tüm favoriler temizlendi! Tüm lokasyonlar gösteriliyor.', 'removed');
        
        // Immediately reset to "Tümü Göster" filter
        const allBtn = document.querySelector('[data-category="all"]');
        const favBtn = document.querySelector('[data-category="favorites"]');
        
        if (allBtn) {
            // Remove active class from favorites button
            if (favBtn) {
                favBtn.classList.remove('active');
            }
            
            // Activate "Tümü Göster" button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            allBtn.classList.add('active');
            
            // Update active category and show all markers
            activeCategory = 'all';
            filterMarkers('all');
            
            console.log('✅ Automatically switched to "Tümü Göster" after removing last favorite');
        }
    } else {
        // Still have favorites, refresh the favorites view
        showFavoritesOnly();
    }
    
    // Update location list
    updateLocationListOnFilter();
}

// Make functions globally accessible for info window buttons
if (typeof window !== 'undefined') {
    window.getDirections = getDirections;
    window.shareLocation = shareLocation;
    window.toggleFavorite = toggleFavorite;
    window.closeCurrentInfoWindow = closeCurrentInfoWindow;
    window.showFavoritesOnly = showFavoritesOnly;
    
    console.log('✅ Global functions registered for info window');
}

// Ensure close function is available immediately
if (typeof window.closeCurrentInfoWindow === 'undefined') {
    window.closeCurrentInfoWindow = function() {
        if (currentInfoWindow) {
            currentInfoWindow.close();
            currentInfoWindow = null;
            removeMapClickListener();
        }
    };
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

        // Info window with enhanced design
        // Dynamic width based on screen size
        const screenWidth = window.innerWidth;
        let maxWidth = 350;
        
        if (screenWidth <= 480) {
            // Very small screens: max 260px or 80% of screen
            maxWidth = Math.min(260, Math.floor(screenWidth * 0.8));
        } else if (screenWidth <= 768) {
            // Mobile screens: max 280px or 75% of screen
            maxWidth = Math.min(280, Math.floor(screenWidth * 0.75));
        }
        
        const infoWindow = new google.maps.InfoWindow({
            content: createEnhancedInfoWindow(location),
            disableAutoPan: false,
            maxWidth: maxWidth,
            pixelOffset: new google.maps.Size(0, -10)
        });

        // Add close event listener to info window
        infoWindow.addListener('closeclick', () => {
            currentInfoWindow = null;
            removeMapClickListener();
        });
        
        // Add domready listener to attach button events
        infoWindow.addListener('domready', () => {
            attachInfoWindowButtonEvents(location, infoWindow);
        });

        marker.addListener('click', () => {
            // Diğer info window'ları kapat
            markers.forEach(m => {
                if (m.infoWindow) m.infoWindow.close();
            });
            
            infoWindow.open(map, marker);
            currentInfoWindow = infoWindow;
            
            // Add click listener to map to close info window when clicking outside
            setTimeout(() => {
                addMapClickListener();
            }, 100);
            
            // Update location list selection
            updateLocationListSelection(location.name);
            
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
    
    if (category === 'favorites') {
        // Handle favorites filter
        showFavoritesOnly();
        return;
    }
    
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
    
    // Update location list
    updateLocationListOnFilter();
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

// ===========================
// Location List Panel Functions
// ===========================

function initLocationListPanel() {
    const panel = document.getElementById('locationListPanel');
    const toggle = document.getElementById('locationListToggle');
    const searchInput = document.getElementById('locationSearch');
    
    if (!panel || !toggle) {
        console.warn('Location list panel elements not found');
        return;
    }
    
    // Load saved panel state
    const userPrefs = SessionManager.loadUserPreferences();
    isLocationListCollapsed = userPrefs.locationListCollapsed || false;
    
    // Apply saved state
    if (isLocationListCollapsed) {
        panel.classList.add('collapsed');
        const toggleIcon = document.getElementById('toggleIcon');
        if (toggleIcon) {
            toggleIcon.className = 'fas fa-chevron-down';
        }
    }
    
    // Show loading state initially
    showLocationListLoading();
    
    // Initialize panel state (will be updated when locations are loaded)
    if (locations.length > 0) {
        updateLocationList();
    }
    
    // Toggle panel collapse/expand
    toggle.addEventListener('click', toggleLocationListPanel);
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleLocationSearch);
    }
    
    console.log('✅ Location list panel initialized');
}

function toggleLocationListPanel() {
    const panel = document.getElementById('locationListPanel');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (!panel || !toggleIcon) return;
    
    isLocationListCollapsed = !isLocationListCollapsed;
    
    if (isLocationListCollapsed) {
        panel.classList.add('collapsed');
        toggleIcon.className = 'fas fa-chevron-down';
    } else {
        panel.classList.remove('collapsed');
        toggleIcon.className = 'fas fa-chevron-up';
    }
    
    // Save user preference
    const userPrefs = SessionManager.loadUserPreferences();
    userPrefs.locationListCollapsed = isLocationListCollapsed;
    SessionManager.saveUserPreferences(userPrefs);
    
    trackEvent('LocationList', 'toggle', isLocationListCollapsed ? 'collapsed' : 'expanded');
}

function updateLocationList() {
    const listContainer = document.getElementById('locationListItems');
    const countElement = document.getElementById('locationCount');
    
    if (!listContainer || !countElement) return;
    
    // Get currently filtered locations based on active category
    filteredLocations = activeCategory === 'all' 
        ? locations 
        : locations.filter(location => location.category === activeCategory);
    
    // Update count
    countElement.textContent = filteredLocations.length;
    
    // Clear existing items
    listContainer.innerHTML = '';
    
    if (filteredLocations.length === 0) {
        listContainer.innerHTML = `
            <div class="location-list-empty">
                <i class="fas fa-map-marker-alt"></i>
                <p>Bu kategoride lokasyon bulunamadı</p>
            </div>
        `;
        return;
    }
    
    // Create location items
    filteredLocations.forEach((location, index) => {
        const locationItem = createLocationItem(location, index);
        listContainer.appendChild(locationItem);
    });
}

function createLocationItem(location, index) {
    const item = document.createElement('div');
    item.className = 'location-item';
    item.dataset.locationIndex = index;
    item.dataset.locationName = location.name;
    
    // Get category info
    const categoryInfo = CATEGORIES[location.category];
    const categoryNames = {
        'museums': 'Müze',
        'restaurants': 'Restoran',
        'attractions': 'Turistik Yer',
        'parks': 'Park',
        'shopping': 'Alışveriş',
        'entertainment': 'Eğlence',
        'cafes': 'Kahveci'
    };
    
    item.innerHTML = `
        <div class="location-icon ${location.category}">
            ${getIconEmoji(categoryInfo.icon)}
        </div>
        <div class="location-info">
            <div class="location-name">${location.name}</div>
            <div class="location-category">${categoryNames[location.category] || location.category}</div>
        </div>
    `;
    
    // Add click handler
    item.addEventListener('click', () => selectLocation(location, item));
    
    return item;
}

function selectLocation(location, itemElement) {
    // Remove active class from previous item
    if (activeLocationItem) {
        activeLocationItem.classList.remove('active');
    }
    
    // Add active class to current item
    itemElement.classList.add('active');
    activeLocationItem = itemElement;
    
    // Find corresponding marker
    const marker = markers.find(m => m.getTitle() === location.name);
    
    if (marker && map) {
        // Close all info windows
        markers.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
        });
        
        // Center map on location with smooth animation
        map.panTo(location.position);
        
        // Set appropriate zoom level
        const currentZoom = map.getZoom();
        if (currentZoom < 15) {
            map.setZoom(15);
        }
        
        // Open info window after a short delay
        setTimeout(() => {
            if (marker.infoWindow) {
                marker.infoWindow.open(map, marker);
                currentInfoWindow = marker.infoWindow;
                
                // Add event listeners after opening
                setTimeout(() => {
                    attachInfoWindowButtonEvents(location, marker.infoWindow);
                    addMapClickListener();
                }, 200);
            }
        }, 500);
        
        // Track selection
        trackEvent('LocationList', 'location_selected', location.name);
        
        // Update visited locations
        const userPrefs = SessionManager.loadUserPreferences();
        if (!userPrefs.visitedLocations.includes(location.name)) {
            userPrefs.visitedLocations.push(location.name);
            SessionManager.saveUserPreferences(userPrefs);
        }
    }
}

function handleLocationSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const listContainer = document.getElementById('locationListItems');
    
    if (!listContainer) return;
    
    const locationItems = listContainer.querySelectorAll('.location-item');
    let visibleCount = 0;
    
    locationItems.forEach(item => {
        const locationName = item.dataset.locationName.toLowerCase();
        const isVisible = locationName.includes(searchTerm);
        
        item.style.display = isVisible ? 'flex' : 'none';
        if (isVisible) visibleCount++;
    });
    
    // Update count
    const countElement = document.getElementById('locationCount');
    if (countElement) {
        countElement.textContent = visibleCount;
    }
    
    // Show empty state if no results
    if (visibleCount === 0 && searchTerm) {
        listContainer.innerHTML = `
            <div class="location-list-empty">
                <i class="fas fa-search"></i>
                <p>"${searchTerm}" için sonuç bulunamadı</p>
            </div>
        `;
    } else if (visibleCount === 0 && !searchTerm) {
        updateLocationList(); // Restore full list
    }
    
    trackEvent('LocationList', 'search', searchTerm);
}

// Update the existing filterMarkers function to also update location list
function updateLocationListOnFilter() {
    updateLocationList();
    
    // Clear active selection if it's not in current filter
    if (activeLocationItem) {
        const locationName = activeLocationItem.dataset.locationName;
        const isLocationVisible = filteredLocations.some(loc => loc.name === locationName);
        
        if (!isLocationVisible) {
            activeLocationItem.classList.remove('active');
            activeLocationItem = null;
        }
    }
}

// Update location list selection when marker is clicked
function updateLocationListSelection(locationName) {
    const listContainer = document.getElementById('locationListItems');
    if (!listContainer) return;
    
    // Remove previous active selection
    if (activeLocationItem) {
        activeLocationItem.classList.remove('active');
    }
    
    // Find and activate the corresponding list item
    const locationItems = listContainer.querySelectorAll('.location-item');
    locationItems.forEach(item => {
        if (item.dataset.locationName === locationName) {
            item.classList.add('active');
            activeLocationItem = item;
            
            // Scroll item into view if panel is open
            if (!isLocationListCollapsed) {
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
    });
}

// Show loading state in location list
function showLocationListLoading() {
    const listContainer = document.getElementById('locationListItems');
    const countElement = document.getElementById('locationCount');
    
    if (!listContainer || !countElement) return;
    
    countElement.textContent = '...';
    listContainer.innerHTML = `
        <div class="location-list-empty">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Lokasyonlar yükleniyor...</p>
        </div>
    `;
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
