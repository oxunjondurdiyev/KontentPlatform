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
  if (process.env.GOOGLE_AI_KEY) return process.env.GOOGLE_AI_KEY;
  try {
    const Settings = require('../models/Settings');
    return Settings.get('GOOGLE_AI_KEY') || null;
  } catch {}
  return null;
}

async function generateWithGoogleImagen(prompt, dims) {
  const apiKey = getGoogleKey();
  if (!apiKey) throw new Error('GOOGLE_AI_KEY sozlanmagan');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: dims.aspect || '1:1' }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Imagen xato (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('Google Imagen rasm qaytarmadi');

  // Base64 ni faylga saqlash
  const uploadsDir = path.join(__dirname, '../../uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `imagen_${Date.now()}.png`;
  fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(b64, 'base64'));
  return `/uploads/${filename}`;
}

async function generateImage(topic, style, platform) {
  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram;
  const imagePrompt = await generateImagePrompt(topic, style, platform);

  // 1. Google Imagen (agar GOOGLE_AI_KEY bo'lsa)
  const googleKey = getGoogleKey();
  if (googleKey) {
    try {
      const imageUrl = await generateWithGoogleImagen(imagePrompt, dims);
      return { imageUrl, prompt: imagePrompt, provider: 'google-imagen' };
    } catch (e) {
      console.log('Google Imagen xato:', e.message);
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
