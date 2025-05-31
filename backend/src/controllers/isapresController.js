import { pool } from "../db.js";

export const getIsapres = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM isapre ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Error getIsapres:", error);
    res.status(500).json({ error: "Error obteniendo isapres" });
  }
};

export const getIsapreById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM isapre WHERE id = $1", [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Isapre no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error getIsapreById:", error);
    res.status(500).json({ error: "Error obteniendo isapre" });
  }
};

export const createIsapre = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const query =
      "INSERT INTO isapre (nombre, descripcion) VALUES ($1, $2) RETURNING *";
    const values = [nombre, descripcion];

    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createIsapre:", error);
    res.status(500).json({ error: "Error creando isapre" });
  }
};

export const updateIsapre = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const query =
      "UPDATE isapre SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *";
    const values = [nombre, descripcion, id];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: "Isapre no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateIsapre:", error);
    res.status(500).json({ error: "Error actualizando isapre" });
  }
};

export const deleteIsapre = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query("DELETE FROM isapre WHERE id = $1 RETURNING *", [
      id,
    ]);

    if (rows.length === 0) return res.status(404).json({ error: "Isapre no encontrada" });

    res.json({ message: "Isapre eliminada correctamente" });
  } catch (error) {
    console.error("Error deleteIsapre:", error);
    res.status(500).json({ error: "Error eliminando isapre" });
  }
};
