function authMiddleware(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Skip auth in development if no password set
  if (!adminPassword || process.env.NODE_ENV === 'development') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (token !== adminPassword) {
    return res.status(403).json({ error: 'Noto\'g\'ri parol' });
  }

  next();
}

module.exports = authMiddleware;
