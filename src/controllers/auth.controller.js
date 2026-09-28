import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../data/db.js';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

function readCookie(req, name) {
  const item = (req.headers.cookie ?? '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!item) return undefined;
  try { return decodeURIComponent(item.slice(name.length + 1)); } catch { return undefined; }
}

function cookieOptions(maxAge) {
  return { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/api/auth', maxAge };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOptions(15 * 60 * 1000), path: '/' });
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...cookieOptions(0), path: '/' });
  res.clearCookie(REFRESH_COOKIE, cookieOptions(0));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function issueTokens(user) {
  const claims = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(claims, accessSecret, { expiresIn: '15m', issuer: 'health-insurance-api' });
  const refreshToken = jwt.sign({ id: user.id, tokenId: crypto.randomUUID() }, refreshSecret, { expiresIn: '7d', issuer: 'health-insurance-api' });
  return { accessToken, refreshToken };
}

export const register = async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Nombre, email válido y contraseña de al menos 8 caracteres son requeridos' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some((user) => user.email === normalizedEmail)) return res.status(409).json({ error: 'No fue posible registrar el usuario' });
  const user = { id: Math.max(0, ...db.users.map((item) => item.id)) + 1, name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role: 'AGENT' };
  db.users.push(user);
  const tokens = issueTokens(user);
  db.refreshTokens.push({ userId: user.id, hash: await bcrypt.hash(tokens.refreshToken, 10) });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.status(201).json({ message: 'Usuario registrado', user: publicUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  const user = db.users.find((item) => item.email === email.trim().toLowerCase());
  const validPassword = user ? await bcrypt.compare(password, user.password) : false;
  if (!validPassword) return res.status(401).json({ error: 'Credenciales incorrectas' });
  const tokens = issueTokens(user);
  db.refreshTokens.push({ userId: user.id, hash: await bcrypt.hash(tokens.refreshToken, 10) });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  return res.json({ message: 'Inicio de sesión exitoso', user: publicUser(user) });
};

export const me = (req, res) => {
  const user = db.users.find((item) => item.id === req.user.id);
  if (!user) return res.status(401).json({ error: 'Sesión inválida' });
  return res.json({ data: publicUser(user) });
};

export const refresh = async (req, res) => {
  const token = readCookie(req, REFRESH_COOKIE);
  if (!token) return res.status(401).json({ error: 'Refresh token requerido' });
  try {
    const decoded = jwt.verify(token, refreshSecret, { issuer: 'health-insurance-api' });
    let storedIndex = -1;
    for (let index = 0; index < db.refreshTokens.length; index += 1) {
      const record = db.refreshTokens[index];
      if (record.userId === decoded.id && await bcrypt.compare(token, record.hash)) { storedIndex = index; break; }
    }
    if (storedIndex < 0) return res.status(401).json({ error: 'Refresh token inválido o revocado' });
    db.refreshTokens.splice(storedIndex, 1);
    const user = db.users.find((item) => item.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Sesión inválida' });
    const tokens = issueTokens(user);
    db.refreshTokens.push({ userId: user.id, hash: await bcrypt.hash(tokens.refreshToken, 10) });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.json({ message: 'Tokens renovados', user: publicUser(user) });
  } catch {
    return res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
};

export const logout = async (req, res) => {
  const token = readCookie(req, REFRESH_COOKIE);
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      const records = db.refreshTokens.filter((item) => item.userId === decoded.id);
      for (const record of records) {
        if (await bcrypt.compare(token, record.hash)) db.refreshTokens.splice(db.refreshTokens.indexOf(record), 1);
      }
    }
  }
  clearAuthCookies(res);
  return res.status(204).end();
};
