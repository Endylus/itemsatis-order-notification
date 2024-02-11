const fetch = require("node-fetch");
const { itemsatis, discord } = require("../../../config");
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

module.exports = async function AdminSendMessage(order, userId) {
    try {
        const base64Image = await fetch('https://cdn.itemsatis.com/' + order.AdvertImage).then(response => response.buffer()).then(buffer => buffer.toString('base64')).catch(error => { console.error('Resmi indirme ve Base64\'e çevirme işlemi başarısız oldu:', error.message); });
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const imageName = order.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const imagePath = `./src/image/${imageName}.png`;
        if (!fs.existsSync('./src/image')) fs.mkdirSync('./src/image');
        fs.writeFileSync(imagePath, imageBuffer)
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        const imageFolder = path.join(__dirname, "../../image");
        const imagesFolder = await fs.promises.readdir(imageFolder);
        const orderImages = imagesFolder.find(file => file === `${imageName}.png`);

        let stockData = await stockControl(order, userId);
        let userData = await getUserData(order);
        let stockValue = await getStockValue(order);

        let contentMessage = "";
        if (stockData.Active === 0) contentMessage = "@everyone\nİlanda stok bulunmamaktadır. Yeni stok ekleyiniz.";
        if (discord.Mention) contentMessage = "@everyone" + contentMessage.replace("@everyone", "");

        const embedData = {
            content: contentMessage,
            embeds: [
                {
                    title: `Yeni Bir Sipariş Var!`,
                    description: `\`\`\`${order.Title}\`\`\``,
                    fields: [{ name: "**İlan Fiyatı:**", value: `\`\`\`${order.Price}\`\`\``, inline: true }, { name: "**Satın Alan Kişi:**", value: `\`\`\`${order.UserName}\`\`\``, inline: true }, { name: " ", value: ` `, inline: true }, { name: "**Satılan Stok:**", value: `\`\`\`${stockData.Passive}\`\`\``, inline: true }, { name: "**Kalan Stok:**", value: `\`\`\`${stockData.Active}\`\`\``, inline: true }, { name: " ", value: ` `, inline: true }, { name: "**Teslim Edilen Stok:**", value: `\`\`\`${stockValue}\`\`\`` }, { name: "Geçmiş Satışlar:", value: `\`\`\`${userData.map((data, index) => `${index + 1}: ${data}`).join('\n')}\`\`\`` }],
                    footer: { text: `Sipariş No: ${order.Id}` },
                    thumbnail: { url: orderImages ? `attachment://${orderImages}` : 'https://cdn.discordapp.com/attachments/812394153211461662/1196063505317638214/unnamed.png' }
                }
            ],
            username: "Sipariş Bildirim Sistemi",
            avatar_url: "https://cdn.discordapp.com/attachments/1146823843667787866/1206278286544736256/unnamed.png"
        };

        formData.append('payload_json', JSON.stringify(embedData));

        await fetch(discord.AdminWebhookUrl, { body: formData, method: "POST" })
    } catch (error) { console.log(`Yeni bir Admin bildirimi gönderilemedi - ${new Date().toLocaleString()} - ${error}`); }
}

async function getUserData(order) {
    try {
        const startChatUserResponse = await fetch("https://www.itemsatis.com/api/startChatUser", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", cookie: 'PHPSESSID=' + itemsatis.cookie, }, body: `UserName=${order.UserName}`, });
        const userData = await startChatUserResponse.json();
        if (!userData.success) return ['Satın alan kişinin geçmiş siparişleri bulunamadı.'];
        const getShopRelationSummaryResponse = await fetch(`https://www.itemsatis.com/api/getShopRelationSummary?UserId=${userData.datas.Id}&Filter=all`, { method: "GET", headers: { "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7", cookie: 'PHPSESSID=' + itemsatis.cookie, }, });
        const data = await getShopRelationSummaryResponse.json();
        if (!data.success) return ['Satın alan kişinin geçmiş siparişleri bulunamadı.'];
        return data.details.filter(x => x.Title === order.Title).map(x => x.Datetime);
    } catch (error) { return ['Satın alan kişinin geçmiş siparişleri bulunamadı.']; }
}

async function stockControl(order, userId) {
    try {
        const getProfilePostsResponse = await fetch("https://www.itemsatis.com/api/merchant/v1/getProfilePosts", { method: "POST", headers: { "accept": "application/json, text/plain, */*", "content-type": "application/json", cookie: 'PHPSESSID=' + itemsatis.cookie, }, body: JSON.stringify({ UserId: userId, Page: 1, Limit: 20, Auto: 0, MinPrice: null, MaxPrice: null, Word: order.Title, IncludeDesc: false, Category: [], }), });
        const datas = await getProfilePostsResponse.json();
        if (!datas.success || !datas.data) return { Active: 'Veri Bulunamadı', Passive: 'Veri Bulunamadı.' };
        const orderId = datas.data.filter(item => item.Title === order.Title)[0]?.Id;
        if (!orderId) return { Active: 'Veri Bulunamadı', Passive: 'Veri Bulunamadı.' };
        const getPostDetailResponse = await fetch("https://www.itemsatis.com/api/getPostDetail", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", cookie: 'PHPSESSID=' + itemsatis.cookie, }, body: `Id=${orderId}`, });
        const data = await getPostDetailResponse.json();
        if (!data.success) return { Active: 'Veri Bulunamadı', Passive: 'Veri Bulunamadı.' };
        const getMyStocksWithPostResponse = await fetch("https://www.itemsatis.com/api/merchant/v1/getMyStocksWithPost", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", cookie: 'PHPSESSID=' + itemsatis.cookie, }, body: `{"Page":1,"Limit":100,"State": ${data.stockCount === 0 ? 3 : 1},"Sort":"default"}`, });
        const data2 = await getMyStocksWithPostResponse.json();
        if (!data2.success) return { Active: 'Veri Bulunamadı', Passive: 'Veri Bulunamadı.' };
        const matchingStock = data2.data.find(item => item.Id === orderId);
        if (!matchingStock) return { Active: 0, Passive: 0 };
        return matchingStock.Stocks;
    } catch (error) { return { Active: 'Veri Bulunamadı', Passive: 'Veri Bulunamadı.' }; }
}

async function getStockValue(order) {
    try {
        const response = await fetch("https://www.itemsatis.com/api/merchant/v1/getShopOrderDetailLogs", { method: "POST", headers: { "accept": "application/json, text/plain, */*", "content-type": "application/json", cookie: 'PHPSESSID=' + itemsatis.cookie, }, body: JSON.stringify({ orderId: order.Id, isSold: 1, }), });
        const data = await response.json();
        if (!data.success || !data.data) return 'Veri Bulunamadı.';
        return data.data.Stock.Value;
    } catch (error) { return 'Veri Bulunamadı.'; }
}
