// 🔐 LOAD ENV
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const app = express();

// 🔒 RATE LIMIT (anti-spam)
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15
});

app.use(limiter);
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// FILES
const CLIENT_FILE = "clients.json";
const REVIEW_FILE = "reviews.json";

// SAFE FILE READ
function readFile(file){
    try{
        if(!fs.existsSync(file)) return [];
        return JSON.parse(fs.readFileSync(file));
    }catch{
        return [];
    }
}

// SAFE FILE WRITE
function writeFile(file,data){
    fs.writeFileSync(file, JSON.stringify(data,null,2));
}

// ROOT
app.get("/", (req, res) => {
    res.send("✅ Server Running");
});

// 🚀 SUBMIT
app.post("/submit", async (req, res) => {
    const { name, email, mobile, service, security, ownership, ads, captcha } = req.body;

    if (!name || !email) {
        return res.status(400).json({ msg: "Missing data" });
    }

    // 🔐 CAPTCHA
    try {
        const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captcha}`;
        const response = await axios.post(verifyURL);

        if (!response.data.success) {
            return res.status(400).json({ msg: "⛔ CAPTCHA failed" });
        }

    } catch {
        return res.status(500).json({ msg: "Captcha error" });
    }

    let clients = readFile(CLIENT_FILE);

    const newClient = {
        name,
        email,
        mobile,
        service,
        security,
        ownership,
        ads,
        time: new Date().toLocaleString()
    };

    clients.push(newClient);
    writeFile(CLIENT_FILE, clients);

    // 📲 TELEGRAM
    try {
        const message = `
🔥 New Client

👤 ${name}
📧 ${email}
📱 ${mobile}

🛠 ${service}
🔐 ${security}
🔑 ${ownership}
📢 ${ads}

⏰ ${newClient.time}
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

// ⭐ ADD REVIEW
app.post("/review", (req, res) => {
    const { name, rating, message } = req.body;

    if(!name || !message){
        return res.status(400).json({ msg:"Missing review data"});
    }

    let reviews = readFile(REVIEW_FILE);

    reviews.push({
        name,
        rating,
        message,
        time:new Date().toLocaleString()
    });

    writeFile(REVIEW_FILE, reviews);

    res.json({ msg:"Review Added"});
});

// ⭐ GET REVIEWS
app.get("/reviews", (req, res) => {
    let reviews = readFile(REVIEW_FILE);
    res.json(reviews.reverse());
});

// 👥 CLIENTS
app.get("/clients", (req, res) => {
    let clients = readFile(CLIENT_FILE);
    res.json(clients);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});