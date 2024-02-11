const fetch = require('node-fetch');
const { discord } = require('../../../config');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

module.exports = async function sendMessage(order) {
    try {
        const base64Image = await fetch('https://cdn.itemsatis.com/' + order.AdvertImage).then(response => response.buffer()).then(buffer => buffer.toString('base64')).catch(error => { console.error('Resmi indirme ve Base64\'e çevirme işlemi başarısız oldu:', error.message); });
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const imageName = order.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        if (!fs.existsSync('./src/image')) fs.mkdirSync('./src/image');
        const imagePath = `./src/image/${imageName}.png`;
        fs.writeFileSync(imagePath, imageBuffer);
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));
        const imageFolder = path.join(__dirname, "../../image");
        const imagesFolder = await fs.promises.readdir(imageFolder);
        const orderImages = imagesFolder.find(file => file === `${imageName}.png`);

        const embedData = {
            embeds: [
                {
                    title: "Yeni Bir Sipariş Var!",
                    description: `\`\`\`${order.Title}\`\`\``,
                    thumbnail: { url: orderImages ? `attachment://${orderImages}` : 'https://cdn.discordapp.com/attachments/812394153211461662/1196063505317638214/unnamed.png' }
                }
            ],
            username: "Sipariş Bildirim Sistemi",
            avatar_url: "https://cdn.discordapp.com/attachments/1146823843667787866/1206278286544736256/unnamed.png"
        };

        formData.append('payload_json', JSON.stringify(embedData));
        await fetch(discord.OrderWebhookUrl, { body: formData, method: "POST" })
    } catch (error) {
        console.log(`Yeni bir Sipariş bildirimi gönderilemedi - ${new Date().toLocaleString()} - Hata: ${error.message}`);
    }
}
