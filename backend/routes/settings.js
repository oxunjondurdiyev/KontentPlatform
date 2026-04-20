const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

router.get('/', (req, res) => {
  try {
    const all = Settings.getAll();
    // API kalitlarni yashirish
    const safe = Object.fromEntries(
      Object.entries(all).map(([k, v]) => {
        if (k.includes('KEY') || k.includes('TOKEN') || k.includes('SECRET') || k.includes('PASSWORD')) {
          return [k, v ? '***' + String(v).slice(-4) : null];
        }
        return [k, v];
      })
    );
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      Settings.set(key, value);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:key', (req, res) => {
  try {
    Settings.delete(req.params.key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
