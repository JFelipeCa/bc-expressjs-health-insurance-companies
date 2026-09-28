import bcrypt from 'bcryptjs';

// In-memory data keeps the project runnable without external services. Passwords
// are hashed even for the demo accounts; production data belongs in a database.
const demoPassword = bcrypt.hashSync('admin123', 10);

export const db = {
  users: [
    { id: 1, name: 'Administración', email: 'admin@saludsegura.com', password: demoPassword, role: 'ADMIN' },
    { id: 2, name: 'Agente de seguros', email: 'agente@saludsegura.com', password: demoPassword, role: 'AGENT' },
    { id: 3, name: 'Analista', email: 'analista@saludsegura.com', password: demoPassword, role: 'ANALYST' }
  ],
  refreshTokens: [],
  agencies: [
    { id: 1, name: 'Salud Segura Bogotá', city: 'Bogotá', contactEmail: 'contacto@saludsegura.com' }
  ],
  policies: [
    { id: 1, agencyId: 1, policyNumber: 'SS-2026-0001', holderName: 'María Gómez', holderEmail: 'maria@example.com', plan: 'Integral Familiar', premium: 289000, status: 'ACTIVE', startDate: '2026-01-01' }
  ],
  plans: [
    { id: 1, name: 'Esencial', coverageType: 'Individual', monthlyPremiumFrom: 99000 },
    { id: 2, name: 'Integral Familiar', coverageType: 'Familiar', monthlyPremiumFrom: 229000 },
    { id: 3, name: 'Preferencial', coverageType: 'Individual', monthlyPremiumFrom: 349000 }
  ],
  claims: [
    { id: 1, policyId: 1, type: 'Consulta especializada', status: 'IN_REVIEW', submittedAt: '2026-02-14' }
  ]
};
