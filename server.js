const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 RATE LIMIT (1 IP = 2 requests per minute)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 2,
    message: { msg: "⛔ Too many requests, try after 1 minute" }
});

app.use("/submit", limiter);

// TEMP STORAGE
let clients = [];

// ROOT (fix Cannot GET /)
app.get("/", (req, res) => {
    res.send("✅ App Service Backend Running");
});

// 🔐 SIMPLE BOT CHECK
function botCheck(req, res, next){
    if(req.body.captcha !== "ok"){
        return res.status(400).json({ msg: "⛔ Bot detected / captcha failed" });
    }
    next();
}

// API
app.post("/submit", botCheck, (req, res) => {
    const data = req.body;

    if (!data.name || !data.email) {
        return res.status(400).json({ msg: "Missing data" });
    }

    data.time = new Date().toLocaleString();

    clients.push(data);

    console.log("🔥 New Client:", data);

    res.json({ msg: "✅ Submitted Successfully" });
});

// VIEW CLIENTS
app.get("/clients", (req, res) => {
    res.json(clients);
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});