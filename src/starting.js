const moduleControl = require("./utils/moduleControl");
const checkFiles = require("./utils/checkFiles");
const start = require("./index");

(async () => {
    await moduleControl();
    await checkFiles();
    await start();
})();