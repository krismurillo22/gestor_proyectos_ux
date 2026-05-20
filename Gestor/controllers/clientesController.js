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



module.exports = {
  getClientes,
  /*getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,*/
};
