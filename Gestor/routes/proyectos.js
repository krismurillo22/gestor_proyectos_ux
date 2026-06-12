const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');

router.get('/proyectos/filtrar', proyectosController.filtrarProyecto);
router.get('/proyectos/activos', proyectosController.getProyectosActivos);
router.get('/proyectos/estadisticas', proyectosController.estadisticasProyectos);
router.get('/proyectos', proyectosController.getProyectos);
router.post('/proyectos', proyectosController.createProyecto);
router.get('/proyectos/:id/cotizaciones', proyectosController.getCotizacionesProyecto);
router.get('/proyectos/:id/evaluaciones', proyectosController.getEvaluacionesProyecto);
router.put('/proyectos/:id/estado', proyectosController.updateProyectoEstado);
router.get('/proyectos/:id', proyectosController.getProyectoById);
router.put('/proyectos/:id', proyectosController.updateProyecto);
router.delete('/proyectos/:id', proyectosController.deleteProyecto);

module.exports = router;