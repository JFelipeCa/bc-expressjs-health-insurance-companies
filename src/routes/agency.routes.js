import { Router } from 'express';
import { 
  getClients, createClient, 
  getCampaigns, createCampaign, 
  getChannels, 
  getMetrics 
} from '../controllers/agency.controller.js';
import { verifyToken, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Aplica autenticación JWT obligatoria a todas estas rutas (Semana 7)
router.use(verifyToken);

// ENTIDAD 1: CLIENTS (Ver: ADMIN/ANALYST, Crear: Solo ADMIN - Semana 8)
router.get('/clients', getClients);
router.post('/clients', requireRoles('ADMIN'), createClient);

// ENTIDAD 2: CAMPAIGNS (Ver: Todos, Crear: ADMIN y ANALYST)
router.get('/campaigns', getCampaigns);
router.post('/campaigns', requireRoles('ADMIN', 'ANALYST'), createCampaign);

// ENTIDAD 3: CHANNELS
router.get('/channels', getChannels);

// ENTIDAD 4: METRICS
router.get('/metrics', getMetrics);

export default router;