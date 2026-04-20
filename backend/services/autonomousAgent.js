const cron = require('node-cron');
const Anthropic = require('@anthropic-ai/sdk');
const { getDb } = require('../models/database');
const { findBestTopic } = require('./topicDiscovery');
const { generateContent } = require('./anthropicService');
const { generateImage } = require('./imageService');
const { publishToInstagram, publishToYouTube, publishToFacebook, publishToTelegram } = require('./publisherService');
const { sendReport } = require('./reportService');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function startAutonomousAgent() {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'autonomous_mode'").get();
  if (!row || row.value !== 'true') {
    console.log('\ud83e\udd16 Avtonom agent: O\'chiq');
    return;
  }

  console.log('\ud83e\udd16 Avtonom agent ishga tushdi');

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
      const dayName = days[now.getDay()];
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hh}:${mm}`;

      const db2 = getDb();
      const schedRow = db2.prepare("SELECT value FROM settings WHERE key = 'autonomous_schedule'").get();
      if (!schedRow) return;
      const schedule = JSON.parse(schedRow.value);
      const todaySlots = schedule[dayName] || [];
      if (!todaySlots.includes(currentTime)) return;

      const today = new Date().toISOString().slice(0, 10);
      const alreadyRan = db2.prepare(
        "SELECT id FROM autonomous_runs WHERE time_slot = ? AND date(started_at) = ?"
      ).get(currentTime, today);
      if (alreadyRan) return;

      console.log(`\u23f0 ${currentTime} \u2014 Avtonom tsikl boshlanmoqda...`);
      await runFullCycle(currentTime);
    } catch (err) {
      console.error('Cron xato:', err.message);
    }
  });
}

async function runFullCycle(timeSlot) {
  const db = getDb();
  const runResult = db.prepare(
    "INSERT INTO autonomous_runs (time_slot) VALUES (?)"
  ).run(timeSlot);
  const runId = runResult.lastInsertRowid;
  const startTime = new Date();
  const report = { timeSlot, runId, startTime, steps: [] };

  try {
    const configRow = db.prepare("SELECT value FROM settings WHERE key = 'platform_config'").get();
    const config = configRow ? JSON.parse(configRow.value) : {};
    const platforms = config.platforms || ['instagram', 'telegram'];
    const hour = parseInt(timeSlot === 'TEST' ? '09' : timeSlot.split(':')[0]);
    const contentType = hour < 11 ? 'article' : hour < 16 ? 'image_post' : 'video';

    // 1. Mavzu topish
    report.steps.push({ name: 'Mavzu topish', status: 'running' });
    const topic = await findBestTopic(timeSlot, config);
    report.topic = topic;
    lastStep(report).status = 'ok';
    console.log(`\ud83d\udccc Mavzu: ${topic.title}`);

    // 2. Matn yozish
    report.steps.push({ name: 'Matn yozish (Claude)', status: 'running' });
    const contents = await generateContent(topic.title, platforms, contentType);
    lastStep(report).status = 'ok';
    console.log('\u270d\ufe0f  Matn yozildi');

    // 3. Rasm chizish
    report.steps.push({ name: 'Rasm (Nano Banana)', status: 'running' });
    const imagePrompt = await buildImagePrompt(topic, contentType);
    let imageUrl = null;
    try {
      const imageResult = await generateImage(topic.title, topic.imageStyle, 'instagram');
      imageUrl = imageResult.imageUrl;
    } catch (imgErr) {
      console.warn('Rasm yaratishda xato:', imgErr.message);
    }
    lastStep(report).status = 'ok';
    console.log('\ud83c\udfa8 Rasm tayyor:', imageUrl);

    // 4. Video (faqat kechqurun)
    let videoUrl = null;
    if (contentType === 'video') {
      report.steps.push({ name: 'Video (Kling/Runway)', status: 'running' });
      try {
        const { generateVideoContent } = require('./videoService');
        const videoData = await generateVideoContent(topic.title, 'youtube');
        videoUrl = videoData.videoUrl;
        lastStep(report).status = 'ok';
        console.log('\ud83c\udfac Video tayyor:', videoUrl);
      } catch (vidErr) {
        lastStep(report).status = 'failed';
        console.warn('Video yaratishda xato:', vidErr.message);
      }
    }

    // 5. Nashr qilish
    report.steps.push({ name: 'Nashr qilish', status: 'running' });
    const publishResults = await publishAll(platforms, contents, imageUrl, videoUrl);
    report.publishResults = publishResults;
    lastStep(report).status = publishResults.every(r => r.status === 'ok') ? 'ok' : 'partial';
    console.log('\ud83d\udce4 Nashr natijalari:', publishResults);

    // Bazaga saqlash
    const Content = require('../models/Content');
    Content.create({
      title: topic.title,
      topic: topic.title,
      platforms,
      content_type: contentType,
      instagram_content: contents.instagram || null,
      youtube_content: contents.youtube || null,
      facebook_content: contents.facebook || null,
      telegram_content: contents.telegram || null,
      image_url: imageUrl,
      video_url: videoUrl,
      status: 'published',
      scheduled_at: null
    });

    report.success = true;
  } catch (err) {
    console.error('\u274c Tsikl xatosi:', err);
    if (report.steps.length > 0) lastStep(report).status = 'failed';
    report.success = false;
    report.error = err.message;
    db.prepare("UPDATE autonomous_runs SET error_message = ? WHERE id = ?").run(err.message, runId);
  } finally {
    await sendReport(report);
    db.prepare(
      "UPDATE autonomous_runs SET success = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(report.success ? 1 : 0, runId);
    const duration = Math.round((new Date() - startTime) / 1000);
    console.log(`${report.success ? '\u2705' : '\u274c'} Tsikl yakunlandi (${duration}s)`);
  }
}

async function buildImagePrompt(topic, contentType) {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `"${topic.title}" mavzusi uchun ${contentType} tipidagi post rasmi uchun ingliz tilida AI rasm generatsiya prompti yoz. Uslub: ${topic.imageStyle || 'professional, modern, clean'}. Faqat promptni yoz.`
    }]
  });
  return response.content[0].text.trim();
}

async function publishAll(platforms, contents, imageUrl, videoUrl) {
  const jobs = platforms.map(async (platform) => {
    try {
      if (platform === 'instagram') await publishToInstagram(contents.instagram, imageUrl);
      if (platform === 'youtube') await publishToYouTube(contents.youtube, videoUrl || imageUrl);
      if (platform === 'facebook') await publishToFacebook(contents.facebook, imageUrl);
      if (platform === 'telegram') await publishToTelegram(contents.telegram, imageUrl);
      return { platform, status: 'ok' };
    } catch (err) {
      return { platform, status: 'failed', error: err.message };
    }
  });
  return Promise.all(jobs);
}

function lastStep(report) {
  return report.steps[report.steps.length - 1];
}

module.exports = { startAutonomousAgent, runFullCycle };
