# 🗺️ Özel Harita Kullanım Rehberi

Tebrikler! Artık kendi özel haritanıza sahipsiniz. Bu rehber, haritanızı nasıl kullanacağınızı ve özelleştireceğinizi gösterir.

## 🚀 Hızlı Başlangıç

### 1. Google Maps API Key Alın

`GOOGLE_MAPS_API_KURULUM.md` dosyasındaki talimatları izleyin ve API Key alın.

### 2. API Key'i Ekleyin

`index.html` dosyasında 34. satırı bulun:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&callback=initMap" async defer></script>
```

`YOUR_API_KEY_HERE` yerine kendi API Key'inizi yapıştırın.

### 3. Tarayıcıda Açın

Dosyayı kaydedin ve tarayıcıda açın. Haritanız hazır! 🎉

## 🎯 Özellikler

### ✅ Çalışan Özellikler

- **6 Filtre Butonu**: Tümü, Müzeler, Restoranlar, Turistik Yerler, Parklar, Alışveriş
- **Renkli Marker'lar**: Her kategori farklı renkte
- **Info Window'lar**: Marker'a tıklayınca detaylı bilgi
- **Zoom & Pan**: Haritayı yakınlaştırıp uzaklaştırabilirsiniz
- **Reset Butonu**: Görünümü sıfırlayın
- **Responsive**: Mobil uyumlu
- **Analytics**: Tüm etkileşimler Google Analytics'te

### 🎨 Retro Tema

Harita özel retro renklerle tasarlandı:
- Açık gri yollar
- Mavi su
- Minimal etiketler

## 📍 Lokasyon Ekleme

`map.js` dosyasındaki `locations` dizisine yeni yerler ekleyin:

```javascript
{
    name: 'Yer Adı',
    category: 'museums', // museums, restaurants, attractions, parks, shopping
    position: { lat: 51.5074, lng: -0.1278 },
    description: 'Kısa açıklama',
    info: '📍 Adres<br>🎫 Fiyat<br>⏰ Saatler'
}
```

### Örnek: Yeni Müze Eklemek

```javascript
{
    name: 'Victoria and Albert Museum',
    category: 'museums',
    position: { lat: 51.4966, lng: -0.1722 },
    description: 'Sanat ve tasarım müzesi. Dünya\'nın en büyük koleksiyonu.',
    info: '📍 Cromwell Rd<br>🎫 Ücretsiz<br>⏰ 10:00-17:45'
}
```

## 🎨 Renkleri Değiştirme

`map.js` dosyasında `CATEGORIES` objesini düzenleyin:

```javascript
const CATEGORIES = {
    museums: { color: '#e74c3c', icon: '🏛️' },      // Kırmızı
    restaurants: { color: '#f39c12', icon: '🍽️' },  // Turuncu
    attractions: { color: '#3498db', icon: '⭐' },  // Mavi
    parks: { color: '#27ae60', icon: '🌳' },        // Yeşil
    shopping: { color: '#9b59b6', icon: '🛍️' }     // Mor
};
```

## 🔍 Koordinat Bulma

Google Maps'te bir yere sağ tıklayın ve koordinatları kopyalayın:

1. https://www.google.com/maps adresine gidin
2. Bir yere sağ tıklayın
3. Koordinatları tıklayın (panoya kopyalanır)
4. Örnek: `51.5074, -0.1278`

## 🎯 Filtre Kategorileri

Mevcut kategoriler:
- `museums` - Müzeler & Kültür
- `restaurants` - Restoranlar & Kafeler
- `attractions` - Turistik Yerler
- `parks` - Parklar & Doğa
- `shopping` - Alışveriş Merkezleri

### Yeni Kategori Eklemek

1. **`map.js`** - `CATEGORIES` objesine ekleyin:
```javascript
nightlife: { color: '#8e44ad', icon: '🎵' }
```

2. **`index.html`** - Yeni filtre butonu ekleyin:
```html
<button class="filter-btn" data-category="nightlife">
    <i class="fas fa-music"></i>
    <span>Gece Hayatı</span>
