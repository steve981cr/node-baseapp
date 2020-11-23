const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.isLoggedIn = (req, res, next) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.SECRET);
    next();
  } catch(err) {
    console.log(err.name + ': ' + err.message);
    res.redirect('/auth/login'); 
  }
}

exports.isAdmin = async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.SECRET);
    const currentUser = await User.findById(decoded.user.id);
    if ((!currentUser.role) || currentUser.role !== 'admin') {
      throw (new Error('Unauthorized'));
    }
    next();
  } catch (err) {
    console.log(err.name + ': ' + err.message);
    if (err.name === 'JsonWebTokenError') {
      res.redirect('/auth/login');
    } else {
      res.redirect('/');
    }
  }
}

exports.isCorrectUser = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.cookies.jwt, process.env.SECRET);
    if (req.params.id !== decoded.user.id) {
      res.redirect('/');
      throw new Error('Unauthorized');      
    }
    next();
  } catch (err) {
    console.log(err.name + ': ' + err.message);
    if (err.name === 'JsonWebTokenError') {
      res.redirect('/auth/login');
    } else {
      res.redirect('/');
    }
  }
}