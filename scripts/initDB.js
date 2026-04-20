require('dotenv').config();
const { initDatabase } = require('../backend/models/database');

try {
  initDatabase();
  console.log('Ma\'lumotlar bazasi muvaffaqiyatli yaratildi!');
  console.log('Endi: npm run dev');
  process.exit(0);
} catch (err) {
  console.error('Xato:', err.message);
  process.exit(1);
}
