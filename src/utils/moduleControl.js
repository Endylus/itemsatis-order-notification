const requiredModules = [
    "express",
    "body-parser",
    "cors",
    "request-ip",
    "morgan",
    "node-fetch@2.6.7",
    "fs",
    "path",
];

async function installModules() {
    console.log("Checking for missing modules...");
    const missingModules = [];
    for (const module of requiredModules) {
        let moduleName = module.split('@')[0];
        try {
            require.resolve(moduleName);
        } catch (error) {
            missingModules.push(module);
        }
    }

    if (missingModules.length > 0) {
        try {
            const { execSync } = require("child_process");
            execSync(`npm install ${missingModules.join(" ")}`, { stdio: "inherit" });
            console.log("Modules successfully installed.");
        } catch (error) {
            console.error("An error occurred while installing modules:", error);
        }
    } else {
        console.log("All required modules are already installed.");
    }
}

module.exports = installModules;