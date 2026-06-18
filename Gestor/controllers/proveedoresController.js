'use strict';

const { Op } = require('sequelize');
const { Proveedor, TelefonoProveedor, Cotizacion, Proyecto, Evaluacion } = require('../models');

const INACTIVO_PREFIX = '[INACTIVO]';

const whereActivo = {
  nombre: {
    [Op.notLike]: `${INACTIVO_PREFIX}%`,
  },
};

const estaInactivo = (proveedor) => {
  return proveedor.nombre?.startsWith(INACTIVO_PREFIX);
};

// GET /api/proveedores
const getProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: whereActivo,
      include: [
        {
          model: TelefonoProveedor,
          as: 'telefonos',
        },
      ],
      order: [['id_proveedor', 'DESC']],
    });

    if (proveedores.length === 0) {
      return res.status(204).send();
    }

    res.json(proveedores);
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al obtener proveedores',
      detalle: error.message,
    });
  }
};

// GET /api/proveedores/:id
const getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: {
        id_proveedor: req.params.id,
        ...whereActivo,
      },
      include: [
        {
          model: TelefonoProveedor,
          as: 'telefonos',
        },
        {
          model: Cotizacion,
          as: 'cotizaciones',
        },
      ],
    });

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al obtener proveedor',
      detalle: error.message,
    });
  }
};

// POST /api/proveedores
const createProveedor = async (req, res) => {
  try {
    const { nombre, rtn } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: 'El nombre es requerido',
      });
    }

    if (nombre.startsWith(INACTIVO_PREFIX)) {
      return res.status(400).json({
        error: `El nombre no puede iniciar con ${INACTIVO_PREFIX}`,
      });
    }

    if (rtn) {
      const proveedorExistente = await Proveedor.findOne({
        where: {
          rtn,
          ...whereActivo,
        },
      });

      if (proveedorExistente) {
        return res.status(400).json({
          error: 'Ya existe un proveedor activo con este RTN',
        });
      }
    }

    const proveedor = await Proveedor.create({ nombre, rtn });

    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al crear proveedor',
      detalle: error.message,
    });
  }
};

// PATCH /api/proveedores/:id
const updateProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor || estaInactivo(proveedor)) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    const { nombre, rtn } = req.body;

    if (nombre === undefined && rtn === undefined) {
      return res.status(400).json({
        error: 'Debe enviar al menos un campo para actualizar',
      });
    }

    if (nombre !== undefined && !nombre) {
      return res.status(400).json({
        error: 'El nombre no puede estar vacío',
      });
    }

    if (nombre && nombre.startsWith(INACTIVO_PREFIX)) {
      return res.status(400).json({
        error: `El nombre no puede iniciar con ${INACTIVO_PREFIX}`,
      });
    }

    if (rtn !== undefined && rtn) {
      const proveedorExistente = await Proveedor.findOne({
        where: {
          rtn,
          id_proveedor: {
            [Op.ne]: req.params.id,
          },
          ...whereActivo,
        },
      });

      if (proveedorExistente) {
        return res.status(400).json({
          error: 'Ya existe otro proveedor activo con este RTN',
        });
      }
    }

    await proveedor.update({
      ...(nombre !== undefined && { nombre }),
      ...(rtn !== undefined && { rtn }),
    });

    res.json({
      message: 'Proveedor actualizado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al actualizar proveedor',
      detalle: error.message,
    });
  }
};

// DELETE /api/proveedores/:id
const deleteProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado',
      });
    }

    if (estaInactivo(proveedor)) {
      return res.status(400).json({
        error: 'El proveedor ya está inactivo',
      });
    }

    await proveedor.update({
      nombre: `${INACTIVO_PREFIX} ${proveedor.nombre}`,
    });

    res.json({
      message: 'Proveedor desactivado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al desactivar proveedor',
      detalle: error.message,
    });
  }
};

// GET /api/proveedores/:id/cotizaciones
const getCotizacionesByProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: {
        id_proveedor: req.params.id,
        ...whereActivo,
      },
    });

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    const cotizaciones = await Cotizacion.findAll({
      where: { id_proveedor: req.params.id },
      order: [['id_cotizacion', 'DESC']],
    });

    if (cotizaciones.length === 0) {
      return res.status(204).send();
    }

    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al obtener cotizaciones del proveedor',
      detalle: error.message,
    });
  }
};

// GET /api/proveedores/:id/proyectos
const getProyectosByProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: {
        id_proveedor: req.params.id,
        ...whereActivo,
      },
    });

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    const proyectos = await Proyecto.findAll({
      include: [
        {
          model: Cotizacion,
          as: 'cotizacion',
          where: { id_proveedor: req.params.id },
          include: [
            {
              model: Proveedor,
              as: 'proveedor',
            },
          ],
        },
        {
          model: Evaluacion,
          as: 'evaluacion',
          required: false,
        },
      ],
      order: [['id_proyecto', 'DESC']],
    });

    if (proyectos.length === 0) {
      return res.status(204).send();
    }

    res.json(proyectos);
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al obtener proyectos del proveedor',
      detalle: error.message,
    });
  }
};

