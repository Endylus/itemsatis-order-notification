const express = require("express");
const { urlencoded, json } = require("body-parser");
const webhhookSender = require("./utils/webhookSender");
const cors = require("cors");
const app = express();
const requestIp = require('request-ip');
const morgan = require('morgan');
const { webhook, web } = require('../config');

app.use(cors());
app.use(json());
app.use(requestIp.mw());
app.use(morgan('combined'));
app.use(urlencoded({ limit: "50mb", extended: false }));

app.use("/callback", require("./router/callback")());
app.use("/image", require("./router/image")());
app.use("/", require("./router/home")());

process.on('SIGINT', async (code) => {
  await webhhookSender(JSON.stringify({
    content: `API is shutting down. Time: <t:${Math.floor(Date.now() / 1000)}:F> - <t:${Math.floor(Date.now() / 1000)}:R>`,
  }), webhook.error);
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  webhhookSender(JSON.stringify({
    content: `An error occurred within the system. Time: <t:${Math.floor(Date.now() / 1000)}:F> - <t:${Math.floor(Date.now() / 1000)}:R>\nError: \`\`\`${err.message}\`\`\``,
  }), webhook.error);
});

function start() {
  console.clear();
  process.title = "Itemsatis Order Notification System";
  const listener = app.listen(web.port, async () => {
    webhhookSender(JSON.stringify({
      content: `API initialized. Time: <t:${Math.floor(Date.now() / 1000)}:F> - <t:${Math.floor(Date.now() / 1000)}:R>`,
    }), webhook.starting);
    console.log(`API is running on port ${listener.address().port}\n${web.url}:${listener.address().port}`);
  });
}

module.exports = start;