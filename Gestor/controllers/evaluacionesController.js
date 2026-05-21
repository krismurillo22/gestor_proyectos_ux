'use strict';

const { Evaluacion, Proyecto } = require('../models');

// GET /api/evaluaciones
const getEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await Evaluacion.findAll({
      include: [
        {
          model: Proyecto,
          as: 'proyecto',
        },
      ],
    });

    res.json(evaluaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/evaluaciones/:id
const getEvaluacionById = async (req, res) => {
  try {
    const evaluacion = await Evaluacion.findByPk(req.params.id, {
      include: [
        {
          model: Proyecto,
          as: 'proyecto',
        },
      ],
    });

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    res.json(evaluacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEvaluaciones,
  getEvaluacionById
};