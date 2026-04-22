const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/kontentbot.db");
let db;

function getDb() {
  if (!db) {
    const fs = require("fs");
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

function initDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      last_name TEXT,
      phone TEXT,
      passport TEXT,
      role TEXT DEFAULT 'user',
      plan TEXT DEFAULT 'free',
      is_active INTEGER DEFAULT 1,
      subscription_expires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      platforms TEXT NOT NULL,
      content_type TEXT NOT NULL,
      instagram_content TEXT,
      youtube_content TEXT,
      facebook_content TEXT,
      telegram_content TEXT,
      image_url TEXT,
      video_url TEXT,
      thumbnail_url TEXT,
      video_prompt TEXT,
      status TEXT DEFAULT 'draft',
      scheduled_at DATETIME,
      published_at DATETIME,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS publish_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER REFERENCES contents(id),
      platform TEXT NOT NULL,
      status TEXT NOT NULL,
      response TEXT,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename TEXT NOT NULL,
      original_name TEXT,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      url TEXT NOT NULL,
      topic TEXT,
      platform TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS autonomous_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time_slot TEXT NOT NULL,
      success INTEGER DEFAULT 0,
      error_message TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS topic_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_style TEXT DEFAULT 'professional',
      content_angle TEXT DEFAULT 'tahlil',
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      plan TEXT NOT NULL,
      amount REAL,
      currency TEXT DEFAULT 'UZS',
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      starts_at DATETIME,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations
  const migrations = [
    "ALTER TABLE users ADD COLUMN last_name TEXT",
    "ALTER TABLE users ADD COLUMN phone TEXT",
    "ALTER TABLE users ADD COLUMN passport TEXT",
    "ALTER TABLE contents ADD COLUMN user_id INTEGER",
    "ALTER TABLE media_library ADD COLUMN user_id INTEGER"
  ];
  for (const sql of migrations) {
    try { database.exec(sql); } catch {}
  }

  // Default settings
  const setDefault = database.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  setDefault.run("autonomous_mode", "false");
  setDefault.run("autonomous_schedule", JSON.stringify({
    monday: ["09:00","18:00"], tuesday: ["09:00","18:00"],
    wednesday: ["09:00","13:00","18:00"], thursday: ["09:00","18:00"],
    friday: ["09:00","13:00","20:00"], saturday: ["10:00"], sunday: []
  }));
  setDefault.run("platform_config", JSON.stringify({
    platforms: ["instagram","telegram"],
    channelDescription: "AI, ISO standartlar, raqamli texnologiyalar, O'zbekiston",
    targetAudience: "O'zbek mutaxassislar, tadbirkorlar, talabalar"
  }));

  console.log("Ma'lumotlar bazasi muvaffaqiyatli ishga tushdi");
}

module.exports = { getDb, initDatabase };
