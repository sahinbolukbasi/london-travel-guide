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
// Console Welcome Message
// ===========================

console.log('%c🗺️ Londra Gezi Rehberi', 'font-size: 20px; font-weight: bold; color: #3498db;');
console.log('%cHoş geldiniz! Bu site GitHub Pages üzerinde yayınlanmaktadır.', 'font-size: 12px; color: #7f8c8d;');
console.log('%cAnalytics aktif - Ziyaretçi hareketleri takip ediliyor.', 'font-size: 12px; color: #27ae60;');
console.log('%cGelişmiş cache yönetimi ve hata kontrolü aktif.', 'font-size: 12px; color: #9b59b6;');
