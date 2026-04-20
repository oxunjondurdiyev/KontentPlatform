const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { publishToInstagram, publishToYouTube, publishToFacebook, publishToTelegram } = require('../services/publisherService');

// Platformaga nashr qilish
router.post('/:id/:platform', async (req, res) => {
  try {
    const { id, platform } = req.params;
    const content = Content.findById(Number(id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });

    const publishers = {
      instagram: () => publishToInstagram(content.instagram_content, content.image_url),
      youtube: () => publishToYouTube(content.youtube_content, content.video_url),
      facebook: () => publishToFacebook(content.facebook_content, content.image_url),
      telegram: () => publishToTelegram(content.telegram_content, content.image_url)
    };

    if (!publishers[platform]) {
      return res.status(400).json({ success: false, error: `Noma'lum platforma: ${platform}` });
    }

    const result = await publishers[platform]();
    const { getDb } = require('../models/database');
    getDb().prepare(
      'INSERT INTO publish_logs (content_id, platform, status, response) VALUES (?, ?, ?, ?)'
    ).run(content.id, platform, 'success', JSON.stringify(result));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
