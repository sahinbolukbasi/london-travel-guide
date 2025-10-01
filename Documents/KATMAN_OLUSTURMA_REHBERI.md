# 🗺️ Google My Maps Katman Oluşturma Rehberi

Bu rehber, Google My Maps'te katmanlar oluşturarak haritanızı organize etmenizi ve kullanıcıların filtreleme yapabilmesini sağlar.

## 📋 Adım Adım Katman Oluşturma

### 1. Google My Maps'i Açın

1. Tarayıcınızda şu adresi açın: https://www.google.com/maps/d/
2. Mevcut haritanızı açın veya yeni bir harita oluşturun

### 2. Katmanları Oluşturun

Sol panelde "Katman ekle" butonuna tıklayın ve aşağıdaki katmanları oluşturun:

#### 🏛️ Katman 1: Müzeler & Kültür
**Eklenecek Yerler:**
- British Museum
- National Gallery
- Tate Modern
- Victoria and Albert Museum (V&A)
- Natural History Museum
- Science Museum
- Churchill War Rooms
- National Portrait Gallery

**Pin Rengi:** Kırmızı

---

#### 🍽️ Katman 2: Restoranlar & Kafeler
**Eklenecek Yerler:**
- Borough Market
- Dishoom (Covent Garden)
- The Ivy
- Sketch (Afternoon Tea)
- Flat Iron Steak
- Hoppers (Soho)
- Monmouth Coffee
- Ottolenghi

**Pin Rengi:** Turuncu

---

#### ⭐ Katman 3: Turistik Yerler
**Eklenecek Yerler:**
- Big Ben & Houses of Parliament
- Tower of London
- Tower Bridge
- London Eye
- Buckingham Palace
- Westminster Abbey
- St. Paul's Cathedral
- Piccadilly Circus
- Trafalgar Square
- The Shard

**Pin Rengi:** Mavi

---

#### 🌳 Katman 4: Parklar & Doğa
**Eklenecek Yerler:**
- Hyde Park
- Regent's Park
- St. James's Park
- Greenwich Park
- Hampstead Heath
- Richmond Park
- Kew Gardens
- Primrose Hill

**Pin Rengi:** Yeşil

---

#### 🛍️ Katman 5: Alışveriş Merkezleri
**Eklenecek Yerler:**
- Oxford Street
- Harrods
- Selfridges
- Covent Garden Market
- Camden Market
- Portobello Road Market
- Westfield London
- Liberty London
- Fortnum & Mason

**Pin Rengi:** Mor

---

#### 🚇 Katman 6: Ulaşım Noktaları
**Eklenecek Yerler:**
- King's Cross Station
- Paddington Station
- Victoria Station
- Liverpool Street Station
- Heathrow Airport (Express)
- Gatwick Airport (Express)
- London Bridge Station

**Pin Rengi:** Gri/Siyah

---

## 🎨 Pin Ekleme ve Özelleştirme

### Her Bir Yer İçin:

1. **Arama Yapın**: Sol üstteki arama kutusuna yer adını yazın
2. **Pin Ekleyin**: Sonuçlardan "Haritaya ekle" butonuna tıklayın
3. **Katman Seçin**: Doğru katmanı seçin
4. **Bilgi Ekleyin**: 
   - Başlık
   - Açıklama (örn: "Ücretsiz giriş, Çarşamba 20:00'ye kadar açık")
   - Fotoğraf (opsiyonel)
   - Web sitesi linki

### Pin Rengini Değiştirme:

1. Pin'e tıklayın
2. Düzenle (kalem) ikonuna tıklayın
3. Pin ikonuna tıklayın
4. Renk ve ikon seçin

## 🎯 Katman Görünürlüğü

### Kullanıcılar İçin:

Haritanız web sitenizde göründüğünde, kullanıcılar:

1. **Sol panelde** tüm katmanları görecek
2. Her katmanın **yanındaki onay kutusuna** tıklayarak o katmanı göster/gizle yapabilir
3. **Birden fazla katmanı** aynı anda açık tutabilir
4. **Sadece ilgilendikleri kategorileri** görebilir

