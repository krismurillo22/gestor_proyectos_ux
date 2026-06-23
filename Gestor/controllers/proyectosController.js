'use strict';

const { Proyecto, Cotizacion, Evaluacion, Solicitud, Proveedor, Cliente, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helpers de validación de fechas y estados
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Debe coincidir exactamente con el ENUM real de la columna Proyectos.estado
// (ver models/proyecto.js y la migración add-pendiente-to-proyecto-estado).
// No existe 'control_calidad': el control de calidad final se hace
// registrando la Evaluacion antes de pasar a 'completado'.
const estadosValidos = ['pendiente', 'en_progreso', 'completado', 'cancelado', 'vencido'];

// Include reutilizable para que el front tenga, sin una segunda llamada, todo
// lo que necesita mostrar en el kanban/detalle de órdenes de trabajo: el
// nombre del proveedor (taller) y del cliente que originó el trabajo, además
// de la evaluación final si ya existe.
function buildProyectoIncludes() {
  return [
    {
      model: Cotizacion,
      as: 'cotizacion',
      include: [
        { model: Proveedor, as: 'proveedor' },
        {
          model: Solicitud,
          as: 'solicitud',
          include: [{ model: Cliente, as: 'cliente' }],
        },
      ],
    },
    { model: Evaluacion, as: 'evaluacion', required: false },
  ];
}

const isValidDateString = (s) => typeof s === 'string' && DATE_RE.test(s) && !Number.isNaN(new Date(s).getTime());
const toDateOnly = (s) => {
    const d = new Date(s);
    d.setHours(0, 0, 0, 0);
    return d;
};
const isPositiveInteger = (v) => {
    if (v === undefined || v === null) return false;
    const n = Number(v);
    return Number.isInteger(n) && n > 0;
};

// GET /api/proyectos?estado=&id_cliente=&id_proveedor=
// id_cliente e id_proveedor filtran a través de la cotización asociada
// (Proyecto -> Cotizacion -> Proveedor, y Proyecto -> Cotizacion -> Solicitud -> Cliente).
const getProyectos = async (req, res) => {
    try {
        const { estado, id_cliente, id_proveedor } = req.query;
        const where = {};

        if (estado) {
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({ error: 'Estado inválido. Los valores permitidos son: ' + estadosValidos.join(', ') });
            }
            where.estado = estado;
        }

        if (id_proveedor !== undefined && !isPositiveInteger(id_proveedor)) {
            return res.status(400).json({ error: 'id_proveedor debe ser un número entero positivo' });
        }
        if (id_cliente !== undefined && !isPositiveInteger(id_cliente)) {
            return res.status(400).json({ error: 'id_cliente debe ser un número entero positivo' });
        }

        const includes = buildProyectoIncludes();
        const cotizacionInclude = includes[0];

        if (id_proveedor !== undefined) {
            cotizacionInclude.where = { id_proveedor };
            cotizacionInclude.required = true;
        }

        if (id_cliente !== undefined) {
            const solicitudInclude = cotizacionInclude.include.find((i) => i.as === 'solicitud');
            solicitudInclude.where = { id_cliente };
            solicitudInclude.required = true;
            cotizacionInclude.required = true;
        }

        const proyectos = await Proyecto.findAll({
            where,
            include: includes,
        });

        // Importante: devolver siempre un arreglo (aunque esté vacío), no un
        // objeto { message: ... } — el front espera Proyecto[] para mapearlo
        // directo en el kanban, y con la base de datos recién creada (sin
        // datos todavía) este es el caso normal, no un error.
        res.json(proyectos);
    } catch(error){
        console.error('Error en getProyectos:', error);
        res.status(500).json({error: 'Error interno al listar proyectos' });
    }
};

// GET /api/proyectos/:id
const getProyectoById = async (req,res) => {
    try {
        const id = req.params.id;
        if (!isPositiveInteger(id)){
            return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
        }

        const proyecto = await Proyecto.findOne({
            where: {id_proyecto: id},
            include: buildProyectoIncludes(),
        });
        if (!proyecto){
            return res.status(404).json({error: `El proyecto con ID ${id} no existe` });
        }
        res.json(proyecto);
    }catch (error) {
        console.error('Error en getProyectoById:', error);
        res.status(500).json({error: 'Error interno al obtener proyecto' });
    }
};

