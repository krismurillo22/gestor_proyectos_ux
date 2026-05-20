const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/clientes', clientesController.getClientes);
router.get('/clientes/:id', clientesController.getClienteById);
router.post('/clientes', clientesController.createCliente);
router.put('/clientes/:id', clientesController.updateCliente);
router.delete('/clientes/:id', clientesController.deleteCliente);

module.exports = router;
