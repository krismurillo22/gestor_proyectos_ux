var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const swaggerSetup = require('./config/swagger');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientesRouter = require('./routes/clientes');
var proveedoresRouter = require('./routes/proveedores');
var evaluacionesRouter = require('./routes/evaluaciones');
var solicitudesRouter = require('./routes/solicitudes');
var proyectosRouter = require('./routes/proyectos');
var cotizacionesRouter = require('./routes/cotizaciones');
var dashboardRouter = require('./routes/dashboard');

var app = express();

// Sin esto el front (Vite, normalmente http://localhost:5173) recibe un
// error "blocked by CORS policy" al llamar a este backend desde el navegador.
// Abierto a cualquier origen porque es un proyecto de clase; si esto llega a
// producción, restringir a la URL real del front.
app.use(cors());

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
app.use('/api', cotizacionesRouter);
app.use('/api', dashboardRouter);

swaggerSetup(app);

const { sequelize, Cliente, Solicitud, Cotizacion, Proyecto } = require('./models');

module.exports = app;
