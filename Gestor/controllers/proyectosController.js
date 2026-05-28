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


// PUT /api/proyectos/:id/estado
const updateProyectoEstado = async (req,res) => {
    const estadosValidos = ['en_progreso', 'completado','cancelado','vencido'];
    const {estado} = req.body;
    const {id} = req.params;

    if (!estadosValidos.includes(estado)){
        return res.status(400).json({
            error: 'Estado invalido.'
        });
    }
    try {
        const proyecto = await Proyecto.findOne({
            where: {
                id_proyecto: id
            }
        });
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado'});
        }

        proyecto.estado = estado;
        await proyecto.save();

        res.json({
            mensaje: `Estado del proyecto actualizado a '${estado}'`,
            proyecto
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// DELETE /api/proyectos/:id
const deleteProyecto = async(req,res) => {
    try{
        const {id} = req.params;

        const proyecto = await Proyecto.findOne({
            where: { id_proyecto: id}
        });

        if (!proyecto){
            return res.status(404).json({ error: 'Proyecto no encontrado'});
        }

        await proyecto.destroy();
        res.json({ mensaje: 'Proyecto eliminado exitosamente. '});
    } catch (error){
        res.status(500).json({error: error.message});
    }
};
      
      
// POST /api/proyectos
const createProyecto = async(req,res) => {
    try{
        const {
            id_cotizacion,
            descripcion,
            fecha_inicio,
            fecha_vencimiento,
            fecha_fin_real,
            estado
        } = req.body;

        if(!id_cotizacion || !fecha_inicio || !fecha_vencimiento){
            return res.status(400).json({ error: "Complete los campos obligatorios"});
        }

        const estadosValidos = ['en_progreso','completado','cancelado','vencido'];
        if (estado && !estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado invalido."});
        }

        const proyecto = await Proyecto.create({
            id_cotizacion,
            descripcion,
            fecha_inicio,
            fecha_vencimiento,
            fecha_fin_real,
            estado: estado || undefined
        });

        res.status(201).json(proyecto);
    }catch (error){
        res.status(500).json({error: error.message});
    }
};

// GET /proyectos/activos
const getProyectosActivos = async (req,res)=>{
    try{
        const proyectos = await Proyecto.findAll({where: {estado: 'en_progreso',},});
        res.json(proyectos);
    }catch(error){
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    getProyectos,
    getProyectoById,
    updateProyectoEstado,
    deleteProyecto,
    createProyecto,
    getProyectosActivos
};