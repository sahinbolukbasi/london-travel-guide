// ===========================
// City Page - Dynamic Script
// Loads city data based on URL parameter
// ===========================

// Get city slug from URL
function getCitySlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('city') || 'london';
}

const CITY_SLUG = getCitySlug();

// ===========================
// i18n Language Support
// ===========================

const I18N = {
    tr: {
        analytics_title: "Seyahat Analitiği",
        analytics_total: "Planlanan Yer",
        analytics_visited: "Gidilen",
        analytics_progress: "Tamamlanma Oranı",
        analytics_daily: "Günlük Plan Dağılımı",
        analytics_btn: "Seyahat Rehberim",
        share_plan_btn: "Planı Paylaş",
        trip_duration_label: "Seyahat Süresi (Gün):",
        visited_btn: "Gidildi İşaretle",
        visited_btn_active: "Gidildi",
        day_label: "Gün:",
        day_unplanned: "- Planlanmadı -",
        directions_btn: "Yol Tarifi",
        suggest_btn: "Öneri",
        share_btn: "Paylaş",
        feedback_title: "Öneri & Geri Bildirim",
        feedback_desc: "Site veya lokasyonlar hakkında düşüncelerinizi, önerilerinizi bizimle paylaşın.",
        feedback_type: "Konu",
        feedback_opt_loc: "Yeni Bir Lokasyon Önerisi",
        feedback_opt_site: "Site İyileştirmesi / Hata Bildirimi",
        feedback_opt_other: "Diğer",
        feedback_msg: "Mesajınız",
        feedback_submit: "Gönder",
        feedback_success: "Teşekkürler! Geri bildiriminiz alındı.",
        layer_filters: "Katman Filtreleri",
        day_filter_all: "Tüm Günler"
    },
    en: {
        analytics_title: "Travel Analytics",
        analytics_total: "Planned Places",
        analytics_visited: "Visited",
        analytics_progress: "Completion Rate",
        analytics_daily: "Daily Breakdown",
        analytics_btn: "My Travel Guide",
        share_plan_btn: "Share Plan",
        trip_duration_label: "Trip Duration (Days):",
        visited_btn: "Mark Visited",
        visited_btn_active: "Visited",
        day_label: "Day:",
        day_unplanned: "- Unplanned -",
        directions_btn: "Directions",
        suggest_btn: "Suggest",
        share_btn: "Share",
        feedback_title: "Suggestions & Feedback",
        feedback_desc: "Share your thoughts, suggestions, or comments about the site and locations.",
        feedback_type: "Subject",
        feedback_opt_loc: "Suggest a New Location",
        feedback_opt_site: "Site Improvement / Bug Report",
        feedback_opt_other: "Other",
        feedback_msg: "Your Message",
        feedback_submit: "Submit",
        feedback_success: "Thank you! Your feedback has been received.",
        layer_filters: "Layer Filters",
        day_filter_all: "All Days"
    }
};

let currentLang = localStorage.getItem('appLang') || 'tr';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (I18N[lang][key]) {
            el.textContent = I18N[lang][key];
        }
    });
    
    if (typeof closeCurrentInfoWindow === 'function') closeCurrentInfoWindow();
}

