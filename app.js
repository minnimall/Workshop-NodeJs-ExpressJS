var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config()
require('./db.js')
const verifyToken = require('./middleware/auth.js')
const responeHelper = require('./utils/response.js')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product.js');
var orderRouter = require('./routes/order.js');

var app = express();
app.set('json spaces',2)
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(responeHelper)

app.use('/api/v1', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', verifyToken, productRouter);
app.use('/api/v1/orders', verifyToken, orderRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({
    status: err.status || 500,
    message: err.message,
    data: null
  });
});

module.exports = app;
