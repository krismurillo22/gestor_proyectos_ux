'use strict';

const { Proveedor, TelefonoProveedor, Cotizacion } = require('../models');

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

module.exports = {
  getProveedores,
  getProveedorById
};