// PATCH /api/proyectos/:id/estado
const updateProyectoEstado = async (req,res) => {
    const {estado} = req.body;
    const {id} = req.params;

    if (!isPositiveInteger(id)){
        return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
    }

    if (!estado || !estadosValidos.includes(estado)){
        return res.status(400).json({
            error: 'El estado debe ser uno de: ' + estadosValidos.join(', ')
        });
    }
    try {
        const proyecto = await Proyecto.findOne({
            where: {
                id_proyecto: id
            }
        });
        if (!proyecto) {
            return res.status(404).json({ error: `El proyecto con ID ${id} no existe`});
        }

        proyecto.estado = estado;
        await proyecto.save();

        res.json({
            message: `Estado del proyecto actualizado a '${estado}'`,
            proyecto
        });
    } catch (error) {
        console.error('Error en updateProyectoEstado:', error);
        res.status(500).json({error: 'Error interno al actualizar estado' });
    }
};

// PATCH /api/proyectos/:id/desactivar  (reemplaza DELETE)
// No borra el registro, solo marca como 'cancelado'
const desactivarProyecto = async(req,res) => {
    try{
        const {id} = req.params;
        if (!isPositiveInteger(id)){
            return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
        }

        const proyecto = await Proyecto.findOne({
            where: { id_proyecto: id}
        });

        if (!proyecto){
            return res.status(404).json({ error: `El proyecto con ID ${id} no existe`});
        }

        if (proyecto.estado === 'cancelado'){
            return res.status(400).json({ error: 'El proyecto ya está cancelado' });
        }

        proyecto.estado = 'cancelado';
        await proyecto.save();

        res.json({ message: 'Proyecto desactivado (estado cancelado) exitosamente', proyecto });
    } catch (error){
        console.error('Error en desactivarProyecto:', error);
        res.status(500).json({error: 'Error interno al desactivar proyecto' });
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

        // Campos obligatorios
        if (!id_cotizacion || !fecha_inicio || !fecha_vencimiento){
            return res.status(400).json({ error: "Complete los campos obligatorios: id_cotizacion, fecha_inicio, fecha_vencimiento" });
        }

        // Validar existencia de cotización
        // OJO: la PK real de Cotizacion es id_cotizacion, no id (ver
        // models/cotizacion.js) — usar { id: ... } aquí hacía que esta
        // consulta fallara siempre con un error de columna inexistente.
        const cot = await Cotizacion.findOne({ where: { id_cotizacion } });
        if (!cot){
            return res.status(404).json({ error: `La cotización con ID ${id_cotizacion} no existe` });
        }

        // Validar estado
        if (estado && !estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado invalido. Debe ser uno de: " + estadosValidos.join(', ') });
        }

        // Validar fechas (formato)
        if (!isValidDateString(fecha_inicio) || !isValidDateString(fecha_vencimiento)){
            return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
        }

        const inicio = toDateOnly(fecha_inicio);
        const venc = toDateOnly(fecha_vencimiento);
        const hoy = toDateOnly(new Date().toISOString().slice(0,10));

        // fecha_inicio no puede ser anterior a hoy
        if (inicio < hoy){
            return res.status(400).json({ error: "fecha_inicio no puede ser anterior a hoy" });
        }

        // fecha_vencimiento debe ser posterior a fecha_inicio
        if (venc <= inicio){
            return res.status(400).json({ error: "fecha_vencimiento debe ser posterior a fecha_inicio" });
        }

        // fecha_fin_real (si se provee) validar formato y rango
        if (fecha_fin_real !== undefined && fecha_fin_real !== null){
            if (!isValidDateString(fecha_fin_real)){
                return res.status(400).json({ error: "Formato de fecha_fin_real inválido. Use YYYY-MM-DD o null" });
            }
            const finReal = toDateOnly(fecha_fin_real);
            if (finReal < inicio){
                return res.status(400).json({ error: "fecha_fin_real no puede ser anterior a fecha_inicio" });
            }
            if (finReal > venc){
                return res.status(400).json({ error: "fecha_fin_real no puede ser posterior a fecha_vencimiento" });
            }
        }

        const proyecto = await Proyecto.create({
            id_cotizacion,
            descripcion,
            fecha_inicio,
            fecha_vencimiento,
            fecha_fin_real: fecha_fin_real ?? null,
            estado: estado || 'pendiente'
        });

        res.status(201).json({
            message: 'Proyecto creado exitosamente',
            data: proyecto
        });
    }catch (error){
        console.error('Error en createProyecto:', error);
        res.status(500).json({error: 'Error interno al crear proyecto' });
    }
};

