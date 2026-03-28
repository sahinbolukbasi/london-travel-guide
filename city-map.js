// ===========================
// City Map - Google Maps Configuration
// Dynamic city loading based on URL parameter
// ===========================

// Get city slug from URL
function getCitySlugMap() {
    const params = new URLSearchParams(window.location.search);
    return params.get('city') || 'london';
}

const CITY_SLUG_MAP = getCitySlugMap();

// Google Maps API error handler
window.gm_authFailure = function() {
    console.error('❌ Google Maps API Authentication Failed!');
    updateLoadingMessage('❌ API Key hatası!');
};

window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('google')) {
        console.error('❌ Google Maps hatası:', e.message);
        updateLoadingMessage('Google Maps yükleme hatası: ' + e.message);
    }
});

let map;
let markers = [];
let activeCategory = 'all';
let locationsCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000;
let retryCount = 0;
const MAX_RETRIES = 3;

// Default city center - will be updated from countries.json
let CITY_CENTER = { lat: 51.5074, lng: -0.1278 };
let CITY_ZOOM = 11;

// Session management
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
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                try { return JSON.parse(c.substring(name.length)); }
                catch (e) { return null; }
            }
        }
        return null;
    },
    remove: (key) => {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    },
    saveUserPreferences: (prefs) => SessionManager.set(`userPrefs_${CITY_SLUG_MAP}`, prefs, 30),
    loadUserPreferences: () => {
        return SessionManager.get(`userPrefs_${CITY_SLUG_MAP}`) || {
            lastActiveCategory: 'all',
            mapZoom: CITY_ZOOM,
            mapCenter: CITY_CENTER,
            visitedLocations: [],
            favoriteLocations: [],
            locationDays: {}, // { locationId: dayNumber }
            totalTripDays: 3, // default trip duration
            locationListCollapsed: false
        };
    }
};

// Category definitions
const CATEGORIES = {
    museums: { color: '#e74c3c', icon: 'fa-landmark' },
    restaurants: { color: '#f39c12', icon: 'fa-utensils' },
    attractions: { color: '#3498db', icon: 'fa-star' },
    parks: { color: '#27ae60', icon: 'fa-tree' },
    shopping: { color: '#9b59b6', icon: 'fa-shopping-bag' },
    entertainment: { color: '#e91e63', icon: 'fa-music' },
    cafes: { color: '#795548', icon: 'fa-coffee' }
};

let locations = [];
let isLocationListCollapsed = false;
let filteredLocations = [];
let activeLocationItem = null;
let currentInfoWindow = null;

// ===========================
// Loading Message
// ===========================

function updateLoadingMessage(message) {
    const el = document.getElementById('loadingText');
    if (el) el.textContent = message;
}

// ===========================
// Map Initialization
// ===========================

