import { pool } from "../db.js";

export const getAfps = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM afp ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Error getAFPs:", error);
    res.status(500).json({ error: "Error obteniendo AFP" });
  }
};

export const getAfpById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM afp WHERE id = $1", [id]);

    if (rows.length === 0) return res.status(404).json({ error: "AFP no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error getAfpById:", error);
    res.status(500).json({ error: "Error obteniendo AFP" });
  }
};

export const createAfp = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const query =
      "INSERT INTO afp (nombre, descripcion) VALUES ($1, $2) RETURNING *";
    const values = [nombre, descripcion];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createAfp:", error);
    res.status(500).json({ error: "Error creando AFP" });
  }
};

export const updateAfp = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const query =
      "UPDATE afp SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *";
    const values = [nombre, descripcion, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: "AFP no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateAfp:", error);
    res.status(500).json({ error: "Error actualizando AFP" });
  }
};

export const deleteAfp = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query("DELETE FROM afp WHERE id = $1 RETURNING *", [
      id,
    ]);

    if (rows.length === 0) return res.status(404).json({ error: "AFP no encontrada" });

    res.json({ message: "AFP eliminada correctamente" });
  } catch (error) {
    console.error("Error deleteAfp:", error);
    res.status(500).json({ error: "Error eliminando AFP" });
  }
};
