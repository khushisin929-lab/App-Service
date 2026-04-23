const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// TEMP STORAGE
let clients = [];

// API
app.post("/submit", (req, res) => {
    const data = req.body;

    if (!data.name || !data.email) {
        return res.status(400).json({ msg: "Missing data" });
    }

    data.time = new Date().toLocaleString();
    clients.push(data);

    console.log("🔥 New Client:", data);

    res.json({ msg: "✅ Submitted Successfully" });
});

app.get("/clients", (req, res) => {
    res.json(clients);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});