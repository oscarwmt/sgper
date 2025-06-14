import { pool } from "../db.js";

export const getDatosTrabajadorPorRUT = async (req, res) => {
  const { rut } = req.params;
  try {
    const query = `
      SELECT id, nombre, apellido, direccion, ciudad, comuna, telefono, correo
      FROM trabajadores
      WHERE rut = $1
    `;
    const { rows } = await pool.query(query, [rut]);

    if (rows.length === 0) return res.status(404).json({ error: "Trabajador no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error getDatosTrabajadorPorRUT:", error);
    res.status(500).json({ error: "Error obteniendo datos del trabajador" });
  }
};

export const getContratos = async (req, res) => {
  try {
    const { page = 1, limit = 10, id_trabajadores } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM contrato";
    let countQuery = "SELECT COUNT(*) FROM contrato";
    const params = [];
    if (id_trabajadores) {
      query += " WHERE id_trabajadores = $1";
      countQuery += " WHERE id_trabajadores = $1";
      params.push(id_trabajadores);
    }
    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, id_trabajadores ? [id_trabajadores] : []);

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
    const {
      id_trabajadores,
      tipo_id_contrato, // ✅ Campo actualizado
      fecha_inicio,
      fecha_fin,
      descripcion_funciones,
      sueldo_base,
      bono_locomocion,
      bono_colacion,
      otros_bonos,
      dias_vacaciones,
      jornada_laboral_id,
      id_departamentos,
      id_cargo,
      id_afp,
      id_isapre,
    } = req.body;

    // Validación básica
    if (!id_trabajadores || !id_departamentos || !jornada_laboral_id || !tipo_id_contrato) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    // Ejecuta tu consulta SQL aquí
    const result = await pool.query(
      `INSERT INTO contrato (
        id_trabajadores, tipo_id_contrato, fecha_inicio, fecha_fin, 
        descripcion_funciones, sueldo_base, bono_locomocion, bono_colacion,
        otros_bonos, dias_vacaciones, jornada_laboral_id, id_departamentos,
        id_cargo, id_afp, id_isapre
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        id_trabajadores,
        tipo_id_contrato, // ✅ Usamos el nuevo campo
        fecha_inicio,
        fecha_fin,
        descripcion_funciones,
        sueldo_base,
        bono_locomocion,
        bono_colacion,
        otros_bonos,
        dias_vacaciones,
        jornada_laboral_id,
        id_departamentos,
        id_cargo,
        id_afp,
        id_isapre,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creando contrato:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export const updateContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_id_contrato,
      fecha_inicio,
      fecha_termino,
      copia_contrato,
      id_departamentos,   // ✅ Corregido
      id_cargo,          // ✅ Corregido
      descripcion_funciones,
      sueldo_base,
      bono_locomocion,
      bono_colacion,
      otros_bonos,
      beneficios,
      horario_trabajo,
      dias_vacaciones,
      politicas_empresa,
      clausulas,
      id_isapre,         // ✅ Corregido
      id_afp,            // ✅ Corregido
    } = req.body;

    const query = `
      UPDATE contrato SET
        tipo_id_contrato = $1,
        fecha_inicio = $2,
        fecha_termino = $3,
        copia_contrato = $4,
        id_departamentos = $5,
        id_cargo = $6,
        descripcion_funciones = $7,
        sueldo_base = $8,
        bono_locomocion = $9,
        bono_colacion = $10,
        otros_bonos = $11,
        beneficios = $12,
        horario_trabajo = $13,
        dias_vacaciones = $14,
        politicas_empresa = $15,
        clausulas = $16,
        id_isapre = $17,
        id_afp = $18
      WHERE id = $19
      RETURNING *
    `;
    const values = [
      tipo_id_contrato,
      fecha_inicio,
      fecha_termino,
      copia_contrato,
      id_departamentos,
      id_cargo,
      descripcion_funciones,
      sueldo_base,
      bono_locomocion,
      bono_colacion,
      otros_bonos,
      beneficios,
      horario_trabajo,
      dias_vacaciones,
      politicas_empresa,
      clausulas,
      id_isapre,
      id_afp,
      id,
    ];

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