async function initMap() {
    if (typeof google === 'undefined' || !google.maps) {
        console.error('❌ Google Maps API not loaded');
        updateLoadingMessage('❌ Google Maps API yüklenemedi.');
        return;
    }

    try {
        // Load city center from countries.json
        await loadCityConfig();
        
        const userPrefs = SessionManager.loadUserPreferences();
        updateLoadingMessage('Lokasyonlar yükleniyor...');
        
        await loadLocations();
        
        if (locations.length === 0) throw new Error('No locations found');

        // Update page stats
        const statLocations = document.getElementById('statLocations');
        const statCategories = document.getElementById('statCategories');
        const loadingSmall = document.getElementById('loadingSmall');
        
        if (statLocations) statLocations.textContent = locations.length + '+';
        
        const uniqueCategories = [...new Set(locations.map(l => l.category))].length;
        if (statCategories) statCategories.textContent = uniqueCategories;
        if (loadingSmall) loadingSmall.textContent = `${locations.length} lokasyon yükleniyor`;

        updateLoadingMessage('Harita oluşturuluyor...');
        
        map = new google.maps.Map(document.getElementById('map'), {
            center: userPrefs.mapCenter || CITY_CENTER,
            zoom: userPrefs.mapZoom || CITY_ZOOM,
            mapId: '318fd832020e738d25f62e55',
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            gestureHandling: 'greedy'
        });
        
        map.addListener('zoom_changed', () => {
            const prefs = SessionManager.loadUserPreferences();
            prefs.mapZoom = map.getZoom();
            SessionManager.saveUserPreferences(prefs);
        });
        
        map.addListener('center_changed', () => {
            const prefs = SessionManager.loadUserPreferences();
            prefs.mapCenter = { lat: map.getCenter().lat(), lng: map.getCenter().lng() };
            SessionManager.saveUserPreferences(prefs);
        });

        updateLoadingMessage("Marker'lar ekleniyor...");
        createMarkers();
        
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

        setTimeout(() => {
            initFilterButtons();
            initLocationListPanel();
            updateFavoritesCount();
        }, 1000);

        const loadingOverlay = document.getElementById('mapLoading');
        if (loadingOverlay) {
            updateLoadingMessage('Harita tamamlanıyor...');
            google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
                hideLoadingOverlay(loadingOverlay);
            });
            setTimeout(() => {
                if (loadingOverlay.style.display !== 'none') hideLoadingOverlay(loadingOverlay);
            }, 5000);
        }
    } catch (error) {
        console.error('❌ Map init error:', error);
        showErrorMessage('Harita yüklenemedi. Sayfa yenileniyor...');
        setTimeout(() => window.location.reload(), 3000);
    }
}

// ===========================
// Load City Config from countries.json
// ===========================

async function loadCityConfig() {
    try {
        const response = await fetch('data/countries.json', { cache: 'no-cache' });
        const data = await response.json();
        const country = data.countries.find(c => c.slug === CITY_SLUG_MAP);
        if (country) {
            CITY_CENTER = country.mapCenter || country.position;
            CITY_ZOOM = country.zoom || 11;
        }
    } catch (e) {
        console.warn('Could not load city config, using defaults');
    }
}

// ===========================
// Load Locations from JSON
// ===========================

