# 📍 Lokasyon Düzenleme Rehberi

Bu rehber, `locations.json` dosyasını düzenleyerek haritanıza yeni yerler eklemenizi veya mevcut yerleri güncellemenizi gösterir.

## 📁 Dosya Yapısı

`locations.json` dosyası şu yapıya sahiptir:

```json
{
  "locations": [
    {
      "name": "Yer Adı",
      "category": "kategori",
      "icon": "fa-icon-adi",
      "position": {
        "lat": 51.5074,
        "lng": -0.1278
      },
      "description": "Kısa açıklama",
      "info": "Detaylı bilgiler"
    }
  ]
}
```

## 🎯 Alan Açıklamaları

### `name` (Zorunlu)
Yerin adı. Haritada ve info window'da görünür.

**Örnek:**
```json
"name": "British Museum"
```

### `category` (Zorunlu)
Yerin kategorisi. Filtreleme için kullanılır.

**Mevcut Kategoriler:**
- `museums` - Müzeler & Kültür
- `restaurants` - Restoranlar & Kafeler
- `attractions` - Turistik Yerler
- `parks` - Parklar & Doğa
- `shopping` - Alışveriş Merkezleri

**Örnek:**
```json
"category": "museums"
```

### `icon` (Zorunlu)
Font Awesome ikon adı. Buton ikonları ile eşleşir.

**Mevcut İkonlar:**
- `fa-landmark` - Müzeler (🏛️)
- `fa-utensils` - Restoranlar (🍽️)
- `fa-star` - Turistik Yerler (⭐)
- `fa-tree` - Parklar (🌳)
- `fa-shopping-bag` - Alışveriş (🛍️)

**Örnek:**
```json
"icon": "fa-landmark"
```

**Daha Fazla İkon:** https://fontawesome.com/icons

### `position` (Zorunlu)
Yerin koordinatları (enlem ve boylam).

**Örnek:**
```json
"position": {
  "lat": 51.5194,
  "lng": -0.1270
}
```

**Koordinat Bulma:**
1. Google Maps'te yere sağ tıklayın
2. Koordinatları tıklayın (kopyalanır)
3. İlk sayı `lat`, ikinci sayı `lng`

### `description` (Zorunlu)
Kısa açıklama. Info window'da görünür.

**Örnek:**
```json
"description": "Dünyanın en ünlü müzelerinden biri. Ücretsiz giriş."
```

### `info` (Zorunlu)
Detaylı bilgiler. HTML kullanabilirsiniz.

**Örnek:**
```json
"info": "📍 Great Russell St<br>🎫 Ücretsiz<br>⏰ 10:00-17:00"
```

**Kullanılabilir HTML:**
- `<br>` - Satır atlama
- `<strong>` - Kalın yazı
- `<em>` - İtalik yazı

## ➕ Yeni Lokasyon Ekleme

### Adım 1: Koordinatları Bulun

1. https://www.google.com/maps adresine gidin
2. Eklemek istediğiniz yere sağ tıklayın
3. Koordinatları tıklayın (otomatik kopyalanır)

### Adım 2: JSON'a Ekleyin

`locations.json` dosyasını açın ve `locations` dizisine yeni bir obje ekleyin:

```json
{
  "locations": [
    // ... mevcut lokasyonlar ...
    ,
    {
      "name": "Westminster Abbey",
      "category": "attractions",
      "icon": "fa-star",
      "position": {
        "lat": 51.4993,
        "lng": -0.1273
      },
      "description": "Kraliyet düğünleri ve cenaze törenleri yapılan tarihi kilise.",
      "info": "📍 Westminster<br>🎫 £27<br>⏰ 09:30-15:30"
    }
  ]
}
```

**DİKKAT:** Son lokasyondan önce virgül eklemeyi unutmayın!

### Adım 3: Kaydet ve Test Et

1. Dosyayı kaydedin
2. Tarayıcıyı yenileyin (F5)
3. Yeni lokasyon haritada görünmeli

## ✏️ Mevcut Lokasyonu Düzenleme

`locations.json` dosyasında düzenlemek istediğiniz lokasyonu bulun ve değiştirin:

**Önce:**
```json
{
  "name": "British Museum",
  "description": "Eski açıklama"
}
```

**Sonra:**
```json
{
  "name": "British Museum",
  "description": "Yeni açıklama daha detaylı bilgilerle"
}
```

## 🗑️ Lokasyon Silme

Silmek istediğiniz lokasyonun tüm objesini silin:

```json
{
  "locations": [
    {
      "name": "Silinecek Yer",
      ...
    },  // ← Bu virgülü de silin
    {
      "name": "Kalacak Yer",
      ...
    }
  ]
}
```

## 🎨 Kategori ve Renk Eşleştirmesi

