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

İlerleme: **18 / 36**

### A. Proje kurulumu

- [x] GitHub reposunu oluştur
- [x] React + TypeScript + Vite kur
- [x] Chrome Manifest V3 altyapısını ekle
- [x] Popup ekranını oluştur
- [x] Service worker ve mesajlaşmayı kur
- [x] SCSS tema ve temel bileşenleri hazırla



### B. Cüzdan ve güvenli kasa

Oluşturma, içe aktarma, parola, şifreli saklama ve 5 dakikalık otomatik kilit var. Kilit yalnızca bellekteki açık oturumu kapatır; şifreli kayıt durur.

- [x] Cüzdan oluşturma akışı
- [x] Kurtarma ifadesi üretme ve doğrulama
- [x] Kurtarma ifadesiyle cüzdanı içe aktarma
- [x] Parola belirleme ve kasa kilidini açma
- [x] Şifreli yerel depolama
- [x] Otomatik kilitleme ve kasa temizleme testleri



### C. Blockchain bağlantısı

- [x] Ethereum adresini türetme
- [x] Sepolia RPC bağlantısı
- [x] ETH bakiyesini okuma
- [x] Gas ücreti tahmini
- [x] Test ETH gönderme
- [x] İşlem hash ve durum ekranı



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