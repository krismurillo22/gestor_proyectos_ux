'use strict';
const { Solicitud, Cliente, Cotizacion } = require('../models');

// GET /api/solicitudes
const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.findAll({
      include: [
        {
          model: Cliente,
          as: 'cliente',
        },
      ],
    });
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// GET /api/solicitudes/:id
const getSolicitudById = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByPk(req.params.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
        },
        {
          model: Cotizacion,
          as: 'cotizaciones',
        },
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
    const cliente = await Cliente.findByPk(req.params.id_cliente);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const solicitudes = await Solicitud.findAll({
      where: { id_cliente: req.params.id_cliente },
      include: [
        {
          model: Cotizacion,
          as: 'cotizaciones',
        },
      ],
    });

    res.json(solicitudes);
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

    const cliente = await Cliente.findByPk(id_cliente);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const solicitud = await Solicitud.create({
      id_cliente,
      descripcion,
      fecha: fecha || new Date(),
    });

    res.status(201).json({ message: 'Solicitud creada exitosamente', data: solicitud });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getSolicitudes,
  getSolicitudById,
  getSolicitudesByCliente,
  //getSolicitudesByFecha,
  //getSolicitudesByRango,
  createSolicitud,
  //updateSolicitud,
 // deleteSolicitud,
};