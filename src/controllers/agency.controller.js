import { db } from '../data/db.js';

const validPolicyStatuses = new Set(['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED']);
const nextId = (items) => Math.max(0, ...items.map((item) => item.id)) + 1;
const safePolicy = ({ id, policyNumber, holderName, holderEmail, plan, premium, status, startDate, agencyId }) => ({ id, policyNumber, holderName, holderEmail, plan, premium, status, startDate, agencyId });

export const getAgencies = (_req, res) => res.json({ data: db.agencies });
export const createAgency = (req, res) => {
  const { name, city, contactEmail } = req.body ?? {};
  if (![name, city, contactEmail].every((value) => typeof value === 'string' && value.trim())) return res.status(400).json({ error: 'Nombre, ciudad y correo de contacto son requeridos' });
  const agency = { id: nextId(db.agencies), name: name.trim(), city: city.trim(), contactEmail: contactEmail.trim().toLowerCase() };
  db.agencies.push(agency);
  return res.status(201).json({ data: agency });
};

export const getPolicies = (req, res) => {
  // Analysts can review policy operations but do not receive holder contact data.
  const policies = db.policies.map(safePolicy);
  const data = req.user.role === 'ANALYST' ? policies.map(({ holderName, holderEmail, ...policy }) => ({ ...policy, holderName: undefined, holderEmail: undefined })) : policies;
  return res.json({ data });
};

export const getPolicy = (req, res) => {
  const policy = db.policies.find((item) => item.id === Number(req.params.id));
  if (!policy) return res.status(404).json({ error: 'Póliza no encontrada' });
  const data = safePolicy(policy);
  if (req.user.role === 'ANALYST') { delete data.holderName; delete data.holderEmail; }
  return res.json({ data });
};

export const createPolicy = (req, res) => {
  const { policyNumber, holderName, holderEmail, plan, premium, startDate } = req.body ?? {};
  if (![policyNumber, holderName, holderEmail, plan, startDate].every((value) => typeof value === 'string' && value.trim()) || typeof premium !== 'number' || !Number.isFinite(premium) || premium <= 0) {
    return res.status(400).json({ error: 'Número, titular, email, plan, fecha y prima positiva son requeridos' });
  }
  if (db.policies.some((item) => item.policyNumber.toLowerCase() === policyNumber.trim().toLowerCase())) return res.status(409).json({ error: 'El número de póliza ya existe' });
  const agencyId = Number(req.body.agencyId ?? db.agencies[0]?.id);
  if (!db.agencies.some((item) => item.id === agencyId)) return res.status(400).json({ error: 'Agencia no válida' });
  const policy = { id: nextId(db.policies), agencyId, policyNumber: policyNumber.trim(), holderName: holderName.trim(), holderEmail: holderEmail.trim().toLowerCase(), plan: plan.trim(), premium, startDate: startDate.trim(), status: 'PENDING' };
  db.policies.push(policy);
  return res.status(201).json({ message: 'Póliza creada', data: safePolicy(policy) });
};

export const updatePolicy = (req, res) => {
  const policy = db.policies.find((item) => item.id === Number(req.params.id));
  if (!policy) return res.status(404).json({ error: 'Póliza no encontrada' });
  const allowed = ['holderName', 'holderEmail', 'plan', 'premium', 'status', 'startDate'];
  const changes = Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => allowed.includes(key)));
  if (!Object.keys(changes).length) return res.status(400).json({ error: 'No se enviaron campos actualizables' });
  if (changes.premium !== undefined && (typeof changes.premium !== 'number' || !Number.isFinite(changes.premium) || changes.premium <= 0)) return res.status(400).json({ error: 'La prima debe ser un número positivo' });
  if (changes.status !== undefined && !validPolicyStatuses.has(changes.status)) return res.status(400).json({ error: 'Estado de póliza no válido' });
  if (changes.holderEmail !== undefined && !/^\S+@\S+\.\S+$/.test(changes.holderEmail)) return res.status(400).json({ error: 'Correo del titular no válido' });
  Object.assign(policy, changes);
  return res.json({ data: safePolicy(policy) });
};

export const deletePolicy = (req, res) => {
  const index = db.policies.findIndex((item) => item.id === Number(req.params.id));
  if (index < 0) return res.status(404).json({ error: 'Póliza no encontrada' });
  db.policies.splice(index, 1);
  return res.status(204).end();
};

export const getPlans = (_req, res) => res.json({ data: db.plans });
export const getClaims = (_req, res) => res.json({ data: db.claims });
