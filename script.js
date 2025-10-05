// ===========================
// Analytics & Visitor Tracking
// ===========================

// Enhanced visitor counter with session management
function updateVisitorCount() {
    try {
        let visits = localStorage.getItem('visitCount');
        let lastVisit = localStorage.getItem('lastVisit');
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000; // 24 saat
        
        if (!visits) {
            visits = 0;
        }
        
        // Eğer son ziyaret 24 saatten eskiyse veya hiç ziyaret yoksa sayacı artır
        if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
            visits = parseInt(visits) + 1;
            localStorage.setItem('visitCount', visits);
            localStorage.setItem('lastVisit', now.toString());
        }
        
        // Display visitor count
        const visitorCountElement = document.getElementById('visitorCount');
        if (visitorCountElement) {
            visitorCountElement.textContent = visits.toLocaleString('tr-TR');
        }
        
        return visits;
    } catch (error) {
        console.warn('LocalStorage erişim hatası:', error);
        return 1;
    }
}

// Track page view
function trackPageView() {
    // Google Analytics tracking (if gtag is loaded)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
    
    // Update local visitor count
    updateVisitorCount();
    
    // Log visit time
    const visitTime = new Date().toISOString();
    console.log('Page viewed at:', visitTime);
}

// Track custom events
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
// Map Functionality
// ===========================

// Enhanced DOM ready handler
document.addEventListener('DOMContentLoaded', function() {
    // Cache temizleme
    CacheManager.clearOldCache();
    
    // Map loading handling
    const mapFrame = document.getElementById('mapFrame');
    const mapLoading = document.getElementById('mapLoading');
    
    if (mapFrame && mapLoading) {
        mapFrame.addEventListener('load', function() {
            setTimeout(() => {
                mapLoading.classList.add('hidden');
                trackEvent('Map', 'loaded', 'Map iframe loaded successfully');
            }, 500);
        });
    }
    
    // Load tips from JSON
    loadTipsFromJSON();
    
    // Remove static tips if JSON loads successfully
    setTimeout(() => {
        const staticTips = document.querySelectorAll('.tips-detailed .tip-detailed-card');
        if (staticTips.length > 0) {
            console.log('🔄 Replacing static tips with JSON data...');
        }
    }, 1000);
    
    // Track page view
    trackPageView();
});

// Reset map view
document.getElementById('resetViewBtn')?.addEventListener('click', function() {
    const mapFrame = document.getElementById('mapFrame');
    if (mapFrame) {
        const currentSrc = mapFrame.src;
        mapFrame.src = '';
        setTimeout(() => {
            mapFrame.src = currentSrc;
            trackEvent('Map', 'reset', 'Map view reset');
        }, 100);
    }
});

// ===========================
// Fullscreen Functionality
// ===========================

let isFullscreen = false;

document.getElementById('fullscreenBtn')?.addEventListener('click', function() {
    const mapContainer = document.getElementById('mapContainer');
    
    if (!isFullscreen) {
        if (mapContainer.requestFullscreen) {
            mapContainer.requestFullscreen();
        } else if (mapContainer.webkitRequestFullscreen) {
            mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) {
            mapContainer.msRequestFullscreen();
        }
        this.innerHTML = '<i class="fas fa-compress"></i>';
        isFullscreen = true;
        trackEvent('UI', 'fullscreen_enter', 'Entered fullscreen mode');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        this.innerHTML = '<i class="fas fa-expand"></i>';
        isFullscreen = false;
        trackEvent('UI', 'fullscreen_exit', 'Exited fullscreen mode');
    }
});

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', function() {
    const btn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement) {
        btn.innerHTML = '<i class="fas fa-expand"></i>';
        isFullscreen = false;
    }
});

// ===========================
// Print Functionality
// ===========================

document.getElementById('printBtn')?.addEventListener('click', function() {
    trackEvent('UI', 'print', 'Print button clicked');
    window.print();
});

// ===========================
// Share Functionality
// ===========================

const shareModal = document.getElementById('shareModal');
const shareBtn = document.getElementById('shareBtn');
const closeModal = document.getElementById('closeModal');
const shareLinkInput = document.getElementById('shareLink');

// Open share modal
shareBtn?.addEventListener('click', function() {
    shareModal.classList.add('active');
    shareLinkInput.value = window.location.href;
    trackEvent('UI', 'share_open', 'Share modal opened');
});

// Close share modal
closeModal?.addEventListener('click', function() {
    shareModal.classList.remove('active');
});

// Close modal when clicking outside
shareModal?.addEventListener('click', function(e) {
    if (e.target === shareModal) {
        shareModal.classList.remove('active');
    }
});

