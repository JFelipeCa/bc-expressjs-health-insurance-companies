import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './middlewares/security.middleware.js';

import authRoutes from './routes/auth.routes.js';
import agencyRoutes from './routes/agency.routes.js';

const app = express();

// --- SEMANA 8: MEDIDAS DE SEGURIDAD OWASP ---
app.use(helmet()); // Seguridad de headers HTTP
app.use(cors()); // Manejo de políticas CORS
app.use(express.json({ limit: '10kb' })); // Control de tamaño de body
app.use('/api', apiLimiter); // Protección contra tasa excesiva de peticiones

// --- RUTAS DE LA APLICACIÓN ---
app.use('/api/auth', authRoutes);
app.use('/api', agencyRoutes);

// Manejador de rutas no encontradas (404 estandarizado)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose correctamente en: http://localhost:${PORT}`);
});