// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const result = await pool.query(`
      SELECT u.id, u.correo, u.password, u.nombre AS nombre_usuario, u.empresa_id, e.nombre AS nombre_empresa
      FROM usuario u
      JOIN empresa e ON u.empresa_id = e.id
      WHERE u.correo = $1
    `, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];
    const passwordOK = await bcrypt.compare(password, usuario.password);

    if (!passwordOK) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        empresa_id: usuario.empresa_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre_usuario,
        empresa_id: usuario.empresa_id,
        empresa_nombre: usuario.nombre_empresa, // <- ESTA ES LA CLAVE
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
