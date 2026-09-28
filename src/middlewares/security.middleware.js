import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes; intenta nuevamente más tarde' }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación; intenta nuevamente más tarde' }
});

export function sanitizeNoSqlInput(req, res, next) {
  const containsUnsafeKey = (value) => {
    if (Array.isArray(value)) return value.some(containsUnsafeKey);
    if (value && typeof value === 'object') {
      return Object.entries(value).some(([key, nested]) => key.startsWith('$') || key.includes('.') || containsUnsafeKey(nested));
    }
    return false;
  };
  if (containsUnsafeKey(req.body) || containsUnsafeKey(req.query) || containsUnsafeKey(req.params)) {
    return res.status(400).json({ error: 'La solicitud contiene campos no permitidos' });
  }
  return next();
}

export function getCorsOptions() {
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
}
