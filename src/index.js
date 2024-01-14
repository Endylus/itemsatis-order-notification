const fetch = require("node-fetch");
const { itemsatis } = require("../config");
const AdminSendMessage = require("../src/utils/message/AdminOrdersNotification");
const sendMessage = require("../src/utils/message/OrdersNotification");
let globalSales = [];

async function checkSales(userId) {
    try {
        const newData = await getOrderData();
        if (!newData || newData == null) return;
        let newSales = newData.filter(x => !globalSales.some(y => y.Id === x.Id));
        if (newSales && newSales.length > 0) {
            newSales.forEach(async order => {
                console.log(`Yeni bir sipariş geldi: ${order.Title} - ${new Date().toLocaleString()}`);
                await sendMessage(order)
                await AdminSendMessage(order, userId)
            });
            globalSales = newData;
        }
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    let data = await getUserId()
    if (!data) {
        console.log("Cookie hatalı veya süresi dolmuş olabilir.");
        process.exit(1);
    }
    console.log(`Siparişler kontrol ediliyor - ${new Date().toLocaleString()}`);
    globalSales = await getOrderData();
    setInterval(() => {
        checkSales(data)
    }, 5000);
})()

async function getOrderData() {
    let datas = await fetch("https://www.itemsatis.com/api/getMySoldOrders", {
        headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", cookie: 'PHPSESSID=' + itemsatis.cookie },
        body: "Page=1&Search=&StartDate=&FinishDate=",
        method: "POST"
    }).catch((error) => { return null; })
    let data = await datas?.json()
    if (!data.success || !data) return null;
    return data.Datas.filter(x => x.StateText === "Alıcının teslimatı onaylaması bekleniyor");
}

async function getUserId() {
    let datas = await fetch("https://www.itemsatis.com/api/getBillingInformation", {
        headers: { accept: "application/json, text/plain, */*", "content-type": "application/x-www-form-urlencoded", cookie: 'PHPSESSID=' + itemsatis.cookie },
        method: "POST"
    }).then(res => res.json())
    if (!datas.success || !datas) return null;
    return datas.data.UserId
}