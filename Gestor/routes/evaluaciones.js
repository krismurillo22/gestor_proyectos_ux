const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluacionesController');

router.get('/evaluaciones', evaluacionesController.getEvaluaciones);
router.get('/evaluaciones/:id', evaluacionesController.getEvaluacionById);

module.exports = router;