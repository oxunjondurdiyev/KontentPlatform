const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'kontentbot_jwt_secret_2024';
const TOKEN_EXPIRES = '30d';

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

router.post('/register', (req, res) => {
  try {
    const { email, password, name, last_name, phone, passport } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email va parol talab qilinadi' });
    if (password.length < 6) return res.status(400).json({ success: false, error: "Parol kamida 6 ta belgi bo'lishi kerak" });
    if (User.findByEmail(email)) return res.status(400).json({ success: false, error: "Bu email allaqachon ro'yxatdan o'tgan" });

    const user = User.create({ email, password, name, last_name, phone, passport, plan: 'free' });
    const token = makeToken(user);
    res.json({ success: true, data: { token, user: User.safe(user) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user || !User.verifyPassword(user, password)) {
      return res.status(401).json({ success: false, error: "Email yoki parol noto'g'ri" });
    }
    // SuperAdmin bu sahifadan kira olmaydi — kiberxavfsizlik
    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, error: "SuperAdmin uchun alohida kirish sahifasi mavjud. /admin-login ga o'ting." });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: "Hisobingiz faol emas. Admin bilan bog'laning." });
    }
    try {
      const { getDb } = require('../models/database');
      getDb().prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    } catch {}
    const token = makeToken(user);
    res.json({ success: true, data: { token, user: User.safe(user) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SuperAdmin uchun alohida login endpoint
router.post('/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user || !User.verifyPassword(user, password)) {
      return res.status(401).json({ success: false, error: "Email yoki parol noto'g'ri" });
    }
    if (user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: "Bu sahifa faqat SuperAdmin uchun. Oddiy foydalanuvchi bo'lsangiz /login ga o'ting." });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Hisob faol emas.' });
    }
    try {
      const { getDb } = require('../models/database');
      getDb().prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    } catch {}
    const token = makeToken(user);
    res.json({ success: true, data: { token, user: User.safe(user) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  try {
    if (req.user.id === 0) {
      return res.json({ success: true, data: { id: 0, email: 'admin', name: 'Superadmin', role: 'superadmin', plan: 'business' } });
    }
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
    res.json({ success: true, data: User.safe(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
