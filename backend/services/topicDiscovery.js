const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getDb } = require('../models/database');

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

async function findBestTopic(timeSlot, config) {
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

  const model = getModel();
  const result = await model.generateContent(
    `"${config.channelDescription || 'AI, texnologiyalar'}" kanalining kontent menejjeri san.\nSoat ${timeSlot} (${timeContext}) uchun mavzu top.\nAuditoriya: ${config.targetAudience || 'O\'zbek mutaxassislar'}\nOxirgi mavzular (takrorlama):\n${recentList}\nFaqat JSON: {"title":"","imageStyle":"professional","contentAngle":"tahlil"}`
  );

  try {
    const match = result.response.text().match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { title: 'Raqamli texnologiyalar', imageStyle: 'professional', contentAngle: 'tahlil' };
  } catch {
    return { title: 'O\'zbekistonda texnologiya yangiliklari', imageStyle: 'professional', contentAngle: 'yangilik' };
  }
}

module.exports = { findBestTopic };
