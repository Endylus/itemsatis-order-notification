const { Router } = require("express");
const router = Router();
const fetch = require("node-fetch");
const config = require("../../config");
const webhhookSender = require("../utils/webhookSender");

module.exports = () => {
    router.get("/uploads/post_images/:url", async (req, res) => {
        try {
            const useragent = req.headers["user-agent"];
            if (!useragent || useragent?.includes("Postman")) return;

            let urlParams = req.params.url;
            if (!urlParams) return res.json({ status: "error", message: "Maalesef parametre uygun değil" });

            let imageUrl = "https://cdn.itemsatis.com/uploads/post_images/" + urlParams;

            try {
                await fetch(imageUrl).then(response => {
                    if (!response.ok) {
                        return res.status(404).json({ status: "error", message: "Resim bulunamadı" });
                    }
                    return response;
                }).then(response => {
                    response.body.pipe(res);
                });
            } catch (error) {
                await webhhookSender(JSON.stringify({
                    embeds: [
                        {
                            title: req.method + " " + req.originalUrl,
                            description: `Error:\`\`\`${error.message}\`\`\``,
                        }
                    ],
                    username: "Image API",
                }), config.webhook.error);
                res.status(500).json({ status: "error", message: "Internal server error!", });
            }
        } catch (error) {
            await webhhookSender(JSON.stringify({
                embeds: [
                    {
                        title: req.method + " " + req.originalUrl,
                        description: `Error:\`\`\`${error.message}\`\`\``,
                    }
                ],
                username: "Image API",
            }), config.webhook.error);
            res.status(500).json({ status: "error", message: "Internal server error!", });
        }

    });
    return router;
};