const express = require('express');
const router = express.Router();
const proyectosController = require('../controllers/proyectosController');

router.get('/proyectos', proyectosController.getProyectos);
router.get('/proyectos/:id', proyectosController.getProyectoById);

module.exports = router;