// City-specific configurations
const CITY_CONFIGS = {
    london: {
        title: 'Londra Gezi Rehberi',
        heroTitle: "Londra'yı Keşfedin",
        heroDescription: "İnteraktif haritamız ile Londra'nın en popüler yerlerini keşfedin. Müzelerden restoranlara, parklardan alışveriş merkezlerine kadar tüm lokasyonlar tek bir haritada.",
        guidePills: [
            { href: '#tip-1', icon: 'fa-calendar-alt', text: 'En İyi Ziyaret Zamanı' },
            { href: '#tip-10', icon: 'fa-plane', text: 'Havalimanı Ulaşım' },
            { href: '#tip-2', icon: 'fa-subway', text: 'Ulaşım Rehberi' },
            { href: '#tip-3', icon: 'fa-ticket-alt', text: 'Bilet & Tasarruf' },
            { href: '#tip-4', icon: 'fa-cloud-rain', text: 'Hava Durumu' },
            { href: '#tip-5', icon: 'fa-utensils', text: 'Yemek Önerileri' },
            { href: '#tip-6', icon: 'fa-shield-alt', text: 'Güvenlik & Pratik' },
            { href: '#tip-7', icon: 'fa-map-marked-alt', text: 'Gezi Rotaları' },
            { href: '#tip-8', icon: 'fa-mobile-alt', text: 'Faydalı Uygulamalar' }
        ],
        filterCategories: [
            { category: 'museums', icon: 'fa-landmark', label: 'Müzeler' },
            { category: 'restaurants', icon: 'fa-utensils', label: 'Restoranlar' },
            { category: 'attractions', icon: 'fa-star', label: 'Turistik Yerler' },
            { category: 'parks', icon: 'fa-tree', label: 'Parklar' },
            { category: 'shopping', icon: 'fa-shopping-bag', label: 'Alışveriş' },
            { category: 'entertainment', icon: 'fa-music', label: 'Eğlence Mekanları' },
            { category: 'cafes', icon: 'fa-coffee', label: 'Kahveciler' }
        ]
    },
    sarajevo: {
        title: 'Saraybosna Gezi Rehberi',
        heroTitle: "Saraybosna'yı Keşfedin",
        heroDescription: "Doğu ile Batı'nın buluştuğu tarihi başkent. Osmanlı mirası, savaş tarihi ve eşsiz Boşnak mutfağıyla Saraybosna'nın en güzel yerlerini keşfedin.",
        guidePills: [
            { href: '#tip-1', icon: 'fa-calendar-alt', text: 'En İyi Ziyaret Zamanı' },
            { href: '#tip-2', icon: 'fa-subway', text: 'Ulaşım Rehberi' },
            { href: '#tip-3', icon: 'fa-utensils', text: 'Yemek Önerileri' },
            { href: '#tip-4', icon: 'fa-shield-alt', text: 'Güvenlik & Pratik' },
            { href: '#tip-5', icon: 'fa-map-marked-alt', text: 'Gezi Rotası' }
        ],
        filterCategories: [
            { category: 'museums', icon: 'fa-landmark', label: 'Müzeler' },
            { category: 'restaurants', icon: 'fa-utensils', label: 'Restoranlar' },
            { category: 'attractions', icon: 'fa-star', label: 'Turistik Yerler' },
            { category: 'parks', icon: 'fa-tree', label: 'Parklar' },
            { category: 'cafes', icon: 'fa-coffee', label: 'Kahveciler' }
        ]
    },
    tokyo: {
        title: 'Tokyo Gezi Rehberi',
        heroTitle: "Tokyo'yu Keşfedin",
        heroDescription: "Geleneksel tapınakların ve devasa gökdelenlerin bir arada olduğu neon ışıklı metropol.",
        guidePills: [
            { href: '#tip-g1', icon: 'fa-subway', text: 'Ulaşım' },
            { href: '#tip-g2', icon: 'fa-volume-mute', text: 'Tren Adabı' },
            { href: '#tip-g3', icon: 'fa-yen-sign', text: 'Nakit' }
        ],
        filterCategories: [
            { category: 'historic', icon: 'fa-landmark', label: 'Tarihi' },
            { category: 'attraction', icon: 'fa-star', label: 'Turistik Yerler' },
            { category: 'entertainment', icon: 'fa-music', label: 'Eğlence' }
        ]
    },
    belgrade: {
        title: 'Belgrad Gezi Rehberi',
        heroTitle: "Belgrad'ı Keşfedin",
        heroDescription: "Tuna ve Sava nehirlerinin buluştuğu canlı ve tarihi Balkan şehri.",
        guidePills: [
            { href: '#tip-g1', icon: 'fa-coins', text: 'Para Birimi' },
            { href: '#tip-g2', icon: 'fa-bus', text: 'Toplu Taşıma' },
            { href: '#tip-g3', icon: 'fa-coffee', text: 'Kahve Kültürü' }
        ],
        filterCategories: [
            { category: 'historic', icon: 'fa-landmark', label: 'Tarihi' },
            { category: 'shopping', icon: 'fa-shopping-bag', label: 'Alışveriş' },
            { category: 'food', icon: 'fa-utensils', label: 'Yeme İçme' }
        ]
    }
};

