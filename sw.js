// ===========================
// Service Worker for Cache Management
// ===========================

const CACHE_NAME = 'london-guide-v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Cache edilecek dosyalar (locations.json hariç - her zaman fresh olsun)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/map.js',
    '/script.js'
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker kuruluyor...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cache açıldı:', CACHE_NAME);
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('❌ Cache kurulum hatası:', error);
            })
    );
    
    // Hemen aktif hale getir
    self.skipWaiting();
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker aktif');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eski cache'leri temizle
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eski cache siliniyor:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Tüm client'ları kontrol et
    return self.clients.claim();
});

// Fetch olaylarını yakalama
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // locations.json için özel handling - her zaman fresh data
    if (url.pathname.includes('locations.json')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Başarılı response'u cache'le (kısa süreliğine)
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network hatası durumunda cache'den döndür
                    console.log('📡 Network hatası, cache\'den locations.json döndürülüyor');
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Diğer dosyalar için cache-first stratejisi
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Cache'de varsa döndür
                if (cachedResponse) {
                    // Arka planda güncellenmiş versiyonu kontrol et
                    fetch(event.request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, response);
                            });
                        }
                    }).catch(() => {
                        // Network hatası - cache kullanmaya devam et
                    });
                    
                    return cachedResponse;
                }
                
                // Cache'de yoksa network'den al
                return fetch(event.request)
                    .then((response) => {
                        // Başarılı response'u cache'le
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ Fetch hatası:', error);
                        
                        // HTML sayfaları için offline fallback
                        if (event.request.destination === 'document') {
                            return new Response(
                                `<!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Çevrimdışı - Londra Gezi Rehberi</title>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body {
                                            font-family: 'Arial', sans-serif;
                                            text-align: center;
                                            padding: 2rem;
                                            background: #f8f9fa;
                                        }
                                        .offline-container {
                                            max-width: 500px;
                                            margin: 2rem auto;
                                            padding: 2rem;
                                            background: white;
                                            border-radius: 12px;
                                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                        }
                                        .offline-icon {
                                            font-size: 4rem;
                                            color: #e74c3c;
                                            margin-bottom: 1rem;
                                        }
                                        .retry-btn {
                                            background: #3498db;
                                            color: white;
                                            border: none;
                                            padding: 1rem 2rem;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            font-size: 1rem;
                                            margin-top: 1rem;
                                        }
                                        .retry-btn:hover {
                                            background: #2980b9;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="offline-container">
                                        <div class="offline-icon">📡</div>
                                        <h2>İnternet Bağlantısı Yok</h2>
                                        <p>Londra Gezi Rehberi'ne erişmek için internet bağlantısı gerekiyor.</p>
                                        <p>Lütfen bağlantınızı kontrol edin ve tekrar deneyin.</p>
                                        <button class="retry-btn" onclick="window.location.reload()">
                                            Yeniden Dene
                                        </button>
                                    </div>
                                </body>
                                </html>`,
                                {
                                    headers: {
                                        'Content-Type': 'text/html'
                                    }
                                }
                            );
                        }
                        
                        throw error;
                    });
            })
    );
});

// Cache temizleme mesajlarını dinle
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('🗑️ Cache temizleme komutu alındı');
        
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('✅ Tüm cache temizlendi');
            event.ports[0].postMessage({ success: true });
        }).catch((error) => {
            console.error('❌ Cache temizleme hatası:', error);
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
});

// Periyodik cache temizleme (24 saatte bir)
setInterval(() => {
    console.log('🧹 Periyodik cache temizleme başlatılıyor...');
    
    caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
            if (cacheName !== CACHE_NAME) {
                caches.delete(cacheName);
            }
        });
    });
}, 24 * 60 * 60 * 1000); // 24 saat
