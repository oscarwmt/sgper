// src/controllers/trabajadoresController.js
import { pool } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// === Configuración de subida de archivos ===
const storage = multer.diskStorage({
  destination: "uploads/trabajadores/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage });

// === GET /api/trabajadores ===
export const getTrabajadores = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, filtro = "" } = req.query;
    const page = parseInt(pagina);
    const limit = parseInt(limite);
    const offset = (page - 1) * limit;
    const empresa_id = req.user.empresa_id;

    const query = `
      SELECT * FROM trabajadores
      WHERE activo = true AND empresa_id = $1 AND (nombre ILIKE $2 OR apellidos ILIKE $2 OR rut ILIKE $2)
      ORDER BY id_trabajadores
      LIMIT $3 OFFSET $4
    `;
    const values = [empresa_id, `%${filtro}%`, limit, offset];

    const { rows } = await pool.query(query, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM trabajadores 
       WHERE activo = true AND empresa_id = $1 AND (nombre ILIKE $2 OR apellidos ILIKE $2 OR rut ILIKE $2)`,
      [empresa_id, `%${filtro}%`]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: rows,
      total,
      pagina: page,
      limite: limit,
      total_paginas: Math.ceil(total / limit),
      message: rows.length > 0 ? "Datos cargados" : "Sin trabajadores",
      error: false
    });
  } catch (error) {
    console.error("Error getTrabajadores:", error);
    res.status(500).json({ error: true, message: "Error obteniendo trabajadores" });
  }
};

// === GET /api/trabajadores/:id ===
export const getTrabajadorById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;
    const query = `SELECT * FROM trabajadores WHERE activo = true AND empresa_id = $1 AND id = $2`;
    const { rows } = await pool.query(query, [empresa_id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: "Trabajador no encontrado" });
    }

    res.json({ error: false, data: rows[0], message: "Datos cargados" });
  } catch (error) {
    console.error("Error getTrabajadorById:", error);
    res.status(500).json({ error: true, message: "Error obteniendo trabajador" });
  }
};

// Para resolver __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saveUploadedFile = (file, rut, tipo) => {
  if (!file) return null;
  const folderPath = path.join(__dirname, "..", "uploads", "trabajadores");
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const ext = path.extname(file.originalname);
  const fileName = `${rut}_${tipo}${ext}`;
  const fullPath = path.join(folderPath, fileName);

  fs.writeFileSync(fullPath, file.buffer);
  return `uploads/trabajadores/${fileName}`;
};

// === CREATE /api/trabajadores ===
export const createTrabajador = async (req, res) => {
  try {
    const {
      rut,
      nombre,
      apellidos,
      correo,
      telefono,
      fechaNacimiento: fecha_nacimiento,
      estadoCivil: estado_civil,
      hijos,
      direccion,
      casaBloqueDepto: casa_bloque_depto,
      comunaId: id_comunas,
      ciudad,
      departamentoId: id_departamentos,
      cargoId: id_cargo,
      empresa_id
    } = req.body;

    // Manejo de archivos adjuntos
    let cv = null;
    let certificado_antecedentes = null;
    let certificado_afp = null;
    let formulario_fun = null;

    if (req.files) {
      if (req.files.cv?.[0]) cv = req.files.cv[0].filename;
      if (req.files.certificado_antecedentes?.[0]) certificado_antecedentes = req.files.certificado_antecedentes[0].filename;
      if (req.files.certificado_afp?.[0]) certificado_afp = req.files.certificado_afp[0].filename;
      if (req.files.formulario_fun?.[0]) formulario_fun = req.files.formulario_fun[0].filename;
    }

    const { rows: rowsExist } = await pool.query(
      `SELECT 1 FROM trabajadores WHERE rut = $1 LIMIT 1`,
      [rut]
    );

    if (rowsExist.length > 0) {
      return res.status(400).json({ error: true, message: "Ya existe un trabajador con ese RUT" });
    }

    const fields = [
      "rut", "nombre", "apellidos", "correo", "telefono",
      "fecha_nacimiento", "estado_civil", "hijos", "direccion",
      "casa_bloque_depto", "id_comunas", "ciudad",
      "id_departamentos", "id_cargo", "empresa_id"
    ];

    const values = [
      rut, nombre, apellidos, correo, telefono || null,
      fecha_nacimiento, estado_civil, parseInt(hijos), direccion,
      casa_bloque_depto || null, parseInt(id_comunas), ciudad,
      parseInt(id_departamentos), parseInt(id_cargo), parseInt(empresa_id)
    ];

    if (cv) { fields.push("cv"); values.push(cv); }
    if (certificado_antecedentes) { fields.push("certificado_antecedentes"); values.push(certificado_antecedentes); }
    if (certificado_afp) { fields.push("certificado_afp"); values.push(certificado_afp); }
    if (formulario_fun) { fields.push("formulario_fun"); values.push(formulario_fun); }

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO trabajadores (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;

    const { rows } = await pool.query(query, values);

    res.status(201).json({ error: false, data: rows[0], message: "Trabajador creado correctamente" });

  } catch (error) {
    console.error("Error createTrabajador:", error.message || error.detail || error.code);
    res.status(500).json({ error: true, message: "Error creando trabajador" });
  }
};

// === UPDATE /api/trabajadores/:id ===
export const updateTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, apellidos, correo, telefono,
      fechaNacimiento: fecha_nacimiento,
      estadoCivil: estado_civil,
      hijos, direccion, casaBloqueDepto: casa_bloque_depto,
      comunaId: id_comunas, ciudad,
      departamentoId: id_departamentos, cargoId: id_cargo
    } = req.body;

    let cv = null, certificado_antecedentes = null, certificado_afp = null, formulario_fun = null;

    if (req.files) {
      if (req.files.cv?.[0]) cv = req.files.cv[0].filename;
      if (req.files.certificado_antecedentes?.[0]) certificado_antecedentes = req.files.certificado_antecedentes[0].filename;
      if (req.files.certificado_afp?.[0]) certificado_afp = req.files.certificado_afp[0].filename;
      if (req.files.formulario_fun?.[0]) formulario_fun = req.files.formulario_fun[0].filename;
    }

    const fields = [
      { name: "nombre", value: nombre },
      { name: "apellidos", value: apellidos },
      { name: "correo", value: correo },
      { name: "telefono", value: telefono || null },
      { name: "fecha_nacimiento", value: fecha_nacimiento },
      { name: "estado_civil", value: estado_civil },
      { name: "hijos", value: parseInt(hijos) },
      { name: "direccion", value: direccion },
      { name: "casa_bloque_depto", value: casa_bloque_depto || null },
      { name: "id_comunas", value: parseInt(id_comunas) },
      { name: "ciudad", value: ciudad },
      { name: "id_departamentos", value: parseInt(id_departamentos) },
      { name: "id_cargo", value: parseInt(id_cargo) }
    ];

    if (cv) fields.push({ name: "cv", value: cv });
    if (certificado_antecedentes) fields.push({ name: "certificado_antecedentes", value: certificado_antecedentes });
    if (certificado_afp) fields.push({ name: "certificado_afp", value: certificado_afp });
    if (formulario_fun) fields.push({ name: "formulario_fun", value: formulario_fun });

    const setClause = fields.map((f, i) => `${f.name} = $${i + 1}`).join(", ");
    const values = fields.map(f => f.value);

    const query = `UPDATE trabajadores SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);

    const { rows } = await pool.query(query, values);

    if (!rows.length) return res.status(404).json({ error: true, message: "Trabajador no encontrado" });

    res.json({ error: false, data: rows[0], message: "Trabajador actualizado correctamente" });
  } catch (error) {
    console.error("Error updateTrabajador:", error.message || error.detail || error.code);
    res.status(500).json({ error: true, message: "Error actualizando trabajador" });
  }
};

// === DELETE /api/trabajadores/:id ===
export const deleteTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa_id = req.user.empresa_id;

    const query = `UPDATE trabajadores SET activo = false WHERE id_trabajadores = $1 AND empresa_id = $2 RETURNING *`;
    const { rows } = await pool.query(query, [id, empresa_id]);

    if (!rows.length) return res.status(404).json({ error: true, message: "Trabajador no encontrado" });

    res.json({ error: false, message: "Trabajador desactivado correctamente" });
  } catch (error) {
    console.error("Error deleteTrabajador:", error);
    res.status(500).json({ error: true, message: "Error desactivando trabajador" });
  }
};

// === PATCH /api/trabajadores/:id/desactivar ===
export const desactivarTrabajador = deleteTrabajador;