| Kategori | Renk | İkon | Buton |
|----------|------|------|-------|
| `museums` | Kırmızı (#e74c3c) | `fa-landmark` | 🏛️ Müzeler |
| `restaurants` | Turuncu (#f39c12) | `fa-utensils` | 🍽️ Restoranlar |
| `attractions` | Mavi (#3498db) | `fa-star` | ⭐ Turistik Yerler |
| `parks` | Yeşil (#27ae60) | `fa-tree` | 🌳 Parklar |
| `shopping` | Mor (#9b59b6) | `fa-shopping-bag` | 🛍️ Alışveriş |

## 📝 Şablon

Yeni lokasyon eklerken bu şablonu kullanın:

```json
{
  "name": "",
  "category": "",
  "icon": "",
  "position": {
    "lat": 0,
    "lng": 0
  },
  "description": "",
  "info": "📍 <br>🎫 <br>⏰ "
}
```

## 🔍 Örnek: Restoran Ekleme

```json
{
  "name": "The Ledbury",
  "category": "restaurants",
  "icon": "fa-utensils",
  "position": {
    "lat": 51.5196,
    "lng": -0.2053
  },
  "description": "2 Michelin yıldızlı modern Avrupa mutfağı restoranı.",
  "info": "📍 Notting Hill<br>💰 £££<br>⏰ 12:00-14:00, 18:30-22:00<br>📞 Rezervasyon gerekli"
}
```

## 🔍 Örnek: Müze Ekleme

```json
{
  "name": "Science Museum",
  "category": "museums",
  "icon": "fa-landmark",
  "position": {
    "lat": 51.4978,
    "lng": -0.1746
  },
  "description": "İnteraktif bilim ve teknoloji müzesi. Çocuklar için ideal.",
  "info": "📍 South Kensington<br>🎫 Ücretsiz<br>⏰ 10:00-18:00<br>👨‍👩‍👧‍👦 Aile dostu"
}
```

## ❌ Yaygın Hatalar

### 1. Virgül Hatası

**YANLIŞ:**
```json
{
  "name": "Yer 1"
}
{
  "name": "Yer 2"
}
```

**DOĞRU:**
```json
{
  "name": "Yer 1"
},
{
  "name": "Yer 2"
}
```

### 2. Eksik Tırnak

**YANLIŞ:**
```json
{
  name: "British Museum"
}
```

**DOĞRU:**
```json
{
  "name": "British Museum"
}
```

### 3. Yanlış Kategori

**YANLIŞ:**
```json
{
  "category": "museum"  // Tekil
}
```

**DOĞRU:**
```json
{
  "category": "museums"  // Çoğul
}
```

## 🛠️ JSON Doğrulama

Dosyanızı kaydetmeden önce doğrulayın:

1. https://jsonlint.com/ adresine gidin
2. JSON içeriğinizi yapıştırın
3. "Validate JSON" tıklayın
4. Hata varsa düzeltin

## 📊 Toplu Düzenleme

Çok sayıda lokasyon ekleyecekseniz:

1. Excel veya Google Sheets kullanın
2. Koordinatları toplu olarak bulun
3. JSON formatına dönüştürün
4. `locations.json` dosyasına yapıştırın

## 🔄 Yedekleme

Düzenleme yapmadan önce yedek alın:

```bash
# Yedek oluştur
cp locations.json locations.backup.json

# Geri yükle (gerekirse)
cp locations.backup.json locations.json
```

## 💡 İpuçları

1. ✅ **Tutarlı Olun**: Aynı formatta bilgi girin
2. ✅ **Kısa Tutun**: Description 1-2 cümle olmalı
3. ✅ **Emoji Kullanın**: Info kısmında emoji kullanın (📍🎫⏰💰)
4. ✅ **Test Edin**: Her değişiklikten sonra test edin
5. ✅ **Yedek Alın**: Düzenlemeden önce yedek alın

## 🎯 Hızlı Referans

### Emoji Listesi
- 📍 Adres
- 🎫 Bilet/Giriş
- ⏰ Saatler
- 💰 Fiyat
- 📞 Telefon
- 🌐 Website
- 🚇 Metro
- 🚌 Otobüs
- 👨‍👩‍👧‍👦 Aile dostu
- ♿ Engelli erişimi

### Font Awesome İkonlar
- `fa-landmark` - Bina/Müze
- `fa-utensils` - Yemek
- `fa-star` - Yıldız
- `fa-tree` - Ağaç
- `fa-shopping-bag` - Alışveriş
- `fa-coffee` - Kafe
- `fa-music` - Müzik/Gece hayatı
- `fa-camera` - Fotoğraf noktası

Daha fazla: https://fontawesome.com/icons

---

**Kolay Gelsin! 📍✨**

Sorularınız için GitHub Issues açabilirsiniz.
