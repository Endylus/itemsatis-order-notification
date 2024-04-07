const fetch = require("node-fetch")

const webhokSender = async (body, webhookUrl) => {
  try {
    await fetch(webhookUrl, { headers: { accept: "application/json", "content-type": "application/json", "sec-fetch-mode": "cors", }, body: body, method: "POST" });
  } catch (error) {
    console.log("WebhookSender Error: ", error.message);
  }
}

module.exports = webhokSender;