// Share on social media
function shareOn(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Londra Gezi Rehberi - London Travel Guide');
    const text = encodeURIComponent('Londra\'nın en güzel yerlerini keşfedin!');
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://x.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        trackEvent('Share', platform, `Shared on ${platform}`);
    }
}

// Copy link to clipboard
function copyLink() {
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(shareLinkInput.value).then(function() {
        const copyBtn = document.querySelector('.btn-copy');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Kopyalandı!';
        copyBtn.style.background = '#27ae60';
        
        trackEvent('Share', 'copy_link', 'Link copied to clipboard');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(function(err) {
        console.error('Kopyalama hatası:', err);
        alert('Link kopyalanamadı. Lütfen manuel olarak kopyalayın.');
    });
}

// ===========================
// Smooth Scrolling
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// Performance Tracking
// ===========================

// Track page load time
window.addEventListener('load', function() {
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            name: 'load',
            value: loadTime,
            event_category: 'Performance'
        });
    }
});

// ===========================
// User Engagement Tracking
// ===========================

// Track time on page
let startTime = Date.now();

window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'time_on_page', {
            value: timeSpent,
            event_category: 'Engagement'
        });
    }
    
    console.log('Time spent on page:', timeSpent + ' seconds');
});

// Track scroll depth
let maxScroll = 0;

window.addEventListener('scroll', function() {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestones
        if (maxScroll >= 25 && maxScroll < 50) {
            trackEvent('Engagement', 'scroll_depth', '25%');
        } else if (maxScroll >= 50 && maxScroll < 75) {
            trackEvent('Engagement', 'scroll_depth', '50%');
        } else if (maxScroll >= 75 && maxScroll < 100) {
            trackEvent('Engagement', 'scroll_depth', '75%');
        } else if (maxScroll >= 100) {
            trackEvent('Engagement', 'scroll_depth', '100%');
        }
    }
});

// ===========================
// Mobile Menu & Responsive
// ===========================

// Detect mobile device
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if (isMobile()) {
    document.body.classList.add('mobile-device');
    trackEvent('Device', 'type', 'Mobile');
} else {
    trackEvent('Device', 'type', 'Desktop');
}

// ===========================
// Error Handling
// ===========================

window.addEventListener('error', function(e) {
    console.error('Error occurred:', e.message);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.message,
            fatal: false
        });
    }
});

// ===========================
// Enhanced Cache Management
// ===========================

