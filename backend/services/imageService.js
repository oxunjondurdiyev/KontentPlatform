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

async function generateImage(topic, style, platform) {
  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram;
  const imagePrompt = await generateImagePrompt(topic, style, platform);
  const apiKey = getApiKey();

  // Nano Banana API (agar kalit bo'lsa)
  if (apiKey) {
    try {
      const response = await fetch('https://api.nanobanana.ai/v1/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, width: dims.width, height: dims.height, style: style || 'professional' })
      });
      if (response.ok) {
        const data = await response.json();
        const url = data.url || data.image_url;
        if (url) return { imageUrl: url, prompt: imagePrompt, provider: 'nanobanana' };
      }
    } catch {}
  }

  // Bepul fallback: Pollinations.ai (API keysiz ishlaydi)
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
