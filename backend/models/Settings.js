const { getDb } = require('./database');

class Settings {
  static get(key) {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    if (!row) return null;
    try { return JSON.parse(row.value); } catch { return row.value; }
  }

  static set(key, value) {
    const db = getDb();
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, serialized);
  }

  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM settings').all();
    return rows.reduce((acc, row) => {
      try { acc[row.key] = JSON.parse(row.value); } catch { acc[row.key] = row.value; }
      return acc;
    }, {});
  }

  static delete(key) {
    const db = getDb();
    db.prepare('DELETE FROM settings WHERE key = ?').run(key);
  }
}

module.exports = Settings;