// ===========================
// Page Initialization
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    const config = CITY_CONFIGS[CITY_SLUG] || CITY_CONFIGS.london;
    
    // Update page meta
    document.title = config.title;
    
    // Update header
    const cityTitle = document.getElementById('cityTitle');
    if (cityTitle) cityTitle.textContent = config.title;
    
    // Update hero
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) heroTitle.textContent = config.heroTitle;
    
    const heroDesc = document.getElementById('heroDescription');
    if (heroDesc) heroDesc.textContent = config.heroDescription;
    
    // Render guide pills
    const guideLinks = document.getElementById('heroGuideLinks');
    if (guideLinks && config.guidePills) {
        guideLinks.innerHTML = config.guidePills.map(pill => `
            <a href="${pill.href}" class="guide-pill">
                <i class="fas ${pill.icon}"></i>
                <span>${pill.text}</span>
            </a>
        `).join('');
    }
    
    // Render filter buttons
    const filterGrid = document.getElementById('filterButtonsGrid');
    if (filterGrid && config.filterCategories) {
        // Keep existing "all" and "favorites" buttons, add category buttons
        config.filterCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = cat.category;
            btn.innerHTML = `<i class="fas ${cat.icon}"></i><span>${cat.label}</span>`;
            filterGrid.appendChild(btn);
        });
    }
    
    // Cache management
    CacheManager.clearOldCache();
    
    // Load tips
    loadTipsFromJSON();
    
    // Track page view
    trackPageView();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initialize Language
    applyLanguage(currentLang);
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
        btn.addEventListener('click', (e) => applyLanguage(e.target.dataset.lang));
    });

    // Initialize Analytics UI Events
    initAnalyticsUI();
    
    // Day Filter Hook
    updateDayFilterDropdown();

    // Burger menu toggle for city page
    const burgerBtn = document.getElementById('burgerBtn');
    const headerActions = document.getElementById('headerActions');
    if (burgerBtn && headerActions) {
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerActions.classList.toggle('open');
            burgerBtn.querySelector('i').className = headerActions.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
        });
        document.addEventListener('click', (e) => {
            if (!headerActions.contains(e.target) && !burgerBtn.contains(e.target)) {
                headerActions.classList.remove('open');
                burgerBtn.querySelector('i').className = 'fas fa-bars';
            }
        });
    }
});

// ===========================
// Travel Analytics Logic
// ===========================

function initAnalyticsUI() {
    const analyticsModal = document.getElementById('analyticsModal');
    const analyticsBtn = document.getElementById('analyticsBtn');
    const closeAnalyticsModalBtn = document.getElementById('closeAnalyticsModal');
    
    const suggestHeaderBtn = document.getElementById('suggestHeaderBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackModalBtn = document.getElementById('closeFeedbackModal');
    const feedbackForm = document.getElementById('feedbackForm');

    if (suggestHeaderBtn && feedbackModal) {
        suggestHeaderBtn.addEventListener('click', () => {
            feedbackModal.classList.add('active');
            const successMsg = document.getElementById('feedbackSuccessMsg');
            if(successMsg) successMsg.style.display = 'none';
            if(feedbackForm) feedbackForm.reset();
        });
    }

    if (closeFeedbackModalBtn && feedbackModal) {
        closeFeedbackModalBtn.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
    }
    
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const successMsg = document.getElementById('feedbackSuccessMsg');
            if(successMsg) successMsg.style.display = 'block';
            setTimeout(() => {
                feedbackModal.classList.remove('active');
            }, 2000);
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === analyticsModal) {
            analyticsModal.classList.remove('active');
            document.dispatchEvent(new Event('plannerUpdated'));
        }
        if (e.target === feedbackModal) feedbackModal.classList.remove('active');
    });

    // Trip Settings
    const decreaseDaysBtn = document.getElementById('decreaseDaysBtn');
    const increaseDaysBtn = document.getElementById('increaseDaysBtn');
    const tripDaysInput = document.getElementById('tripDaysInput');

    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', () => {
            if (typeof SessionManager !== 'undefined') {
                const prefs = SessionManager.loadUserPreferences();
                if (tripDaysInput) tripDaysInput.value = prefs.totalTripDays || 3;
            }
            updateAnalyticsData();
            analyticsModal.classList.add('active');
        });
    }

    if (closeAnalyticsModalBtn) {
        closeAnalyticsModalBtn.addEventListener('click', () => {
            analyticsModal.classList.remove('active');
            document.dispatchEvent(new Event('plannerUpdated'));
        });
    }

    document.addEventListener('plannerUpdated', () => {
        if (analyticsModal && analyticsModal.classList.contains('active')) {
            updateAnalyticsData();
        }
        updateDayFilterDropdown();
    });

    if (decreaseDaysBtn && increaseDaysBtn && tripDaysInput) {
        decreaseDaysBtn.addEventListener('click', () => updateTripDays(-1));
        increaseDaysBtn.addEventListener('click', () => updateTripDays(1));
    }
}

