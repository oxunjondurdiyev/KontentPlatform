// Groq API - bepul, tez, Llama 3.1 70B
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-70b-versatile';

async function groqGenerate(prompt, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY sozlanmagan. console.groq.com dan bepul kalit oling.');

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API xato (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

const platformPrompts = {
  instagram: `Sen O'zbekiston auditoriyasi uchun Instagram kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Sarlavha (emoji bilan, 10 so'zgacha)
- Asosiy matn (150-220 so'z, o'zbek tilida)
- 15-20 ta hashtag
- Call-to-action
Faqat JSON qaytargin: { "title": "", "caption": "", "hashtags": [], "cta": "" }`,

  youtube: `Sen YouTube O'zbek kanallar uchun kontent mutaxassisisan.
- Video sarlavhasi (60 belgigacha)
- Tavsif (300-500 so'z)
- Tegler (30 ta)
- Video skript
Faqat JSON: { "title": "", "description": "", "tags": [], "script": "", "thumbnailIdea": "" }`,

  facebook: `Sen Facebook O'zbek auditoriyasi uchun kontent mutaxassisisan.
- Sarlavha (15 so'zgacha)
- Asosiy matn (200-350 so'z)
- 3-5 ta savol
Faqat JSON: { "headline": "", "body": "", "questions": [], "shareText": "" }`,

  telegram: `Sen Telegram kanallar uchun kontent mutaxassisisan.
- Qisqa xabar (100-150 so'z)
- Markdown formatlash (* bold)
Faqat JSON: { "message": "", "buttons": [] }`
};

async function generateContent(topic, platforms, contentType) {
  const results = {};
  await Promise.all(platforms.map(async (platform) => {
    const systemPrompt = platformPrompts[platform];
    if (!systemPrompt) return;
    const text = await groqGenerate(`Mavzu: ${topic}\nKontent turi: ${contentType}\nFaqat JSON qaytargin, boshqa hech narsa yozma.`, systemPrompt);
    const match = text.match(/\{[\s\S]*\}/);
    try { results[platform] = match ? JSON.parse(match[0]) : { raw: text }; }
    catch { results[platform] = { raw: text }; }
  }));
  return results;
}

async function generateImagePrompt(topic, style, platform) {
  return groqGenerate(`${platform} uchun "${topic}" mavzusida professional rasm uchun ingliz tilida AI prompt yoz. Uslub: ${style || 'professional'}. Faqat promptni yoz.`);
}

async function generateVideoPrompt(topic, platform) {
  return groqGenerate(`${platform} uchun "${topic}" mavzusida qisqa video uchun ingliz tilida prompt yoz. Faqat promptni yoz.`);
}

async function chatWithAI(messages, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY sozlanmagan');

  const groqMessages = [];
  if (systemPrompt) groqMessages.push({ role: 'system', content: systemPrompt });
  messages.forEach(m => groqMessages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages: groqMessages, temperature: 0.7, max_tokens: 1500 })
  });

  if (!res.ok) throw new Error(`Groq xato: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

module.exports = { generateContent, generateImagePrompt, generateVideoPrompt, chatWithAI };
