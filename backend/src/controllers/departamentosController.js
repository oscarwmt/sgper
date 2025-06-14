// src/controllers/departamentosController.js
import { pool } from "../db.js";

export const getDepartamentos = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM departamentos ORDER BY id_departamentos");
    res.json(rows);
  } catch (error) {
    console.error("Error getDepartamentos:", error);
    res.status(500).json({ error: "Error obteniendo departamentos" });
  }
};

export const getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM departamentos WHERE id_departamentos = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Departamento no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error getDepartamentoById:", error);
    res.status(500).json({ error: "Error obteniendo departamento" });
  }
};

export const createDepartamento = async (req, res) => {
  try {
    const { nombre } = req.body;
    const query = "INSERT INTO departamentos (nombre) VALUES ($1) RETURNING *";
    const values = [nombre];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error createDepartamento:", error);
    res.status(500).json({ error: "Error creando departamento" });
  }
};

export const updateDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const query = "UPDATE departamentos SET nombre = $1 WHERE id_departamentos = $2 RETURNING *";
    const values = [nombre, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: "Departamento no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error updateDepartamento:", error);
    res.status(500).json({ error: "Error actualizando departamento" });
  }
};

export const deleteDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("DELETE FROM departamentos WHERE id_departamentos = $1 RETURNING *", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Departamento no encontrado" });
    res.json({ message: "Departamento eliminado correctamente" });
  } catch (error) {
    console.error("Error deleteDepartamento:", error);
    res.status(500).json({ error: "Error eliminando departamento" });
  }
};