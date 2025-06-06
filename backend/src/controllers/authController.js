// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    console.log("Password ingresada en login:", password);

    const result = await pool.query("SELECT * FROM usuario WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];
    console.log("Hash en DB:", usuario.password);

    const passwordOK = await bcrypt.compare(password, usuario.password);

    if (!passwordOK) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // resto del código...


    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, usuario });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};