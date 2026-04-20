require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./models/database');
const authMiddleware = require('./middleware/auth');

const contentRoutes = require('./routes/content');
const schedulerRoutes = require('./routes/scheduler');
const publishRoutes = require('./routes/publish');
const mediaRoutes = require('./routes/media');

const { startScheduler } = require('./services/schedulerService');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Initialize DB and start server
initDatabase();
startScheduler();

app.listen(PORT, () => {
  console.log(`KontentBot Pro server http://localhost:${PORT} da ishga tushdi`);
});

module.exports = app;
