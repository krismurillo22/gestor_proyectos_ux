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
router.patch('/proyectos/:id/estado', proyectosController.updateProyectoEstado); 
router.patch('/proyectos/:id', proyectosController.updateProyecto); 
router.patch('/proyectos/:id/desactivar', proyectosController.desactivarProyecto); 
router.delete('/proyectos/:id', proyectosController.desactivarProyecto);
router.get('/proyectos/:id', proyectosController.getProyectoById);

module.exports = router;