// GET /proyectos/filtrar
const filtrarProyecto = async(req,res) =>{
    try{
        const {estado, descripcion, fecha_inicio, fecha_fin} = req.query;
        const where = {};

        if (estado){
            if (!estadosValidos.includes(estado)){
                return res.status(400).json({ error: 'Estado inválido. Los valores permitidos son: ' + estadosValidos.join(', ') });
            }
            where.estado = estado;
        }

        // Buscar descripción de forma case-insensitive y compatible con distintos motores
        if (descripcion) {
            where[Op.and] = where[Op.and] || [];
            where[Op.and].push(
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('descripcion')),
                    'LIKE',
                    `%${descripcion.toLowerCase()}%`
                )
            );
        }

        // Validar formatos de fechas de filtro
        if (fecha_inicio && !isValidDateString(fecha_inicio)){
            return res.status(400).json({ error: "Formato de fecha_inicio inválido. Use YYYY-MM-DD" });
        }
        if (fecha_fin && !isValidDateString(fecha_fin)){
            return res.status(400).json({ error: "Formato de fecha_fin inválido. Use YYYY-MM-DD" });
        }

        // fecha_inicio = fecha mínima de inicio, fecha_fin = fecha máxima de vencimiento
        if (fecha_inicio) {
            where.fecha_inicio = { [Op.gte]: fecha_inicio };
        }
        if (fecha_fin) {
            where.fecha_vencimiento = where.fecha_vencimiento
                ? { ...where.fecha_vencimiento, [Op.lte]: fecha_fin }
                : { [Op.lte]: fecha_fin };
        }

        const proyectos = await Proyecto.findAll({ where });

        if (!proyectos || proyectos.length === 0) {
            return res.json({ message: 'No hay resultados' });
        }

        res.json(proyectos);
    }catch(error){
        console.error('Error en filtrarProyecto:', error);
        res.status(500).json({error: 'Error interno al filtrar proyectos' });
    }
};

// GET /proyectos/activos
const getProyectosActivos = async (req,res)=>{
    try{
        const proyectos = await Proyecto.findAll({where: {estado: 'en_progreso'}});

        if (!proyectos || proyectos.length === 0) {
            return res.json({ message: 'No hay resultados' });
        }

        res.json(proyectos);
    }catch(error){
        console.error('Error en getProyectosActivos:', error);
        res.status(500).json({error: 'Error interno al listar proyectos activos' });
    }
};

// GET /api/proyectos/estadisticas
const estadisticasProyectos = async(req,res) =>{
    try{
        const total = await Proyecto.count();
        const porEstado = await Proyecto.findAll({
            attributes: ['estado', [sequelize.fn('COUNT', sequelize.col('estado')), 'cantidad']],
            group: ['estado'],
            raw: true,
        });

        res.json({
            total,
            porEstado,
        });
    }catch(error){
        console.error('Error en estadisticasProyectos:', error);
        res.status(500).json({error: 'Error interno al calcular estadísticas de proyectos' });
    }
};

// GET /proyectos/:id/cotizaciones
const getCotizacionesProyecto = async(req,res) => {
    try{
        const {id} = req.params;
        if (!isPositiveInteger(id)){
            return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
        }

        // Intentamos traer la cotización vía asociación primero (si está definida)
        const proyecto = await Proyecto.findOne({
            where: {id_proyecto: id},
            include: [{ model: Cotizacion, as: 'cotizacion' }]
        });

        if (!proyecto) {
            return res.status(404).json({ error: `El proyecto con ID ${id} no existe` });
        }

        let resultados = [];

        if (proyecto.cotizacion) {
            resultados = Array.isArray(proyecto.cotizacion) ? proyecto.cotizacion : [proyecto.cotizacion];
        } else {
            // Fallback (la PK de Cotizacion es id_cotizacion, no id)
            const cotizacion = await Cotizacion.findOne({
                where: { id_cotizacion: proyecto.id_cotizacion }
            });
            if (cotizacion) resultados = [cotizacion];
        }

        if (resultados.length === 0) {
            return res.json({ message: 'No hay resultados' });
        }

        res.json(resultados);
    }catch(error){
        console.error('Error en getCotizacionesProyecto:', error);
        res.status(500).json({error: 'Error interno al obtener cotizaciones del proyecto' });
    }
};