async function loadLocations() {
    const now = Date.now();
    if (locationsCache && lastCacheTime && (now - lastCacheTime) < CACHE_DURATION) {
        locations = locationsCache;
        return;
    }
    
    try {
        updateLoadingMessage('Lokasyonlar yükleniyor...');
        const timestamp = new Date().getTime();
        const locPath = `data/cities/${CITY_SLUG_MAP}/locations.json?v=${timestamp}`;
        const response = await fetch(locPath, { cache: 'no-cache' });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (!data.locations || !Array.isArray(data.locations)) throw new Error('Invalid data format');
        
        locations = data.locations;
        locationsCache = locations;
        lastCacheTime = now;
        retryCount = 0;
        
        updateLoadingMessage(`${locations.length} lokasyon yüklendi`);
        setTimeout(() => updateLocationList(), 100);
        
    } catch (error) {
        console.error('❌ Location load error:', error);
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
            updateLoadingMessage(`Yeniden deneniyor... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(() => loadLocations(), Math.pow(2, retryCount) * 1000);
            return;
        }
        locations = [];
        updateLoadingMessage('Lokasyonlar yüklenemedi.');
    }
}

// ===========================
// Custom Marker Icon
// ===========================

function createCustomMarkerIcon(iconClass, color) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
            <ellipse cx="16" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
            <path d="M16 0 C7.2 0 0 7.2 0 16 C0 28 16 44 16 44 S32 28 32 16 C32 7.2 24.8 0 16 0 Z" 
                  fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
            <circle cx="16" cy="14" r="9" fill="rgba(255,255,255,0.9)"/>
            <text x="16" y="19" font-size="12" text-anchor="middle" fill="${color}">${getIconEmoji(iconClass)}</text>
        </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function getIconEmoji(iconClass) {
    const emojiMap = {
        'fa-landmark': '🏛', 'fa-utensils': '🍽', 'fa-star': '⭐',
        'fa-tree': '🌳', 'fa-shopping-bag': '🛍', 'fa-music': '🎵',
        'fa-coffee': '☕', 'fa-mosque': '🕌', 'fa-church': '⛪',
        'fa-cable-car': '🚡', 'fa-anchor': '⚓', 'fa-route': '🛤'
    };
    return emojiMap[iconClass] || '📍';
}

// ===========================
// Info Window
// ===========================

function createEnhancedInfoWindow(location) {
    const categoryInfo = CATEGORIES[location.category];
    const categoryNames = {
        'museums': 'Müze', 'restaurants': 'Restoran', 'attractions': 'Turistik Yer',
        'parks': 'Park', 'shopping': 'Alışveriş', 'entertainment': 'Eğlence', 'cafes': 'Kafe'
    };

    const infoLines = location.info.split('<br>');
    let address = '', price = '', hours = '', transport = '';
    infoLines.forEach(line => {
        if (line.includes('📍')) address = line.replace('📍 ', '');
        if (line.includes('🎫') || line.includes('💰')) price = line.replace(/[🎫💰] /, '');
        if (line.includes('⏰')) hours = line.replace('⏰ ', '');
        if (line.includes('🚇') || line.includes('🚃')) transport = line.replace(/[🚇🚃] /, '');
    });

    const prefs = SessionManager.loadUserPreferences();
    const isVisited = (prefs.visitedLocations || []).includes(location.id);
    const plannedDay = (prefs.locationDays || {})[location.id] || 0;
    const totalTripDays = prefs.totalTripDays || 3;
    
    let dayOptionsHTML = `<option value="0" ${plannedDay === 0 ? 'selected' : ''} data-i18n="day_unplanned">- Planlanmadı -</option>`;
    for (let i = 1; i <= totalTripDays; i++) {
        dayOptionsHTML += `<option value="${i}" ${plannedDay === i ? 'selected' : ''}>${i}. Gün</option>`;
    }

    return `
        <div class="enhanced-info-window" data-loc-id="${location.id}">
            <div class="info-header">
                <div class="header-content">
                    <div class="category-badge" style="background: ${isVisited ? '#1a1a1a' : categoryInfo.color};">
                        <i class="fas ${isVisited ? 'fa-check-circle' : categoryInfo.icon}"></i>
                        <span data-i18n-cat="${location.category}">${categoryNames[location.category]}</span>
                    </div>
                    <h3 class="location-title">${location.name}</h3>
                </div>
                <button class="custom-close-btn" id="closeInfoWindowBtn"><i class="fas fa-times"></i></button>
            </div>
            <div class="info-content">
                <p class="location-description">${location.description}</p>
                <div class="info-details">
                    ${address ? `<div class="detail-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
                    ${price ? `<div class="detail-item"><i class="fas fa-ticket-alt"></i><span>${price}</span></div>` : ''}
                    ${hours ? `<div class="detail-item"><i class="fas fa-clock"></i><span>${hours}</span></div>` : ''}
                    ${transport ? `<div class="detail-item"><i class="fas fa-subway"></i><span>${transport}</span></div>` : ''}
                </div>
            </div>
            
            <div class="planner-controls">
                <button class="planner-btn visited-toggle ${isVisited ? 'active' : ''}" id="toggleVisitedBtn">
                    <i class="fas ${isVisited ? 'fa-check-circle' : 'fa-circle'}"></i> 
                    <span data-i18n="visited_btn">${isVisited ? 'Gidildi' : 'Gidildi İşaretle'}</span>
                </button>
                <div class="day-selector">
                    <span data-i18n="day_label">Gün:</span>
                    <select id="daySelect" class="day-select">
                        ${dayOptionsHTML}
                    </select>
                </div>
            </div>

            <div class="info-actions">
                <button class="action-btn directions-btn" id="directionsBtn" data-i18n="directions_btn"><i class="fas fa-route"></i> Yol Tarifi</button>
                <button class="action-btn share-btn" id="shareLocationBtn" data-i18n="share_btn"><i class="fas fa-share-alt"></i> Paylaş</button>
                <button class="action-btn favorite-btn" id="favoriteBtn"><i class="fas fa-heart"></i> ${getFavoriteButtonText(location.id)}</button>
            </div>
        </div>
    `;
}

function getFavoriteButtonText(id) {
    const prefs = SessionManager.loadUserPreferences();
    return (prefs.favoriteLocations || []).includes(id) ? 'Favorilerden Çıkar' : 'Favorile';
}

// ===========================
// Info Window Actions
// ===========================

function getDirections(name, lat, lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}

function shareLocation(name, lat, lng) {
    const url = `https://www.google.com/maps/place/${lat},${lng}`;
    if (navigator.share) {
        navigator.share({ title: name, text: `${name} konumunu keşfedin!`, url });
    } else {
        navigator.clipboard.writeText(`${name}: ${url}`).then(() => alert('Konum linki kopyalandı!'));
    }
}

function toggleFavorite(name) {
    const prefs = SessionManager.loadUserPreferences();
    const favorites = prefs.favoriteLocations || [];
    const wasRemoved = favorites.includes(name);
    
    prefs.favoriteLocations = wasRemoved ? favorites.filter(f => f !== name) : [...favorites, name];
    SessionManager.saveUserPreferences(prefs);
    updateFavoritesCount();
    updateFavoriteButtonInInfoWindow(name, !wasRemoved);
    
    showFavoriteNotification(
        wasRemoved ? `${name} favorilerden çıkarıldı!` : `${name} favorilere eklendi!`,
        wasRemoved ? 'removed' : 'added'
    );
    
    if (wasRemoved && activeCategory === 'favorites') updateMapAfterFavoriteRemoval();
}

function closeCurrentInfoWindow() {
    if (currentInfoWindow) {
        currentInfoWindow.close();
        currentInfoWindow = null;
        removeMapClickListener();
    }
}

let mapClickListener = null;

function addMapClickListener() {
    if (mapClickListener) google.maps.event.removeListener(mapClickListener);
    mapClickListener = map.addListener('click', function() {
        setTimeout(() => { if (currentInfoWindow) closeCurrentInfoWindow(); }, 50);
    });
}

function removeMapClickListener() {
    if (mapClickListener) {
        google.maps.event.removeListener(mapClickListener);
        mapClickListener = null;
    }
}

function attachInfoWindowButtonEvents(location, infoWindow) {
    const closeBtn = document.getElementById('closeInfoWindowBtn');
    if (closeBtn) closeBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); infoWindow.close(); currentInfoWindow = null; removeMapClickListener(); };
    
    const dirBtn = document.getElementById('directionsBtn');
    if (dirBtn) dirBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); getDirections(location.name, location.position.lat, location.position.lng); };
    
    const shareBtn = document.getElementById('shareLocationBtn');
    if (shareBtn) shareBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); shareLocation(location.name, location.position.lat, location.position.lng); };
    
    const favBtn = document.getElementById('favoriteBtn');
    if (favBtn) favBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(location.id); };

    const visitBtn = document.getElementById('toggleVisitedBtn');
    if (visitBtn) visitBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleVisited(location); };

    const daySelect = document.getElementById('daySelect');
    if (daySelect) daySelect.onchange = (e) => { e.preventDefault(); e.stopPropagation(); setLocationDay(location.id, parseInt(e.target.value)); };
}

