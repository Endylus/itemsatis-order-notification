const { Router } = require("express");
const router = Router();

module.exports = () => {
    router.get("/", async (req, res) => {
        return res.status(404).end();
    });
    return router;
};