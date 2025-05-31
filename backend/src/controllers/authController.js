// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from "../db.js";

dotenv.config();

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Buscar usuario y su empresa
    const result = await pool.query(
      `SELECT u.*, e.nombre AS empresa_nombre, e.rut AS empresa_rut
       FROM usuario u
       JOIN empresa e ON u.empresa_id = e.id
       WHERE u.correo = $1 AND u.activo = true`,
      [correo]
    );

    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Actualizar campo ultimo_acceso
    await pool.query(
      `UPDATE usuario SET ultimo_acceso = NOW() WHERE id = $1`,
      [usuario.id]
    );

    // Generar token JWT
    const tokenPayload = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      empresaId: usuario.empresa_id,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        empresa: {
          id: usuario.empresa_id,
          nombre: usuario.empresa_nombre,
          rut: usuario.empresa_rut,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
