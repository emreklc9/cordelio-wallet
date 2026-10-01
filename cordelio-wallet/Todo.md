# Cordelio Wallet

Private başlangıç. Tek repo: React, TypeScript ve Chrome Extension Manifest V3.

Seed phrase, özel anahtar, parola ve gerçek kullanıcı verisi hiçbir koşulda Git'e girmez.

## 1. Repo ve proje yapısı

```text
cordelio-wallet/
├── src/
│   ├── popup/         Cüzdan arayüzü
│   ├── onboarding/    Oluşturma ve içe aktarma
│   ├── background/    Service worker
│   ├── content/       dApp bağlantı köprüsü
│   ├── wallet-core/   Blockchain ve kriptografi
│   ├── storage/       Şifreli yerel kasa
│   └── shared/        Ortak tipler ve yardımcılar
├── public/
├── tests/
├── manifest.json
├── package.json
└── README.md
```

Repo başlangıçta private kalır. Gerçek kullanıcıya açılmaya yaklaşınca açık kaynak kararı ayrıca verilir.

## 2. Parola nasıl çalışacak

Kullanıcı cüzdan oluştururken bir parola belirler. Bu parola, cihazda saklanan şifreli kasayı açar.

- Parola blockchain ağına gönderilmez.
- Parola, cüzdan adresinin kendisi değildir.
- Parolayı unutmak, kurtarma ifadesi varsa cüzdanı yeniden kurmaya engel olmak zorunda değildir.
- Kurtarma ifadesi, cüzdanın asıl kurtarma mekanizmasıdır.

Parola ile şifreli kasa tasarımı ilk günden bellidir. Kriptografik algoritmalar icat edilmez; bakımı yapılan kütüphaneler kullanılır.

## 3. Ana yapılacaklar

İlerleme: **1 / 36**

### A. Proje kurulumu

- [ ] GitHub reposunu oluştur
- [x] React + TypeScript + Vite kur
- [ ] Chrome Manifest V3 altyapısını ekle
- [ ] Popup ekranını oluştur
- [ ] Service worker ve mesajlaşmayı kur
- [ ] SCSS tema ve temel bileşenleri hazırla

### B. Cüzdan ve güvenli kasa

- [ ] Cüzdan oluşturma akışı
- [ ] Kurtarma ifadesi üretme ve doğrulama
- [ ] Kurtarma ifadesiyle cüzdanı içe aktarma
- [ ] Parola belirleme ve kasa kilidini açma
- [ ] Şifreli yerel depolama
- [ ] Otomatik kilitleme ve kasa temizleme testleri

### C. Blockchain bağlantısı

- [ ] Ethereum adresini türetme
- [ ] Sepolia RPC bağlantısı
- [ ] ETH bakiyesini okuma
- [ ] Gas ücreti tahmini
- [ ] Test ETH gönderme
- [ ] İşlem hash ve durum ekranı

### D. Cüzdan özellikleri

- [ ] Hesap ve adres ekranı
- [ ] Ağ seçimi
- [ ] Token bakiyeleri
- [ ] İşlem geçmişi
- [ ] Hesapları yönetme
- [ ] Hata ve bağlantı durumları

### E. dApp bağlantısı

- [ ] EIP-1193 provider
- [ ] Web sitesinden bağlantı isteği
- [ ] Hesap erişim onayı
- [ ] İşlem imzalama onayı
- [ ] Ağ değiştirme ve olaylar
- [ ] EIP-6963 cüzdan keşfi

### F. Yayına hazırlık

- [ ] Birim ve entegrasyon testleri
- [ ] Güvenlik tehdit modeli
- [ ] Bağımlılık ve izin denetimi
- [ ] Bağımsız güvenlik incelemesi
- [ ] Chrome Web Store materyalleri
- [ ] Kontrollü beta ve yayın

## 4. Gün gün plan

Her gün tek bir hedef vardır. Güvenlik ve test adımları geçilmeden sonraki aşamaya geçilmez.

### Sprint 1

#### Gün 1 — Repo ve proje kurulumu

Vite, React, TypeScript, Git, ilk commit ve klasör yapısı.

**Çıktı:** Çalışan proje

#### Gün 2 — Chrome eklentisi

Manifest V3, popup, ikonlar ve Chrome'a yükleme.

**Çıktı:** Açılan eklenti

#### Gün 3 — Eklenti mimarisi

Service worker, mesajlaşma ve modüller arası iletişim.

#### Gün 4 — Arayüz

Cüzdan ana ekranı, SCSS değişkenleri, responsive popup.

#### Gün 5 — Test altyapısı

Vitest, lint, temel testler ve GitHub Actions.

#### Gün 6 — Wallet Core tasarımı

Adres, hesap, ağ ve kasa tipleri; güven sınırlarının belirlenmesi.

#### Gün 7 — Adres üretimi

Test vektörleriyle adres türetme ve doğrulama.

#### Gün 8 — Kurtarma akışı

Kurtarma ifadesi gösterimi, onay ve içe aktarma arayüzü.

#### Gün 9 — Şifreli kasa

Parola, anahtar türetme, şifreleme ve çözme testleri.

#### Gün 10 — Güvenlik kontrolü

Yanlış parola, kilitleme, veri temizliği ve hata senaryoları.

## 5. Bugünkü kapsam

Bugün yalnızca projeyi ayağa kaldırmak. Kurtarma ifadesi, özel anahtar veya gerçek para ile ilgili işlem yok.

Vite projesi kuruldu. Sıradaki iş, klasör iskeletini bağlamak. Chrome eklentisi 2. günün işi.

Manifest V3 service worker'ı sürekli çalışan bir Node.js sunucusu gibi değildir. State, global değişkenlerde tutulmayacak şekilde tasarlanır.
