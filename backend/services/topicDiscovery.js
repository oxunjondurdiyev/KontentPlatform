const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile';

async function findBestTopic(timeSlot, config) {
  const { getDb } = require('../models/database');
  const db = getDb();

  const queued = db.prepare("SELECT * FROM topic_queue WHERE used = 0 ORDER BY id ASC LIMIT 1").get();
  if (queued) {
    db.prepare("UPDATE topic_queue SET used = 1 WHERE id = ?").run(queued.id);
    return { title: queued.title, imageStyle: queued.image_style || 'professional', contentAngle: queued.content_angle || 'tahlil' };
  }

  const recentRows = db.prepare("SELECT topic FROM contents WHERE created_at >= datetime('now', '-7 days') LIMIT 20").all();
  const recentList = recentRows.length > 0 ? recentRows.map(r => `- ${r.topic}`).join('\n') : '- (hali mavzu yo\'q)';
  const hour = parseInt(timeSlot === 'TEST' ? '09' : timeSlot.split(':')[0]);
  const timeContext = hour < 11 ? 'ertalab' : hour < 16 ? 'kunduz' : 'kechqurun';

  const apiKey = process.env.GROQ_API_KEY;
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: `"${config.channelDescription || 'AI, texnologiyalar'}" kanalining kontent menejjeri san.` },
        { role: 'user', content: `Soat ${timeSlot} (${timeContext}) uchun mavzu top.\nAuditoriya: ${config.targetAudience || "O'zbek mutaxassislar"}\nOxirgi mavzular (takrorlama):\n${recentList}\nFaqat JSON: {"title":"","imageStyle":"professional","contentAngle":"tahlil"}` }
      ],
      temperature: 0.8, max_tokens: 300
    })
  });

  if (!res.ok) return { title: 'Raqamli texnologiyalar', imageStyle: 'professional', contentAngle: 'tahlil' };
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { title: 'Texnologiya yangiliklari', imageStyle: 'professional', contentAngle: 'tahlil' };
  } catch {
    return { title: 'O\'zbekistonda texnologiya yangiliklari', imageStyle: 'professional', contentAngle: 'yangilik' };
  }
}

module.exports = { findBestTopic };
