const { body, param, validationResult } = require('express-validator');

const manejarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ error: errores.array()[0].msg });
  }
  next();
};

const validarCrearCliente = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 255 }).withMessage('El nombre no puede tener más de 255 caracteres'),
  body('rtn')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{4}-\d{5}$/).withMessage('El RTN debe tener el formato 0000-0000-00000'),
  manejarErrores,
];

const validarActualizarCliente = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 255 }).withMessage('El nombre no puede tener más de 255 caracteres'),
  body('rtn')
    .optional({ nullable: true })
    .matches(/^\d{4}-\d{4}-\d{5}$/).withMessage('El RTN debe tener el formato 0000-0000-00000'),
  manejarErrores,
];

const validarId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  manejarErrores,
];

const validarCrearSolicitud = [
  body('id_cliente')
    .notEmpty().withMessage('El id_cliente es requerido')
    .isInt({ min: 1 }).withMessage('El id_cliente debe ser un número entero positivo'),
  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 500 }).withMessage('La descripción no puede tener más de 500 caracteres'),
  body('fecha')
    .optional()
    .isDate().withMessage('La fecha no tiene un formato válido'),
  manejarErrores,
];

const validarActualizarSolicitud = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  body('id_cliente')
    .optional()
    .isInt({ min: 1 }).withMessage('El id_cliente debe ser un número entero positivo'),
  body('descripcion')
    .optional({ nullable: true })
    .isLength({ max: 500 }).withMessage('La descripción no puede tener más de 500 caracteres'),
  body('fecha')
    .optional()
    .isDate().withMessage('La fecha no tiene un formato válido'),
  manejarErrores,
];

module.exports = {
  validarCrearCliente,
  validarActualizarCliente,
  validarId,
  validarCrearSolicitud,
  validarActualizarSolicitud,
};