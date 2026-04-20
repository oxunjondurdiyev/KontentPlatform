async function sendReport(report) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const duration = Math.round((new Date() - report.startTime) / 1000);
  const ok = report.success;

  const platformIcons = {
    instagram: '\ud83d\udcf8 Instagram',
    youtube: '\ud83c\udfac YouTube',
    facebook: '\ud83d\udc65 Facebook',
    telegram: '\u2708\ufe0f Telegram'
  };
  const stepIcons = { ok: '\u2705', failed: '\u274c', partial: '\u26a0\ufe0f', running: '\u23f3' };

  let text = `${ok ? '\u2705' : '\u274c'} *KontentBot Hisoboti*\n`;
  text += `\ud83d\udd50 Vaqt: \`${report.timeSlot}\` | \u23f1 ${duration}s\n`;
  text += `\ud83d\udccc Mavzu: *${report.topic?.title || 'Aniqlanmadi'}*\n\n`;

  if (report.steps?.length) {
    text += `*Qadamlar:*\n`;
    for (const step of report.steps) {
      text += `${stepIcons[step.status] || '\u2022'} ${step.name}\n`;
    }
    text += '\n';
  }

  if (report.publishResults?.length) {
    text += `*Nashr natijalari:*\n`;
    for (const r of report.publishResults) {
      const icon = r.status === 'ok' ? '\u2705' : '\u274c';
      text += `${icon} ${platformIcons[r.platform] || r.platform}`;
      if (r.error) text += ` \u2014 ${r.error}`;
      text += '\n';
    }
  }

  if (!ok && report.error) {
    text += `\n\u26a0\ufe0f *Xato:* \`${report.error}\``;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
  } catch (err) {
    console.warn('Hisobot yuborishda xato:', err.message);
  }
}

module.exports = { sendReport };
