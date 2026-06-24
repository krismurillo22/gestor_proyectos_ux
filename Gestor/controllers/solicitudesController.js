'use strict';

const { Solicitud, Cliente, Cotizacion, DetalleCotizacion, Proveedor } = require('../models');
const { Op } = require('sequelize');

// GET /api/solicitudes
const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.findAll({
      where: { activo: true },
      include: [{ model: Cliente, as: 'cliente' }],
    });

    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'No hay solicitudes registradas' });
    }

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/solicitudes/:id
const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const solicitud = await Solicitud.findOne({
      where: { id_solicitud: id, activo: true },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Cotizacion, as: 'cotizaciones' },
      ],
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/solicitudes/cliente/:id_cliente
const getSolicitudesByCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;

    if (isNaN(id_cliente) || id_cliente <= 0) {
      return res.status(400).json({ error: 'El ID del cliente debe ser un número entero positivo' });
    }

    const cliente = await Cliente.findOne({ where: { id_cliente, activo: true } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const solicitudes = await Solicitud.findAll({
      where: { id_cliente, activo: true },
      include: [{ model: Cotizacion, as: 'cotizaciones' }],
    });

    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Este cliente no tiene solicitudes registradas' });
    }

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/solicitudes/:id/cotizaciones
// Cotizaciones recibidas para una solicitud (vista de comparación en el front).
const getCotizacionesBySolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const solicitud = await Solicitud.findOne({ where: { id_solicitud: id, activo: true } });
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const cotizaciones = await Cotizacion.findAll({
      where: { id_solicitud: id },
      include: [
        { model: DetalleCotizacion, as: 'detalles' },
        { model: Proveedor, as: 'proveedor' },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (cotizaciones.length === 0) {
      return res.status(404).json({ error: 'Esta solicitud no tiene cotizaciones registradas' });
    }

    res.json(cotizaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/solicitudes
const createSolicitud = async (req, res) => {
  try {
    const { id_cliente, descripcion, fecha } = req.body;

    if (!id_cliente) {
      return res.status(400).json({ error: 'El id_cliente es requerido' });
    }

    if (isNaN(id_cliente) || id_cliente <= 0) {
      return res.status(400).json({ error: 'El id_cliente debe ser un número entero positivo' });
    }

    if (descripcion && descripcion.trim().length > 500) {
      return res.status(400).json({ error: 'La descripción no puede tener más de 500 caracteres' });
    }

    if (fecha && isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido' });
    }

    const cliente = await Cliente.findOne({ where: { id_cliente, activo: true } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const solicitud = await Solicitud.create({
      id_cliente,
      descripcion: descripcion?.trim(),
      fecha: fecha || new Date(),
      activo: true,
    });

    res.status(201).json({ message: 'Solicitud creada exitosamente', data: solicitud });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/solicitudes/:id
const updateSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const solicitud = await Solicitud.findOne({ where: { id_solicitud: id, activo: true } });
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const { id_cliente, descripcion, fecha } = req.body;

    if (id_cliente !== undefined) {
      if (isNaN(id_cliente) || id_cliente <= 0) {
        return res.status(400).json({ error: 'El id_cliente debe ser un número entero positivo' });
      }
      const cliente = await Cliente.findOne({ where: { id_cliente, activo: true } });
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
    }

    if (descripcion && descripcion.trim().length > 500) {
      return res.status(400).json({ error: 'La descripción no puede tener más de 500 caracteres' });
    }

    if (fecha && isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'La fecha no tiene un formato válido' });
    }

    await solicitud.update({
      id_cliente,
      descripcion: descripcion?.trim(),
      fecha,
    });

    res.json({ message: 'Solicitud actualizada exitosamente', data: solicitud });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/solicitudes/:id/desactivar
const desactivarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const solicitud = await Solicitud.findOne({ where: { id_solicitud: id, activo: true } });
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada o ya está desactivada' });
    }

    await solicitud.update({ activo: false });
    res.json({ message: 'Solicitud desactivada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSolicitudes,
  getSolicitudById,
  getSolicitudesByCliente,
  getCotizacionesBySolicitud,
  createSolicitud,
  updateSolicitud,
  desactivarSolicitud,
};