// GET /proyectos/:id/evaluaciones
const getEvaluacionesProyecto = async(req, res) => {
    try{
        const {id} = req.params;
        if (!isPositiveInteger(id)){
            return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
        }

        const proyecto = await Proyecto.findOne({ where: { id_proyecto: id } });
        if (!proyecto) return res.status(404).json({ error: `El proyecto con ID ${id} no existe` });

        const evaluaciones = await Evaluacion.findAll({where: {id_proyecto: id}});

        if (!evaluaciones || evaluaciones.length === 0) {
            return res.json({ message: 'No hay resultados' });
        }

        res.json(evaluaciones);
    } catch (error){
        console.error('Error en getEvaluacionesProyecto:', error);
        res.status(500).json({error: 'Error interno al obtener evaluaciones' });
    }
};

// PATCH /api/proyectos/:id  (actualización parcial)
const updateProyecto = async(req,res) => {
    try {
        const {id} = req.params;
        if (!isPositiveInteger(id)){
            return res.status(400).json({ error: "El ID debe ser un número entero positivo" });
        }

        const {id_cotizacion, descripcion, fecha_inicio, fecha_vencimiento, fecha_fin_real, estado} = req.body;

        const proyecto = await Proyecto.findOne({where: {id_proyecto: id}});
        if(!proyecto){
            return res.status(404).json({error: `El proyecto con ID ${id} no existe`});
        }

        // Si se proporciona id_cotizacion, verificar existencia
        // (mismo fix que en createProyecto: la PK es id_cotizacion, no id)
        if (id_cotizacion){
            const cot = await Cotizacion.findOne({ where: { id_cotizacion } });
            if (!cot){
                return res.status(404).json({ error: `La cotización con ID ${id_cotizacion} no existe` });
            }
        }

        // Validar estado si se proporciona
        if (estado && !estadosValidos.includes(estado)){
            return res.status(400).json({ error: "Estado invalido. Debe ser uno de: " + estadosValidos.join(', ') });
        }

        // Validar fechas si se proporcionan
        let inicio = proyecto.fecha_inicio ? toDateOnly(proyecto.fecha_inicio) : null;
        let venc = proyecto.fecha_vencimiento ? toDateOnly(proyecto.fecha_vencimiento) : null;

        if (fecha_inicio){
            if (!isValidDateString(fecha_inicio)){
                return res.status(400).json({ error: "Formato de fecha_inicio inválido. Use YYYY-MM-DD" });
            }
            inicio = toDateOnly(fecha_inicio);
        }
        if (fecha_vencimiento){
            if (!isValidDateString(fecha_vencimiento)){
                return res.status(400).json({ error: "Formato de fecha_vencimiento inválido. Use YYYY-MM-DD" });
            }
            venc = toDateOnly(fecha_vencimiento);
        }

        if (inicio && venc && venc <= inicio){
            return res.status(400).json({ error: "fecha_vencimiento debe ser posterior a fecha_inicio" });
        }

        if (fecha_fin_real !== undefined && fecha_fin_real !== null){
            if (!isValidDateString(fecha_fin_real)){
                return res.status(400).json({ error: "Formato de fecha_fin_real inválido. Use YYYY-MM-DD o null" });
            }
            const finReal = toDateOnly(fecha_fin_real);
            if (inicio && finReal < inicio){
                return res.status(400).json({ error: "fecha_fin_real no puede ser anterior a fecha_inicio" });
            }
            if (venc && finReal > venc){
                return res.status(400).json({ error: "fecha_fin_real no puede ser posterior a fecha_vencimiento" });
            }
        }

        await proyecto.update({
            id_cotizacion: id_cotizacion ?? proyecto.id_cotizacion,
            descripcion: descripcion ?? proyecto.descripcion,
            fecha_inicio: fecha_inicio ?? proyecto.fecha_inicio,
            fecha_vencimiento: fecha_vencimiento ?? proyecto.fecha_vencimiento,
            fecha_fin_real: fecha_fin_real ?? proyecto.fecha_fin_real,
            estado: estado ?? proyecto.estado,
        });

        res.json({message: 'Proyecto actualizado exitosamente', proyecto});
    } catch (error){
        console.error('Error en updateProyecto:', error);
        res.status(500).json({error: 'Error interno al actualizar proyecto' });
    }
};

module.exports = {
    getProyectos,
    getProyectoById,
    updateProyectoEstado,
    desactivarProyecto,
    createProyecto,
    filtrarProyecto,
    getProyectosActivos,
    estadisticasProyectos,
    getCotizacionesProyecto,
    getEvaluacionesProyecto,
    updateProyecto
};