// ===========================
// Planner Actions (Visited & Day)
// ===========================

function toggleVisited(location) {
    const prefs = SessionManager.loadUserPreferences();
    const visited = prefs.visitedLocations || [];
    const isVisited = visited.includes(location.id);
    
    if (isVisited) {
        prefs.visitedLocations = visited.filter(id => id !== location.id);
    } else {
        prefs.visitedLocations.push(location.id);
    }
    
    SessionManager.saveUserPreferences(prefs);
    
    // Re-render marker
    refreshMarker(location.id);
    
    // Refresh info window safely
    if (currentInfoWindow) {
        currentInfoWindow.setContent(createEnhancedInfoWindow(location));
        setTimeout(() => attachInfoWindowButtonEvents(location, currentInfoWindow), 50);
    }
    
    // Dispatch event to update Analytics
    document.dispatchEvent(new Event('plannerUpdated'));
}

function setLocationDay(locId, dayNum) {
    const prefs = SessionManager.loadUserPreferences();
    if (!prefs.locationDays) prefs.locationDays = {};
    
    if (dayNum === 0) {
        delete prefs.locationDays[locId];
    } else {
        prefs.locationDays[locId] = dayNum;
    }
    
    SessionManager.saveUserPreferences(prefs);
    document.dispatchEvent(new Event('plannerUpdated'));
}

