// trabajadoresController.js
import { pool } from "../db.js";

// === GET /api/trabajadores ===
export const getTrabajadores = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, filtro = "" } = req.query;
    const page = parseInt(pagina);
    const limit = parseInt(limite);
    const offset = (page - 1) * limit;

    // Consulta paginada
    const query = `
      SELECT * FROM trabajadores
      WHERE activo = true AND (nombre ILIKE $1 OR apellidos ILIKE $1 OR rut ILIKE $1)
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    const values = [`%${filtro}%`, limit, offset];

    const { rows } = await pool.query(query, values);

    // Conteo total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM trabajadores 
       WHERE activo = true AND (nombre ILIKE $1 OR apellidos ILIKE $1 OR rut ILIKE $1)`,
      [`%${filtro}%`]
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
    console.error("Error creando trabajador:", error);
    res.status(500).json({ error: true, message: "Error creando trabajador" });
  }
};

// === Desactivar Trabajador ===
export const desactivarTrabajador = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query(
      "UPDATE trabajadores SET activo = false WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: true, message: "Trabajador no encontrado" });
    }
    res.json({ error: false, message: "Trabajador desactivado", data: result.rows[0] });
  } catch (error) {
    console.error("Error al desactivar trabajador:", error);
    res.status(500).json({ error: true, message: "Error del servidor" });
  }
};

// === GET /api/trabajadores/:id ===
export const getTrabajadorById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM trabajadores WHERE activo = true AND id = $1`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: "Trabajador no encontrado" });
    }

    res.json({ error: false, data: rows[0], message: "Datos cargados" });
  } catch (error) {
    console.error("Error getTrabajadorById:", error.message || error);
    res.status(500).json({ error: true, message: "Error obteniendo trabajador" });
  }
};

// === POST /api/trabajadores ===
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
        comunaId: comuna_id,
        ciudad,
        departamentoId: departamento_id,
        cargoId: cargo_id,
        tipoContrato: tipocontrato,
        cantidadDuracion: cantidad_duracion,
        unidadDuracion: unidad_duracion,
        jornadaLaboralId: jornada_laboral_id,
        gratificacionTipo: gratificacion_tipo,
        gratificacionMonto: gratificacion_monto
      } = req.body;
  
      // 1. Verificar si ya existe un trabajador con ese RUT
      const { rows: rowsExist } = await pool.query(
        `SELECT 1 FROM trabajadores WHERE rut = $1 LIMIT 1`,
        [rut]
      );
  
      if (rowsExist.length > 0) {
        return res.status(400).json({
          error: true,
          message: "Ya existe un trabajador con ese RUT"
        });
      }
  
      // 2. Insertar nuevo trabajador
      const query = `
        INSERT INTO trabajadores (
          rut, nombre, apellidos, correo, telefono, fecha_nacimiento, estado_civil, hijos, 
          direccion, casa_bloque_depto, comuna_id, ciudad, departamento_id, cargo_id, 
          tipocontrato, cantidad_duracion, unidad_duracion, jornada_laboral_id, 
          gratificacion_tipo, gratificacion_monto
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `;
  
      const values = [
        rut,
        nombre,
        apellidos,
        correo,
        telefono || null,
        fecha_nacimiento,
        estado_civil,
        parseInt(hijos),
        direccion,
        casa_bloque_depto || null,
        parseInt(comuna_id),
        ciudad,
        parseInt(departamento_id),
        parseInt(cargo_id),
        tipocontrato,
        parseInt(cantidad_duracion) || null,
        unidad_duracion || null,
        parseInt(jornada_laboral_id),
        gratificacion_tipo || null,
        parseFloat(gratificacion_monto) || null
      ];
  
      const { rows } = await pool.query(query, values);
  
      res.status(201).json({ error: false, data: rows[0], message: "Trabajador creado correctamente" });
  
    } catch (error) {
      console.error("Error createTrabajador:", error.message || error.detail || error.code);
      res.status(500).json({ error: true, message: "Error creando trabajador" });
    }
  };
  

// === PUT /api/trabajadores/:id ===
export const updateTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellidos,
      correo,
      telefono,
      fechaNacimiento: fecha_nacimiento,
      estadoCivil: estado_civil,
      hijos,
      direccion,
      casaBloqueDepto: casa_bloque_depto,
      comunaId: comuna_id,
      ciudad,
      departamentoId: departamento_id,
      cargoId: cargo_id,
      tipoContrato: tipocontrato,
      cantidadDuracion: cantidad_duracion,
      unidadDuracion: unidad_duracion,
      jornadaLaboralId: jornada_laboral_id,
      gratificacionTipo: gratificacion_tipo,
      gratificacionMonto: gratificacion_monto
    } = req.body;

    const query = `
      UPDATE trabajadores SET
        nombre = $1,
        apellidos = $2,
        correo = $3,
        telefono = $4,
        fecha_nacimiento = $5,
        estado_civil = $6,
        hijos = $7,
        direccion = $8,
        casa_bloque_depto = $9,
        comuna_id = $10,
        ciudad = $11,
        departamento_id = $12,
        cargo_id = $13,
        tipocontrato = $14,
        cantidad_duracion = $15,
        unidad_duracion = $16,
        jornada_laboral_id = $17,
        gratificacion_tipo = $18,
        gratificacion_monto = $19
      WHERE id = $20
      RETURNING *
    `;

    const values = [
      nombre,
      apellidos,
      correo,
      telefono || null,
      fecha_nacimiento,
      estado_civil,
      parseInt(hijos),
      direccion,
      casa_bloque_depto || null,
      parseInt(comuna_id),
      ciudad,
      parseInt(departamento_id),
      parseInt(cargo_id),
      tipocontrato,
      parseInt(cantidad_duracion) || null,
      unidad_duracion || null,
      parseInt(jornada_laboral_id),
      gratificacion_tipo || null,
      parseFloat(gratificacion_monto) || null,
      id
    ];

    const { rows } = await pool.query(query, values);

    if (!rows.length) {
      return res.status(404).json({ error: true, message: "Trabajador no encontrado" });
    }

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

    const query = `UPDATE trabajadores SET activo = false WHERE id = $1 RETURNING *`;

    const { rows } = await pool.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: true, message: "Trabajador no encontrado" });
    }

    res.json({ error: false, message: "Trabajador desactivado correctamente" });
  } catch (error) {
    console.error("Error deleteTrabajador:", error.message || error.detail || error.code);
    res.status(500).json({ error: true, message: "Error desactivando trabajador" });
  }
};