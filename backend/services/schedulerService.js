const cron = require('node-cron');
const Content = require('../models/Content');
const { getDb } = require('../models/database');
const { publishToInstagram, publishToYouTube, publishToFacebook, publishToTelegram } = require('./publisherService');

const publishers = {
  instagram: (content) => publishToInstagram(content.instagram_content, content.image_url),
  youtube: (content) => publishToYouTube(content.youtube_content, content.video_url),
  facebook: (content) => publishToFacebook(content.facebook_content, content.image_url),
  telegram: (content) => publishToTelegram(content.telegram_content, content.image_url)
};

async function publishContent(content) {
  const db = getDb();
  const logStmt = db.prepare(
    'INSERT INTO publish_logs (content_id, platform, status, response) VALUES (?, ?, ?, ?)'
  );

  const results = {};

  await Promise.all(
    content.platforms.map(async (platform) => {
      if (!publishers[platform]) return;
      try {
        const res = await publishers[platform](content);
        logStmt.run(content.id, platform, 'success', JSON.stringify(res));
        results[platform] = { success: true };
      } catch (err) {
        logStmt.run(content.id, platform, 'failed', err.message);
        results[platform] = { success: false, error: err.message };
      }
    })
  );

  const anySuccess = Object.values(results).some(r => r.success);
  const allFailed = Object.values(results).every(r => !r.success);

  if (allFailed) {
    const errors = Object.entries(results).map(([p, r]) => `${p}: ${r.error}`).join('; ');
    Content.markFailed(content.id, errors);
  } else {
    Content.markPublished(content.id);
  }

  return results;
}

function startScheduler() {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const pending = Content.findScheduled(now);
    for (const content of pending) {
      try {
        console.log(`Nashr qilinmoqda: ${content.title}`);
        await publishContent(content);
        console.log(`Muvaffaqiyatli: ${content.title}`);
      } catch (err) {
        console.error(`Xato (${content.title}): ${err.message}`);
      }
    }
  });
  console.log('Scheduler ishga tushdi');
}

module.exports = { startScheduler, publishContent };
