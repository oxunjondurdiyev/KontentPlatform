const { generateVideoPrompt } = require('./anthropicService');

function getSetting(key) {
  if (process.env[key]) return process.env[key];
  try {
    const Settings = require('../models/Settings');
    return Settings.get(key) || null;
  } catch {}
  return null;
}

async function generateVideoContent(topic, platform) {
  const videoPrompt = await generateVideoPrompt(topic, platform);
  const provider = getSetting('VIDEO_PROVIDER') || 'kling';
  const apiKey = getSetting(`${provider.toUpperCase()}_API_KEY`);

  // API keysiz - faqat skript/prompt qaytaradi
  if (!apiKey) {
    return { prompt: videoPrompt, videoUrl: null, provider, promptOnly: true };
  }

  try {
    let videoUrl;
    if (provider === 'kling') videoUrl = await generateWithKling(videoPrompt, apiKey);
    else if (provider === 'runway') videoUrl = await generateWithRunway(videoPrompt, apiKey);
    else if (provider === 'higgsfield') videoUrl = await generateWithHiggsfield(videoPrompt, apiKey);
    else throw new Error(`Noma'lum provayder: ${provider}`);
    return { prompt: videoPrompt, videoUrl, provider };
  } catch (err) {
    return { prompt: videoPrompt, videoUrl: null, provider, error: err.message };
  }
}

async function generateWithKling(prompt, apiKey) {
  const response = await fetch('https://api.klingai.com/v1/videos/text2video', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, duration: 15, aspect_ratio: '16:9', mode: 'pro' })
  });
  if (!response.ok) throw new Error(`Kling API xatosi: ${response.status}`);
  const data = await response.json();
  return data.video_url;
}

async function generateWithRunway(prompt, apiKey) {
  const response = await fetch('https://api.runwayml.com/v1/generation', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptText: prompt, seconds: 4, watermark: false })
  });
  if (!response.ok) throw new Error(`Runway API xatosi: ${response.status}`);
  const data = await response.json();
  return data.output[0];
}

async function generateWithHiggsfield(prompt, apiKey) {
  const response = await fetch('https://api.higgsfield.ai/v1/generate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, duration: 10, resolution: '1080p' })
  });
  if (!response.ok) throw new Error(`Higgsfield API xatosi: ${response.status}`);
  const data = await response.json();
  return data.video_url;
}

module.exports = { generateVideoContent };
