const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard/kpis', dashboardController.getKpis);
router.get('/dashboard/cotizaciones-por-mes', dashboardController.getCotizacionesPorMes);
router.get('/dashboard/proyectos-proximos-vencer', dashboardController.getProyectosProximosVencer);

module.exports = router;
