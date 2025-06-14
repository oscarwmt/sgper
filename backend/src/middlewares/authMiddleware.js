// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Aquí debe venir { id, correo, empresa_id }
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};
