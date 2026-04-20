const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile';

function getApiKey() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  try {
    const Settings = require('../models/Settings');
    const key = Settings.get('GROQ_API_KEY');
    if (key) return key;
  } catch {}
  return null;
}

async function discoverTopics(channelDescription, targetAudience, count = 5) {
  try {
    const Settings = require('../models/Settings');
    const db = require('./database');

    // Avval topic_queue dan olish
    const queued = Settings.get ? null : null; // placeholder
    try {
      const { getDb } = require('../models/database');
      const dbInst = getDb();
      const rows = dbInst.prepare(`SELECT topic FROM topic_queue WHERE used = 0 ORDER BY priority DESC, created_at ASC LIMIT ?`).all(count);
      if (rows.length > 0) {
        const topics = rows.map(r => r.topic);
        dbInst.prepare(`UPDATE topic_queue SET used = 1 WHERE topic IN (${rows.map(() => '?').join(',')})`).run(...topics);
        return topics;
      }
    } catch {}

    // AI dan yangi mavzular olish
    const apiKey = getApiKey();
    if (!apiKey) return getDefaultTopics();

    const prompt = `O'zbek tilida ${channelDescription} mavzusida ${targetAudience} auditoriyasi uchun ${count} ta qiziqarli kontent mavzusi taklif qil.
Har bir mavzu qisqa (10 so'zgacha) va aniq bo'lsin.
Faqat JSON array qaytargin: ["mavzu1", "mavzu2", ...]`;

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 500
      })
    });

    if (!res.ok) return getDefaultTopics();
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const topics = JSON.parse(match[0]);
      return Array.isArray(topics) ? topics.slice(0, count) : getDefaultTopics();
    }
    return getDefaultTopics();
  } catch {
    return getDefaultTopics();
  }
}

function getDefaultTopics() {
  return [
    "O'zbekistonda texnologiya rivojlanishi",
    "Sog'lom turmush tarzi sirlari",
    "Biznes boshlash bo'yicha maslahatlar",
    "Ta'lim va o'z-o'zini rivojlantirish",
    "Ekologiya va tabiatni muhofaza qilish"
  ];
}

module.exports = { discoverTopics };
