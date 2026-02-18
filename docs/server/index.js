const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
if (!BOT_TOKEN || !CHAT_ID) {
  console.warn('Warning: BOT_TOKEN or CHAT_ID not set in environment. See .env.example');
}


const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// Handle CORS preflight for /submit explicitly
app.options('/submit', cors());

app.post('/submit', async (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.studentName) return res.status(400).json({error: 'Invalid payload'});

    let message = `Учениk: ${body.studentName}\nКласс: ${body.studentClass}\n\n`;
    const answers = body.answers || {};
    Object.keys(answers).sort().forEach(k => {
      message += `${k}: ${answers[k]}\n`;
    });

    if (!BOT_TOKEN || !CHAT_ID) return res.status(500).json({error: 'Server not configured with BOT_TOKEN/CHAT_ID'});

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({chat_id: CHAT_ID, text: message})
    });
    const data = await resp.json();
    if (!data.ok) return res.status(502).json({error: 'Telegram API error', details: data});
    res.json({ok: true, result: data.result});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Serve static frontend from parent docs folder (after API routes)
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
