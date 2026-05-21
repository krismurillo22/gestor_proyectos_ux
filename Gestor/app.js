var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientesRouter = require('./routes/clientes');
var proveedoresRouter = require('./routes/proveedores');
//var solicitudesRouter = require('./routes/solicitudes');

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
//app.use('/api', solicitudesRouter);

const { sequelize, Cliente, Solicitud, Cotizacion } = require('./models');

module.exports = app;
