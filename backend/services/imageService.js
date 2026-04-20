const { generateImagePrompt } = require('./anthropicService');

const PLATFORM_DIMENSIONS = {
  instagram: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  youtube: { width: 1280, height: 720 },
  facebook: { width: 1200, height: 630 },
  telegram: { width: 1280, height: 720 }
};

function getApiKey() {
  if (process.env.NANO_BANANA_API_KEY) return process.env.NANO_BANANA_API_KEY;
  try {
    const Settings = require('../models/Settings');
    return Settings.get('NANO_BANANA_API_KEY') || null;
  } catch {}
  return null;
}

// Nano Banana API ga to'g'ridan-to'g'ri so'rov - xatoni qaytaradi
async function tryNanoBanana(prompt, dims, apiKey) {
  // Nano Banana haqiqiy API endpointlarini sinab ko'ramiz
  const endpoints = [
    { url: 'https://api.nanobanana.ai/v1/images/generations', body: { prompt, n: 1, size: `${dims.width}x${dims.height}` } },
    { url: 'https://api.nanobanana.ai/v1/generate', body: { prompt, width: dims.width, height: dims.height } },
    { url: 'https://nanobanana.ai/api/generate', body: { prompt, width: dims.width, height: dims.height } }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(ep.body)
      });
      const text = await res.text();
      console.log(`Nano Banana [${ep.url}] status=${res.status} body=${text.slice(0, 200)}`);
      if (res.ok) {
        const data = JSON.parse(text);
        const url = data.url || data.image_url || data.data?.[0]?.url || data.images?.[0];
        if (url) return { imageUrl: url, provider: 'nanobanana' };
      }
    } catch (e) {
      console.log(`Nano Banana endpoint xato: ${ep.url} -> ${e.message}`);
    }
  }
  return null;
}

async function generateImage(topic, style, platform) {
  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram;
  const imagePrompt = await generateImagePrompt(topic, style, platform);
  const apiKey = getApiKey();

  if (apiKey) {
    const result = await tryNanoBanana(imagePrompt, dims, apiKey);
    if (result) return { ...result, prompt: imagePrompt };
    console.log('Nano Banana ishlamadi, Pollinations ga o\'tildi');
  }

  // Bepul fallback: Pollinations.ai
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

module.exports = { generateImage, generateImagesForPlatforms, tryNanoBanana };
