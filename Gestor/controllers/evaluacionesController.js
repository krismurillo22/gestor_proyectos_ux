'use strict';

const { Evaluacion, Proyecto, Cotizacion, Proveedor } = require('../models');

const { Op } = require('sequelize');

const INACTIVA_PREFIX = '[INACTIVA]';

const whereActiva = {
  [Op.or]: [
    { descripcion: null },
    { descripcion: { [Op.notLike]: `${INACTIVA_PREFIX}%` } },
  ],
};

const estaInactiva = (evaluacion) => {
  return evaluacion.descripcion?.startsWith(INACTIVA_PREFIX);
};

// GET /api/evaluaciones
const getEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await Evaluacion.findAll({
      where: whereActiva,
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
      const evaluacion = await Evaluacion.findOne({
        where: {
          id_proyecto: req.params.id,
          ...whereActiva,
        },
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

    if (!evaluacion || estaInactiva(evaluacion)) {
      return res.status(404).json({ error: 'Evaluación no encontrada o inactiva' });
    }

    const { rating, descripcion } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'El rating debe estar entre 1 y 5',
      });
    }

    await evaluacion.update({
      ...(rating !== undefined && { rating }),
      ...(descripcion !== undefined && { descripcion }),
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

    if (estaInactiva(evaluacion)) {
      return res.status(400).json({ error: 'La evaluación ya está inactiva' });
    }

    await evaluacion.update({
      descripcion: `${INACTIVA_PREFIX} ${evaluacion.descripcion || 'Evaluación desactivada'}`,
    });

    res.json({
      message: 'Evaluación desactivada exitosamente',
      data: evaluacion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/evaluaciones/proyecto/:id_proyecto
const getEvaluacionByProyecto = async (req, res) => {
  try {
    const { id_proyecto } = req.params;
    const evaluacion = await Evaluacion.findOne({
      where: {
        id_proyecto,
        ...whereActiva,
      },
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

    const evaluacion = await Evaluacion.findOne({
      where: {
        id_proyecto,
        ...whereActiva,
      },
    });

    res.json({
      existe: !!evaluacion,
      id_proyecto: Number(id_proyecto),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/evaluaciones/proveedor/:id_proveedor/promedio
const getPromedioProveedor = async (req, res) => {
  try {
    const { id_proveedor } = req.params;

    const proveedor = await Proveedor.findByPk(id_proveedor);

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const evaluaciones = await Evaluacion.findAll({
      where: whereActiva,
      include: [
        {
          model: Proyecto,
          as: 'proyecto',
          required: true,
          include: [
            {
              model: Cotizacion,
              as: 'cotizacion',
              required: true,
              where: { id_proveedor },
            },
          ],
        },
      ],
    });

    const totalEvaluaciones = evaluaciones.length;

    const promedio =
      totalEvaluaciones > 0
        ? evaluaciones.reduce((acc, item) => acc + item.rating, 0) / totalEvaluaciones
        : 0;

    res.json({
      id_proveedor: Number(id_proveedor),
      proveedor: proveedor.nombre,
      rating_promedio: Number(promedio.toFixed(2)),
      total_evaluaciones: totalEvaluaciones,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/evaluaciones/ranking/proveedores
const getRankingProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      include: [
        {
          model: Cotizacion,
          as: 'cotizaciones',
          required: false,
          include: [
            {
              model: Proyecto,
              as: 'proyecto',
              required: false,
              include: [
                {
                  model: Evaluacion,
                  as: 'evaluacion',
                  required: false,
                  where: whereActiva,
                },
              ],
            },
          ],
        },
      ],
    });

    const ranking = proveedores.map((proveedor) => {
      const evaluaciones = [];

      proveedor.cotizaciones.forEach((cotizacion) => {
        if (cotizacion.proyecto && cotizacion.proyecto.evaluacion) {
          evaluaciones.push(cotizacion.proyecto.evaluacion.rating);
        }
      });

      const totalEvaluaciones = evaluaciones.length;

      const promedio =
        totalEvaluaciones > 0
          ? evaluaciones.reduce((acc, rating) => acc + rating, 0) / totalEvaluaciones
          : 0;

      return {
        id_proveedor: proveedor.id_proveedor,
        proveedor: proveedor.nombre,
        rtn: proveedor.rtn,
        rating_promedio: Number(promedio.toFixed(2)),
        total_evaluaciones: totalEvaluaciones,
      };
    });

    ranking.sort((a, b) => b.rating_promedio - a.rating_promedio);

    res.json(ranking);
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
  getPromedioProveedor,
  getRankingProveedores,
};