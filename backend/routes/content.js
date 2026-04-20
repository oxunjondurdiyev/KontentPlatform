const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { generateContent } = require('../services/anthropicService');
const { generateImagesForPlatforms } = require('../services/imageService');
const { generateVideoContent } = require('../services/videoService');
const { publishContent } = require('../services/schedulerService');

// Barcha kontentlarni olish
router.get('/', (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const contents = Content.findAll({ status, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Statistika
router.get('/stats', (req, res) => {
  try {
    res.json({ success: true, data: Content.getStats() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bitta kontent
router.get('/:id', (req, res) => {
  try {
    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Yangi kontent yaratish (AI bilan)
router.post('/generate', async (req, res) => {
  try {
    const { topic, platforms, contentType, imageStyle, generateVideo, scheduledAt } = req.body;

    if (!topic) return res.status(400).json({ success: false, error: 'Mavzu talab qilinadi' });
    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'Kamida bitta platforma tanlang' });
    }

    // AI kontent yaratish
    const contentData = await generateContent(topic, platforms, contentType || 'article');

    // Rasm yaratish
    let imageUrl = null;
    try {
      const images = await generateImagesForPlatforms(topic, imageStyle, platforms);
      imageUrl = Object.values(images).find(i => i && i.imageUrl)?.imageUrl || null;
    } catch {
      // Rasm yaratish muvaffaqiyatsiz bo'lsa davom etamiz
    }

    // Video yaratish (agar so'ralsa)
    let videoData = null;
    if (generateVideo && (platforms.includes('youtube') || contentType === 'video')) {
      try {
        videoData = await generateVideoContent(topic, 'youtube');
      } catch {
        // Video yaratish muvaffaqiyatsiz bo'lsa davom etamiz
      }
    }

    // Bazaga saqlash
    const saved = Content.create({
      title: contentData.instagram?.title || contentData.youtube?.title || topic,
      topic,
      platforms,
      content_type: contentType || 'article',
      instagram_content: contentData.instagram || null,
      youtube_content: contentData.youtube || null,
      facebook_content: contentData.facebook || null,
      telegram_content: contentData.telegram || null,
      image_url: imageUrl,
      video_url: videoData?.videoUrl || null,
      video_prompt: videoData?.prompt || null,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduled_at: scheduledAt || null
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kontent yangilash
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

// Kontent o'chirish
router.delete('/:id', (req, res) => {
  try {
    Content.delete(Number(req.params.id));
    res.json({ success: true, message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Darhol nashr qilish
router.post('/:id/publish', async (req, res) => {
  try {
    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });

    await publishContent(content);
    const updated = Content.findById(content.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI bilan suhbat
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
