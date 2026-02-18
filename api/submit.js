export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // 🔥 CORS — разрешаем GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { studentName, studentClass, answers } = req.body;

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Environment variables missing" });
    }

    let text = `📚 НОВЫЙ ТЕСТ\n\n`;
    text += `👤 Ученик: ${studentName}\n`;
    text += `🏫 Класс: ${studentClass}\n\n`;

    Object.entries(answers).forEach(([q, ans]) => {
      text += `${q.toUpperCase()}:\n${ans}\n\n`;
    });

    const tg = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text
        })
      }
    );

    const tgData = await tg.json();

    if (!tgData.ok) {
      return res.status(500).json({ error: "Telegram error", tgData });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