function updateTripDays(change) {
    if (typeof SessionManager === 'undefined') return;
    
    const prefs = SessionManager.loadUserPreferences();
    let currentDays = prefs.totalTripDays || 3;
    currentDays += change;
    
    if (currentDays < 1) currentDays = 1;
    if (currentDays > 30) currentDays = 30; // Max limit 30
    
    prefs.totalTripDays = currentDays;
    SessionManager.saveUserPreferences(prefs);
    
    const tripDaysInput = document.getElementById('tripDaysInput');
    if (tripDaysInput) tripDaysInput.value = currentDays;
    
    // Re-render info window if open
    if (typeof refreshCurrentMarkerInfoWindow === 'function') {
        refreshCurrentMarkerInfoWindow();
    }
}

function saveTripSettings() {
    if (typeof SessionManager === 'undefined') return;
    
    let currentDays = parseInt(document.getElementById('tripDaysInput').value);
    if (isNaN(currentDays) || currentDays < 1) currentDays = 1;
    if (currentDays > 30) currentDays = 30; // Max limit 30
    
    const prefs = SessionManager.loadUserPreferences();
    prefs.totalTripDays = currentDays;
    SessionManager.saveUserPreferences(prefs);
    
    const tripDaysInput = document.getElementById('tripDaysInput');
    if (tripDaysInput) tripDaysInput.value = currentDays;
    
    // Update daily modal and map UI
    updateAnalyticsData();
    updateDayFilterDropdown();
    
    // Re-render info window if open
    if (typeof refreshCurrentMarkerInfoWindow === 'function') {
        refreshCurrentMarkerInfoWindow();
    }
}

function updateAnalyticsData() {
    // SessionManager is available globally via city-map.js
    if (typeof SessionManager === 'undefined') return;
    
    const prefs = SessionManager.loadUserPreferences();
    const plannedDays = prefs.locationDays || {};
    const visited = prefs.visitedLocations || [];
    
    const plannedLocIds = Object.keys(plannedDays);
    const totalPlanned = plannedLocIds.length;
    
    let visitedCount = 0;
    plannedLocIds.forEach(id => {
        if (visited.includes(id)) visitedCount++;
    });
    
    if (totalPlanned === 0) {
        visitedCount = visited.length;
    }
    
    const realTotal = totalPlanned > 0 ? totalPlanned : (visitedCount > 0 ? visitedCount : 0);
    const progress = realTotal > 0 ? Math.round((visitedCount / realTotal) * 100) : 0;
    
    document.getElementById('analyticsTotal').textContent = realTotal;
    document.getElementById('analyticsVisited').textContent = visitedCount;
    document.getElementById('analyticsProgressText').textContent = `${progress}%`;
    document.getElementById('analyticsProgressBar').style.width = `${progress}%`;
    
    const dailyMap = {}; // { dayNumber: [locId1, locId2] }
    plannedLocIds.forEach(id => {
        const day = plannedDays[id];
        if (!dailyMap[day]) dailyMap[day] = [];
        dailyMap[day].push(id);
    });
    
    const dailyList = document.getElementById('analyticsDailyList');
    if (Object.keys(dailyMap).length === 0) {
        dailyList.innerHTML = `<div class="daily-item"><span class="daily-item-day" style="font-weight:normal; font-size:0.95rem;">${currentLang === 'tr' ? 'Henüz plan yapmadınız' : 'No planned days yet'}</span></div>`;
    } else {
        const sortedDays = Object.keys(dailyMap).sort((a,b) => parseInt(a) - parseInt(b));
        dailyList.innerHTML = sortedDays.map(day => {
            const dayLocIds = dailyMap[day];
            let listHTML = `<div class="daily-locations">`;
            
            dayLocIds.forEach(id => {
                // Find location details from the global locations array (if available)
                let locName = id;
                let icon = 'fa-map-marker-alt';
                if (typeof locations !== 'undefined') {
                    const l = locations.find(loc => loc.id === id);
                    if (l) {
                        locName = l.name;
                        // Map category to a basic icon, or use the global CATEGORIES if available
                        if (typeof CATEGORIES !== 'undefined' && CATEGORIES[l.category]) {
                            icon = CATEGORIES[l.category].icon;
                        }
                    }
                }
                listHTML += `
                    <div class="daily-loc-item" onclick="focusOnLocation('${id}')">
                        <i class="fas ${icon.replace('fa-','')}"></i>
                        <span>${locName}</span>
                    </div>
                `;
            });
            listHTML += `</div>`;

            return `
            <div class="daily-item">
                <div class="daily-item-header" onclick="filterMapByDay(${day})" style="cursor: pointer;" title="${currentLang === 'tr' ? 'Haritada Göster' : 'Show on Map'}">
                    <span class="daily-item-day">${day}. ${currentLang === 'tr' ? 'Gün' : 'Day'}</span>
                    <span class="daily-item-count">${dayLocIds.length} ${currentLang === 'tr' ? 'Yer' : 'Places'}</span>
                    <i class="fas fa-filter" style="margin-left:auto; color:var(--highlight-color);"></i>
                </div>
                ${listHTML}
            </div>
            `;
        }).join('');
    }
}

