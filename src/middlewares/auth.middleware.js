import jwt from 'jsonwebtoken';

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie ?? '';
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!entry) return undefined;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return undefined; }
}

export const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const bearer = authorization?.match(/^Bearer\s+([^\s]+)$/i)?.[1];
  const token = bearer || readCookie(req, 'accessToken');
  if (!token) return res.status(401).json({ error: 'Autenticación requerida' });
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { issuer: 'health-insurance-api' });
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticación requerida' });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'No tienes permisos para esta operación' });
  return next();
};
