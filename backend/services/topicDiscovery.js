const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getDb } = require('../models/database');

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
}

async function findBestTopic(timeSlot, config) {
  const db = getDb();

  const queued = db.prepare(
    "SELECT * FROM topic_queue WHERE used = 0 ORDER BY id ASC LIMIT 1"
  ).get();
  if (queued) {
    db.prepare("UPDATE topic_queue SET used = 1 WHERE id = ?").run(queued.id);
    return {
      title: queued.title,
      imageStyle: queued.image_style || 'professional',
      contentAngle: queued.content_angle || 'tahlil'
    };
  }

  const recentRows = db.prepare(
    "SELECT topic FROM contents WHERE created_at >= datetime('now', '-7 days') ORDER BY created_at DESC LIMIT 20"
  ).all();
  const recentList = recentRows.length > 0
    ? recentRows.map(r => `- ${r.topic}`).join('\n')
    : '- (hali mavzu yo\'q)';

  const hour = parseInt(timeSlot === 'TEST' ? '09' : timeSlot.split(':')[0]);
  const timeContext = hour < 11 ? 'ertalab (informatsion, foydali)'
    : hour < 16 ? 'kunduz (qisqa, vizual)'
    : 'kechqurun (chuqur, ilhomlantiruvchi)';

  const model = getModel();
  const result = await model.generateContent(
    `Sen "${config.channelDescription || 'AI, raqamli texnologiyalar'}" yo'nalishidagi O'zbek kontent kanalining kontent menedjeri san.\n\nBugun soat ${timeSlot} — ${timeContext} — uchun eng dolzarb mavzu top.\nMaqsadli auditoriya: ${config.targetAudience || 'O\'zbek mutaxassislar'}\n\nSo'nggi 7 kunda ishlatilgan (TAKRORLAMA):\n${recentList}\n\nFaqat JSON qaytargin:\n{\n  "title": "Mavzu nomi",\n  "imageStyle": "professional",\n  "contentAngle": "tahlil"\n}`
  );

  try {
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { title: 'Raqamli texnologiyalar', imageStyle: 'professional', contentAngle: 'tahlil' };
  } catch {
    return { title: 'O\'zbekistonda texnologiya yangiliklari', imageStyle: 'professional', contentAngle: 'yangilik' };
  }
}

module.exports = { findBestTopic };
