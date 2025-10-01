# 🚀 Hızlı Kurulum Rehberi

Bu rehber, Londra Gezi Rehberi web sitenizi GitHub Pages'te yayınlamak için adım adım talimatlar içerir.

## ⚡ Hızlı Başlangıç (5 Dakika)

### 1️⃣ Google Maps iframe URL'sini Alın

1. **Google Maps'e gidin**: https://www.google.com/maps
2. **Haritanızı açın** veya yeni bir harita oluşturun
3. **Paylaş** butonuna tıklayın
4. **"Haritayı göm"** sekmesine tıklayın
5. **iframe kodunu kopyalayın**

Örnek iframe kodu:
```html
<iframe src="https://www.google.com/maps/d/embed?mid=XXXXX" width="640" height="480"></iframe>
```

6. **Sadece URL kısmını** (src="..." içindeki) kopyalayın
7. **`index.html` dosyasını açın**
8. **Satır 42'yi** bulun ve `YOUR_GOOGLE_MAPS_EMBED_URL_HERE` yerine URL'nizi yapıştırın

```html
<!-- ÖNCE -->
<iframe 
    id="mapFrame"
    src="YOUR_GOOGLE_MAPS_EMBED_URL_HERE"

<!-- SONRA -->
<iframe 
    id="mapFrame"
    src="https://www.google.com/maps/d/embed?mid=XXXXX"
```

### 2️⃣ Google Analytics Kurulumu (Opsiyonel ama Önerilen)

1. **Google Analytics'e gidin**: https://analytics.google.com/
2. **Hesap oluşturun** (yoksa)
3. **Yeni Property ekleyin**:
   - Property adı: "Londra Gezi Rehberi"
   - Zaman dilimi: Türkiye
   - Para birimi: TRY
4. **Veri Akışı oluşturun**:
   - Platform: Web
   - Web sitesi URL'si: GitHub Pages URL'niz (daha sonra güncelleyebilirsiniz)
5. **Measurement ID'yi kopyalayın** (G-XXXXXXXXXX formatında)
6. **`index.html` dosyasını açın**
7. **Satır 18 ve 19'u** bulun ve `G-XXXXXXXXXX` yerine kendi ID'nizi yapıştırın

```javascript
<!-- ÖNCE -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- SONRA -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ABC123DEF4');
</script>
```

### 3️⃣ GitHub'a Yükleyin

#### Yöntem 1: GitHub Web Arayüzü (Kolay)

1. **GitHub'a giriş yapın**: https://github.com
2. **Yeni repository oluşturun**:
   - Sağ üstteki **+** işaretine tıklayın
   - **New repository** seçin
   - Repository adı: `london-travel-guid`
   - Public seçin
   - **Create repository** tıklayın
3. **Dosyaları yükleyin**:
   - **uploading an existing file** linkine tıklayın
   - Tüm dosyaları sürükleyip bırakın:
     - `index.html`
     - `styles.css`
     - `script.js`
     - `README.md`
     - `.gitignore`
   - **Commit changes** tıklayın

#### Yöntem 2: Terminal/Komut Satırı (Gelişmiş)

```bash
# Proje klasörüne gidin
cd /Users/apple/Desktop/london-travel-guid

# Git başlatın
git init

# Dosyaları ekleyin
git add .

# İlk commit
git commit -m "İlk commit: Londra gezi rehberi"

# Ana branch'i main olarak ayarlayın
git branch -M main

# GitHub repository'nizi ekleyin (KULLANICI_ADINIZ'i değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/london-travel-guid.git

# GitHub'a yükleyin
git push -u origin main
```

### 4️⃣ GitHub Pages'i Aktifleştirin

1. **Repository'nize gidin**: https://github.com/KULLANICI_ADINIZ/london-travel-guid
2. **Settings** sekmesine tıklayın
3. Sol menüden **Pages** seçin
4. **Source** bölümünde:
   - Branch: **main** seçin
   - Folder: **/ (root)** seçin
5. **Save** butonuna tıklayın
6. **Bekleyin** (1-5 dakika)
7. Sayfa yenilendiğinde üstte yeşil bir kutu görünecek:
   ```
   ✅ Your site is live at https://KULLANICI_ADINIZ.github.io/london-travel-guid/
   ```

### 5️⃣ Sitenizi Test Edin

1. **URL'yi açın**: https://KULLANICI_ADINIZ.github.io/london-travel-guid/
2. **Kontrol edin**:
   - ✅ Harita görünüyor mu?
   - ✅ Butonlar çalışıyor mu?
   - ✅ Mobilde düzgün görünüyor mu?
   - ✅ Paylaşma özellikleri çalışıyor mu?

