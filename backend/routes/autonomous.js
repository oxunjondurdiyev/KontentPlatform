const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');
const { runFullCycle } = require('../services/autonomousAgent');

// Sozlamalarni olish
router.get('/settings', (req, res) => {
  try {
    const db = getDb();
    const get = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value;
    res.json({
      mode: get('autonomous_mode') || 'false',
      schedule: JSON.parse(get('autonomous_schedule') || '{}'),
      config: JSON.parse(get('platform_config') || '{}')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sozlamalarni saqlash
router.post('/settings', (req, res) => {
  try {
    const db = getDb();
    const set = (key, value) => db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
    ).run(key, String(value));

    const { mode, schedule, config } = req.body;
    if (mode !== undefined) set('autonomous_mode', mode);
    if (schedule !== undefined) set('autonomous_schedule', JSON.stringify(schedule));
    if (config !== undefined) set('platform_config', JSON.stringify(config));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test tsiklini ishga tushirish
router.post('/test-run', (req, res) => {
  res.json({ message: 'Test tsikl ishga tushdi, Telegram hisobotini kuting...' });
  runFullCycle('TEST').catch(console.error);
});

// Mavzular navbati
router.get('/queue', (req, res) => {
  const db = getDb();
  const topics = db.prepare('SELECT * FROM topic_queue WHERE used = 0 ORDER BY id ASC').all();
  res.json(topics);
});

router.post('/queue', (req, res) => {
  const db = getDb();
  const { title, image_style, content_angle } = req.body;
  if (!title) return res.status(400).json({ error: 'title talab qilinadi' });
  db.prepare(
    'INSERT INTO topic_queue (title, image_style, content_angle) VALUES (?, ?, ?)'
  ).run(title, image_style || 'professional', content_angle || 'tahlil');
  res.json({ success: true });
});

router.delete('/queue/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM topic_queue WHERE id = ?').run(Number(req.params.id));
  res.json({ success: true });
});

// Oxirgi tsikllar logi
router.get('/logs', (req, res) => {
  const db = getDb();
  const logs = db.prepare(
    'SELECT * FROM autonomous_runs ORDER BY started_at DESC LIMIT 20'
  ).all();
  res.json(logs);
});

module.exports = router;
