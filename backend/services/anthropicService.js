const { GoogleGenerativeAI } = require('@google/generative-ai');

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const platformPrompts = {
  instagram: `Sen O'zbekiston auditoriyasi uchun Instagram kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Sarlavha (emoji bilan, e'tibor tortuvchi, 10 so'zgacha)
- Asosiy matn (150-220 so'z, o'zbek tilida, jonli va iliqlik bilan)
- 15-20 ta hashtag (#uzbekistan, #ozbek va mavzuga oid)
- Call-to-action
Faqat JSON formatida: { "title": "", "caption": "", "hashtags": [], "cta": "" }`,

  youtube: `Sen YouTube O'zbek kanallar uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Video sarlavhasi (SEO uchun, 60 belgigacha)
- Tavsif (300-500 so'z)
- Tegler (30 ta kalit so'z)
- Video skript (kirish, asosiy qism, xulosa)
- Thumbnail tavsiyasi
Faqat JSON: { "title": "", "description": "", "tags": [], "script": "", "thumbnailIdea": "" }`,

  facebook: `Sen Facebook O'zbek auditoriyasi uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Post sarlavhasi (15 so'zgacha)
- Asosiy matn (200-350 so'z, hikoya uslubida)
- 3-5 ta savol
- Ulashishga undovchi matn
Faqat JSON: { "headline": "", "body": "", "questions": [], "shareText": "" }`,

  telegram: `Sen Telegram kanallar uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Qisqa xabar (100-150 so'z)
- Bold va emoji bilan formatlash
- Subscribe undovi
- Inline tugmalar
Telegram markdown ishlat (* bold, _ italic).
Faqat JSON: { "message": "", "buttons": [] }`
};

async function generateContent(topic, platforms, contentType) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const results = {};

  await Promise.all(platforms.map(async (platform) => {
    const prompt = platformPrompts[platform];
    if (!prompt) return;
    const fullPrompt = `${prompt}\n\nMavzu: ${topic}\nKontent turi: ${contentType}\nFaqat JSON qaytargin, boshqa hech narsa yozma.`;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    results[platform] = match ? JSON.parse(match[0]) : { raw: text };
  }));

  return results;
}

async function generateImagePrompt(topic, style, platform) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(
    `${platform} uchun "${topic}" mavzusida professional rasm yaratish uchun ingliz tilida batafsil AI rasm generatsiya prompti yoz. Uslub: ${style || 'professional, modern'}. O'zbek madaniyati elementlarini kiritgin. Faqat promptni yoz.`
  );
  return result.response.text().trim();
}

async function generateVideoPrompt(topic, platform) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(
    `${platform} uchun "${topic}" mavzusida 15-60 soniyalik professional video yaratish uchun ingliz tilidagi batafsil video prompt yoz. Vizual sahnalar, kamera harakatlari, rang va kayfiyatni o'z ichiga olsin. Faqat promptni yoz.`
  );
  return result.response.text().trim();
}

async function chatWithAI(messages, systemPrompt) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt || "Sen O'zbek tilida ishlaydigan kontent yaratish bo'yicha ekspertsan."
  });

  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

module.exports = { generateContent, generateImagePrompt, generateVideoPrompt, chatWithAI };
