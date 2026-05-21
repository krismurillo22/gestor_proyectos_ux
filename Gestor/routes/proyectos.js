const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');

router.get('/proyectos', proyectosController.getProyectos);
router.get('/proyectos/:id', proyectosController.getProyectoById);
router.put('/proyectos/:id/estado', proyectosController.updateProyectoEstado);
router.delete('/proyectos/:id', proyectosController.deleteProyecto);
router.post('/proyectos', proyectosController.createProyecto);

module.exports = router;