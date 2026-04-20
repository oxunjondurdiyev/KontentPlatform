const GEMINI_API = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

async function geminiGenerate(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY sozlanmagan');

  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API xato (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const platformPrompts = {
  instagram: `Sen O'zbekiston auditoriyasi uchun Instagram kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Sarlavha (emoji bilan, 10 so'zgacha)
- Asosiy matn (150-220 so'z, o'zbek tilida)
- 15-20 ta hashtag
- Call-to-action
Faqat JSON: { "title": "", "caption": "", "hashtags": [], "cta": "" }`,

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
    const prompt = platformPrompts[platform];
    if (!prompt) return;
    const text = await geminiGenerate(`${prompt}\n\nMavzu: ${topic}\nKontent turi: ${contentType}\nFaqat JSON qaytargin.`);
    const match = text.match(/\{[\s\S]*\}/);
    try { results[platform] = match ? JSON.parse(match[0]) : { raw: text }; }
    catch { results[platform] = { raw: text }; }
  }));
  return results;
}

async function generateImagePrompt(topic, style, platform) {
  return geminiGenerate(`${platform} uchun "${topic}" mavzusida professional rasm uchun ingliz tilida AI prompt yoz. Uslub: ${style || 'professional'}. Faqat promptni yoz.`);
}

async function generateVideoPrompt(topic, platform) {
  return geminiGenerate(`${platform} uchun "${topic}" mavzusida qisqa video uchun ingliz tilida prompt yoz. Faqat promptni yoz.`);
}

async function chatWithAI(messages, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY sozlanmagan');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt || "Sen O'zbek tilida kontent yaratish bo'yicha ekspertsan." }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
    })
  });

  if (!res.ok) throw new Error(`Gemini xato: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

module.exports = { generateContent, generateImagePrompt, generateVideoPrompt, chatWithAI };
