const bcrypt = require('bcryptjs');
const { getDb } = require('./database');

const PLAN_LIMITS = { free: 5, starter: 30, pro: 100, business: Infinity };

const User = {
  create({ email, password, name, last_name, phone, passport, role = 'user', plan = 'free' }) {
    const db = getDb();
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(
      'INSERT INTO users (email, password_hash, name, last_name, phone, passport, role, plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(email, hash, name || null, last_name || null, phone || null, passport || null, role, plan);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  },

  findByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findAll() {
    return getDb().prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  },

  update(id, data) {
    const db = getDb();
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  verifyPassword(user, password) {
    try { return bcrypt.compareSync(password, user.password_hash); }
    catch { return false; }
  },

  safe(user) {
    if (!user) return null;
    const { password_hash, ...safe } = user;
    return safe;
  },

  getMonthlyCount(userId) {
    return getDb().prepare(
      "SELECT COUNT(*) as c FROM contents WHERE user_id = ? AND created_at >= date('now','start of month')"
    ).get(userId)?.c || 0;
  },

  canCreate(user) {
    const limit = PLAN_LIMITS[user.plan] || 5;
    if (limit === Infinity) return true;
    return this.getMonthlyCount(user.id) < limit;
  }
};

module.exports = User;
