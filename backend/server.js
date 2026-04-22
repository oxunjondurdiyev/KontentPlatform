require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./models/database');
const authMiddleware = require('./middleware/auth');

const contentRoutes = require('./routes/content');
const schedulerRoutes = require('./routes/scheduler');
const publishRoutes = require('./routes/publish');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');
const autonomousRoutes = require('./routes/autonomous');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const { startScheduler } = require('./services/schedulerService');
const { startAutonomousAgent } = require('./services/autonomousAgent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/scheduler', authMiddleware, schedulerRoutes);
app.use('/api/publish', authMiddleware, publishRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/autonomous', authMiddleware, autonomousRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

function syncEnvToDb() {
  try {
    const Settings = require('./models/Settings');
    const keys = [
      'GROQ_API_KEY', 'GOOGLE_AI_KEY',
      'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID', 'ADMIN_TELEGRAM_CHAT_ID',
      'INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_USER_ID',
      'YOUTUBE_API_KEY', 'YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN',
      'FACEBOOK_PAGE_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID',
      'KLING_API_KEY', 'RUNWAY_API_KEY', 'VIDEO_PROVIDER'
    ];
    for (const key of keys) {
      if (process.env[key]) Settings.set(key, process.env[key]);
    }
    if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_KEY) {
      Settings.set('GOOGLE_AI_KEY', process.env.GEMINI_API_KEY);
    }
  } catch (e) {
    console.error('Sync xato:', e.message);
  }
}

function createSuperadmin() {
  try {
    const User = require('./models/User');
    const email = process.env.SUPERADMIN_EMAIL || 'admin@kontentbot.uz';
    const password = process.env.SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';
    if (!User.findByEmail(email)) {
      User.create({ email, password, name: 'Superadmin', role: 'superadmin', plan: 'business' });
      console.log(`Superadmin yaratildi: ${email} / ${password}`);
    }
  } catch (e) {
    console.error('Superadmin xatosi:', e.message);
  }
}

initDatabase();
syncEnvToDb();
createeSuperadmin();
startScheduler();
startAutonomousAgent();

app.listen(PORT, () => {
  console.log(`KontentBot Pro http://localhost:${PORT} da ishga tushdi`);
});

module.exports = app;
