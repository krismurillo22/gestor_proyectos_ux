'use strict';

const { Proveedor, TelefonoProveedor, Cotizacion, Proyecto, Evaluacion } = require('../models');

// GET /api/proveedores
const getProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      include: [
        {
          model: TelefonoProveedor,
          as: 'telefonos',
        },
      ],
    });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/proveedores/:id
const getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id, {
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
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/proveedores
const createProveedor = async (req, res) => {
  try {
    const { nombre, rtn } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const proveedor = await Proveedor.create({ nombre, rtn });

    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/proveedores/:id
const updateProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const { nombre, rtn } = req.body;

    await proveedor.update({ nombre, rtn });

    res.json({
      message: 'Proveedor actualizado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/proveedores/:id
const deleteProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const cotizaciones = await Cotizacion.count({
      where: { id_proveedor: req.params.id },
    });

    if (cotizaciones > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el proveedor porque tiene cotizaciones registradas',
      });
    }

    await proveedor.destroy();

    res.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/proveedores/:id/cotizaciones
const getCotizacionesByProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const cotizaciones = await Cotizacion.findAll({
      where: { id_proveedor: req.params.id },
      order: [['id_cotizacion', 'DESC']],
    });

    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/proveedores/:id/proyectos
const getProyectosByProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
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

    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/proveedores/:id/estadisticas
const getEstadisticasProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
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
    res.status(500).json({ error: error.message });
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
};