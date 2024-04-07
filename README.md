# ItemSatis Sipariş Bildirim Sistemi

Bu proje, ItemSatış da satılan ilanlarınızı belirli bir kanala webhook aracılığıyla duyuran bir scripttir.

## Yapılandırma

`config.json` dosyasını düzenleyerek programı yapılandırın. Örnek bir yapılandırma aşağıdaki gibidir:

```json
{
    "web": {
        "url": "http://93.177.102.201",
        "port": 443
    },
    "webhook": {
        "purchase": "https://discord.com/api/webhooks/id/token",
        "starting": "https://discord.com/api/webhooks/id/token",
        "error": "https://discord.com/api/webhooks/id/token"
    }
}
```

- `web.url`: VDS ipniz.
- `web.port`: VDS üzerinde açık olması gereken port. (önerilen 443)
- `webhook.purchase`: Satın Alma Webhook URL'si.
- `webhook.starting`: Başlangıç Webhook URL'si.
- `webhook.error`: Hata Webhook URL'si.

## Port Açma

Projenizin düzgün çalışabilmesi için belirli bir portun Windows VDS'de açık olması gerekmektedir. Aşağıdaki adımlar, Windows Güvenlik Duvarı üzerinden bir portun nasıl açılacağını göstermektedir:

### Yapılması Gereken Adımlar:

1. **Arama Çubuğunu Kullanarak Windows Güvenlik Duvarı Ayarlarını Açın**
   - Başlat menüsünde, arama çubuğuna "Gelişmiş Güvenlik Özellikli Windows Defender Güvenlik Duvarı" yazarak Güvenlik Duvarı Ayarları'nı açın.

2. **Gelen Kurallar'a Erişin**
   - Sol taraftaki menüden "Gelen Kurallar" seçeneğine tıklayın.

3. **Yeni Kural Ekle**
   - Sağ üst köşede "Yeni Kural Ekle" seçeneğine tıklayın.

4. **Portu Açın**
   - "Bağlantı Noktası" seçeneğini işaretleyin ve "Sonraki" butonuna tıklayın.
   - "TCP" protokolünü seçin ve "Belirli Yer Bağlantı Noktası" kutucuğuna açmak istediğiniz port numarasını girin. (Örneğin, 443)
   - "Sonraki" butonuna tıklayın.

5. **Kuralı Onaylayın**
   - "Bağlantıya izin ver" seçeneğini işaretleyin ve "Sonraki" butonuna tıklayın.

6. **Profil**
   - "Sonraki" butonuna tıklayın.

7. **Ad**
   - İsteğe bağlı olarak, kurala bir isim, açıklama ekleyin ve "Son" butonuna tıklayın.

Bu adımları takip ederek, VDS'nizde belirli bir portu açabilir ve projenizi düzgün bir şekilde çalıştırabilirsiniz.

## Kullanım

1. Gerekli paketleri yükleyin:

```
npm install
```

2. Scripti çalıştırın:

```
npm start
```

## Sorumluluk Reddi Beyanı
Bu proje ve içeriğinin kullanımından kaynaklanabilecek herhangi bir sorundan dolayı sorumluluk kabul edilmemektedir. Proje, kullanıcıların kendi sistemlerinde yapılandırma ve kullanma sorumluluğunu taşımaktadır. Kullanıcılar, projeyi kullanmadan önce gerekli önlemleri almalı ve yapılandırma talimatlarını doğru bir şekilde takip etmelidir.

## Destek

Eğer herhangi bir sorunuz varsa çekinmeden Discord sunucuma katılabilirsiniz: [https://discord.gg/dctoken](https://discord.gg/dctoken)