window.filterMapByDay = function(day) {
    document.getElementById('analyticsModal').classList.remove('active');
    
    // Update custom dropdown visually
    const selectedEl = document.getElementById('dayFilterSelected');
    const optionsDiv = document.getElementById('dayFilterOptions');
    if (selectedEl && optionsDiv) {
        const text = day === 'all' ? (currentLang === 'tr' ? 'Tüm Günler' : 'All Days') : `${day}. ${currentLang === 'tr' ? 'Gün' : 'Day'}`;
        selectedEl.innerHTML = `${text} <i class="fas fa-chevron-down"></i>`;
        
        optionsDiv.querySelectorAll('.custom-dropdown-option').forEach(o => o.classList.remove('active'));
        const opt = optionsDiv.querySelector(`.custom-dropdown-option[data-value="${day}"]`);
        if (opt) opt.classList.add('active');
    }
    
    // Deactivate category filter buttons
    document.querySelectorAll('#filterButtonsGrid .filter-btn').forEach(btn => btn.classList.remove('active'));
    
    if (typeof filterMarkersByDay === 'function') {
        filterMarkersByDay(day);
    }
};

window.updateDayFilterDropdown = function() {
    const container = document.getElementById('dayFilterContainer');
    const customDropdown = document.getElementById('dayFilterCustom');
    const selectedEl = document.getElementById('dayFilterSelected');
    const optionsDiv = document.getElementById('dayFilterOptions');
    if (!container || !customDropdown || !selectedEl || !optionsDiv) return;
    
    if (typeof SessionManager === 'undefined') return;
    const prefs = SessionManager.loadUserPreferences();
    const totalDays = prefs.totalTripDays || 0;
    
    if (totalDays > 0) {
        container.style.display = 'block';
        let html = `<div class="custom-dropdown-option active" data-value="all">${currentLang === 'tr' ? 'Tüm Günler' : 'All Days'}</div>`;
        for(let i=1; i<=totalDays; i++) {
            html += `<div class="custom-dropdown-option" data-value="${i}">${i}. ${currentLang === 'tr' ? 'Gün' : 'Day'}</div>`;
        }
        optionsDiv.innerHTML = html;
        
        if (!customDropdown.dataset.listenerAttached) {
            selectedEl.addEventListener('click', (e) => {
                e.stopPropagation();
                customDropdown.classList.toggle('open');
            });
            document.addEventListener('click', (e) => {
                if (!customDropdown.contains(e.target)) {
                    customDropdown.classList.remove('open');
                }
            });
            customDropdown.dataset.listenerAttached = 'true';
        }
        
        // Reattach option clicks since innerHTML was replaced
        optionsDiv.querySelectorAll('.custom-dropdown-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                customDropdown.classList.remove('open');
                const val = opt.dataset.value;
                
                if (val === 'all') {
                    const allBtn = document.querySelector('#filterButtonsGrid .filter-btn[data-category="all"]');
                    if (allBtn) allBtn.click();
                } else {
                    window.filterMapByDay(val === 'all' ? 'all' : parseInt(val));
                }
            });
        });
    } else {
        container.style.display = 'none';
        optionsDiv.innerHTML = `<div class="custom-dropdown-option active" data-value="all">${currentLang === 'tr' ? 'Tüm Günler' : 'All Days'}</div>`;
    }
};

