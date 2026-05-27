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

module.exports = {
  getSolicitudes,
  //getSolicitudById,
  //getSolicitudesByCliente,
  //getSolicitudesByFecha,
  //getSolicitudesByRango,
  //createSolicitud,
  //updateSolicitud,
 // deleteSolicitud,
};