## 🎨 Özelleştirme İpuçları

### Site Başlığını Değiştirin

`index.html` dosyasında:
```html
<!-- Satır 13 -->
<title>Londra Gezi Rehberi | London Travel Guide</title>

<!-- Satır 30 -->
<h1>Londra Gezi Rehberi</h1>
```

### Renkleri Değiştirin

`styles.css` dosyasının başında:
```css
:root {
    --primary-color: #2c3e50;      /* Ana renk */
    --secondary-color: #3498db;    /* İkincil renk (mavi) */
    --accent-color: #e74c3c;       /* Vurgu rengi (kırmızı) */
}
```

### İpuçlarını Güncelleyin

`index.html` dosyasında `.tip-card` sınıfına sahip bölümleri düzenleyin (Satır 120-145).

### Sosyal Medya Linklerini Ekleyin

`index.html` dosyasında footer bölümündeki sosyal medya linklerini güncelleyin (Satır 165-180).

## 📊 Analytics Verilerini Görüntüleme

1. **Google Analytics'e gidin**: https://analytics.google.com/
2. **Property'nizi seçin**
3. **Raporlar** sekmesine tıklayın
4. **Gerçek Zamanlı** bölümünden anlık ziyaretçileri görebilirsiniz
5. **Etkileşim > Etkinlikler** bölümünden özel etkinlikleri görebilirsiniz:
   - `page_view` - Sayfa görüntülemeleri
   - `share_open` - Paylaş modalı açılışları
   - `fullscreen_enter` - Tam ekran kullanımı
   - `scroll_depth` - Scroll derinliği
   - `print` - Yazdırma işlemleri

## 🔧 Sorun Giderme

### Harita Görünmüyor

**Çözüm 1**: iframe URL'sini kontrol edin
- URL `https://` ile başlamalı
- URL tırnak içinde olmalı
- Tarayıcı konsolunda hata var mı kontrol edin (F12)

**Çözüm 2**: Google Maps gömme ayarlarını kontrol edin
- Haritanızın paylaşım ayarlarının "Public" olduğundan emin olun

### GitHub Pages Çalışmıyor

**Çözüm 1**: Repository public mi?
- Settings > General > Danger Zone
- Repository'nin public olduğundan emin olun

**Çözüm 2**: Dosya adları doğru mu?
- Ana dosya `index.html` olmalı (küçük harflerle)
- Dosya uzantıları doğru olmalı (.html, .css, .js)

**Çözüm 3**: Bekleyin
- GitHub Pages'in aktif olması 1-5 dakika sürebilir
- Sayfayı yenileyin ve tekrar kontrol edin

### Analytics Veri Göstermiyor

**Çözüm 1**: Measurement ID doğru mu?
- `G-` ile başlamalı
- Her iki yerde de aynı ID olmalı

**Çözüm 2**: Bekleyin
- İlk verilerin görünmesi 24-48 saat sürebilir
- "Gerçek Zamanlı" raporlarında hemen görebilirsiniz

**Çözüm 3**: Ad-blocker
- Tarayıcınızın ad-blocker eklentisini devre dışı bırakın
- Gizli mod kullanmayın (analytics engellenebilir)

## 📱 Mobil Test

Sitenizi mobilde test etmek için:

1. **Tarayıcı DevTools** (F12):
   - Toggle device toolbar (Ctrl+Shift+M)
   - Farklı cihazları test edin

2. **Gerçek Cihaz**:
   - QR kod oluşturun: https://www.qr-code-generator.com/
   - URL'nizi girin
   - Mobil cihazınızla tarayın

## 🎯 Sonraki Adımlar

- [ ] Custom domain ekleyin (opsiyonel)
- [ ] Favicon ekleyin
- [ ] Daha fazla içerik ekleyin
- [ ] SEO optimizasyonu yapın
- [ ] Sosyal medyada paylaşın

## 💡 Öneriler

1. **Düzenli Güncelleyin**: Haritanızı ve içeriğinizi güncel tutun
2. **Analytics Takip Edin**: Hangi içeriklerin popüler olduğunu görün
3. **Geri Bildirim Alın**: Kullanıcılardan geri bildirim toplayın
4. **Backup Alın**: Kodunuzu düzenli olarak yedekleyin

## 🆘 Yardım

Sorun yaşıyorsanız:

1. **README.md** dosyasını okuyun
2. **GitHub Issues** açın
3. **Google** araması yapın
4. **Stack Overflow** kontrol edin

---

**Başarılar! 🎉**

Herhangi bir sorunuz varsa issue açmaktan çekinmeyin!
