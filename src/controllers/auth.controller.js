import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../data/db.js';

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  // Generación del Token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    message: 'Login exitoso',
    user: { id: user.id, email: user.email, role: user.role },
    token
  });
};