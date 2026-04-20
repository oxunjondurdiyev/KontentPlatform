const { getDb } = require('./database');

class Content {
  static create(data) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO contents (title, topic, platforms, content_type,
        instagram_content, youtube_content, facebook_content, telegram_content,
        image_url, video_url, thumbnail_url, video_prompt, status, scheduled_at)
      VALUES (@title, @topic, @platforms, @content_type,
        @instagram_content, @youtube_content, @facebook_content, @telegram_content,
        @image_url, @video_url, @thumbnail_url, @video_prompt, @status, @scheduled_at)
    `);
    const result = stmt.run({
      ...data,
      platforms: JSON.stringify(data.platforms),
      instagram_content: data.instagram_content ? JSON.stringify(data.instagram_content) : null,
      youtube_content: data.youtube_content ? JSON.stringify(data.youtube_content) : null,
      facebook_content: data.facebook_content ? JSON.stringify(data.facebook_content) : null,
      telegram_content: data.telegram_content ? JSON.stringify(data.telegram_content) : null,
      status: data.status || 'draft',
      scheduled_at: data.scheduled_at || null
    });
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM contents WHERE id = ?').get(id);
    return row ? this._parse(row) : null;
  }

  static findAll({ status, limit = 50, offset = 0 } = {}) {
    const db = getDb();
    let query = 'SELECT * FROM contents';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    return db.prepare(query).all(...params).map(this._parse);
  }

  static findScheduled(before) {
    const db = getDb();
    return db.prepare(
      `SELECT * FROM contents WHERE status = 'scheduled' AND scheduled_at <= ?`
    ).all(before.toISOString()).map(this._parse);
  }

  static update(id, data) {
    const db = getDb();
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE contents SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
      .run({ ...data, id });
    return this.findById(id);
  }

  static markPublished(id) {
    return this.update(id, { status: 'published', published_at: new Date().toISOString() });
  }

  static markFailed(id, errorMessage) {
    return this.update(id, { status: 'failed', error_message: errorMessage });
  }

  static delete(id) {
    const db = getDb();
    db.prepare('DELETE FROM contents WHERE id = ?').run(id);
  }

  static getStats() {
    const db = getDb();
    return {
      total: db.prepare('SELECT COUNT(*) as count FROM contents').get().count,
      published: db.prepare(`SELECT COUNT(*) as count FROM contents WHERE status = 'published'`).get().count,
      scheduled: db.prepare(`SELECT COUNT(*) as count FROM contents WHERE status = 'scheduled'`).get().count,
      draft: db.prepare(`SELECT COUNT(*) as count FROM contents WHERE status = 'draft'`).get().count,
      failed: db.prepare(`SELECT COUNT(*) as count FROM contents WHERE status = 'failed'`).get().count
    };
  }

  static _parse(row) {
    if (!row) return null;
    return {
      ...row,
      platforms: JSON.parse(row.platforms || '[]'),
      instagram_content: row.instagram_content ? JSON.parse(row.instagram_content) : null,
      youtube_content: row.youtube_content ? JSON.parse(row.youtube_content) : null,
      facebook_content: row.facebook_content ? JSON.parse(row.facebook_content) : null,
      telegram_content: row.telegram_content ? JSON.parse(row.telegram_content) : null
    };
  }
}

module.exports = Content;
