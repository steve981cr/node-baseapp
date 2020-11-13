const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();

const router = require('./routes/index');

// Instantiate an express app object. 
const app = express();

console.log("Listening on port " + process.env.PORT);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Chain Express and 3rd Party middleware layers to the app.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: process.env.SECRET, saveUninitialized: true, resave: false }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
// Router level middleware defined in routes/index.js
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('pages/error');
});

module.exports = app;