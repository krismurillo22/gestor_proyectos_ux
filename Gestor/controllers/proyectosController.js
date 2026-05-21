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

module.exports = {
    getProyectos
};