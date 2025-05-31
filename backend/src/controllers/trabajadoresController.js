// trabajadoresController.js
import { pool } from "../db.js";

// Obtener lista con paginación y filtro básico
export const getTrabajadores = async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = "" } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM trabajador
      WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR rut ILIKE $1
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    const values = [`%${filter}%`, limit, offset];

    const { rows } = await pool.query(query, values);

    // Para total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM trabajador WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR rut ILIKE $1`,
      [`%${filter}%`]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("Error getTrabajadores:", error);
    res.status(500).json({ error: "Error obteniendo trabajadores" });
  }
};

export const getTrabajadorById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM trabajador WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Trabajador no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error getTrabajadorById:", error);
    res.status(500).json({ error: "Error obteniendo trabajador" });
  }
};

export const createTrabajador = async (req, res) => {
  try {
    const {
      rut,
      nombre,
      apellido,
      direccion,
      comuna_id,
      ciudad,
      fecha_nacimiento,
      nacionalidad,
      // otros campos...
    } = req.body;

    const query = `
      INSERT INTO trabajador (rut, nombre, apellido, direccion, comuna_id, ciudad, fecha_nacimiento, nacionalidad)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [rut, nombre, apellido, direccion, comuna_id, ciudad, fecha_nacimiento, nacionalidad];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createTrabajador:", error);
    res.status(500).json({ error: "Error creando trabajador" });
  }
};

export const updateTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      direccion,
      comuna_id,
      ciudad,
      fecha_nacimiento,
      nacionalidad,
      // otros campos, no actualizar rut
    } = req.body;

    const query = `
      UPDATE trabajador SET
        nombre = $1,
        apellido = $2,
        direccion = $3,
        comuna_id = $4,
        ciudad = $5,
        fecha_nacimiento = $6,
        nacionalidad = $7
      WHERE id = $8
      RETURNING *
    `;

    const values = [nombre, apellido, direccion, comuna_id, ciudad, fecha_nacimiento, nacionalidad, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0)
      return res.status(404).json({ error: "Trabajador no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateTrabajador:", error);
    res.status(500).json({ error: "Error actualizando trabajador" });
  }
};

export const deleteTrabajador = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM trabajador WHERE id = $1 RETURNING *`;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Trabajador no encontrado" });

    res.json({ message: "Trabajador eliminado correctamente" });
  } catch (error) {
    console.error("Error deleteTrabajador:", error);
    res.status(500).json({ error: "Error eliminando trabajador" });
  }
};
