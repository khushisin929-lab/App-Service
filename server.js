const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = "6LeyHsYsAAAAAP6k0DY5V1LuLH9M_fO-yRLCYqTG";

// TEMP STORAGE
let clients = [];

app.post("/submit", async (req, res) => {
    const data = req.body;

    if (!data.name || !data.email) {
        return res.status(400).json({ msg: "Missing data" });
    }

    // 🔐 CAPTCHA VERIFY
    try{
        const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${data.captcha}`;

        const response = await axios.post(verifyURL);

        if(!response.data.success){
            return res.status(400).json({ msg: "⛔ CAPTCHA failed" });
        }

    } catch(err){
        return res.status(500).json({ msg: "Captcha error" });
    }

    data.time = new Date().toLocaleString();
    clients.push(data);

    res.json({ msg: "✅ Submitted Successfully" });
});

app.get("/clients", (req, res) => {
    res.json(clients);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});