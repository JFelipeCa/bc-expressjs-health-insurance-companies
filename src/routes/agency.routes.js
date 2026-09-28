import { Router } from 'express';
import { createAgency, createPolicy, deletePolicy, getAgencies, getClaims, getPlans, getPolicies, getPolicy, updatePolicy } from '../controllers/agency.controller.js';
import { requireRoles, verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.get('/agencies', getAgencies);
router.post('/agencies', requireRoles('ADMIN'), createAgency);

router.get('/policies', getPolicies);
router.get('/policies/:id', getPolicy);
router.post('/policies', requireRoles('ADMIN', 'AGENT'), createPolicy);
router.patch('/policies/:id', requireRoles('ADMIN', 'AGENT'), updatePolicy);
router.delete('/policies/:id', requireRoles('ADMIN'), deletePolicy);

router.get('/plans', getPlans);
router.get('/claims', getClaims);
export default router;
