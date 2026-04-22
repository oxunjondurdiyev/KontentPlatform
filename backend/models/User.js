const { getDb } = require('./database');
const bcrypt = require('bcryptjs');

const PLAN_LIMITS = {
  free:     { contents_per_month: 5,   autonomous: false, label: 'Bepul' },
  starter:  { contents_per_month: 30,  autonomous: false, label: 'Starter' },
  pro:      { contents_per_month: 100, autonomous: true,  label: 'Pro' },
  business: { contents_per_month: -1,  autonomous: true,  label: 'Biznes' }
};

class User {
  static create({ email, password, name, role = 'user', plan = 'free' }) {
    const db = getDb();
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name, role, plan) VALUES (?, ?, ?, ?, ?)'
    ).run(email, hash, name || email.split('@')[0], role, plan);
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  static findByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static findAll() {
    return getDb().prepare(
      'SELECT id, email, name, role, plan, is_active, subscription_expires, created_at FROM users ORDER BY created_at DESC'
    ).all();
  }

  static update(id, data) {
    const db = getDb();
    const keys = Object.keys(data);
    const fields = keys.map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
    return this.findById(id);
  }

  static verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password_hash);
  }

  static getContentCountThisMonth(userId) {
    const start = new Date();
    start.setDate(1); start.setHours(0, 0, 0, 0);
    const result = getDb().prepare(
      'SELECT COUNT(*) as count FROM contents WHERE user_id = ? AND created_at >= ?'
    ).get(userId, start.toISOString());
    return result?.count || 0;
  }

  static getPlanLimits(plan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  }

  static safe(user) {
    if (!user) return null;
    const { password_hash, ...safe } = user;
    return safe;
  }
}

module.exports = User;
