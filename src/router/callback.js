const { Router } = require("express");
const router = Router();
const config = require("../../config");
const webhhookSender = require("../utils/webhookSender");

module.exports = () => {
  router.post("/", async (req, res) => {
    const { details } = req.body;
    try {
      if (!details) return res.status(400).json({ status: "error", message: "Details bilgisi alınamadı" });
      if (details.event !== "advert_sold") return res.status(400).json({ status: "error", message: "Geçersiz event" });

      let postUrl;
      if (details.advert && details.advert.imageUrl) {
        postUrl = `${config.web.url}:${config.web.port}/image/` + details.advert.imageUrl.replace("https://cdn.itemsatis.com/uploads/post_images/", "");
      } else {
        postUrl = 'https://i.ibb.co/5cNHqRP/itemsatis-logo.png';
      }

      const embedData = {
        embeds: [
          {
            title: "Yeni Bir Sipariş Var!",
            description: `\`\`\`${order.Title}\`\`\``,
            thumbnail: { url: postUrl }
          }
        ],
      };

      const webhookUrl = config.webhook.purchase;
      if (!webhookUrl) return res.status(400).json({ status: "error", message: "Webhook url bulunamadı" });

      await webhhookSender(JSON.stringify(embedData), webhookUrl);
    } catch (error) {
      await webhhookSender(JSON.stringify({
        embeds: [
          {
            title: req.method + " " + req.originalUrl,
            description: `Error:\`\`\`${error.message}\`\`\``,
          }
        ],
        username: "Callback API",
      }), config.webhook.error);
      res.status(500).json({ status: "error", message: "Internal server error!", });
    }
  });
  return router;
};
