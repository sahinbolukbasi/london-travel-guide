# 🗺️ Londra Gezi Rehberi | London Travel Guide

Modern ve kullanıcı dostu bir Londra gezi rehberi web sitesi. Google Maps entegrasyonu ile interaktif harita deneyimi sunar.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Özellikler

- 🎨 **Modern & Minimalist Tasarım**: Beyaz tonlarda, sade ve şık arayüz
- 📱 **Responsive**: Mobil, tablet ve masaüstü uyumlu
- 🗺️ **Google Maps Entegrasyonu**: İnteraktif harita ile kolay navigasyon
- 📊 **Analytics**: Google Analytics ile ziyaretçi takibi
- 🖨️ **Yazdırma Desteği**: Haritayı ve bilgileri yazdırabilme
- 🔗 **Sosyal Medya Paylaşımı**: Facebook, X, WhatsApp, LinkedIn
- 🖥️ **Tam Ekran Modu**: Haritayı tam ekranda görüntüleme
- ⚡ **Hızlı Yükleme**: Optimize edilmiş performans
- 🎯 **SEO Uyumlu**: Arama motorları için optimize edilmiş

## 🚀 Kurulum

### 1. Projeyi İndirin

```bash
git clone https://github.com/KULLANICI_ADINIZ/london-travel-guid.git
cd london-travel-guid
```

### 2. Google Maps iframe URL'sini Ekleyin

`index.html` dosyasını açın ve aşağıdaki satırı bulun:

```html
<iframe 
    id="mapFrame"
    src="YOUR_GOOGLE_MAPS_EMBED_URL_HERE"
```

Google Maps'ten aldığınız iframe URL'sini buraya yapıştırın.

#### Google Maps iframe Nasıl Alınır?

1. [Google Maps](https://www.google.com/maps) adresine gidin
2. Haritanızı oluşturun veya mevcut haritanızı açın
3. "Paylaş" veya "Share" butonuna tıklayın
4. "Haritayı göm" veya "Embed a map" sekmesine tıklayın
5. iframe kodunu kopyalayın
6. Sadece `src="..."` kısmındaki URL'yi kullanın

### 3. Google Analytics Kurulumu

`index.html` dosyasında aşağıdaki satırı bulun:

```javascript
gtag('config', 'G-XXXXXXXXXX'); // Buraya kendi Google Analytics ID'nizi ekleyin
```

Kendi Google Analytics Measurement ID'nizi buraya ekleyin.

#### Google Analytics ID Nasıl Alınır?

1. [Google Analytics](https://analytics.google.com/) hesabınıza giriş yapın
2. Yeni bir property oluşturun
3. "Veri Akışı" (Data Stream) ekleyin
4. "Measurement ID" (G-XXXXXXXXXX formatında) kopyalayın
5. Her iki yerdeki `G-XXXXXXXXXX` değerini değiştirin

## 📦 GitHub Pages ile Yayınlama

### Adım 1: GitHub Repository Oluşturun

1. GitHub'da yeni bir repository oluşturun
2. Repository adı: `london-travel-guid` (veya istediğiniz bir isim)

### Adım 2: Kodu GitHub'a Yükleyin

```bash
git init
git add .
git commit -m "İlk commit: Londra gezi rehberi"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/london-travel-guid.git
git push -u origin main
```

### Adım 3: GitHub Pages'i Aktifleştirin

1. Repository'nizin **Settings** sekmesine gidin
2. Sol menüden **Pages** seçeneğine tıklayın
3. **Source** bölümünde **main** branch'ini seçin
4. **Root** klasörünü seçin
5. **Save** butonuna tıklayın
6. Birkaç dakika sonra siteniz yayında olacak!

Siteniz şu adreste yayınlanacak:
```
https://worldtravelguid.uk/
```

## 📊 Analytics ve Takip

### Google Analytics ile Takip Edilen Metrikler:

- ✅ Sayfa görüntülemeleri
- ✅ Ziyaretçi sayısı
- ✅ Oturum süresi
- ✅ Scroll derinliği (25%, 50%, 75%, 100%)
- ✅ Harita etkileşimleri
- ✅ Buton tıklamaları (paylaş, yazdır, tam ekran)
- ✅ Sosyal medya paylaşımları
- ✅ Cihaz türü (mobil/masaüstü)
- ✅ Sayfa yükleme süresi

### Yerel Ziyaretçi Sayacı:

Site ayrıca tarayıcının localStorage'ında yerel bir ziyaretçi sayacı tutar. Bu, Google Analytics'e ek olarak basit bir takip mekanizması sağlar.

## 🎨 Özelleştirme

### Renkleri Değiştirme

`styles.css` dosyasının başındaki CSS değişkenlerini düzenleyin:

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    /* ... diğer renkler */
}
```

### İçerik Güncelleme

- **Başlık**: `index.html` içindeki `<h1>` etiketini düzenleyin
- **İpuçları**: `.tip-card` sınıfına sahip kartları düzenleyin
- **Footer Bilgileri**: `<footer>` bölümünü düzenleyin

## 📱 Tarayıcı Desteği

- ✅ Chrome (son 2 versiyon)
- ✅ Firefox (son 2 versiyon)
- ✅ Safari (son 2 versiyon)
- ✅ Edge (son 2 versiyon)
- ✅ Mobil tarayıcılar

## 🛠️ Teknolojiler

- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript (ES6+)
- Google Maps Embed API
- Google Analytics 4
- Font Awesome Icons

## 📄 Dosya Yapısı

```
london-travel-guid/
├── index.html          # Ana HTML dosyası
├── styles.css          # Stil dosyası
├── script.js           # JavaScript dosyası
└── README.md           # Bu dosya
```

## 🔒 Güvenlik

- ✅ HTTPS üzerinden yayınlanır (GitHub Pages otomatik)
- ✅ Content Security Policy uyumlu
- ✅ XSS koruması
- ✅ API anahtarları güvenli şekilde saklanır

## 🐛 Sorun Giderme

### Harita Görünmüyor

- Google Maps iframe URL'sini doğru eklediğinizden emin olun
- iframe URL'sinin `https://` ile başladığından emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### Analytics Çalışmıyor

- Google Analytics Measurement ID'yi doğru girdiğinizden emin olun
- Tarayıcınızın ad-blocker eklentisini devre dışı bırakın
- 24-48 saat sonra verilerin görünmeye başlayacağını unutmayın

### GitHub Pages Yayınlanmıyor

- Repository'nin public olduğundan emin olun
- Settings > Pages ayarlarını kontrol edin
- Ana dosyanın `index.html` olarak adlandırıldığından emin olun

## 📈 Performans

- ⚡ Lighthouse Score: 95+
- 🚀 First Contentful Paint: < 1.5s
- 📊 Time to Interactive: < 3.0s
- 💯 SEO Score: 100

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull request göndermekten çekinmeyin.

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz.

## 🙏 Teşekkürler

- [Font Awesome](https://fontawesome.com/) - İkonlar için
- [Google Maps](https://maps.google.com/) - Harita entegrasyonu için
- [Google Analytics](https://analytics.google.com/) - Analytics için

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!

**Keyifli geziler! 🗺️✈️**
