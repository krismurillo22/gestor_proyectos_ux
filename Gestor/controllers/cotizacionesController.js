// Controlador de cotizaciones
// Método: crear una nueva cotización con sus ítems de detalle
// Expectativa del body (JSON):
// {
//   id_solicitud: number,
//   id_proveedor: number,
//   total: number,
//   estado: string,
//   detalles: [ { producto_id, cantidad, precio_unitario, descripcion_item }, ... ]
// }


const { Cotizacion, DetalleCotizacion } = require('../models');

// Estados posibles para cotizaciones
const ESTADOS_COTIZACION = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada'
};

async function crearCotizacion(req, res) {
  try {
    const { id_solicitud, id_proveedor, total, estado, detalles } = req.body;

    // Validaciones básicas
    if (!id_solicitud || !id_proveedor || total == null || !Array.isArray(detalles)) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos requeridos o formato inválido.' });
    }

    // Crear cotización principal
    const nuevaCotizacion = await Cotizacion.create({
      id_solicitud,
      id_proveedor,
      total,
      estado,
      fecha: new Date()
    });

    // Crear detalles asociados
    const detallesToCreate = detalles.map(d => ({
      cotizacion_id: nuevaCotizacion.id,
      producto_id: d.producto_id || null,
      cantidad: d.cantidad || 0,
      precio_unitario: d.precio_unitario || 0,
      descripcion: d.descripcion_item || null
    }));

  
    return res.status(201).json({ ok: true, cotizacion: nuevaCotizacion, estado: nuevaCotizacion.estado });
  } catch (error) {
    console.error('Error creando cotización:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno creando cotización.' });
  }
}

async function obtenerCotizacionPorId(req, res) {
  try {
    const { id } = req.params;

    // Validación básica
    if (!id) {
      return res.status(400).json({ ok: false, msg: 'ID de cotización requerido.' });
    }

    // Buscar cotización con sus detalles
    const cotizacion = await Cotizacion.findByPk(id, {
      include: [{ model: DetalleCotizacion, as: 'detalles' }]
    });

    if (!cotizacion) {
      return res.status(404).json({ ok: false, msg: 'Cotización no encontrada.' });
    }

    return res.status(200).json({ ok: true, cotizacion });
  } catch (error) {
    console.error('Error obteniendo cotización:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno obteniendo cotización.' });
  }
}

// PUT: Aprobar una cotización por ID (cambiar estado a 'aprobada')
async function aprobarCotizacion(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, msg: 'ID de cotización requerido.' });
    }

    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      return res.status(404).json({ ok: false, msg: 'Cotización no encontrada.' });
    }

    cotizacion.estado = ESTADOS_COTIZACION.APROBADA;
    await cotizacion.save();

    return res.status(200).json({ ok: true, cotizacion });
  } catch (error) {
    console.error('Error aprobando cotización:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno aprobando cotización.' });
  }
}

// PUT: Rechazar una cotización por ID (cambiar estado a 'rechazada')
async function rechazarCotizacion(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, msg: 'ID de cotización requerido.' });
    }

    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) {
      return res.status(404).json({ ok: false, msg: 'Cotización no encontrada.' });
    }

    cotizacion.estado = ESTADOS_COTIZACION.RECHAZADA;
    await cotizacion.save();

    return res.status(200).json({ ok: true, cotizacion });
  } catch (error) {
    console.error('Error rechazando cotización:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno rechazando cotización.' });
  }
}

//module.exports = { crearCotizacion, obtenerCotizacionPorId, aprobarCotizacion, rechazarCotizacion };

// PUT: Modificar una cotización por ID (incluye reemplazo de detalles)
async function modificarCotizacion(req, res) {
  try {
    const { id } = req.params;
    const { id_solicitud, id_proveedor, total, estado, detalles } = req.body;

    if (!id) return res.status(400).json({ ok: false, msg: 'ID de cotización requerido.' });

    const cotizacion = await Cotizacion.findByPk(id);
    if (!cotizacion) return res.status(404).json({ ok: false, msg: 'Cotización no encontrada.' });

    // Actualizar campos si vienen en el body
    if (id_solicitud !== undefined) cotizacion.id_solicitud = id_solicitud;
    if (id_proveedor !== undefined) cotizacion.id_proveedor = id_proveedor;
    if (total !== undefined) cotizacion.total = total;
    if (estado !== undefined) cotizacion.estado = estado;

    await cotizacion.save();

    // Si vienen detalles, reemplazarlos: eliminar existentes y crear los nuevos
    if (Array.isArray(detalles)) {
      await DetalleCotizacion.destroy({ where: { cotizacion_id: cotizacion.id } });

      const detallesToCreate = detalles.map(d => ({
        cotizacion_id: cotizacion.id,
        producto_id: d.producto_id || null,
        cantidad: d.cantidad || 0,
        precio_unitario: d.precio_unitario || 0,
        descripcion: d.descripcion_item || null
      }));

      if (detallesToCreate.length) {
        await DetalleCotizacion.bulkCreate(detallesToCreate);
      }
    }

    // Obtener cotizacion actualizada con sus detalles
    const cotizacionActualizada = await Cotizacion.findByPk(cotizacion.id, {
      include: [{ model: DetalleCotizacion, as: 'detalles' }]
    });

    return res.status(200).json({ ok: true, cotizacion: cotizacionActualizada });
  } catch (error) {
    console.error('Error modificando cotización:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno modificando cotización.' });
  }
}

module.exports = { crearCotizacion, obtenerCotizacionPorId, aprobarCotizacion, rechazarCotizacion, modificarCotizacion };
