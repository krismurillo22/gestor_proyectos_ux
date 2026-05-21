const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');

router.get('/proyectos', proyectosController.getProyectos);
router.get('/proyectos', proyectosController.getProyectoById);
router.put('/proyectos/:id/estado', proyectosController.updateProyectoEstado);
router.delete('/proyectos/:id', proyectosController.deleteProyecto);

module.exports = router;