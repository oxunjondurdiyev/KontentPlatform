const { GoogleGenerativeAI } = require('@google/generative-ai');

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
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
Berilgan mavzu asosida quyidagilarni yaratasan:
- Video sarlavhasi (60 belgigacha)
- Tavsif (300-500 so'z)
- Tegler (30 ta)
- Video skript
Faqat JSON: { "title": "", "description": "", "tags": [], "script": "", "thumbnailIdea": "" }`,

  facebook: `Sen Facebook O'zbek auditoriyasi uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Sarlavha (15 so'zgacha)
- Asosiy matn (200-350 so'z)
- 3-5 ta savol
Faqat JSON: { "headline": "", "body": "", "questions": [], "shareText": "" }`,

  telegram: `Sen Telegram kanallar uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Qisqa xabar (100-150 so'z)
- Markdown formatlash
Faqat JSON: { "message": "", "buttons": [] }`
};

async function generateContent(topic, platforms, contentType) {
  const model = getModel();
  const results = {};

  await Promise.all(platforms.map(async (platform) => {
    const prompt = platformPrompts[platform];
    if (!prompt) return;
    const result = await model.generateContent(
      `${prompt}\n\nMavzu: ${topic}\nKontent turi: ${contentType}\nFaqat JSON qaytargin.`
    );
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    try { results[platform] = match ? JSON.parse(match[0]) : { raw: text }; }
    catch { results[platform] = { raw: text }; }
  }));

  return results;
}

async function generateImagePrompt(topic, style, platform) {
  const model = getModel();
  const result = await model.generateContent(
    `${platform} uchun "${topic}" mavzusida professional rasm uchun ingliz tilida AI prompt yoz. Uslub: ${style || 'professional'}. Faqat promptni yoz.`
  );
  return result.response.text().trim();
}

async function generateVideoPrompt(topic, platform) {
  const model = getModel();
  const result = await model.generateContent(
    `${platform} uchun "${topic}" mavzusida qisqa video uchun ingliz tilida prompt yoz. Faqat promptni yoz.`
  );
  return result.response.text().trim();
}

async function chatWithAI(messages, systemPrompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return result.response.text();
}

module.exports = { generateContent, generateImagePrompt, generateVideoPrompt, chatWithAI };
