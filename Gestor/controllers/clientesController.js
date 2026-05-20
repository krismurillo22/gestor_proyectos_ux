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
// POST /api/clientes
const createCliente = async (req, res) => {
  try {
    const { nombre, rtn } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const cliente = await Cliente.create({ nombre, rtn });
    res.status(201).json({ message: 'Cliente creado exitosamente', data: cliente });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// PUT /api/clientes/:id
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const { nombre, rtn } = req.body;
    await cliente.update({ nombre, rtn });
    res.json({ message: 'Cliente actualizado exitosamente', data: cliente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// DELETE /api/clientes/:id
const deleteCliente = async (req, res) => {
   try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const solicitudes = await Solicitud.count({
      where: { id_cliente: req.params.id },
    });

    if (solicitudes > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene solicitudes registradas'
      });
    }

    await cliente.destroy();
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