function refreshMarker(locId) {
    const marker = markers.find(m => m.locationId === locId);
    if (!marker) return;
    
    const location = locations.find(l => l.id === locId);
    if (!location) return;
    
    const prefs = SessionManager.loadUserPreferences();
    const isVisited = (prefs.visitedLocations || []).includes(locId);
    
    const cat = CATEGORIES[location.category];
    const pinColor = isVisited ? '#1a1a1a' : cat.color;
    const iconUrl = createCustomMarkerIcon(cat.icon, pinColor);
    
    marker.setIcon({ url: iconUrl, scaledSize: new google.maps.Size(32, 44), anchor: new google.maps.Point(16, 44) });
}

function suggestNearby(location) {
    // Mock suggestion algorithm based on coordinates & category
    const nearby = locations
        .filter(l => l.id !== location.id)
        .map(l => {
            const dx = l.position.lat - location.position.lat;
            const dy = l.position.lng - location.position.lng;
            return { loc: l, dist: Math.sqrt(dx*dx + dy*dy) };
        })
        .sort((a,b) => a.dist - b.dist)
        .slice(0, 2);
    
    if (nearby.length > 0) {
        let text = `🎯 ${location.name} yakınında harika önerilerimiz var:\n\n`;
        nearby.forEach(n => text += `👉 ${n.loc.name} (${CATEGORIES[n.loc.category].icon.replace('fa-','')})\n`);
        alert(text);
    } else {
        alert("Bu lokasyona çok yakın başka bir öneri bulunamadı.");
    }
}

// ===========================
// Favorites
// ===========================

function updateFavoritesCount() {
    const prefs = SessionManager.loadUserPreferences();
    const count = (prefs.favoriteLocations || []).length;
    const el = document.getElementById('favoritesCount');
    const btn = document.getElementById('favoritesBtn');
    if (el) { el.textContent = count; el.classList.toggle('zero', count === 0); }
    if (btn) btn.style.display = count === 0 ? 'none' : 'flex';
}

function showFavoriteNotification(message, type) {
    const notif = document.createElement('div');
    notif.className = `favorite-notification ${type}`;
    notif.innerHTML = `<i class="fas ${type === 'added' ? 'fa-heart' : 'fa-heart-broken'}"></i><span>${message}</span>`;
    notif.style.cssText = `position:fixed;top:20px;right:20px;background:${type === 'added' ? '#27ae60' : '#e74c3c'};color:white;padding:12px 16px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-family:'Space Grotesk',sans-serif;font-size:0.9rem;display:flex;align-items:center;gap:8px;animation:slideInRight 0.3s ease;`;
    document.body.appendChild(notif);
    setTimeout(() => { if (notif.parentNode) notif.parentNode.removeChild(notif); }, 3000);
}

function updateFavoriteButtonInInfoWindow(id, isFavorite) {
    const btn = document.querySelector('.favorite-btn');
    if (btn) {
        btn.innerHTML = `<i class="fas fa-heart"></i> ${isFavorite ? 'Favorilerden Çıkar' : 'Favorile'}`;
        btn.style.background = isFavorite ? '#ff6b6b' : '#e8e8e8';
        btn.style.color = isFavorite ? 'white' : 'var(--text-dark)';
    }
}

