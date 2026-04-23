const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 CAPTCHA SECRET KEY
const SECRET_KEY = "6LeyHsYsAAAAAP6k0DY5V1LuLH9M_fO-yRLCYqTG";

// 🤖 TELEGRAM BOT DETAILS
const BOT_TOKEN = "8699241488:AAFCvPKlhpPIMXygpY67vVzRAKMuaJtWCig";
const CHAT_ID = "7963939076";

// TEMP STORAGE
let clients = [];

// SUBMIT API
app.post("/submit", async (req, res) => {
    const data = req.body;

    if (!data.name || !data.email) {
        return res.status(400).json({ msg: "Missing data" });
    }

    // 🔐 CAPTCHA VERIFY
    try {
        const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${data.captcha}`;

        const response = await axios.post(verifyURL);

        if (!response.data.success) {
            return res.status(400).json({ msg: "⛔ CAPTCHA failed" });
        }

    } catch (err) {
        return res.status(500).json({ msg: "Captcha error" });
    }

    // SAVE DATA
    data.time = new Date().toLocaleString();
    clients.push(data);

    // 📲 TELEGRAM NOTIFICATION
    try {
        const message = `
🔥 New Client

👤 Name: ${data.name}
📧 Email: ${data.email}
📱 Mobile: ${data.mobile}

🛠 Service: ${data.service}
🔐 Security: ${data.security}
🔑 Ownership: ${data.ownership}
📢 Ads: ${data.ads}

⏰ Time: ${data.time}
`;

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });

    } catch (err) {
        console.log("Telegram Error:", err.message);
    }

    res.json({ msg: "✅ Submitted Successfully" });
});

// VIEW CLIENTS
app.get("/clients", (req, res) => {
    res.json(clients);
});

// SERVER START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});