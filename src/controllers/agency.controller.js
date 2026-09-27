import { db } from '../data/db.js';

// CLIENTS
export const getClients = (req, res) => res.json({ data: db.clients });
export const createClient = (req, res) => {
  const newClient = { id: db.clients.length + 1, ...req.body };
  db.clients.push(newClient);
  res.status(201).json({ message: 'Cliente registrado', data: newClient });
};

// CAMPAIGNS
export const getCampaigns = (req, res) => res.json({ data: db.campaigns });
export const createCampaign = (req, res) => {
  const newCampaign = { id: db.campaigns.length + 1, ...req.body };
  db.campaigns.push(newCampaign);
  res.status(201).json({ message: 'Campaña creada', data: newCampaign });
};

// CHANNELS
export const getChannels = (req, res) => res.json({ data: db.channels });

// METRICS
export const getMetrics = (req, res) => res.json({ data: db.metrics });