// ===========================
// Google Maps Configuration
// ===========================

let map;
let markers = [];
let activeCategory = 'all';

// Londra merkez koordinatları
const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };

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
    updateLoadingMessage('Lokasyonlar yükleniyor...');
    
    // Lokasyonları JSON'dan yükle
    await loadLocations();

    // Loading mesajını güncelle
    updateLoadingMessage('Harita oluşturuluyor...');
    
    // Harita oluştur
    map = new google.maps.Map(document.getElementById('map'), {
        center: LONDON_CENTER,
        zoom: 11,
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

    // Loading mesajını güncelle
    updateLoadingMessage('Marker\'lar ekleniyor...');
    
    // Marker'ları ekle
    createMarkers();

    // Filter butonlarını dinle (DOM hazır olduktan sonra)
    setTimeout(() => {
        initFilterButtons();
    }, 1000);

    // Loading overlay'i hemen gizle (harita hazır olduğunda)
    const loadingOverlay = document.getElementById('mapLoading');
    if (loadingOverlay) {
        updateLoadingMessage('Harita tamamlanıyor...');
        
        // Harita tiles yüklenene kadar bekle
        google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        });
        
        // Maksimum 3 saniye bekle, sonra zorla gizle
        setTimeout(() => {
            if (loadingOverlay.style.display !== 'none') {
                loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 300);
            }
        }, 3000);
    }

    trackEvent('Map', 'loaded', 'Custom map loaded successfully');
    console.log('✅ Harita başarıyla yüklendi. Filtreler başlatılıyor...');
}

// ===========================
// Load Locations from JSON
// ===========================

async function loadLocations() {
    try {
        const response = await fetch('locations.json', {
            cache: 'force-cache'
        });
        const data = await response.json();
        locations = data.locations;
        console.log(`✅ ${locations.length} lokasyon yüklendi`);
    } catch (error) {
        console.error('❌ Lokasyonlar yüklenirken hata:', error);
        // Hata durumunda boş array kullan
        locations = [];
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
