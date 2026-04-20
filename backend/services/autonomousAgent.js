const cron = require('node-cron');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getDb } = require('../models/database');
const { findBestTopic } = require('./topicDiscovery');
const { generateContent } = require('./anthropicService');
const { generateImage } = require('./imageService');
const { publishToInstagram, publishToYouTube, publishToFacebook, publishToTelegram } = require('./publisherService');
const { sendReport } = require('./reportService');

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

async function startAutonomousAgent() {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'autonomous_mode'").get();
  if (!row || row.value !== 'true') { console.log('\ud83e\udd16 Avtonom agent: O\'chiq'); return; }
  console.log('\ud83e\udd16 Avtonom agent ishga tushdi');

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const db2 = getDb();
      const schedRow = db2.prepare("SELECT value FROM settings WHERE key = 'autonomous_schedule'").get();
      if (!schedRow) return;
      const schedule = JSON.parse(schedRow.value);
      if (!(schedule[days[now.getDay()]] || []).includes(currentTime)) return;
      const today = new Date().toISOString().slice(0, 10);
      if (db2.prepare("SELECT id FROM autonomous_runs WHERE time_slot = ? AND date(started_at) = ?").get(currentTime, today)) return;
      await runFullCycle(currentTime);
    } catch (err) { console.error('Cron xato:', err.message); }
  });
}

async function runFullCycle(timeSlot) {
  const db = getDb();
  const runId = db.prepare("INSERT INTO autonomous_runs (time_slot) VALUES (?)").run(timeSlot).lastInsertRowid;
  const startTime = new Date();
  const report = { timeSlot, runId, startTime, steps: [] };

  try {
    const configRow = db.prepare("SELECT value FROM settings WHERE key = 'platform_config'").get();
    const config = configRow ? JSON.parse(configRow.value) : {};
    const platforms = config.platforms || ['instagram', 'telegram'];
    const hour = parseInt(timeSlot === 'TEST' ? '09' : timeSlot.split(':')[0]);
    const contentType = hour < 11 ? 'article' : hour < 16 ? 'image_post' : 'video';

    report.steps.push({ name: 'Mavzu topish', status: 'running' });
    const topic = await findBestTopic(timeSlot, config);
    report.topic = topic;
    lastStep(report).status = 'ok';

    report.steps.push({ name: 'Matn yozish (Gemini)', status: 'running' });
    const contents = await generateContent(topic.title, platforms, contentType);
    lastStep(report).status = 'ok';

    report.steps.push({ name: 'Rasm (Nano Banana)', status: 'running' });
    let imageUrl = null;
    try { const r = await generateImage(topic.title, topic.imageStyle, 'instagram'); imageUrl = r.imageUrl; } catch (e) { console.warn('Rasm xato:', e.message); }
    lastStep(report).status = 'ok';

    let videoUrl = null;
    if (contentType === 'video') {
      report.steps.push({ name: 'Video', status: 'running' });
      try { const { generateVideoContent } = require('./videoService'); const vd = await generateVideoContent(topic.title, 'youtube'); videoUrl = vd.videoUrl; lastStep(report).status = 'ok'; }
      catch (e) { lastStep(report).status = 'failed'; }
    }

    report.steps.push({ name: 'Nashr qilish', status: 'running' });
    const publishResults = await publishAll(platforms, contents, imageUrl, videoUrl);
    report.publishResults = publishResults;
    lastStep(report).status = publishResults.every(r => r.status === 'ok') ? 'ok' : 'partial';

    const Content = require('../models/Content');
    Content.create({ title: topic.title, topic: topic.title, platforms, content_type: contentType, instagram_content: contents.instagram || null, youtube_content: contents.youtube || null, facebook_content: contents.facebook || null, telegram_content: contents.telegram || null, image_url: imageUrl, video_url: videoUrl, status: 'published', scheduled_at: null });
    report.success = true;
  } catch (err) {
    if (report.steps.length > 0) lastStep(report).status = 'failed';
    report.success = false; report.error = err.message;
    db.prepare("UPDATE autonomous_runs SET error_message = ? WHERE id = ?").run(err.message, runId);
  } finally {
    await sendReport(report);
    db.prepare("UPDATE autonomous_runs SET success = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(report.success ? 1 : 0, runId);
    console.log(`${report.success ? '\u2705' : '\u274c'} Tsikl (${Math.round((new Date()-startTime)/1000)}s)`);
  }
}

async function publishAll(platforms, contents, imageUrl, videoUrl) {
  return Promise.all(platforms.map(async (p) => {
    try {
      if (p === 'instagram') await publishToInstagram(contents.instagram, imageUrl);
      if (p === 'youtube') await publishToYouTube(contents.youtube, videoUrl || imageUrl);
      if (p === 'facebook') await publishToFacebook(contents.facebook, imageUrl);
      if (p === 'telegram') await publishToTelegram(contents.telegram, imageUrl);
      return { platform: p, status: 'ok' };
    } catch (e) { return { platform: p, status: 'failed', error: e.message }; }
  }));
}

function lastStep(r) { return r.steps[r.steps.length - 1]; }

module.exports = { startAutonomousAgent, runFullCycle };