// Function to focus Map on a location clicked from Analytics
window.focusOnLocation = function(id) {
    document.getElementById('analyticsModal').classList.remove('active');
    
    if (typeof markers !== 'undefined') {
        const marker = markers.find(m => m.locationId === id);
        if (marker) {
            if (typeof focusMapOnFilteredLocations === 'function') {
                // simple hack: click the marker
                google.maps.event.trigger(marker, 'click');
                map.panTo(marker.getPosition());
                map.setZoom(15);
            }
        }
    }
}

// ===========================
// Analytics & Visitor Tracking
// ===========================

function updateVisitorCount() {
    try {
        let visits = localStorage.getItem(`visitCount_${CITY_SLUG}`);
        let lastVisit = localStorage.getItem(`lastVisit_${CITY_SLUG}`);
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (!visits) visits = 0;
        if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
            visits = parseInt(visits) + 1;
            localStorage.setItem(`visitCount_${CITY_SLUG}`, visits);
            localStorage.setItem(`lastVisit_${CITY_SLUG}`, now.toString());
        }
        return visits;
    } catch (error) {
        return 1;
    }
}

function trackPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
    updateVisitorCount();
}

function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, { event_category: category, event_label: label });
    }
}

// ===========================
// Cache Management
// ===========================

const CacheManager = {
    clearOldCache: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_') || key.startsWith('temp_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.timestamp && (Date.now() - data.timestamp) > 3600000) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) { localStorage.removeItem(key); }
                }
            });
        } catch (error) { }
    }
};

// ===========================
// Tips Loading from JSON
// ===========================

async function loadTipsFromJSON() {
    try {
        const timestamp = new Date().getTime();
        const tipsPath = `data/cities/${CITY_SLUG}/tips.json?v=${timestamp}`;
        const response = await fetch(tipsPath, { cache: 'no-cache' });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (!data.tips || !Array.isArray(data.tips)) throw new Error('Invalid tips data');
        
        renderTips(data.tips);
    } catch (error) {
        console.error('❌ Error loading tips:', error);
    }
}

function renderTips(tips) {
    const container = document.querySelector('.tips-detailed');
    if (!container) return;
    
    container.innerHTML = '';
    tips.forEach(tip => {
        container.appendChild(createTipElement(tip));
    });
    
    // Update hero guide pills links
    updateGuideLinksWithTipIds(tips);
}

function updateGuideLinksWithTipIds(tips) {
    // Ensure guide pill links match actual tip IDs
    const guideLinks = document.querySelectorAll('.guide-pill');
    guideLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#tip-')) {
            const tipId = href.substring(1);
            const tipExists = tips.find(t => t.id === tipId);
            if (!tipExists) {
                link.style.display = 'none';
            }
        }
    });
}

function createTipElement(tip) {
    const tipDiv = document.createElement('div');
    tipDiv.className = 'tip-detailed-card';
    tipDiv.id = tip.id;
    
    let contentHTML = '';
    if (tip.content) {
        contentHTML = '<ul>';
        tip.content.forEach(item => {
            let itemText = '';
            if (item.season) itemText = `<strong>${item.season}:</strong> ${item.description}`;
            else if (item.item) itemText = `<strong>${item.item}:</strong> ${item.description}`;
            else if (item.day) itemText = `<strong>${item.day}:</strong> ${item.description}`;
            else if (item.app) itemText = `<strong>${item.app}:</strong> ${item.description}`;
            contentHTML += `<li>${itemText}</li>`;
        });
        contentHTML += '</ul>';
    }
    
    tipDiv.innerHTML = `
        <div class="tip-icon-wrapper">
            <i class="fas ${tip.icon}"></i>
        </div>
        <div class="tip-content">
            <h3>${tip.title}</h3>
            <p><strong>${tip.description}</strong></p>
            ${contentHTML}
            ${tip.tip ? `<p class="tip-note"><strong>İpucu:</strong> ${tip.tip}</p>` : ''}
        </div>
    `;
    
    return tipDiv;
}

