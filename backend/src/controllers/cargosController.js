// src/controllers/cargosController.js
import { pool } from "../db.js";

/**
 * Obtiene los cargos asociados a un departamento por id_departamento
 */
export const getCargos = async (req, res) => {
  try {
    const { id_departamento } = req.query;

    // Validación: id_departamento debe ser un número válido
    if (!id_departamento || isNaN(parseInt(id_departamento))) {
      return res.status(400).json({
        error: "El parámetro id_departamento es requerido y debe ser un número válido",
      });
    }

    const id = parseInt(id_departamento);

    // Verificar si el departamento existe
    const deptResult = await pool.query(
      "SELECT id_departamento FROM departamentos WHERE id_departamento = $1",
      [id]
    );

    if (deptResult.rows.length === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    // Obtener los cargos asociados al departamento
    const result = await pool.query(
      "SELECT * FROM cargos WHERE id_departamento = $1 ORDER BY nombre ASC",
      [id]
    );

    // Devolver resultados
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo cargos:", error.message);
    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
    });
  }
};


export const getCargoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM cargos WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Cargo no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error getCargoById:", error);
    res.status(500).json({ error: "Error obteniendo cargo" });
  }
};

export const createCargo = async (req, res) => {
  try {
    const { nombre, id_departamento } = req.body;
    const query = "INSERT INTO cargos (nombre, id_departamento) VALUES ($1, $2) RETURNING *";
    const values = [nombre, id_departamento];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createCargo:", error);
    res.status(500).json({ error: "Error creando cargo" });
  }
};

export const updateCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, id_departamento } = req.body;
    const query = "UPDATE cargos SET nombre = $1, id_departamento = $2 WHERE id = $3 RETURNING *";
    const values = [nombre, id_departamento, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: "Cargo no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateCargo:", error);
    res.status(500).json({ error: "Error actualizando cargo" });
  }
};

export const deleteCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("DELETE FROM cargos WHERE id = $1 RETURNING *", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Cargo no encontrado" });
    res.json({ message: "Cargo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleteCargo:", error);
    res.status(500).json({ error: "Error eliminando cargo" });
  }
};