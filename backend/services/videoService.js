const { generateVideoPrompt } = require('./anthropicService');

async function generateVideoContent(topic, platform) {
  const videoPrompt = await generateVideoPrompt(topic, platform);
  const provider = process.env.VIDEO_PROVIDER || 'kling';

  let videoUrl;
  if (provider === 'kling') {
    videoUrl = await generateWithKling(videoPrompt);
  } else if (provider === 'runway') {
    videoUrl = await generateWithRunway(videoPrompt);
  } else if (provider === 'higgsfield') {
    videoUrl = await generateWithHiggsfield(videoPrompt);
  } else {
    throw new Error(`Noma'lum video provayder: ${provider}`);
  }

  return { prompt: videoPrompt, videoUrl, provider };
}

async function generateWithKling(prompt) {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) throw new Error('KLING_API_KEY sozlanmagan');

  const response = await fetch('https://api.klingai.com/v1/videos/text2video', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      duration: 15,
      aspect_ratio: '16:9',
      mode: 'pro'
    })
  });

  if (!response.ok) throw new Error(`Kling API xatosi: ${response.status}`);
  const data = await response.json();
  return data.video_url;
}

async function generateWithRunway(prompt) {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) throw new Error('RUNWAY_API_KEY sozlanmagan');

  const response = await fetch('https://api.runwayml.com/v1/generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      promptText: prompt,
      seconds: 4,
      watermark: false
    })
  });

  if (!response.ok) throw new Error(`Runway API xatosi: ${response.status}`);
  const data = await response.json();
  return data.output[0];
}

async function generateWithHiggsfield(prompt) {
  const apiKey = process.env.HIGGSFIELD_API_KEY;
  if (!apiKey) throw new Error('HIGGSFIELD_API_KEY sozlanmagan');

  const response = await fetch('https://api.higgsfield.ai/v1/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, duration: 10, resolution: '1080p' })
  });

  if (!response.ok) throw new Error(`Higgsfield API xatosi: ${response.status}`);
  const data = await response.json();
  return data.video_url;
}

module.exports = { generateVideoContent };
