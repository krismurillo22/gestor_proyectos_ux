'use strict';

const { Proyecto, Cotizacion, Solicitud, Cliente, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/dashboard/kpis
// Devuelve: proyectos activos, solicitudes pendientes, nuevos clientes del mes
// e ingresos del mes.
//
// OJO sobre "ingresosMes": hoy no existe un campo fecha_aprobacion en Cotizacion,
// así que se usa updatedAt como proxy de "cuándo se aprobó" (se actualiza cuando
// aprobarCotizacion cambia el estado). Si más adelante se necesita precisión,
// conviene agregar un campo fecha_aprobacion dedicado.
//
// OJO sobre "solicitudesPendientes": antes este KPI contaba Cotizaciones en
// estado 'pendiente' (cotizacionesPendientes), pero eso cuenta una solicitud
// con varios talleres cotizando (sus cotizaciones "hermanas") como varias
// pendientes en vez de una sola — confuso para Jorge incluso después de que
// aprobar una descarta a las demás (mientras nadie aprueba, las hermanas
// siguen sin descartar y siguen contando). Ahora se cuenta por Solicitud:
// una solicitud activa está "pendiente" mientras ninguna de sus cotizaciones
// haya sido aprobada (sin importar cuántos talleres estén cotizando), a
// pedido de Jorge, 2026-06-24.
const getKpis = async (req, res) => {
    try {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const finMes = new Date(inicioMes);
        finMes.setMonth(finMes.getMonth() + 1);

        const proyectosActivos = await Proyecto.count({ where: { estado: 'en_progreso' } });

        const solicitudesPendientes = await Solicitud.count({
            where: {
                activo: true,
                id_solicitud: {
                    [Op.notIn]: sequelize.literal(
                        `(SELECT id_solicitud FROM "Cotizaciones" WHERE estado = 'aprobada')`
                    ),
                },
            },
        });

        const nuevosClientes = await Cliente.count({
            where: { createdAt: { [Op.gte]: inicioMes, [Op.lt]: finMes } },
        });

        const ingresosMes = await Cotizacion.sum('total', {
            where: {
                estado: 'aprobada',
                updatedAt: { [Op.gte]: inicioMes, [Op.lt]: finMes },
            },
        });

        res.json({
            proyectosActivos,
            solicitudesPendientes,
            nuevosClientes,
            ingresosMes: ingresosMes || 0,
        });
    } catch (error) {
        console.error('Error en getKpis:', error);
        res.status(500).json({ error: 'Error interno al calcular KPIs' });
    }
};

// GET /api/dashboard/cotizaciones-por-mes?meses=6
// Serie histórica: cuántas cotizaciones se crearon vs. cuántas terminaron aprobadas,
// agrupadas por mes de creación (createdAt). Por defecto trae los últimos 6 meses.
const getCotizacionesPorMes = async (req, res) => {
    try {
        const meses = Number(req.query.meses) > 0 ? Number(req.query.meses) : 6;

        const desde = new Date();
        desde.setDate(1);
        desde.setHours(0, 0, 0, 0);
        desde.setMonth(desde.getMonth() - (meses - 1));

        const mesExpr = sequelize.fn('to_char', sequelize.col('createdAt'), 'YYYY-MM');

        const filas = await Cotizacion.findAll({
            attributes: [
                [mesExpr, 'mes'],
                [sequelize.fn('COUNT', sequelize.col('id_cotizacion')), 'cotizadas'],
                [sequelize.literal(`COUNT(CASE WHEN "estado" = 'aprobada' THEN 1 END)`), 'aprobadas'],
            ],
            where: { createdAt: { [Op.gte]: desde } },
            group: [mesExpr],
            order: [[mesExpr, 'ASC']],
            raw: true,
        });

        res.json(filas.map((f) => ({
            mes: f.mes,
            cotizadas: Number(f.cotizadas),
            aprobadas: Number(f.aprobadas),
        })));
    } catch (error) {
        console.error('Error en getCotizacionesPorMes:', error);
        res.status(500).json({ error: 'Error interno al calcular cotizaciones por mes' });
    }
};

// GET /api/dashboard/proyectos-proximos-vencer?dias=60
// Proyectos en_progreso cuya fecha_vencimiento cae dentro de los próximos N días
// (por defecto 60, ~2 meses, a pedido de Jorge — 2026-06-24), ordenados del
// más urgente al menos urgente. Incluye cotizacion->solicitud->cliente para
// que el front pueda mostrar el nombre del cliente sin tener que pedir el
// detalle completo de cada proyecto.
const getProyectosProximosVencer = async (req, res) => {
    try {
        const dias = Number(req.query.dias) > 0 ? Number(req.query.dias) : 60;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const limite = new Date(hoy);
        limite.setDate(limite.getDate() + dias);

        const proyectos = await Proyecto.findAll({
            where: {
                estado: { [Op.in]: ['pendiente', 'en_progreso'] },
                fecha_vencimiento: { [Op.gte]: hoy, [Op.lte]: limite },
            },
            include: [
                {
                    model: Cotizacion,
                    as: 'cotizacion',
                    include: [{ model: Solicitud, as: 'solicitud', include: [{ model: Cliente, as: 'cliente' }] }],
                },
            ],
            order: [['fecha_vencimiento', 'ASC']],
        });

        res.json(proyectos);
    } catch (error) {
        console.error('Error en getProyectosProximosVencer:', error);
        res.status(500).json({ error: 'Error interno al obtener proyectos próximos a vencer' });
    }
};

module.exports = {
    getKpis,
    getCotizacionesPorMes,
    getProyectosProximosVencer,
};