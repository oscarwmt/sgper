import { pool } from "../db.js";

export const getCargasFamiliares = async (req, res) => {
  try {
    const { page = 1, limit = 10, trabajador_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM carga_familiar`;
    let countQuery = `SELECT COUNT(*) FROM carga_familiar`;
    const params = [];
    if (trabajador_id) {
      query += ` WHERE trabajador_id = $1`;
      countQuery += ` WHERE trabajador_id = $1`;
      params.push(trabajador_id);
    }
    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, trabajador_id ? [trabajador_id] : []);

    const total = parseInt(countResult.rows[0].count);

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("Error getCargasFamiliares:", error);
    res.status(500).json({ error: "Error obteniendo cargas familiares" });
  }
};

export const getCargaFamiliarById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM carga_familiar WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Carga familiar no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error getCargaFamiliarById:", error);
    res.status(500).json({ error: "Error obteniendo carga familiar" });
  }
};

export const createCargaFamiliar = async (req, res) => {
  try {
    const { trabajador_id, nombre, fecha_nacimiento, parentesco } = req.body;

    const query = `
      INSERT INTO carga_familiar (trabajador_id, nombre, fecha_nacimiento, parentesco)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [trabajador_id, nombre, fecha_nacimiento, parentesco];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createCargaFamiliar:", error);
    res.status(500).json({ error: "Error creando carga familiar" });
  }
};

export const updateCargaFamiliar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha_nacimiento, parentesco } = req.body;

    const query = `
      UPDATE carga_familiar SET
        nombre = $1,
        fecha_nacimiento = $2,
        parentesco = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [nombre, fecha_nacimiento, parentesco, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0)
      return res.status(404).json({ error: "Carga familiar no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateCargaFamiliar:", error);
    res.status(500).json({ error: "Error actualizando carga familiar" });
  }
};

export const deleteCargaFamiliar = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM carga_familiar WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Carga familiar no encontrada" });

    res.json({ message: "Carga familiar eliminada correctamente" });
  } catch (error) {
    console.error("Error deleteCargaFamiliar:", error);
    res.status(500).json({ error: "Error eliminando carga familiar" });
  }
};
