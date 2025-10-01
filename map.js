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
    shopping: { color: '#9b59b6', icon: 'fa-shopping-bag' }
};

// Lokasyonlar - locations.json dosyasından yüklenecek
let locations = [];

// ===========================
// Map Initialization
// ===========================

async function initMap() {
    // Lokasyonları JSON'dan yükle
    await loadLocations();

    // Harita oluştur
    map = new google.maps.Map(document.getElementById('map'), {
        center: LONDON_CENTER,
        zoom: 12,
        styles: getMapStyles(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    });

    // Marker'ları ekle
    createMarkers();

    // Loading overlay'i gizle
    setTimeout(() => {
        document.getElementById('mapLoading').style.display = 'none';
    }, 1000);

    // Filter butonlarını dinle
    initFilterButtons();

    trackEvent('Map', 'loaded', 'Custom map loaded successfully');
}

// ===========================
// Load Locations from JSON
// ===========================

async function loadLocations() {
    try {
        const response = await fetch('locations.json');
        const data = await response.json();
        locations = data.locations;
        console.log(`${locations.length} lokasyon yüklendi`);
    } catch (error) {
        console.error('Lokasyonlar yüklenirken hata:', error);
        // Hata durumunda boş array kullan
        locations = [];
    }
}

// ===========================
// Custom Marker Icon Creation
// ===========================

function createCustomMarkerIcon(iconClass, color) {
    // SVG marker with Font Awesome icon
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <!-- Marker shape -->
            <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 S40 35 40 20 C40 9 31 0 20 0 Z" 
                  fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <!-- Icon placeholder (will be replaced with Font Awesome) -->
            <text x="20" y="24" font-family="'Font Awesome 6 Free'" font-size="16" 
                  font-weight="900" fill="#ffffff" text-anchor="middle" 
                  dominant-baseline="middle">&#x${getFontAwesomeUnicode(iconClass)};</text>
        </svg>
    `;
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Font Awesome icon unicode mapping
function getFontAwesomeUnicode(iconClass) {
    const iconMap = {
        'fa-landmark': 'f66f',      // 🏛️
        'fa-utensils': 'f2e7',      // 🍽️
        'fa-star': 'f005',          // ⭐
        'fa-tree': 'f1bb',          // 🌳
        'fa-shopping-bag': 'f290'   // 🛍️
    };
    return iconMap[iconClass] || 'f3c5'; // Default: map-marker-alt
}

// ===========================
// Marker Creation
// ===========================

function createMarkers() {
    locations.forEach(location => {
        // Font Awesome ikonu ile özel marker oluştur
        const iconUrl = createCustomMarkerIcon(
            CATEGORIES[location.category].icon,
            CATEGORIES[location.category].color
        );

        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.name,
            category: location.category,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 40)
            },
            animation: google.maps.Animation.DROP
        });

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
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Aktif butonu güncelle
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Marker'ları filtrele
            filterMarkers(category);
            
            trackEvent('Map', 'filter', category);
        });
    });
}

function filterMarkers(category) {
    activeCategory = category;
    
    markers.forEach(marker => {
        if (category === 'all') {
            marker.setVisible(true);
        } else {
            marker.setVisible(marker.category === category);
        }
    });
}

// ===========================
// Map Styles (Retro Theme)
// ===========================

function getMapStyles() {
    return [
        {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }]
        },
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
        },
        {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#f5f5f5" }]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#c9e6f2" }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{ "color": "#eeeeee" }]
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
