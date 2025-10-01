# 🗺️ Google Maps API Key Alma Rehberi

Bu rehber, Google Maps JavaScript API kullanarak kendi haritanızı oluşturmanız için gerekli API Key'i nasıl alacağınızı gösterir.

## 📋 Adım Adım Kurulum

### 1️⃣ Google Cloud Console'a Giriş

1. **Google Cloud Console'a gidin**: https://console.cloud.google.com/
2. Google hesabınızla giriş yapın
3. Üst kısımda **"Proje Seç"** butonuna tıklayın
4. **"YENİ PROJE"** butonuna tıklayın

### 2️⃣ Yeni Proje Oluşturun

1. **Proje Adı**: `Londra Gezi Rehberi` (veya istediğiniz bir isim)
2. **Konum**: Varsayılan bırakın
3. **OLUŞTUR** butonuna tıklayın
4. Proje oluşturulana kadar bekleyin (30 saniye)

### 3️⃣ Google Maps API'yi Etkinleştirin

1. Sol menüden **"API'ler ve Hizmetler"** → **"Kitaplık"** seçin
2. Arama kutusuna **"Maps JavaScript API"** yazın
3. **Maps JavaScript API** seçin
4. **ETKİNLEŞTİR** butonuna tıklayın

### 4️⃣ API Key Oluşturun

1. Sol menüden **"Kimlik Bilgileri"** seçin
2. Üst kısımda **"+ KİMLİK BİLGİSİ OLUŞTUR"** butonuna tıklayın
3. **"API anahtarı"** seçin
4. API Key oluşturuldu! **Kopyalayın** ve güvenli bir yere kaydedin

### 5️⃣ API Key'i Güvenli Hale Getirin (ÖNEMLİ!)

1. Oluşturulan API Key'in yanındaki **düzenle** ikonuna tıklayın
2. **"Uygulama kısıtlamaları"** bölümünde:
   - **"HTTP yönlendirici (web siteleri)"** seçin
   - **"Web sitesi kısıtlamaları"** altına şunları ekleyin:
     ```
     http://localhost:8000/*
     http://127.0.0.1:8000/*
     https://KULLANICI_ADINIZ.github.io/*
     ```
3. **"API kısıtlamaları"** bölümünde:
   - **"Anahtarı kısıtla"** seçin
   - **"Maps JavaScript API"** seçin
4. **KAYDET** butonuna tıklayın

## 💰 Ücretlendirme

### Ücretsiz Kota (Aylık)
- **$200 ücretsiz kredi** (her ay yenilenir)
- **28,000 harita yüklemesi** ücretsiz
- Kredi kartı gerekli ama **otomatik ücretlendirme YOK**

### Nasıl Çalışır?
1. İlk $200 ücretsiz
2. Küçük siteler için genellikle yeterli
3. Limiti aşarsanız harita çalışmayı durdurur (ücret alınmaz)

## 🔐 API Key'inizi Projeye Ekleyin

`index.html` dosyasında şu satırı bulun:

```html
<!-- Google Maps API -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&callback=initMap" async defer></script>
```

`YOUR_API_KEY_HERE` yerine kendi API Key'inizi yapıştırın:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxx&callback=initMap" async defer></script>
```

## ✅ Test Edin

1. Dosyaları kaydedin
2. Tarayıcıda sayfayı açın
3. Harita görünüyorsa başarılı! 🎉

## ❌ Sorun Giderme

### "This page can't load Google Maps correctly"

**Çözüm 1**: API Key doğru mu?
- Console'da (F12) hata mesajını kontrol edin
- API Key'i kopyalarken boşluk bırakmadığınızdan emin olun

**Çözüm 2**: API etkin mi?
- Cloud Console → API'ler ve Hizmetler → Etkin API'ler
- "Maps JavaScript API" listede olmalı

**Çözüm 3**: Faturalama aktif mi?
- Cloud Console → Faturalama
- Kredi kartı ekleyin (ücret alınmaz, sadece doğrulama için)

### "RefererNotAllowedMapError"

**Çözüm**: API Key kısıtlamalarını kontrol edin
- Kimlik Bilgileri → API Key'inizi düzenleyin
- HTTP yönlendirici kısıtlamalarına domain'inizi ekleyin

### Harita gri görünüyor

**Çözüm**: CSS yükseklik sorunu
- `.map-container` için `height` tanımlı olmalı
- Minimum 400px önerilir

## 📊 Kullanım İstatistiklerini Görüntüleme

1. Cloud Console → **"API'ler ve Hizmetler"** → **"Kontrol Paneli"**
2. Günlük istek sayısını görebilirsiniz
3. Limitleri izleyin

## 🔒 Güvenlik İpuçları

1. ✅ **API Key'i GitHub'a yüklemeyin** (public repo ise)
2. ✅ **HTTP yönlendirici kısıtlaması kullanın**
3. ✅ **API kısıtlaması ekleyin** (sadece Maps JavaScript API)
4. ✅ **Kullanımı düzenli kontrol edin**
5. ❌ **API Key'i asla client-side kodda gizlemeyin** (zaten görünür olacak)

## 🆘 Yardım

- **Resmi Dokümantasyon**: https://developers.google.com/maps/documentation/javascript
- **Fiyatlandırma**: https://cloud.google.com/maps-platform/pricing
- **Destek**: https://support.google.com/maps

---

**Hazır mısınız?** API Key'inizi aldıktan sonra `index.html` dosyasına ekleyin ve haritanız çalışmaya başlasın! 🚀
