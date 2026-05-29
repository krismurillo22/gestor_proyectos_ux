const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');

router.post('/cotizaciones', cotizacionesController.crearCotizacion);

router.get('/cotizaciones/:id', cotizacionesController.obtenerCotizacionPorId);

router.put('/cotizaciones/:id/aprobar', cotizacionesController.aprobarCotizacion);

router.put('/cotizaciones/:id/rechazar', cotizacionesController.rechazarCotizacion);

router.put('/cotizaciones/:id', cotizacionesController.modificarCotizacion);

module.exports = router;