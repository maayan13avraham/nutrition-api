const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({
      success: false, data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token required.', details: {} }
    });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({
      success: false, data: null,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired.', details: {} }
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userRole)) {
      return res.status(403).json({
        success: false, data: null,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.', details: {} }
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorize };
