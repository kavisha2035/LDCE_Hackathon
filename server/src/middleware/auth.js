import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'TOKEN_MISSING',
      message: 'Access token is missing'
    });
  }

  const secret = process.env.JWT_SECRET || 'globetrotter_super_secret_jwt_key_2026';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired'
        });
      }
      return res.status(403).json({
        error: 'Forbidden',
        code: 'TOKEN_INVALID',
        message: 'Invalid access token'
      });
    }
    req.user = user; // { userId, email, iat, exp }
    next();
  });
};
