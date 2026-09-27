import bcrypt from 'bcryptjs';

const passwordHash = bcrypt.hashSync('admin123', 10);

export const db = {
  users: [
    { id: 1, email: 'admin@agencia.com', password: passwordHash, role: 'ADMIN' },
    { id: 2, email: 'analista@agencia.com', password: passwordHash, role: 'ANALYST' }
  ],
  clients: [
    { id: 1, name: 'Nike', industry: 'Deportes', contactEmail: 'marketing@nike.com' }
  ],
  campaigns: [
    { id: 1, clientId: 1, name: 'Lanzamiento Running 2024', budget: 25000, status: 'Activa' }
  ],
  channels: [
    { id: 1, name: 'Meta Ads', platform: 'Social Media' },
    { id: 2, name: 'Google Ads', platform: 'Search Engine' }
  ],
  metrics: [
    { id: 1, campaignId: 1, channelId: 1, impressions: 85000, clicks: 4200, conversions: 310 }
  ]
};