</button>
```

3. **`locations`** dizisine yeni yerler ekleyin:
```javascript
{
    name: 'Ministry of Sound',
    category: 'nightlife',
    position: { lat: 51.4988, lng: -0.0989 },
    description: 'Ünlü gece kulübü',
    info: '📍 Elephant & Castle<br>💰 £20+<br>⏰ 22:00-06:00'
}
```

## 🎨 Harita Stilini Değiştirme

`map.js` dosyasındaki `getMapStyles()` fonksiyonunu düzenleyin.

### Örnek: Koyu Tema

```javascript
function getMapStyles() {
    return [
        {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "color": "#242f3e" }]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#17263c" }]
        }
    ];
}
```

**Hazır Temalar**: https://snazzymaps.com/

## 📊 Analytics Takibi

Otomatik olarak takip edilen olaylar:

- `Map loaded` - Harita yüklendi
- `Map reset` - Görünüm sıfırlandı
- `Filter: [kategori]` - Filtre değiştirildi
- `Marker click: [yer adı]` - Marker'a tıklandı

Google Analytics'te **Etkileşim → Etkinlikler** bölümünden görüntüleyin.

## 🔧 Gelişmiş Özelleştirme

### Marker İkonlarını Değiştirme

Emoji yerine özel ikon kullanın:

```javascript
icon: {
    url: 'images/museum-icon.png',
    scaledSize: new google.maps.Size(40, 40)
}
```

### Marker Animasyonu

```javascript
animation: google.maps.Animation.BOUNCE  // Zıplayan marker
```

### Özel Info Window

HTML ve CSS ile tamamen özelleştirilebilir:

```javascript
content: `
    <div style="padding: 15px; max-width: 300px;">
        <img src="image.jpg" style="width: 100%; border-radius: 8px;">
        <h3>${location.name}</h3>
        <p>${location.description}</p>
        <a href="#" style="color: #e94560;">Detaylar →</a>
    </div>
`
```

## 🐛 Sorun Giderme

### Harita Görünmüyor

1. **API Key doğru mu?** - Console'da (F12) hata mesajını kontrol edin
2. **API etkin mi?** - Maps JavaScript API etkinleştirilmiş olmalı
3. **Faturalama aktif mi?** - Kredi kartı eklenmiş olmalı

### Marker'lar Görünmüyor

1. **Koordinatlar doğru mu?** - Londra için lat: 51.x, lng: -0.x olmalı
2. **Kategori adı doğru mu?** - `CATEGORIES` objesinde tanımlı olmalı
3. **Console'da hata var mı?** - F12 ile kontrol edin

### Filtreler Çalışmıyor

1. **`data-category` doğru mu?** - HTML'deki kategori adı `locations` dizisindeki ile aynı olmalı
2. **JavaScript yüklendi mi?** - `map.js` dosyası HTML'e eklenmiş olmalı

## 📱 Mobil Optimizasyon

Harita mobilde otomatik olarak responsive:
- Touch ile zoom
- Tek parmakla kaydırma
- Küçük ekranda optimize edilmiş info window'lar

## 🚀 Performans İpuçları

1. **Marker Sayısını Sınırlayın**: 50-100 marker ideal
2. **Lazy Loading**: Sadece görünür marker'ları yükleyin
3. **Marker Clustering**: Çok marker varsa gruplama kullanın

### Marker Clustering Eklemek

```html
<script src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"></script>
```

```javascript
new MarkerClusterer({ markers, map });
```

## 📚 Kaynaklar

- **Google Maps API Docs**: https://developers.google.com/maps/documentation/javascript
- **Marker Örnekleri**: https://developers.google.com/maps/documentation/javascript/examples
- **Stil Galerisi**: https://snazzymaps.com/
- **İkon Kütüphanesi**: https://fontawesome.com/icons

## 💡 İpuçları

1. ✅ **Düzenli Güncelleyin**: Yeni yerler ekleyin
2. ✅ **Fotoğraf Ekleyin**: Info window'lara görsel ekleyin
3. ✅ **Rotalar Çizin**: Polyline ile yürüyüş rotaları
4. ✅ **Heatmap Ekleyin**: Popülerlik haritası
5. ✅ **Arama Ekleyin**: Yer arama fonksiyonu

---

**Keyifli kodlamalar! 🗺️✨**

Sorularınız için GitHub Issues açabilirsiniz.
