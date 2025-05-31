import { pool } from "../db.js";

export const getContratos = async (req, res) => {
  try {
    const { page = 1, limit = 10, trabajador_id } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM contrato";
    let countQuery = "SELECT COUNT(*) FROM contrato";
    const params = [];
    if (trabajador_id) {
      query += " WHERE trabajador_id = $1";
      countQuery += " WHERE trabajador_id = $1";
      params.push(trabajador_id);
    }
    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, trabajador_id ? [trabajador_id] : []);

    const total = parseInt(countResult.rows[0].count);

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("Error getContratos:", error);
    res.status(500).json({ error: "Error obteniendo contratos" });
  }
};

export const getContratoById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM contrato WHERE id = $1";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Contrato no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error getContratoById:", error);
    res.status(500).json({ error: "Error obteniendo contrato" });
  }
};

export const createContrato = async (req, res) => {
  try {
    const { trabajador_id, fecha_inicio, fecha_termino, tipo_contrato, descripcion } = req.body;

    const query = `
      INSERT INTO contrato (trabajador_id, fecha_inicio, fecha_termino, tipo_contrato, descripcion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [trabajador_id, fecha_inicio, fecha_termino, tipo_contrato, descripcion];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createContrato:", error);
    res.status(500).json({ error: "Error creando contrato" });
  }
};

export const updateContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_termino, tipo_contrato, descripcion } = req.body;

    const query = `
      UPDATE contrato SET
        fecha_inicio = $1,
        fecha_termino = $2,
        tipo_contrato = $3,
        descripcion = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [fecha_inicio, fecha_termino, tipo_contrato, descripcion, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: "Contrato no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateContrato:", error);
    res.status(500).json({ error: "Error actualizando contrato" });
  }
};

export const deleteContrato = async (req, res) => {
  try {
    const { id } = req.params;

    const query = "DELETE FROM contrato WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Contrato no encontrado" });

    res.json({ message: "Contrato eliminado correctamente" });
  } catch (error) {
    console.error("Error deleteContrato:", error);
    res.status(500).json({ error: "Error eliminando contrato" });
  }
};
