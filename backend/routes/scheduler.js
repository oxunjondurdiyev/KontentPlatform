const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Rejalashtirilgan kontentlar
router.get('/', (req, res) => {
  try {
    const scheduled = Content.findAll({ status: 'scheduled' });
    res.json({ success: true, data: scheduled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kontent vaqtini belgilash
router.post('/:id/schedule', (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) return res.status(400).json({ success: false, error: 'scheduledAt talab qilinadi' });

    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });

    const updated = Content.update(content.id, { status: 'scheduled', scheduled_at: scheduledAt });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rejalashtirishni bekor qilish
router.post('/:id/unschedule', (req, res) => {
  try {
    const content = Content.findById(Number(req.params.id));
    if (!content) return res.status(404).json({ success: false, error: 'Topilmadi' });

    const updated = Content.update(content.id, { status: 'draft', scheduled_at: null });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Nashr tarixi
router.get('/logs', (req, res) => {
  try {
    const { getDb } = require('../models/database');
    const db = getDb();
    const logs = db.prepare(
      `SELECT l.*, c.title FROM publish_logs l
       LEFT JOIN contents c ON c.id = l.content_id
       ORDER BY l.published_at DESC LIMIT 100`
    ).all();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
