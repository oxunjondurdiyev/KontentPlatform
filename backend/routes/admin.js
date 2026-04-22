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

// Telegram diagnostika
router.post('/test-platform', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const token = process.env.TELEGRAM_BOT_TOKEN || Settings.get('TELEGRAM_BOT_TOKEN');
    const chatId = process.env.TELEGRAM_CHANNEL_ID || Settings.get('TELEGRAM_CHANNEL_ID');

    const steps = [];

    if (!token) {
      return res.json({ success: true, results: { telegram: {
        success: false,
        error: 'TELEGRAM_BOT_TOKEN kiritilmagan. Railway Variables yoki Sozlamalar sahifasiga qo\'shing.'
      }}, steps });
    }
    if (!chatId) {
      return res.json({ success: true, results: { telegram: {
        success: false,
        error: 'TELEGRAM_CHANNEL_ID kiritilmagan. @kanalingiz yoki -1001234567890 formatida kiriting.'
      }}, steps });
    }

    // 1. Bot tokenni tekshirish
    const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const getMeData = await getMeRes.json();
    if (!getMeData.ok) {
      return res.json({ success: true, steps, results: { telegram: {
        success: false,
        error: `Bot token noto'g'ri! Telegram xatosi: ${getMeData.description}. @BotFather dan yangi token oling.`
      }}});
    }
    steps.push(`✅ Bot topildi: @${getMeData.result.username}`);

    // 2. Kanal/chat mavjudligini tekshirish
    const getChatRes = await fetch(`https://api.telegram.org/bot${token}/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });
    const getChatData = await getChatRes.json();
    if (!getChatData.ok) {
      return res.json({ success: true, steps, results: { telegram: {
        success: false,
        error: `Kanal topilmadi: "${chatId}". Bot kanalga admin qilib qo'shilganmi? Xato: ${getChatData.description}`
      }}});
    }
    steps.push(`✅ Kanal topildi: ${getChatData.result.title || chatId}`);

    // 3. Test xabar yuborish
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '✅ KontentBot Pro — Telegram ulanishi muvaffaqiyatli tekshirildi!' })
    });
    const sendData = await sendRes.json();
    if (!sendData.ok) {
      return res.json({ success: true, steps, results: { telegram: {
        success: false,
        error: `Xabar yuborishda xato: ${sendData.description}. Bot kanalga post yuborish huquqiga ega emasmi?`
      }}});
    }
    steps.push('✅ Test xabar yuborildi!');

    res.json({ success: true, steps, results: { telegram: { success: true } } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
