const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudesController');
const {
  validarCrearSolicitud,
  validarActualizarSolicitud,
  validarId,
} = require('../middlewares/validaciones');

router.get('/solicitudes', solicitudesController.getSolicitudes);
router.get('/solicitudes/cliente/:id_cliente', solicitudesController.getSolicitudesByCliente);
router.get('/solicitudes/:id', validarId, solicitudesController.getSolicitudById);
router.post('/solicitudes', validarCrearSolicitud, solicitudesController.createSolicitud);
router.patch('/solicitudes/:id', validarActualizarSolicitud, solicitudesController.updateSolicitud);
router.patch('/solicitudes/:id/desactivar', validarId, solicitudesController.desactivarSolicitud);

module.exports = router;