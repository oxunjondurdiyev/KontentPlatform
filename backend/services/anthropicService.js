const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const platformPrompts = {
  instagram: `
Sen O'zbekiston auditoriyasi uchun Instagram kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Sarlavha (emoji bilan, e'tibor tortuvchi, 10 so'zgacha)
- Asosiy matn (150-220 so'z, o'zbek tilida, jonli va iliqlik bilan)
- 15-20 ta hashtag (#uzbekistan, #ozbek va mavzuga oid)
- Call-to-action (izoh qoldiring, do'stlaringizga ulashing, va h.k.)
Faqat JSON formatida qaytargin: { "title": "", "caption": "", "hashtags": [], "cta": "" }
`,
  youtube: `
Sen YouTube O'zbek kanallar uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Video sarlavhasi (SEO uchun optimallashtirilgan, qiziqarli, 60 belgigacha)
- Tavsif (300-500 so'z, kalit so'zlar bilan)
- Tegler (30 ta kalit so'z)
- Video skript yoki reja (kirish, asosiy qism, xulosa)
- Thumbnail uchun tavsiya
Faqat JSON formatida qaytargin: { "title": "", "description": "", "tags": [], "script": "", "thumbnailIdea": "" }
`,
  facebook: `
Sen Facebook O'zbek auditoriyasi uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Post sarlavhasi (diqqat tortar, 15 so'zgacha)
- Asosiy matn (200-350 so'z, hikoya uslubida, o'zbek tilida)
- 3-5 ta savol (auditoriya bilan muloqot uchun)
- Ulashishga undovchi matn
Faqat JSON formatida qaytargin: { "headline": "", "body": "", "questions": [], "shareText": "" }
`,
  telegram: `
Sen Telegram kanallar uchun kontent mutaxassisisan.
Berilgan mavzu asosida quyidagilarni yaratasan:
- Qisqa va lo'nda xabar (100-150 so'z)
- Muhim fikrlarni bold va emoji bilan ajratib ko'rsatish
- Kanalga subscribe qilishga undovchi so'z
- Inline tugmalar uchun matn
Telegram markdown formatini ishlat (** uchun bold, __ uchun italic).
Faqat JSON formatida qaytargin: { "message": "", "buttons": [] }
`
};

async function generateContent(topic, platforms, contentType) {
  const results = {};
  const promises = platforms.map(async (platform) => {
    const prompt = platformPrompts[platform];
    if (!prompt) return;
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      system: prompt,
      messages: [{
        role: 'user',
        content: `Mavzu: ${topic}\nKontent turi: ${contentType}\nFaqat JSON formatida qaytargin.`
      }]
    });
    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    results[platform] = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
  });
  await Promise.all(promises);
  return results;
}

async function generateImagePrompt(topic, style, platform) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `${platform} uchun "${topic}" mavzusida professional rasm yaratish uchun ingliz tilida batafsil prompt yoz. O'zbek madaniyati elementlarini kiritgin. Faqat promptni yoz, boshqa narsa yo'q.`
    }]
  });
  return response.content[0].text.trim();
}

async function generateVideoPrompt(topic, platform) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `${platform} uchun "${topic}" mavzusida 15-60 soniyalik professional video yaratish uchun batafsil ingliz tilidagi prompt yoz.\n\nPrompt quyidagilarni o'z ichiga olsin:\n- Vizual sahnalar tavsifi\n- Kamera harakatlari (pan, zoom, tilt)\n- Rang va yorug'lik tavsifi\n- Kayfiyat va atmosfera\n- Matn overlay tavsiyalari\n\nFaqat promptni yoz.`
    }]
  });
  return response.content[0].text.trim();
}

async function chatWithAI(messages, systemPrompt) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: systemPrompt || 'Sen O\'zbek tilida ishlaydigan kontent yaratish bo\'yicha ekspertsan. Foydalanuvchiga kontent yaratishda yordam ber.',
    messages
  });
  return response.content[0].text;
}

module.exports = { generateContent, generateImagePrompt, generateVideoPrompt, chatWithAI };
