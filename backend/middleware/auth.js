const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'kontentbot_jwt_secret_2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiya talab qilinadi' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Legacy admin password fallback
  const adminPwd = process.env.ADMIN_PASSWORD;
  if (adminPwd && token === adminPwd) {
    req.user = { id: 0, role: 'superadmin', email: 'admin', plan: 'business' };
    return next();
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token yaroqsiz yoki muddati tugagan' });
  }
}

module.exports = authMiddleware;
