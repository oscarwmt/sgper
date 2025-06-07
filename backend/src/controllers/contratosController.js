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
    const {
      trabajador_id,
      tipo_contrato,
      fecha_inicio,
      fecha_termino,
      copia_contrato,
      departamento,
      cargo,
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
      isapre,
      afp,
    } = req.body;

    const query = `
      INSERT INTO contrato (
        trabajador_id,
        tipo_contrato,
        fecha_inicio,
        fecha_termino,
        copia_contrato,
        departamento,
        cargo,
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
        isapre,
        afp
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING *
    `;
    const values = [
      trabajador_id,
      tipo_contrato,
      fecha_inicio,
      fecha_termino,
      copia_contrato,
      departamento,
      cargo,
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
      isapre,
      afp,
    ];

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
    const {
      tipo_contrato,
      fecha_inicio,
      fecha_termino,
      copia_contrato,
      departamento,
      cargo,
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
      isapre,
      afp,
    } = req.body;

    const query = `
      UPDATE contrato SET
        tipo_contrato = $1,
        fecha_inicio = $2,
        fecha_termino = $3,
        copia_contrato = $4,
        departamento = $5,
        cargo = $6,
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
        isapre = $17,
        afp = $18
      WHERE id = $19
      RETURNING *
    `;
    const values = [
      tipo_contrato,
      fecha_inicio,
      fecha_termino,
      copia_contrato,
      departamento,
      cargo,
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
      isapre,
      afp,
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