### Örnek Kullanım Senaryoları:

- **Sadece müzeleri görmek isteyen** → Sadece "Müzeler & Kültür" katmanını açar
- **Yemek planı yapan** → "Restoranlar & Kafeler" katmanını açar
- **Genel tur planlayan** → Tüm katmanları açık tutar
- **Alışveriş odaklı gezi** → "Alışveriş Merkezleri" ve "Ulaşım Noktaları" katmanlarını açar

## 💡 İpuçları

### 1. Açıklama Ekleyin
Her pin için detaylı bilgi ekleyin:
```
📍 British Museum
🎫 Giriş: ÜCRETSİZ
⏰ Açılış: 10:00-17:00 (Cuma 20:30'a kadar)
🚇 En Yakın Metro: Tottenham Court Road
💡 İpucu: Sabah 10:00'da gidin, kalabalık olmadan gezilebilir
🌐 britishmuseum.org
```

### 2. Rotalar Oluşturun
Katmanlar içinde yürüyüş rotaları çizebilirsiniz:
- "Çizgi ekle" aracını kullanın
- Günlük gezi rotalarını gösterin
- Mesafe ve süre bilgisi ekleyin

### 3. Bölgelere Ayırın
Alternatif olarak, katmanları bölgelere göre de ayırabilirsiniz:
- Westminster & City
- South Bank
- East London
- West End
- North London

### 4. Renkli İkonlar Kullanın
Her kategori için farklı renk ve ikon kullanın:
- 🏛️ Müzeler: Kırmızı, Bina ikonu
- 🍽️ Restoranlar: Turuncu, Çatal-Bıçak ikonu
- ⭐ Turistik: Mavi, Yıldız ikonu
- 🌳 Parklar: Yeşil, Ağaç ikonu
- 🛍️ Alışveriş: Mor, Alışveriş çantası ikonu

## 🔄 Haritayı Güncelleme

Haritanızı güncelledikten sonra:

1. **Otomatik Güncelleme**: Web sitenizdeki iframe otomatik olarak güncellenecek
2. **Yeni Katman Eklediyseniz**: `index.html` dosyasındaki legend kısmını güncelleyin
3. **Renk Değiştirdiyseniz**: CSS'teki renkleri eşleştirin

## 📤 Haritayı Paylaşma Ayarları

Haritanızın herkese açık olduğundan emin olun:

1. **Paylaş** butonuna tıklayın
2. **"Erişimi olan herkes"** veya **"Web'de herkese açık"** seçin
3. **Bağlantıyı kopyala** → Bu URL'yi web sitenizde kullanın

## 🎬 Video Eğitim

Google My Maps kullanımı için resmi video: https://www.youtube.com/watch?v=NRe2WnTLHJE

## ❓ Sık Sorulan Sorular

### S: Kaç katman ekleyebilirim?
**C:** Google My Maps'te bir haritada maksimum 10 katman oluşturabilirsiniz.

### S: Her katmanda kaç pin olabilir?
**C:** Her katmanda sınırsız pin ekleyebilirsiniz, ancak toplam 2000 öğe limiti vardır.

### S: Katmanları sıralayabilir miyim?
**C:** Evet, sol panelde katmanları sürükleyerek sıralayabilirsiniz.

### S: Mobilde de çalışır mı?
**C:** Evet, kullanıcılar mobil cihazlarda da katmanları açıp kapatabilir.

### S: Katman isimlerini değiştirebilir miyim?
**C:** Evet, katman adına tıklayarak istediğiniz zaman değiştirebilirsiniz.

## 🚀 Sonraki Adımlar

1. ✅ Katmanları oluşturun
2. ✅ Her katmana en az 5-10 yer ekleyin
3. ✅ Pin renklerini ve ikonlarını özelleştirin
4. ✅ Her yere açıklama ve bilgi ekleyin
5. ✅ Haritayı herkese açık yapın
6. ✅ Web sitenizde test edin

---

**İyi Çalışmalar! 🗺️✨**

Sorularınız için: Google My Maps Yardım Merkezi - https://support.google.com/mymaps
