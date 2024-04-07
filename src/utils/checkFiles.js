const fs = require('fs');
const path = require('path');

function checkConfigFiles() {
    if (!fs.existsSync(path.join(process.cwd(), './config.json'))) {
        let configData = {
            web: {
                url: "http://93.177.102.201",
                port: 443
            },
            webhook: {
                purchase: "",
                starting: "",
                error: ""
            },
        };
        fs.writeFileSync(path.join(process.cwd(), './config.json'), JSON.stringify(configData, null, 2));
        console.log(`>> Config.json file not found. A new one has been created. Please fill in the information in the config.json file.`);
        process.exit(1);
    } else {
        const config = fs.readFileSync(path.join(process.cwd(), './config.json'), 'utf8');
        const parsedConfig = JSON.parse(config);

        if (parsedConfig.web.url === "" || parsedConfig.web.url === " " || parsedConfig.web.port === 0 || parsedConfig.webhook.purchase === "" || parsedConfig.webhook.purchase === " " || parsedConfig.webhook.starting === "" || parsedConfig.webhook.starting === " " || parsedConfig.webhook.error === "" || parsedConfig.webhook.error === " ") {
            console.log(`>> Please fill in the information in the config.json file.`);
            process.exit(1);
        }
        const webhookUrls = [
            { type: 'purchase', url: parsedConfig.webhook.purchase },
            { type: 'starting', url: parsedConfig.webhook.starting },
            { type: 'error', url: parsedConfig.webhook.error }
        ];

        const promises = webhookUrls.map(async (webhook, index) => {
            try {
                const response = await fetch(webhook.url);
                if (!response.ok) {
                    console.error(`Webhook URL ${webhook.url} Type: ${webhook.type} is not working.`);
                }
            } catch (error) {
                console.error(`Error testing Webhook URL ${webhook.url} Type: ${webhook.type}:`, error);
            }
        });

        Promise.all(promises).catch(error => {
                console.error('Error testing webhook URLs:', error);
                process.exit(1);
            });
    }
}

module.exports = checkConfigFiles;