// src/controllers/tipoContratoController.js
import { pool } from "../db.js";

export const getTiposContrato = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tipos_contrato ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Error getTiposContrato:", error);
    res.status(500).json({ error: "Error obteniendo tipos de contrato" });
  }
};
