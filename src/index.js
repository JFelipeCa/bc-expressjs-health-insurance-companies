import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import agencyRoutes from './routes/agency.routes.js';
import { apiLimiter, getCorsOptions, sanitizeNoSqlInput } from './middlewares/security.middleware.js';

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32 || process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
  throw new Error('Configura JWT_ACCESS_SECRET y JWT_REFRESH_SECRET distintos, ambos de al menos 32 caracteres, en .env');
}

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '10kb' }));
app.use(sanitizeNoSqlInput);
app.use('/api', apiLimiter);
app.get('/', (_req, res) => res.json({
  service: 'API de agencias de seguros de salud',
  status: 'ok',
  health: '/health',
  auth: '/api/auth',
  resources: ['/api/agencies', '/api/policies', '/api/plans', '/api/claims']
}));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'health-insurance-agencies-api' }));
app.use('/api/auth', authRoutes);
app.use('/api', agencyRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));
app.use((err, _req, res, _next) => {
  if (err.message === 'Origen no permitido por CORS') return res.status(403).json({ error: err.message });
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  return res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API de seguros de salud disponible en http://localhost:${port}`));