// ===========================
// Share Functionality
// ===========================

const shareModal = document.getElementById('shareModal');
const shareBtn = document.getElementById('shareBtn');
const closeModal = document.getElementById('closeModal');
const shareLinkInput = document.getElementById('shareLink');

shareBtn?.addEventListener('click', function() {
    shareModal.classList.add('active');
    shareLinkInput.value = window.location.href;
});

closeModal?.addEventListener('click', function() {
    shareModal.classList.remove('active');
});

shareModal?.addEventListener('click', function(e) {
    if (e.target === shareModal) shareModal.classList.remove('active');
});

function shareOn(platform) {
    const url = encodeURIComponent(window.location.href);
    const config = CITY_CONFIGS[CITY_SLUG] || CITY_CONFIGS.london;
    const title = encodeURIComponent(config.title);
    const text = encodeURIComponent(`${config.heroTitle}!`);
    
    let shareUrl = '';
    switch(platform) {
        case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
        case 'twitter': shareUrl = `https://x.com/intent/tweet?url=${url}&text=${text}`; break;
        case 'whatsapp': shareUrl = `https://wa.me/?text=${text}%20${url}`; break;
        case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
}

function copyLink() {
    const input = document.getElementById('shareLink');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Kopyalandı!';
        btn.style.background = '#27ae60';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
    });
}

// ===========================
// Email Favorites
// ===========================

function openEmailModal() {
    const modal = document.createElement('div');
    modal.className = 'email-modal';
    const config = CITY_CONFIGS[CITY_SLUG] || CITY_CONFIGS.london;
    
    modal.innerHTML = `
        <div class="email-modal-content">
            <div class="email-modal-header">
                <h3><i class="fas fa-envelope"></i> Favorileri E-posta ile Gönder</h3>
                <button class="email-modal-close" onclick="closeEmailModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="email-modal-body">
                <p>Favori lokasyonlarınızı e-posta adresinize göndermek için formu doldurun:</p>
                <form class="email-form" id="emailForm">
                    <div class="form-group">
                        <label for="userEmail">E-posta Adresiniz</label>
                        <input type="email" id="userEmail" placeholder="ornek@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="emailSubject">Konu</label>
                        <input type="text" id="emailSubject" value="${config.title} - Favori Lokasyonlarım">
                    </div>
                    <div class="email-actions">
                        <button type="button" class="btn-secondary" onclick="closeEmailModal()">İptal</button>
                        <button type="submit" class="btn-primary"><i class="fas fa-paper-plane"></i> Gönder</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
    document.body.appendChild(modal);
    
    document.getElementById('emailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendFavoritesEmail();
    });
}

function closeEmailModal() {
    const modal = document.querySelector('.email-modal');
    if (modal && modal.parentNode) document.body.removeChild(modal);
}

function sendFavoritesEmail() {
    const userPrefs = SessionManager.loadUserPreferences();
    const favorites = userPrefs.favoriteLocations || [];
    const email = document.getElementById('userEmail').value;
    const subject = document.getElementById('emailSubject').value;
    
    let emailBody = `Favori lokasyonlarım:\n\n`;
    favorites.forEach((name, i) => {
        emailBody += `${i + 1}. ${name}\n`;
    });
    emailBody += `\n${window.location.href}`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    closeEmailModal();
}

window.openEmailModal = openEmailModal;
window.closeEmailModal = closeEmailModal;

// ===========================
// Scroll & Engagement Tracking
// ===========================

let startTime = Date.now();
window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'time_on_page', { value: timeSpent, event_category: 'Engagement' });
    }
});

let maxScroll = 0;
window.addEventListener('scroll', function() {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if ([25, 50, 75, 100].includes(Math.floor(maxScroll / 25) * 25) && maxScroll >= 25) {
            trackEvent('Engagement', 'scroll_depth', `${Math.floor(maxScroll / 25) * 25}%`);
        }
    }
});
