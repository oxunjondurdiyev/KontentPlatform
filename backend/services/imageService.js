const path = require('path');
const fs = require('fs');
const { generateImagePrompt } = require('./anthropicService');

const PLATFORM_DIMENSIONS = {
  instagram: { width: 1080, height: 1080, aspect: '1:1' },
  instagram_story: { width: 1080, height: 1920, aspect: '9:16' },
  youtube: { width: 1280, height: 720, aspect: '16:9' },
  facebook: { width: 1200, height: 630, aspect: '16:9' },
  telegram: { width: 1280, height: 720, aspect: '16:9' }
};

function getGoogleKey() {
  // GOOGLE_AI_KEY yoki GEMINI_API_KEY ni tekshiradi
  if (process.env.GOOGLE_AI_KEY) return process.env.GOOGLE_AI_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const Settings = require('../models/Settings');
    return Settings.get('GOOGLE_AI_KEY') || Settings.get('GEMINI_API_KEY') || null;
  } catch {}
  return null;
}

async function generateWithGoogleImagen(prompt, dims) {
  const apiKey = getGoogleKey();
  if (!apiKey) throw new Error('GOOGLE_AI_KEY yoki GEMINI_API_KEY sozlanmagan');

  // Imagen modellarini navbat bilan sinab ko'ramiz
  const models = [
    'imagen-3.0-generate-001',
    'imagen-3.0-fast-generate-001',
    'imagen-2.0-generate-001'
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: dims.aspect || '1:1' }
          })
        }
      );

      const text = await res.text();
      console.log(`Imagen [${model}] status=${res.status}`);

      if (res.ok) {
        const data = JSON.parse(text);
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          const uploadsDir = path.join(__dirname, '../../uploads');
          fs.mkdirSync(uploadsDir, { recursive: true });
          const filename = `imagen_${Date.now()}.png`;
          fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(b64, 'base64'));
          console.log(`Imagen muvaffaqiyatli: ${model}`);
          return `/uploads/${filename}`;
        }
      } else {
        console.log(`Imagen [${model}] xato: ${text.slice(0, 300)}`);
      }
    } catch (e) {
      console.log(`Imagen [${model}] exception: ${e.message}`);
    }
  }

  throw new Error('Barcha Imagen modellari muvaffaqiyatsiz');
}

async function generateImage(topic, style, platform) {
  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram;
  const imagePrompt = await generateImagePrompt(topic, style, platform);

  // 1. Google Imagen (agar kalit bo'lsa)
  const googleKey = getGoogleKey();
  if (googleKey) {
    try {
      const imageUrl = await generateWithGoogleImagen(imagePrompt, dims);
      return { imageUrl, prompt: imagePrompt, provider: 'google-imagen' };
    } catch (e) {
      console.log('Google Imagen failed, Pollinations ga o\'tildi:', e.message);
    }
  }

  // 2. Bepul fallback: Pollinations.ai
  const encoded = encodeURIComponent(imagePrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${dims.width}&height=${dims.height}&nologo=true&model=flux`;
  return { imageUrl, prompt: imagePrompt, provider: 'pollinations' };
}

async function generateImagesForPlatforms(topic, style, platforms) {
  const results = {};
  for (const platform of platforms) {
    try {
      results[platform] = await generateImage(topic, style, platform);
    } catch (err) {
      results[platform] = { error: err.message };
    }
  }
  return results;
}

module.exports = { generateImage, generateImagesForPlatforms };
