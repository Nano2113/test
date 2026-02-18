// Serverless function compatible with Vercel/Netlify (Node 18+ runtime with global fetch)
// Configure BOT_TOKEN and CHAT_ID as environment variables in hosting (do NOT commit them publicly)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = req.body;
    if (!body || !body.studentName) return res.status(400).json({error: 'Invalid payload'});

    // Prefer environment variables (secure), but allow using local `secrets.js` for quick testing.
    let BOT_TOKEN = process.env.BOT_TOKEN || '';
    let CHAT_ID = process.env.CHAT_ID || '';
    try {
      const secrets = await import('../secrets.js');
      BOT_TOKEN = BOT_TOKEN || (secrets && secrets.BOT_TOKEN) || '';
      CHAT_ID = CHAT_ID || (secrets && secrets.CHAT_ID) || '';
    } catch (e) {
      // If secrets.js is missing, ignore — rely on env vars.
    }

    let message = `Ученик: ${body.studentName}\nКласс: ${body.studentClass}\n\n`;
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
    res.status(200).json({ok: true});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
}
