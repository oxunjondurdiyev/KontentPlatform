const { generateImagePrompt } = require('./anthropicService');

const NANO_BANANA_BASE = 'https://api.nanobanana.ai/v1';

const PLATFORM_DIMENSIONS = {
  instagram: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  youtube: { width: 1280, height: 720 },
  facebook: { width: 1200, height: 630 },
  telegram: { width: 1280, height: 720 }
};

async function generateImage(topic, style, platform) {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  if (!apiKey) throw new Error('NANO_BANANA_API_KEY sozlanmagan');

  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS.instagram;
  const imagePrompt = await generateImagePrompt(topic, style, platform);

  const response = await fetch(`${NANO_BANANA_BASE}/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: imagePrompt,
      width: dims.width,
      height: dims.height,
      style: style || 'professional, modern, uzbek culture inspired'
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Nano Banana API xatosi: ${err}`);
  }

  const data = await response.json();
  return { imageUrl: data.url || data.image_url, prompt: imagePrompt };
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
