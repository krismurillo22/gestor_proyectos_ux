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

module.exports = {
  getProveedores,
  getProveedorById,
  createProveedor
};