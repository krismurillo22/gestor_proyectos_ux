'use strict';

const { Evaluacion, Proyecto, Cotizacion, Proveedor } = require('../models');

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

// POST /api/evaluaciones
const createEvaluacion = async (req, res) => {
  try {
    const { id_proyecto, rating, descripcion } = req.body;

    if (!id_proyecto) {
      return res.status(400).json({ error: 'El id_proyecto es requerido' });
    }

    if (!rating) {
      return res.status(400).json({ error: 'El rating es requerido' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'El rating debe estar entre 1 y 5',
      });
    }

    const proyecto = await Proyecto.findByPk(id_proyecto);

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const evaluacionExistente = await Evaluacion.findByPk(id_proyecto);

    if (evaluacionExistente) {
      return res.status(400).json({
        error: 'Este proyecto ya tiene una evaluación registrada',
      });
    }

    const evaluacion = await Evaluacion.create({
      id_proyecto,
      rating,
      descripcion,
    });

    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      data: evaluacion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/evaluaciones/:id
const updateEvaluacion = async (req, res) => {
  try {
    const evaluacion = await Evaluacion.findByPk(req.params.id);

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    const { rating, descripcion } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'El rating debe estar entre 1 y 5',
      });
    }

    await evaluacion.update({
      rating,
      descripcion,
    });

    res.json({
      message: 'Evaluación actualizada exitosamente',
      data: evaluacion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/evaluaciones/:id
const deleteEvaluacion = async (req, res) => {
  try {
    const evaluacion = await Evaluacion.findByPk(req.params.id);

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    await evaluacion.destroy();

    res.json({ message: 'Evaluación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/evaluaciones/proyecto/:id_proyecto
const getEvaluacionByProyecto = async (req, res) => {
  try {
    const { id_proyecto } = req.params;

    const evaluacion = await Evaluacion.findOne({
      where: { id_proyecto },
      include: [
        {
          model: Proyecto,
          as: 'proyecto',
        },
      ],
    });

    if (!evaluacion) {
      return res.status(404).json({
        error: 'Este proyecto no tiene evaluación registrada',
      });
    }

    res.json(evaluacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/evaluaciones/proyecto/:id_proyecto/existe
const existeEvaluacionProyecto = async (req, res) => {
  try {
    const { id_proyecto } = req.params;

    const evaluacion = await Evaluacion.findByPk(id_proyecto);

    res.json({
      existe: !!evaluacion,
      id_proyecto: Number(id_proyecto),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEvaluaciones,
  getEvaluacionById,
  createEvaluacion,
  updateEvaluacion,
  deleteEvaluacion,
  getEvaluacionByProyecto,
  existeEvaluacionProyecto,
};