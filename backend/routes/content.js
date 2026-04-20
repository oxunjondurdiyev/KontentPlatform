const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { generateContent } = require('../services/anthropicService');
const { generateImagesForPlatforms } = require('../services/imageService');
const { generateVideoContent } = require('../services/videoService');
const { publishContent } = require('../services/schedulerService');

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

    // AI matn yaratish
    const contentData = await generateContent(topic, platforms, contentType || 'article');

    // Rasm yaratish (Pollinations bepul fallback bilan)
    let imageUrl = null;
    let imagePrompt = null;
    try {
      const images = await generateImagesForPlatforms(topic, imageStyle, platforms);
      const firstImage = Object.values(images).find(i => i && i.imageUrl);
      imageUrl = firstImage?.imageUrl || null;
      imagePrompt = firstImage?.prompt || null;
    } catch {}

    // Video yaratish (agar so'ralsa)
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
        imageProvider: imageUrl ? (imageUrl.includes('pollinations') ? 'pollinations' : 'nanobanana') : null
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

router.post('/:id/publish', async (req, res) => {
  try {
    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });

    const publishResults = await publishContent(content);
    const updated = Content.findById(content.id);
    res.json({ success: true, data: updated, publishResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { chatWithAI } = require('../services/anthropicService');
    const { messages, systemPrompt } = req.body;
    const reply = await chatWithAI(messages, systemPrompt);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