// Cache yönetimi için yardımcı fonksiyonlar
const CacheManager = {
    // Cache temizleme
    clearOldCache: () => {
        try {
            // Eski cache verilerini temizle
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('cache_') || key.startsWith('temp_')) {
                    const item = localStorage.getItem(key);
                    try {
                        const data = JSON.parse(item);
                        const now = Date.now();
                        // 1 saatten eski cache'leri temizle
                        if (data.timestamp && (now - data.timestamp) > 3600000) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.warn('Cache temizleme hatası:', error);
        }
    },
    
    // Browser cache'ini temizle
    forceCacheRefresh: () => {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
    },
    
    // Sayfa yenileme ile cache temizleme
    refreshWithCacheClear: () => {
        CacheManager.forceCacheRefresh();
        window.location.reload(true);
    }
};

// ===========================
// Tips Loading from JSON
// ===========================

async function loadTipsFromJSON() {
    try {
        console.log('🔄 Loading tips from JSON...');
        
        // Cache busting için timestamp ekle
        const timestamp = new Date().getTime();
        const response = await fetch(`tips.json?v=${timestamp}`, {
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
        
        if (!data.tips || !Array.isArray(data.tips)) {
            throw new Error('Invalid tips data format');
        }
        
        renderTips(data.tips);
        console.log(`✅ ${data.tips.length} tips loaded successfully`);
        
    } catch (error) {
        console.error('❌ Error loading tips:', error);
        // Keep existing static tips if JSON loading fails
        console.log('📝 Using fallback static tips');
    }
}

function renderTips(tips) {
    const tipsContainer = document.querySelector('.tips-detailed');
    if (!tipsContainer) {
        console.warn('Tips container not found');
        return;
    }
    
    // Clear existing tips (including static HTML)
    tipsContainer.innerHTML = '';
    
    tips.forEach(tip => {
        const tipElement = createTipElement(tip);
        tipsContainer.appendChild(tipElement);
    });
    
    console.log(`✅ Rendered ${tips.length} tips from JSON successfully`);
}

function createTipElement(tip) {
    const tipDiv = document.createElement('div');
    tipDiv.className = 'tip-detailed-card';
    tipDiv.id = tip.id;
    
    let contentHTML = '';
    
    // Generate content based on tip structure
    if (tip.content) {
        contentHTML = '<ul>';
        tip.content.forEach(item => {
            let itemText = '';
            if (item.season) {
                itemText = `<strong>${item.season}:</strong> ${item.description}`;
            } else if (item.item) {
                itemText = `<strong>${item.item}:</strong> ${item.description}`;
            } else if (item.day) {
                itemText = `<strong>${item.day}:</strong> ${item.description}`;
            } else if (item.app) {
                itemText = `<strong>${item.app}:</strong> ${item.description}`;
            }
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
// Console Welcome Message
// ===========================

// ===========================
// Email Favorites Modal
// ===========================

function openEmailModal() {
    const modal = document.createElement('div');
    modal.className = 'email-modal';
    modal.innerHTML = `
        <div class="email-modal-content">
            <div class="email-modal-header">
                <h3>
                    <i class="fas fa-envelope"></i>
                    Favorileri E-posta ile Gönder
                </h3>
                <button class="email-modal-close" onclick="closeEmailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="email-modal-body">
                <p>Favori lokasyonlarınızı e-posta adresinize göndermek için aşağıdaki formu doldurun:</p>
                
                <form class="email-form" id="emailForm">
                    <div class="form-group">
                        <label for="userEmail">E-posta Adresiniz</label>
                        <input type="email" id="userEmail" name="email" placeholder="ornek@email.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="emailSubject">Konu (Opsiyonel)</label>
                        <input type="text" id="emailSubject" name="subject" placeholder="Londra Favori Lokasyonlarım" value="Londra Favori Lokasyonlarım">
                    </div>
                    
                    <div class="form-group">
                        <label for="emailMessage">Ek Mesaj (Opsiyonel)</label>
                        <textarea id="emailMessage" name="message" rows="3" placeholder="Favori lokasyonlarımı paylaşıyorum..."></textarea>
                    </div>
                    
                    <div class="email-actions">
                        <button type="button" class="btn-secondary" onclick="closeEmailModal()">İptal</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-paper-plane"></i>
                            Gönder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('emailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendFavoritesEmail();
    });
}

function closeEmailModal() {
    const modal = document.querySelector('.email-modal');
    if (modal) {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 300);
    }
}

function sendFavoritesEmail() {
    const userPrefs = SessionManager.loadUserPreferences();
    const favorites = userPrefs.favoriteLocations || [];
    const email = document.getElementById('userEmail').value;
    const subject = document.getElementById('emailSubject').value || 'Londra Favori Lokasyonlarım';
    const message = document.getElementById('emailMessage').value;
    
    // Create email content
    let emailBody = `Merhaba!\n\n`;
    if (message) {
        emailBody += `${message}\n\n`;
    }
    emailBody += `Londra'da favori lokasyonlarım:\n\n`;
    
    favorites.forEach((favName, index) => {
        const location = locations.find(loc => loc.name === favName);
        if (location) {
            emailBody += `${index + 1}. ${location.name}\n`;
            emailBody += `   Kategori: ${getCategoryName(location.category)}\n`;
            emailBody += `   Açıklama: ${location.description}\n`;
            emailBody += `   Google Maps: https://www.google.com/maps/place/${location.position.lat},${location.position.lng}\n\n`;
        }
    });
    
    emailBody += `Bu liste Londra Gezi Rehberi (${window.location.href}) kullanılarak oluşturulmuştur.\n\n`;
    emailBody += `İyi geziler! 🗺️`;
    
    // Create mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    showFavoriteNotification('E-posta uygulamanız açıldı!', 'added');
    
    // Close modal
    closeEmailModal();
    
    trackEvent('Favorites', 'email_sent', favorites.length);
}

function getCategoryName(category) {
    const categoryNames = {
        'museums': 'Müze',
        'restaurants': 'Restoran',
        'attractions': 'Turistik Yer',
        'parks': 'Park',
        'shopping': 'Alışveriş Merkezi',
        'entertainment': 'Eğlence Merkezi',
        'cafes': 'Kafe'
    };
    return categoryNames[category] || category;
}

// Make functions globally accessible
window.openEmailModal = openEmailModal;
window.closeEmailModal = closeEmailModal;

console.log('%c🗺️ Londra Gezi Rehberi', 'font-size: 20px; font-weight: bold; color: #3498db;');
console.log('%cHoş geldiniz! Bu site GitHub Pages üzerinde yayınlanmaktadır.', 'font-size: 12px; color: #7f8c8d;');
console.log('%cAnalytics aktif - Ziyaretçi hareketleri takip ediliyor.', 'font-size: 12px; color: #27ae60;');
console.log('%cGelişmiş cache yönetimi ve hata kontrolü aktif.', 'font-size: 12px; color: #9b59b6;');
