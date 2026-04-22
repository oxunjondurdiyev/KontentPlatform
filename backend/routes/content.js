const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { generateContent } = require('./anthropicService');
const { generateImagesForPlatforms } = require('../services/imageService');
const { generateVideoContent } = require('../services/videoService');
const { publishContent } = require('../services/schedulerService');

function getAnthropicService() {
  return require('../services/anthropicService');
}

router.get('/', (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const contents = Content.findAll({ status, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    res.json({ success: true, data: Content.getStats() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { topic, platforms, contentType, imageStyle, generateVideo, scheduledAt } = req.body;
    if (!topic) return res.status(400).json({ success: false, error: 'Mavzu talab qilinadi' });
    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'Kamida bitta platforma tanlang' });
    }

    const { generateContent } = getAnthropicService();
    const contentData = await generateContent(topic, platforms, contentType || 'article');

    let imageUrl = null;
    let imagePrompt = null;
    let imageProvider = null;
    try {
      const images = await generateImagesForPlatforms(topic, imageStyle, platforms);
      const firstImage = Object.values(images).find(i => i && i.imageUrl);
      imageUrl = firstImage?.imageUrl || null;
      imagePrompt = firstImage?.prompt || null;
      imageProvider = firstImage?.provider || null;
    } catch {}

    let videoData = null;
    if (generateVideo) {
      try {
        videoData = await generateVideoContent(topic, platforms.includes('youtube') ? 'youtube' : platforms[0]);
      } catch {}
    }

    const saved = Content.create({
      title: contentData.instagram?.title || contentData.youtube?.title || contentData.facebook?.headline || topic,
      topic,
      platforms,
      content_type: contentType || 'article',
      instagram_content: contentData.instagram || null,
      youtube_content: contentData.youtube || null,
      facebook_content: contentData.facebook || null,
      telegram_content: contentData.telegram || null,
      image_url: imageUrl,
      thumbnail_url: null,
      video_url: videoData?.videoUrl || null,
      video_prompt: videoData?.prompt || imagePrompt || null,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduled_at: scheduledAt || null
    });

    res.json({
      success: true,
      data: {
        ...saved,
        videoPromptOnly: videoData?.promptOnly || false,
        imageProvider: imageProvider || (imageUrl?.includes('pollinations') ? 'pollinations' : null)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });
    const updated = Content.update(Number(req.params.id), req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    Content.delete(Number(req.params.id));
    res.json({ success: true, message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Publish: DB da topilmasa, request body dan qayta tiklaydi (Railway ephemeral DB fix)
router.post('/:id/publish', async (req, res) => {
  try {
    let content = Content.findById(Number(req.params.id));

    if (!content && req.body.contentData) {
      // DB wiped after redeploy — restore from frontend data and publish
      const d = req.body.contentData;
      content = Content.create({
        title: d.title || d.topic || 'Kontent',
        topic: d.topic || '',
        platforms: d.platforms || [],
        content_type: d.content_type || 'article',
        instagram_content: d.instagram_content || null,
        youtube_content: d.youtube_content || null,
        facebook_content: d.facebook_content || null,
        telegram_content: d.telegram_content || null,
        image_url: d.image_url || null,
        thumbnail_url: d.thumbnail_url || null,
        video_url: d.video_url || null,
        video_prompt: d.video_prompt || null,
        status: 'draft',
        scheduled_at: null
      });
    }

    if (!content) return res.status(404).json({ success: false, error: 'Kontent topilmadi. Iltimos, kontentni qayta yarating.' });

    const publishResults = await publishContent(content);
    const updated = Content.findById(content.id);
    res.json({ success: true, data: updated, publishResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { chatWithAI } = getAnthropicService();
    const { messages, systemPrompt } = req.body;
    const reply = await chatWithAI(messages, systemPrompt);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
