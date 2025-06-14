// src/controllers/jornadasController.js
import { pool } from "../db.js";

export const getJornadas = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM jornadas_laborales ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Error getJornadas:", error);
    res.status(500).json({ error: "Error obteniendo jornadas" });
  }
};

export const getJornadaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM jornadas_laborales WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Jornada no encontrada" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error getJornadaById:", error);
    res.status(500).json({ error: "Error obteniendo jornada" });
  }
};

export const createJornada = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const query = "INSERT INTO jornadas_laborales (nombre, descripcion) VALUES ($1, $2) RETURNING *";
    const values = [nombre, descripcion];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createJornada:", error);
    res.status(500).json({ error: "Error creando jornada" });
  }
};

export const updateJornada = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const query = "UPDATE jornadas_laborales SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *";
    const values = [nombre, descripcion, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: "Jornada no encontrada" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateJornada:", error);
    res.status(500).json({ error: "Error actualizando jornada" });
  }
};

export const deleteJornada = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("DELETE FROM jornadas_laborales WHERE id = $1 RETURNING *", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Jornada no encontrada" });
    res.json({ message: "Jornada eliminada correctamente" });
  } catch (error) {
    console.error("Error deleteJornada:", error);
    res.status(500).json({ error: "Error eliminando jornada" });
  }
};
