const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getDb } = require('../models/database');

function superadminOnly(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, error: 'Superadmin huquqlari talab qilinadi' });
  }
  next();
}
router.use(superadminOnly);

router.get('/users', (req, res) => {
  try {
    res.json({ success: true, data: User.findAll() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/users/:id', (req, res) => {
  try {
    const { plan, is_active, subscription_expires } = req.body;
    const updates = {};
    if (plan !== undefined) updates.plan = plan;
    if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;
    if (subscription_expires !== undefined) updates.subscription_expires = subscription_expires;
    const user = User.update(Number(req.params.id), updates);
    res.json({ success: true, data: User.safe(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/users/:id', (req, res) => {
  try {
    getDb().prepare('DELETE FROM users WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    res.json({ success: true, data: {
      total_users:    db.prepare('SELECT COUNT(*) as c FROM users').get().c,
      active_users:   db.prepare('SELECT COUNT(*) as c FROM users WHERE is_active = 1').get().c,
      paid_users:     db.prepare("SELECT COUNT(*) as c FROM users WHERE plan != 'free'").get().c,
      total_contents: db.prepare('SELECT COUNT(*) as c FROM contents').get().c,
      this_month:     db.prepare("SELECT COUNT(*) as c FROM contents WHERE created_at >= date('now','start of month')").get().c
    }});
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Platformani test qilish
router.post('/test-platform', async (req, res) => {
  try {
    const { platform } = req.body;
    const Settings = require('../models/Settings');
    const results = {};

    if (platform === 'telegram' || !platform) {
      const token = process.env.TELEGRAM_BOT_TOKEN || Settings.get('TELEGRAM_BOT_TOKEN');
      const chatId = process.env.TELEGRAM_CHANNEL_ID || Settings.get('TELEGRAM_CHANNEL_ID');
      if (token && chatId) {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: '✅ KontentBot Pro - Telegram test muvaffaqiyatli!' })
        });
        const d = await r.json();
        results.telegram = d.ok ? { success: true } : { success: false, error: d.description };
      } else {
        results.telegram = { success: false, error: 'Token yoki Channel ID kiritilmagan' };
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
