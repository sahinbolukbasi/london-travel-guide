# 🔒 API Key Güvenlik Rehberi

Google Maps API Key'inizi GitHub'da paylaşırken güvenlik önlemleri.

## ⚠️ Sorun

API Key'iniz `index.html` dosyasında açıkça görünüyor:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAGPK0ksa9JuLRQEfkAMjG1xqk0cPkFho0&callback=initMap"></script>
```

Bu normal bir durumdur çünkü:
- ✅ Client-side JavaScript'te API Key'ler her zaman görünür
- ✅ Tarayıcı kaynak kodunu görebilir
- ✅ Bu Google Maps için standart kullanım

## 🛡️ Güvenlik Önlemleri

### 1️⃣ API Key Kısıtlamaları (EN ÖNEMLİ)

Google Cloud Console'da API Key'inizi kısıtlayın:

#### HTTP Yönlendirici Kısıtlaması

1. **Cloud Console** → **Kimlik Bilgileri** → API Key'inizi düzenleyin
2. **Uygulama kısıtlamaları** → **HTTP yönlendirici (web siteleri)**
3. **Web sitesi kısıtlamaları** ekleyin:

```
http://localhost:8000/*
http://127.0.0.1:8000/*
https://KULLANICI_ADINIZ.github.io/*
```

**Sonuç:** API Key sadece bu domain'lerden çalışır! ✅

#### API Kısıtlaması

1. **API kısıtlamaları** → **Anahtarı kısıtla**
2. Sadece **Maps JavaScript API** seçin

**Sonuç:** API Key sadece harita için kullanılabilir! ✅

### 2️⃣ Günlük Kota Limiti

1. **Cloud Console** → **API'ler ve Hizmetler** → **Kotalar**
2. Günlük istek limitini ayarlayın (örn: 1000 istek/gün)

**Sonuç:** Kötüye kullanım durumunda maksimum hasar sınırlı! ✅

### 3️⃣ Kullanım İzleme

1. **Cloud Console** → **API'ler ve Hizmetler** → **Kontrol Paneli**
2. Günlük kullanımı kontrol edin
3. Anormal artış varsa API Key'i yenileyin

### 4️⃣ Uyarı Kurulumu

1. **Cloud Console** → **Faturalama** → **Bütçeler ve Uyarılar**
2. Aylık $10 bütçe uyarısı oluşturun
3. E-posta bildirimi alın

## 📊 Güvenlik Seviyeleri

| Yöntem | Güvenlik | Kullanım |
|--------|----------|----------|
| API Key açıkta | ⚠️ Düşük | Kısıtlama YOK |
| HTTP kısıtlaması | ✅ İyi | Sadece domain'inizde çalışır |
| API kısıtlaması | ✅ İyi | Sadece Maps API |
| Kota limiti | ✅ İyi | Maksimum hasar sınırlı |
| **HEPSİ BİRLİKTE** | ✅✅ Çok İyi | Önerilen! |

## 🚫 Yapmamanız Gerekenler

❌ **API Key'i gizlemeye çalışmayın** - Client-side'da imkansız
❌ **Obfuscation kullanmayın** - Gereksiz ve etkisiz
❌ **Environment variable kullanmayın** - Client-side'da çalışmaz
❌ **Backend proxy kullanmayın** - Gereksiz karmaşıklık (küçük projeler için)

## ✅ Yapmanız Gerekenler

✅ **HTTP yönlendirici kısıtlaması** - Mutlaka!
✅ **API kısıtlaması** - Mutlaka!
✅ **Günlük kota** - Önerilen
✅ **Kullanım izleme** - Düzenli kontrol
✅ **Uyarı kurulumu** - Önerilen

## 🔄 API Key Yenileme

Eğer API Key'iniz kötüye kullanıldıysa:

1. **Cloud Console** → **Kimlik Bilgileri**
2. Eski API Key'i **SİL**
3. Yeni API Key oluştur
4. Kısıtlamaları ekle
5. `index.html` dosyasını güncelle
6. GitHub'a push et

## 💰 Maliyet Kontrolü

### Ücretsiz Kota
- **$200/ay** ücretsiz kredi
- **28,000** harita yüklemesi
- Küçük siteler için yeterli

### Aşım Durumunda
1. **Otomatik ücretlendirme YOK** (varsayılan)
2. Harita çalışmayı durdurur
3. E-posta uyarısı alırsınız

### Maliyet Azaltma
- Haritayı lazy load edin
- Gereksiz API çağrılarını önleyin
- Cache kullanın

## 📝 GitHub Pages İçin Özel Notlar

GitHub Pages'te API Key görünür olacak - **bu normaldir!**

**Neden sorun değil?**
1. ✅ HTTP kısıtlaması aktif
2. ✅ Sadece `github.io` domain'inizde çalışır
3. ✅ API kısıtlaması aktif
4. ✅ Kota limiti var

**Birisi API Key'i kopyalarsa:**
- ❌ Kendi sitesinde çalışmaz (HTTP kısıtlaması)
- ❌ Başka API'lerde kullanamaz (API kısıtlaması)
- ❌ Sınırsız kullanamaz (kota limiti)

## 🎯 Önerilen Kurulum

### Adım 1: API Key Kısıtlamaları

```
HTTP Yönlendirici:
- http://localhost:8000/*
- https://KULLANICI_ADINIZ.github.io/*

API Kısıtlaması:
- Maps JavaScript API
```

### Adım 2: Kota Limiti

```
Günlük Limit: 1000 istek
```

### Adım 3: Bütçe Uyarısı

```
Aylık Bütçe: $10
Uyarı: %50, %90, %100
```

### Adım 4: İzleme

```
Haftalık kontrol: Kullanım istatistikleri
```

## 🔍 Kontrol Listesi

Deployment öncesi kontrol edin:

- [ ] HTTP yönlendirici kısıtlaması eklendi
- [ ] API kısıtlaması eklendi
- [ ] Günlük kota limiti ayarlandı
- [ ] Bütçe uyarısı kuruldu
- [ ] Test edildi (localhost ve GitHub Pages)
- [ ] Kullanım izleme aktif

## 💡 İpuçları

1. **API Key'i düzenli kontrol edin** - Aylık 1 kez
2. **Kullanım istatistiklerini izleyin** - Anormal artış varsa araştırın
3. **Yedek API Key oluşturun** - Acil durumlar için
4. **Dokümantasyonu okuyun** - Google'ın güvenlik önerileri

## 📚 Kaynaklar

- **API Key Güvenliği**: https://cloud.google.com/docs/authentication/api-keys
- **Best Practices**: https://developers.google.com/maps/api-security-best-practices
- **Kısıtlamalar**: https://cloud.google.com/docs/authentication/api-keys#api_key_restrictions

## ❓ SSS

### S: API Key'im GitHub'da görünüyor, tehlikeli mi?

**C:** Hayır, eğer kısıtlamalar aktifse. Client-side uygulamalarda API Key'ler her zaman görünür.

### S: Birisi API Key'imi kopyalarsa ne olur?

**C:** HTTP kısıtlaması sayesinde sadece sizin domain'inizde çalışır.

### S: Backend'de API Key saklayabilir miyim?

**C:** Evet ama gereksiz. Küçük projeler için over-engineering. Kısıtlamalar yeterli.

### S: API Key'imi ne sıklıkla değiştirmeliyim?

**C:** Kötüye kullanım yoksa değiştirmenize gerek yok. Kullanımı izleyin.

---

**Güvenli kodlamalar! 🔒✨**

Sorularınız için GitHub Issues açabilirsiniz.
