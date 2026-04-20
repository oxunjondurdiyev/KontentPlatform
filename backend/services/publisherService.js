function getSetting(key) {
  if (process.env[key]) return process.env[key];
  try {
    const Settings = require('../models/Settings');
    return Settings.get(key) || null;
  } catch {}
  return null;
}

async function publishToInstagram(content, imageUrl) {
  const token = getSetting('INSTAGRAM_ACCESS_TOKEN');
  const userId = getSetting('INSTAGRAM_USER_ID');
  if (!token || !userId) throw new Error('Instagram sozlamalari to\'liq emas (token va user ID kerak)');

  const caption = `${content.caption || content.title || ''}\n\n${(content.hashtags || []).join(' ')}`;

  const containerRes = await fetch(`https://graph.instagram.com/${userId}/media`, {
    method: 'POST',
    body: new URLSearchParams({ image_url: imageUrl, caption, access_token: token })
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(container.error.message);

  const publishRes = await fetch(`https://graph.instagram.com/${userId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({ creation_id: container.id, access_token: token })
  });
  const published = await publishRes.json();
  if (published.error) throw new Error(published.error.message);
  return published;
}

async function publishToYouTube(content, videoPath) {
  const clientId = getSetting('YOUTUBE_CLIENT_ID');
  const clientSecret = getSetting('YOUTUBE_CLIENT_SECRET');
  const refreshToken = getSetting('YOUTUBE_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) throw new Error('YouTube OAuth sozlamalari to\'liq emas');
  if (!videoPath) throw new Error('YouTube uchun video fayl kerak');

  const { google } = require('googleapis');
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: content.title,
        description: content.description,
        tags: Array.isArray(content.tags) ? content.tags : (content.tags || '').split(','),
        categoryId: '22'
      },
      status: { privacyStatus: 'public' }
    },
    media: { body: require('fs').createReadStream(videoPath) }
  });
  return response.data;
}

async function publishToFacebook(content, imageUrl) {
  const token = getSetting('FACEBOOK_PAGE_ACCESS_TOKEN');
  const pageId = getSetting('FACEBOOK_PAGE_ID');
  if (!token || !pageId) throw new Error('Facebook sozlamalari to\'liq emas');

  const text = [content.headline || '', '', content.body || '', '', ...(content.questions || [])].join('\n').trim();

  const response = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
    method: 'POST',
    body: new URLSearchParams({ url: imageUrl, caption: text, access_token: token })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

async function publishToTelegram(content, imageUrl) {
  const token = getSetting('TELEGRAM_BOT_TOKEN');
  const channelId = getSetting('TELEGRAM_CHANNEL_ID');
  if (!token || !channelId) throw new Error('Telegram sozlamalari to\'liq emas (bot token va channel ID kerak)');

  const keyboard = content.buttons && content.buttons.length > 0 ? {
    inline_keyboard: content.buttons.map(btn => [{
      text: btn.text || btn,
      ...(btn.url ? { url: btn.url } : { callback_data: btn.callback || btn.text || String(btn) })
    }])
  } : undefined;

  const method = imageUrl ? 'sendPhoto' : 'sendMessage';
  const body = imageUrl
    ? { chat_id: channelId, photo: imageUrl, caption: content.message, parse_mode: 'Markdown', ...(keyboard ? { reply_markup: keyboard } : {}) }
    : { chat_id: channelId, text: content.message, parse_mode: 'Markdown', ...(keyboard ? { reply_markup: keyboard } : {}) };

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description);
  return data;
}

module.exports = { publishToInstagram, publishToYouTube, publishToFacebook, publishToTelegram };
