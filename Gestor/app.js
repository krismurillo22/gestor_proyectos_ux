var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientesRouter = require('./routes/clientes');
var proveedoresRouter = require('./routes/proveedores');
var evaluacionesRouter = require('./routes/evaluaciones');
var solicitudesRouter = require('./routes/solicitudes');
var proyectosRouter = require('./routes/proyectos');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', clientesRouter);
app.use('/api', proveedoresRouter);
app.use('/api', evaluacionesRouter);
app.use('/api', solicitudesRouter);
app.use('/api', proyectosRouter);

const { sequelize, Cliente, Solicitud, Cotizacion, Proyecto } = require('./models');

module.exports = app;
