const express = require('express');
const router = express.Router();
const { User } = require('../models');
const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Auth routes
router.get('/signup', signupForm);
router.post('/signup', validateSignup(), signup);
router.get('/login', loginForm);
router.post('/login', validateLogin(), login);
router.get('/logout', logout);

// Users Controller Functions
// GET /signup
function signupForm(req, res, next) {
  res.render('auth/signup', { title: 'Signup' });
};

// POST /signup
async function signup(req, res, next) {
  /* Process Validation Result: 
      Create object of any validation errors from the request.
      If errors, send the errors and original request body back.
  */   
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/signup', { title: 'Signup', user: req.body, errors: errors.array() });
  }
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create(req.body);
    req.flash('success', 'Account Created.');
    res.redirect(`/users/${newUser.id}`);
  } catch (err) {
    next(err);
  }
};

function loginForm(req, res, next) {};
function login(req, res, next) {};
function logout(req, res, next) {};

// Form Validator & Sanitizer Middleware Placeholders
function validateSignup() {
  return [
    // validate username not empty.
    body('username').trim().not().isEmpty().withMessage('Username cannot be blank.'),
    // change email to lowercase, validate not empty, valid format, not in use.
    body('email')
      .not().isEmpty().withMessage('Email cannot be blank.')
      .isEmail().withMessage('Email format is invalid.')
      .normalizeEmail()
      .custom(async (value) => {
        const user = await User.findOne({where: {email: value}});
        if (user) {
          return Promise.reject('Email is already in use');
        }
      }),
    // Validate password at least 6 chars, passwordConfirmation matches password.
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
      .custom((value, { req }) => {
        if (value !== req.body.passwordConfirmation) {
          throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;    
      }
    )  
  ];
}
function validateLogin() {return []}

module.exports = router;