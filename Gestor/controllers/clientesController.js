'use strict';

const { Cliente, TelefonoCliente, Solicitud, Cotizacion, Proyecto } = require('../models');
const { Op } = require('sequelize');

// GET /api/clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { activo: true },
      include: [{ model: TelefonoCliente, as: 'telefonos' }],
    });

    if (clientes.length === 0) {
      return res.status(404).json({ error: 'No hay clientes registrados' });
    }

    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/clientes/:id
const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const cliente = await Cliente.findOne({
      where: { id_cliente: id, activo: true },
      include: [
        { model: TelefonoCliente, as: 'telefonos' },
        { model: Solicitud, as: 'solicitudes' },
      ],
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/clientes/buscar?nombre=Hernandez
const getClienteByNombre = async (req, res) => {
  try {
    const { nombre } = req.query;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const clientes = await Cliente.findAll({
      where: {
        nombre: { [Op.iLike]: `%${nombre.trim()}%` },
        activo: true,
      },
      include: [{ model: TelefonoCliente, as: 'telefonos' }],
    });

    if (clientes.length === 0) {
      return res.status(404).json({ error: `No se encontraron clientes con el nombre "${nombre}"` });
    }

    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/clientes/:id/historial
// Historial de proyectos del cliente: recorre Cliente -> Solicitud -> Cotizacion -> Proyecto
// y devuelve, por cada proyecto, su info junto con el total de la cotización que lo originó.
const getHistorialCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const cliente = await Cliente.findOne({ where: { id_cliente: id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const solicitudes = await Solicitud.findAll({
      where: { id_cliente: id },
      include: [{
        model: Cotizacion,
        as: 'cotizaciones',
        include: [{ model: Proyecto, as: 'proyecto' }],
      }],
    });

    const proyectos = [];
    solicitudes.forEach((solicitud) => {
      (solicitud.cotizaciones || []).forEach((cotizacion) => {
        if (cotizacion.proyecto) {
          proyectos.push({
            id_proyecto: cotizacion.proyecto.id_proyecto,
            descripcion: cotizacion.proyecto.descripcion,
            estado: cotizacion.proyecto.estado,
            fecha_inicio: cotizacion.proyecto.fecha_inicio,
            fecha_vencimiento: cotizacion.proyecto.fecha_vencimiento,
            fecha_fin_real: cotizacion.proyecto.fecha_fin_real,
            id_solicitud: solicitud.id_solicitud,
            id_cotizacion: cotizacion.id_cotizacion,
            total: cotizacion.total,
          });
        }
      });
    });

    res.json({
      cliente: { id_cliente: cliente.id_cliente, nombre: cliente.nombre },
      proyectos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/clientes
const createCliente = async (req, res) => {
  try {
    const { nombre, rtn, contacto, correo, telefono, direccion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (nombre.trim().length > 255) {
      return res.status(400).json({ error: 'El nombre no puede tener más de 255 caracteres' });
    }

    if (rtn && !/^\d{4}-\d{4}-\d{5}$/.test(rtn)) {
      return res.status(400).json({ error: 'El RTN debe tener el formato 0000-0000-00000' });
    }

    const clienteExistente = await Cliente.findOne({
      where: { nombre: { [Op.iLike]: nombre.trim() }, activo: true },
    });

    if (clienteExistente) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese nombre' });
    }

    if (rtn) {
      const rtnExistente = await Cliente.findOne({ where: { rtn, activo: true } });
      if (rtnExistente) {
        return res.status(409).json({ error: 'Ya existe un cliente con ese RTN' });
      }
    }

    const cliente = await Cliente.create({
      nombre: nombre.trim(),
      rtn,
      contacto: contacto?.trim() || null,
      correo: correo?.trim() || null,
      telefono: telefono?.trim() || null,
      direccion: direccion?.trim() || null,
      activo: true,
    });
    res.status(201).json({ message: 'Cliente creado exitosamente', data: cliente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/clientes/:id
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const cliente = await Cliente.findOne({ where: { id_cliente: id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const { nombre, rtn, contacto, correo, telefono, direccion } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (nombre.trim().length > 255) {
      return res.status(400).json({ error: 'El nombre no puede tener más de 255 caracteres' });
    }

    if (rtn && !/^\d{4}-\d{4}-\d{5}$/.test(rtn)) {
      return res.status(400).json({ error: 'El RTN debe tener el formato 0000-0000-00000' });
    }

    const nombreExistente = await Cliente.findOne({
      where: {
        nombre: { [Op.iLike]: nombre.trim() },
        id_cliente: { [Op.ne]: id },
        activo: true,
      },
    });

    if (nombreExistente) {
      return res.status(409).json({ error: 'Ya existe otro cliente con ese nombre' });
    }

    if (rtn) {
      const rtnExistente = await Cliente.findOne({
        where: { rtn, id_cliente: { [Op.ne]: id }, activo: true },
      });
      if (rtnExistente) {
        return res.status(409).json({ error: 'Ya existe otro cliente con ese RTN' });
      }
    }

    await cliente.update({
      nombre: nombre.trim(),
      rtn,
      contacto: contacto?.trim() || null,
      correo: correo?.trim() || null,
      telefono: telefono?.trim() || null,
      direccion: direccion?.trim() || null,
    });
    res.json({ message: 'Cliente actualizado exitosamente', data: cliente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/clientes/:id/desactivar
const desactivarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const cliente = await Cliente.findOne({ where: { id_cliente: id, activo: true } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado o ya está desactivado' });
    }

    const solicitudesActivas = await Solicitud.count({
      where: { id_cliente: id, activo: true },
    });

    if (solicitudesActivas > 0) {
      return res.status(409).json({ error: 'No se puede desactivar el cliente porque tiene solicitudes activas' });
    }

    await cliente.update({ activo: false });
    res.json({ message: 'Cliente desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  getClienteByNombre,
  getHistorialCliente,
  createCliente,
  updateCliente,
  desactivarCliente,
};
