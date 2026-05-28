const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudesController');

router.get('/solicitudes', solicitudesController.getSolicitudes);
router.get('/solicitudes/cliente/:id_cliente', solicitudesController.getSolicitudesByCliente);
router.get('/solicitudes/:id', solicitudesController.getSolicitudById);
router.post('/solicitudes', solicitudesController.createSolicitud);
//router.put('/solicitudes/:id', solicitudesController.updateSolicitud);
//router.delete('/solicitudes/:id', solicitudesController.deleteSolicitud);

module.exports = router;