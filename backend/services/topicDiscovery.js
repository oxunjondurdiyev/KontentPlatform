const Anthropic = require('@anthropic-ai/sdk');
const { getDb } = require('../models/database');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function findBestTopic(timeSlot, config) {
  const db = getDb();

  // 1. Navbatdagi mavzuni tekshir
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

  // 2. AI orqali mavzu topish
  const recentRows = db.prepare(
    "SELECT topic FROM contents WHERE created_at >= datetime('now', '-7 days') ORDER BY created_at DESC LIMIT 20"
  ).all();
  const recentList = recentRows.length > 0
    ? recentRows.map(r => `- ${r.topic}`).join('\n')
    : '- (hali mavzu yo\'q)';

  const hour = parseInt(timeSlot === 'TEST' ? '09' : timeSlot.split(':')[0]);
  const timeContext = hour < 11
    ? 'ertalab (informatsion, foydali)'
    : hour < 16 ? 'kunduz (qisqa, vizual)'
    : 'kechqurun (chuqur, ilhomlantiruvchi)';

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Sen "${config.channelDescription || 'AI, ISO standartlar, raqamli texnologiyalar'}" yo'nalishidagi O'zbek tilidagi kontent kanalining kontent menedjeri san.\n\nBugun soat ${timeSlot} \u2014 ${timeContext} \u2014 uchun eng dolzarb mavzu top.\n\nMaqsadli auditoriya: ${config.targetAudience || 'O\'zbek mutaxassislar va tadbirkorlar'}\n\nSo'nggi 7 kunda ishlatilgan mavzular (BULARNI TAKRORLAMA):\n${recentList}\n\nFaqat JSON formatda javob ber:\n{\n  "title": "Mavzu nomi (o'zbek tilida, qiziqarli va aniq)",\n  "imageStyle": "professional | modern | minimalist | vibrant | cinematic",\n  "contentAngle": "yangilik | qo'llanma | tahlil | ilhom"\n}`
    }]
  });

  try {
    const text = response.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { title: 'Raqamli texnologiyalar va kelajak', imageStyle: 'professional', contentAngle: 'tahlil' };
  } catch {
    return { title: 'O\'zbekistonda texnologiya yangiliklari', imageStyle: 'professional', contentAngle: 'yangilik' };
  }
}

module.exports = { findBestTopic };
