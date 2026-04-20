const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

router.get('/', (req, res) => {
  try {
    const all = Settings.getAll();
    const safe = Object.fromEntries(
      Object.entries(all).map(([k, v]) => {
        if (k.includes('KEY') || k.includes('TOKEN') || k.includes('SECRET') || k.includes('PASSWORD')) {
          return [k, v ? true : null];
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

// Nano Banana API ni test qilish
router.post('/test-nano-banana', async (req, res) => {
  try {
    const apiKey = Settings.get('NANO_BANANA_API_KEY') || process.env.NANO_BANANA_API_KEY;
    if (!apiKey) return res.json({ success: false, error: 'NANO_BANANA_API_KEY kiritilmagan' });

    const testPrompt = 'professional photo of a flower';
    const endpoints = [
      { name: 'v1/images/generations', url: 'https://api.nanobanana.ai/v1/images/generations', body: { prompt: testPrompt, n: 1, size: '512x512' } },
      { name: 'v1/generate', url: 'https://api.nanobanana.ai/v1/generate', body: { prompt: testPrompt, width: 512, height: 512 } },
      { name: 'nanobanana.ai/api', url: 'https://nanobanana.ai/api/generate', body: { prompt: testPrompt, width: 512, height: 512 } }
    ];

    const results = [];
    for (const ep of endpoints) {
      try {
        const r = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(ep.body)
        });
        const text = await r.text();
        results.push({ endpoint: ep.name, status: r.status, body: text.slice(0, 300) });
      } catch (e) {
        results.push({ endpoint: ep.name, status: 'fetch_error', body: e.message });
      }
    }

    res.json({ success: true, results });
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