function showFavoritesOnly() {
    const prefs = SessionManager.loadUserPreferences();
    const favorites = prefs.favoriteLocations || [];
    if (favorites.length === 0) { showFavoriteNotification('Henüz favori lokasyon eklenmemiş!', 'removed'); return; }
    markers.forEach(m => m.setVisible(favorites.includes(m.locationId)));
    focusMapOnFilteredLocations('favorites');
    updateLocationListOnFilter();
}

function updateMapAfterFavoriteRemoval() {
    const prefs = SessionManager.loadUserPreferences();
    const favorites = prefs.favoriteLocations || [];
    closeCurrentInfoWindow();
    if (favorites.length === 0) {
        activeCategory = 'all';
        filterMarkers('all');
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-category="all"]')?.classList.add('active');
    } else {
        showFavoritesOnly();
    }
    updateLocationListOnFilter();
}

function focusMapOnFilteredLocations(category) {
    const bounds = new google.maps.LatLngBounds();
    let count = 0;
    markers.forEach(m => { if (m.getVisible()) { bounds.extend(m.getPosition()); count++; } });
    if (count > 0) map.fitBounds(bounds, 60);
}

// ===========================
// Markers
// ===========================

function createMarkers() {
    const prefs = SessionManager.loadUserPreferences();

    locations.forEach(location => {
        const cat = CATEGORIES[location.category] || CATEGORIES.attractions;
        const isVisited = (prefs.visitedLocations || []).includes(location.id);
        const pinColor = isVisited ? '#1a1a1a' : cat.color;
        
        const iconUrl = createCustomMarkerIcon(cat.icon, pinColor);

        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.name,
            icon: { url: iconUrl, scaledSize: new google.maps.Size(32, 44), anchor: new google.maps.Point(16, 44) },
            optimized: true
        });

        marker.category = location.category;
        marker.locationId = location.id;

        const screenWidth = window.innerWidth;
        let maxWidth = 350;
        if (screenWidth <= 480) maxWidth = Math.min(260, Math.floor(screenWidth * 0.8));
        else if (screenWidth <= 768) maxWidth = Math.min(280, Math.floor(screenWidth * 0.75));

        const infoWindow = new google.maps.InfoWindow({
            content: createEnhancedInfoWindow(location),
            disableAutoPan: false,
            maxWidth: maxWidth,
            pixelOffset: new google.maps.Size(0, -10)
        });

        infoWindow.addListener('closeclick', () => { currentInfoWindow = null; removeMapClickListener(); });
        infoWindow.addListener('domready', () => attachInfoWindowButtonEvents(location, infoWindow));

        marker.addListener('click', () => {
            markers.forEach(m => { if (m.infoWindow) m.infoWindow.close(); });
            
            // Re-generate content to catch up with latest state before opening
            infoWindow.setContent(createEnhancedInfoWindow(location));
            
            infoWindow.open(map, marker);
            currentInfoWindow = infoWindow;
            setTimeout(() => addMapClickListener(), 100);
            updateLocationListSelection(location.name);
        });

        marker.infoWindow = infoWindow;
        markers.push(marker);
    });
}

// ===========================
// Filters
// ===========================

function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterMarkers(category);
        });
    });
}

function filterMarkers(category) {
    activeCategory = category;
    const prefs = SessionManager.loadUserPreferences();
    prefs.lastActiveCategory = category;
    SessionManager.saveUserPreferences(prefs);
    
    if (category === 'favorites') { showFavoritesOnly(); return; }
    
    markers.forEach(marker => {
        marker.setVisible(category === 'all' || marker.category === category);
    });

    const customDropdown = document.getElementById('dayFilterCustom');
    const selectedEl = document.getElementById('dayFilterSelected');
    const optionsDiv = document.getElementById('dayFilterOptions');
    if (customDropdown && !activeCategory.toString().startsWith('day_')) {
        if (selectedEl) selectedEl.innerHTML = `Tüm Günler <i class="fas fa-chevron-down"></i>`;
        if (optionsDiv) {
            optionsDiv.querySelectorAll('.custom-dropdown-option').forEach(o => o.classList.remove('active'));
            const allOpt = optionsDiv.querySelector('.custom-dropdown-option[data-value="all"]');
            if (allOpt) allOpt.classList.add('active');
        }
    }

    if (category === 'all') {
        focusMapOnFilteredLocations();
    }
    updateLocationListOnFilter();
}

