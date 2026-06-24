const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const {
  validarCrearCliente,
  validarActualizarCliente,
  validarId,
} = require('../middlewares/validaciones');

router.get('/clientes', clientesController.getClientes);
router.get('/clientes/buscar', clientesController.getClienteByNombre);
router.get('/clientes/:id/historial', validarId, clientesController.getHistorialCliente);
router.get('/clientes/:id', validarId, clientesController.getClienteById);
router.post('/clientes', validarCrearCliente, clientesController.createCliente);
router.patch('/clientes/:id', validarActualizarCliente, clientesController.updateCliente);
router.patch('/clientes/:id/desactivar', validarId, clientesController.desactivarCliente);

module.exports = router;
