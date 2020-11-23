const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const articlesRouter = require('./routes/articles');

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

// Add current user to local storage
const getCurrentUser = (token) => {
  if (token) {
    let decoded = jwt.verify(token, process.env.SECRET);
    const user = decoded.user || '';
    return user;
  }
}
app.use((req, res, next) => {
  res.locals.currentUser = getCurrentUser(req.cookies.jwt);
  next();
});

// Router middleware
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/articles', articlesRouter);

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