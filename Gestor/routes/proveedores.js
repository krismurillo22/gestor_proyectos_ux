const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/proveedores', proveedoresController.getProveedores);
router.get('/proveedores/:id', proveedoresController.getProveedorById);
router.post('/proveedores', proveedoresController.createProveedor);
router.put('/proveedores/:id', proveedoresController.updateProveedor);

module.exports = router;