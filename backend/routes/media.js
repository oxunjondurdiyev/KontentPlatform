const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../models/database');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)$/i;
    cb(null, allowed.test(file.originalname));
  }
});

// Media kutubxonasi
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM media_library ORDER BY created_at DESC LIMIT 100').all();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fayl yuklash
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Fayl talab qilinadi' });
    const db = getDb();
    const url = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const result = db.prepare(
      'INSERT INTO media_library (filename, original_name, file_type, file_size, url, topic, platform) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.file.filename, req.file.originalname, fileType, req.file.size, url, req.body.topic || null, req.body.platform || null);
    res.json({ success: true, data: { id: result.lastInsertRowid, url, fileType } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fayl o'chirish
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const item = db.prepare('SELECT * FROM media_library WHERE id = ?').get(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Topilmadi' });
    const filePath = path.join(UPLOAD_DIR, item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM media_library WHERE id = ?').run(item.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
