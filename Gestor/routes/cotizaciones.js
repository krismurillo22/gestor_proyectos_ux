const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');

router.get('/cotizaciones', cotizacionesController.listarCotizaciones);

router.post('/cotizaciones', cotizacionesController.crearCotizacion);

router.get('/cotizaciones/:id', cotizacionesController.obtenerCotizacionPorId);

router.put('/cotizaciones/:id/aprobar', cotizacionesController.aprobarCotizacion);

router.put('/cotizaciones/:id/rechazar', cotizacionesController.rechazarCotizacion);

router.patch('/cotizaciones/:id/enviar-a-cliente', cotizacionesController.enviarACliente);

router.put('/cotizaciones/:id', cotizacionesController.modificarCotizacion);

module.exports = router;