// Special filter by planned day
window.filterMarkersByDay = function(day) {
    const prefs = SessionManager.loadUserPreferences();
    const plannedDays = prefs.locationDays || {};
    const dayLocIds = Object.keys(plannedDays).filter(id => plannedDays[id] === day);
    
    if (dayLocIds.length === 0) return;
    activeCategory = 'day_' + day;
    
    markers.forEach(marker => {
        marker.setVisible(dayLocIds.includes(marker.locationId));
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    focusMapOnFilteredLocations('custom');
    
    // Update location list to show only day locs
    const container = document.getElementById('locationListItems');
    const countEl = document.getElementById('locationCount');
    if (container && countEl) {
        filteredLocations = locations.filter(l => dayLocIds.includes(l.id));
        countEl.textContent = filteredLocations.length;
        container.innerHTML = '';
        
        filteredLocations.forEach((location) => {
            const item = document.createElement('div');
            item.className = 'location-item';
            item.dataset.locationName = location.name;
            const cat = CATEGORIES[location.category] || {};
            const catNames = { museums: 'Müze', restaurants: 'Restoran', attractions: 'Turistik Yer', parks: 'Park', shopping: 'Alışveriş', entertainment: 'Eğlence', cafes: 'Kahveci' };
            item.innerHTML = `
                <div class="location-icon ${location.category}">${getIconEmoji(cat.icon || 'fa-star')}</div>
                <div class="location-info">
                    <div class="location-name">${location.name}</div>
                    <div class="location-category">${currentLang === 'tr' ? (catNames[location.category] || location.category) : location.category}</div>
                </div>
            `;
            item.addEventListener('click', () => selectLocation(location, item));
            container.appendChild(item);
        });
    }
}

// ===========================
// Helpers
// ===========================

function hideLoadingOverlay(el) {
    if (el) { el.classList.add('hidden'); setTimeout(() => { el.style.display = 'none'; }, 300); }
}

function showErrorMessage(message) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:20px;right:20px;background:#e74c3c;color:white;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;font-family:"Space Grotesk",sans-serif;font-size:0.9rem;';
    el.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5000);
}

// ===========================
// Location List Panel
// ===========================

function initLocationListPanel() {
    const panel = document.getElementById('locationListPanel');
    const toggle = document.getElementById('locationListToggle');
    const searchInput = document.getElementById('locationSearch');
    if (!panel || !toggle) return;
    
    const prefs = SessionManager.loadUserPreferences();
    isLocationListCollapsed = prefs.locationListCollapsed || false;
    if (isLocationListCollapsed) {
        panel.classList.add('collapsed');
        const icon = document.getElementById('toggleIcon');
        if (icon) icon.className = 'fas fa-chevron-down';
    }
    
    if (locations.length > 0) updateLocationList();
    toggle.addEventListener('click', toggleLocationListPanel);
    if (searchInput) searchInput.addEventListener('input', handleLocationSearch);
}

function toggleLocationListPanel() {
    const panel = document.getElementById('locationListPanel');
    const icon = document.getElementById('toggleIcon');
    if (!panel || !icon) return;
    
    isLocationListCollapsed = !isLocationListCollapsed;
    panel.classList.toggle('collapsed', isLocationListCollapsed);
    icon.className = isLocationListCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    
    const prefs = SessionManager.loadUserPreferences();
    prefs.locationListCollapsed = isLocationListCollapsed;
    SessionManager.saveUserPreferences(prefs);
}

