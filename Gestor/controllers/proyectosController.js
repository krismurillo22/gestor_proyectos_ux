'use strict';

const { Proyecto, Cotizacion } = require('../models');

// GET /api/proyectos
const getProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll({
            include: [
                {
                    model: Cotizacion,
                    as: 'cotizacion'
                },
            ],
        });
        res.json(proyectos);
    } catch(error){
        res.status(500).json({error: error.message });
    }
};

// GET /api/proyectos/:id
const getProyectoById = async (req,res) => {
    try {
        const id = req.params.id;

        const proyecto = await Proyecto.findOne({
            where: {id_proyecto: id},
            include: [
                {
                    model: Cotizacion,
                    as: 'cotizacion'
                }
            ]
        });
        if (!proyecto){
            return res.status(404).json({error: 'Proyecto no encontrado' });
        }
        res.json(proyecto);
    }catch (error) {
        res.status(500).json({error: error.message });
    }
};

module.exports = {
    getProyectos,
    getProyectoById
};