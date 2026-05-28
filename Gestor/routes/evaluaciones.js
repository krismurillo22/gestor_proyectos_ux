const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluacionesController');

router.get('/evaluaciones', evaluacionesController.getEvaluaciones);
router.get('/evaluaciones/:id', evaluacionesController.getEvaluacionById);
router.post('/evaluaciones', evaluacionesController.createEvaluacion);
router.put('/evaluaciones/:id', evaluacionesController.updateEvaluacion);
router.delete('/evaluaciones/:id', evaluacionesController.deleteEvaluacion);
router.get('/evaluaciones/proyecto/:id_proyecto', evaluacionesController.getEvaluacionByProyecto);
router.get('/evaluaciones/proyecto/:id_proyecto/existe', evaluacionesController.existeEvaluacionProyecto);
router.get('/evaluaciones/proveedor/:id_proveedor/promedio', evaluacionesController.getPromedioProveedor);
router.get('/evaluaciones/ranking/proveedores', evaluacionesController.getRankingProveedores);

module.exports = router;