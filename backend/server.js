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

const { startScheduler } = require('./services/schedulerService');
const { startAutonomousAgent } = require('./services/autonomousAgent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/scheduler', authMiddleware, schedulerRoutes);
app.use('/api/publish', authMiddleware, publishRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/autonomous', authMiddleware, autonomousRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Railway Variables -> DB ga sync (har deploy da)
function syncEnvToDb() {
  try {
    const Settings = require('./models/Settings');

    // To'g'ridan-to'g'ri mapping
    const direct = [
      'GROQ_API_KEY', 'GOOGLE_AI_KEY',
      'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHANNEL_ID', 'ADMIN_TELEGRAM_CHAT_ID',
      'INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_USER_ID',
      'YOUTUBE_API_KEY', 'YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REFRESH_TOKEN',
      'FACEBOOK_PAGE_ACCESS_TOKEN', 'FACEBOOK_PAGE_ID',
      'KLING_API_KEY', 'RUNWAY_API_KEY', 'VIDEO_PROVIDER'
    ];
    for (const key of direct) {
      if (process.env[key]) Settings.set(key, process.env[key]);
    }

    // Eski nom aliaslar (GEMINI_API_KEY -> GOOGLE_AI_KEY)
    if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_KEY) {
      Settings.set('GOOGLE_AI_KEY', process.env.GEMINI_API_KEY);
    }

    console.log('Env vars DB ga sync qilindi');
  } catch (e) {
    console.error('Sync xato:', e.message);
  }
}

initDatabase();
syncEnvToDb();
startScheduler();
startAutonomousAgent();

app.listen(PORT, () => {
  console.log(`KontentBot Pro http://localhost:${PORT} da ishga tushdi`);
});

module.exports = app;
