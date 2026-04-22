const { getDb } = require("./database");
const bcrypt = require("bcryptjs");

const PLAN_LIMITS = {
  free:     { contents_per_month: 5,   autonomous: false, label: "Bepul" },
  starter:  { contents_per_month: 30,  autonomous: false, label: "Starter" },
  pro:      { contents_per_month: 100, autonomous: true,  label: "Pro" },
  business: { contents_per_month: -1,  autonomous: true,  label: "Biznes" }
};

class User {
  static create({ email, password, name, last_name, phone, passport, role = "user", plan = "free" }) {
    const db = getDb();
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      "INSERT INTO users (email, password_hash, name, last_name, phone, passport, role, plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(email, hash, name || "", last_name || "", phone || "", passport || "", role, plan);
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
  }

  static findByEmail(email) {
    return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  static findAll() {
    return getDb().prepare(
      "SELECT id, email, name, last_name, phone, passport, role, plan, is_active, subscription_expires, created_at FROM users ORDER BY created_at DESC"
    ).all();
  }

  static update(id, data) {
    const db = getDb();
    const keys = Object.keys(data);
    const fields = keys.map(k => k + " = ?").join(", ");
    db.prepare("UPDATE users SET " + fields + " WHERE id = ?").run(...Object.values(data), id);
    return this.findById(id);
  }

  static verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password_hash);
  }

  static safe(user) {
    if (!user) return null;
    const { password_hash, ...safe } = user;
    return safe;
  }

  static getPlanLimits(plan) {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  }
}

module.exports = User;
