'use strict';

const { Cliente, TelefonoCliente, Solicitud } = require('../models');

// GET /api/clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [
        {
          model: TelefonoCliente,
          as: 'telefonos',
        },
      ],
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// GET /api/clientes/:id
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        {
          model: TelefonoCliente,
          as: 'telefonos',
        },
        {
          model: Solicitud,
          as: 'solicitudes',
        },
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


module.exports = {
  getClientes,
  getClienteById,
  //createCliente,
  //updateCliente,
  //deleteCliente,
};
