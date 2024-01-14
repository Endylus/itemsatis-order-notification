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
            avatar_url: "https://scontent.fsaw2-1.fna.fbcdn.net/v/t39.30808-6/359042483_106181399211154_6791628675255973535_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=qW1p3H-sJZEAX_mmM4S&_nc_ht=scontent.fsaw2-1.fna&cb_e2o_trans=q&oh=00_AfB5lqpcGQc7TZSWHSe9dIZtOjXODF0dVoyyjysto53JSw&oe=65A91EB6"
        };

        formData.append('payload_json', JSON.stringify(embedData));
        await fetch(discord.OrderWebhookUrl, { body: formData, method: "POST" })
    } catch (error) {
        console.log(`Yeni bir Sipariş bildirimi gönderilemedi - ${new Date().toLocaleString()} - Hata: ${error.message}`);
    }
}