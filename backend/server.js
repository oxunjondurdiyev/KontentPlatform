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

// API routes
app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/scheduler', authMiddleware, schedulerRoutes);
app.use('/api/publish', authMiddleware, publishRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/autonomous', authMiddleware, autonomousRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend (always — works in both dev build and production)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

initDatabase();
startScheduler();
startAutonomousAgent();

app.listen(PORT, () => {
  console.log(`KontentBot Pro http://localhost:${PORT} da ishga tushdi`);
});

module.exports = app;