// GET /api/proveedores/:id/estadisticas
const getEstadisticasProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: {
        id_proveedor: req.params.id,
        ...whereActivo,
      },
    });

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    const totalCotizaciones = await Cotizacion.count({
      where: { id_proveedor: req.params.id },
    });

    const cotizacionesPendientes = await Cotizacion.count({
      where: {
        id_proveedor: req.params.id,
        estado: 'pendiente',
      },
    });

    const cotizacionesAprobadas = await Cotizacion.count({
      where: {
        id_proveedor: req.params.id,
        estado: 'aprobada',
      },
    });

    const cotizacionesRechazadas = await Cotizacion.count({
      where: {
        id_proveedor: req.params.id,
        estado: 'rechazada',
      },
    });

    const totalFacturado = await Cotizacion.sum('total', {
      where: {
        id_proveedor: req.params.id,
        estado: 'aprobada',
      },
    });

    const proyectos = await Proyecto.findAll({
      include: [
        {
          model: Cotizacion,
          as: 'cotizacion',
          where: { id_proveedor: req.params.id },
        },
        {
          model: Evaluacion,
          as: 'evaluacion',
          required: false,
        },
      ],
    });

    const totalProyectos = proyectos.length;

    const proyectosCompletados = proyectos.filter(
      (proyecto) => proyecto.estado === 'completado'
    ).length;

    const evaluaciones = proyectos
      .filter((proyecto) => proyecto.evaluacion)
      .map((proyecto) => proyecto.evaluacion.rating);

    const ratingPromedio =
      evaluaciones.length > 0
        ? evaluaciones.reduce((acc, rating) => acc + rating, 0) / evaluaciones.length
        : 0;

    res.json({
      proveedor: {
        id_proveedor: proveedor.id_proveedor,
        nombre: proveedor.nombre,
        rtn: proveedor.rtn,
      },
      estadisticas: {
        total_cotizaciones: totalCotizaciones,
        cotizaciones_pendientes: cotizacionesPendientes,
        cotizaciones_aprobadas: cotizacionesAprobadas,
        cotizaciones_rechazadas: cotizacionesRechazadas,
        total_facturado: totalFacturado || 0,
        total_proyectos: totalProyectos,
        proyectos_completados: proyectosCompletados,
        rating_promedio: Number(ratingPromedio.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al obtener estadísticas del proveedor',
      detalle: error.message,
    });
  }
};

// GET /api/proveedores/validar-rtn/:rtn
const validarRtnProveedor = async (req, res) => {
  try {
    const { rtn } = req.params;

    const proveedor = await Proveedor.findOne({
      where: {
        rtn,
        ...whereActivo,
      },
    });

    res.json({
      existe: !!proveedor,
      data: proveedor,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al validar RTN del proveedor',
      detalle: error.message,
    });
  }
};

// POST /api/proveedores/:id/telefonos
const addTelefonoProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono } = req.body;

    if (!telefono) {
      return res.status(400).json({
        error: 'El teléfono es requerido',
      });
    }

    const proveedor = await Proveedor.findOne({
      where: {
        id_proveedor: id,
        ...whereActivo,
      },
    });

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    const telefonoExistente = await TelefonoProveedor.findOne({
      where: {
        id_proveedor: id,
        telefono,
      },
    });

    if (telefonoExistente) {
      return res.status(400).json({
        error: 'Este teléfono ya está registrado para este proveedor',
      });
    }

    const nuevoTelefono = await TelefonoProveedor.create({
      id_proveedor: id,
      telefono,
    });

    res.status(201).json({
      message: 'Teléfono agregado exitosamente',
      data: nuevoTelefono,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al agregar teléfono al proveedor',
      detalle: error.message,
    });
  }
};

// DELETE /api/proveedores/:id/telefonos/:telefono
const deleteTelefonoProveedor = async (req, res) => {
  try {
    const { id, telefono } = req.params;

    const proveedor = await Proveedor.findOne({
      where: {
        id_proveedor: id,
        ...whereActivo,
      },
    });

    if (!proveedor) {
      return res.status(404).json({
        error: 'Proveedor no encontrado o inactivo',
      });
    }

    const telefonoProveedor = await TelefonoProveedor.findOne({
      where: {
        id_proveedor: id,
        telefono,
      },
    });

    if (!telefonoProveedor) {
      return res.status(404).json({
        error: 'Teléfono no encontrado para este proveedor',
      });
    }

    await telefonoProveedor.destroy();

    res.json({
      message: 'Teléfono eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno al eliminar teléfono del proveedor',
      detalle: error.message,
    });
  }
};

module.exports = {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  getCotizacionesByProveedor,
  getProyectosByProveedor,
  getEstadisticasProveedor,
  validarRtnProveedor,
  addTelefonoProveedor,
  deleteTelefonoProveedor,
};