function updateLocationList() {
    const container = document.getElementById('locationListItems');
    const countEl = document.getElementById('locationCount');
    if (!container || !countEl) return;
    
    filteredLocations = activeCategory === 'all' ? locations : locations.filter(l => l.category === activeCategory);
    countEl.textContent = filteredLocations.length;
    container.innerHTML = '';
    
    if (filteredLocations.length === 0) {
        container.innerHTML = '<div class="location-list-empty"><i class="fas fa-map-marker-alt"></i><p>Bu kategoride lokasyon bulunamadı</p></div>';
        return;
    }
    
    filteredLocations.forEach((location, index) => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.dataset.locationName = location.name;
        const cat = CATEGORIES[location.category] || {};
        const catNames = { museums: 'Müze', restaurants: 'Restoran', attractions: 'Turistik Yer', parks: 'Park', shopping: 'Alışveriş', entertainment: 'Eğlence', cafes: 'Kahveci' };
        item.innerHTML = `
            <div class="location-icon ${location.category}">${getIconEmoji(cat.icon || 'fa-star')}</div>
            <div class="location-info">
                <div class="location-name">${location.name}</div>
                <div class="location-category">${catNames[location.category] || location.category}</div>
            </div>
        `;
        item.addEventListener('click', () => selectLocation(location, item));
        container.appendChild(item);
    });
}

function selectLocation(location, itemElement) {
    if (activeLocationItem) activeLocationItem.classList.remove('active');
    itemElement.classList.add('active');
    activeLocationItem = itemElement;
    
    const marker = markers.find(m => m.getTitle() === location.name);
    if (marker && map) {
        markers.forEach(m => { if (m.infoWindow) m.infoWindow.close(); });
        map.panTo(location.position);
        if (map.getZoom() < 15) map.setZoom(15);
        setTimeout(() => {
            if (marker.infoWindow) {
                marker.infoWindow.open(map, marker);
                currentInfoWindow = marker.infoWindow;
                setTimeout(() => { attachInfoWindowButtonEvents(location, marker.infoWindow); addMapClickListener(); }, 200);
            }
        }, 500);
    }
}

function handleLocationSearch(event) {
    const term = event.target.value.toLowerCase().trim();
    const container = document.getElementById('locationListItems');
    if (!container) return;
    
    // Check if the container was emptied previously; if so, restore the items
    if (!container.querySelector('.location-item')) {
        updateLocationList();
    }
    
    let count = 0;
    container.querySelectorAll('.location-item').forEach(item => {
        const visible = item.dataset.locationName.toLowerCase().includes(term);
        item.style.display = visible ? 'flex' : 'none';
        if (visible) count++;
    });
    
    const countEl = document.getElementById('locationCount');
    if (countEl) countEl.textContent = count;
    
    if (count === 0 && term) {
        container.innerHTML = `<div class="location-list-empty"><i class="fas fa-search"></i><p>"${term}" için sonuç bulunamadı</p></div>`;
    }
}

function updateLocationListOnFilter() {
    updateLocationList();
    if (activeLocationItem) {
        const name = activeLocationItem.dataset.locationName;
        if (!filteredLocations.some(l => l.name === name)) {
            activeLocationItem.classList.remove('active');
            activeLocationItem = null;
        }
    }
}

function updateLocationListSelection(locationName) {
    const container = document.getElementById('locationListItems');
    if (!container) return;
    if (activeLocationItem) activeLocationItem.classList.remove('active');
    container.querySelectorAll('.location-item').forEach(item => {
        if (item.dataset.locationName === locationName) {
            item.classList.add('active');
            activeLocationItem = item;
            if (!isLocationListCollapsed) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Global functions
window.getDirections = getDirections;
window.shareLocation = shareLocation;
window.toggleFavorite = toggleFavorite;
window.closeCurrentInfoWindow = closeCurrentInfoWindow;
window.showFavoritesOnly = showFavoritesOnly;
