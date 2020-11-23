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

// GET /login
function loginForm(req, res, next) {       
  res.render('auth/login', { title: "Log In" });
};
// POST /login
async function login(req, res, next) {
  // Create object of any validation errors from the request.
  const errors = validationResult(req);
  // if errors send the errors and original request body back.
  if (!errors.isEmpty()) {
    res.render('auth/login', { user: req.body, errors: errors.array() });
  } else {
    User.findOne({where: {email: req.body.email}}).then((user) => {
      // the jwt and cookie each have their own expirations.
      user.role = "standard";
      const token = jwt.sign(
        { user: { id: user.id, username: user.username, role: user.role }}, 
        process.env.SECRET, 
        { expiresIn: '1y' }
      );
      // Assign the jwt to the cookie. 
      // Adding option secure: true only allows https. 
      // maxAge 3600000 is 1 hr (in milliseconds). Below is 1 year.
      res.cookie('jwt', token, { httpOnly: true, maxAge: 31536000000 });
      req.flash('success', 'You are logged in.');
      res.redirect('/');
    });
  }
};

// GET /logout
function logout(req, res, next) {
  res.clearCookie('jwt');
  req.flash('info', 'Logged out.');
  res.redirect('/');
};

// Form Validator & Sanitizer Middleware
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

function validateLogin() {return [
  // change email to lowercase, validate not empty.
  body('email')
  .not().isEmpty().withMessage('Email cannot be blank.')
  .normalizeEmail()
  // custom validator gets user object from DB from email, rejects if not present, compares user.password to hashed password from login.
  .custom((value, {req}) => {
    return User.findOne({where: {email: value}}).then(async (user) => {
      if (!user) {
        return Promise.reject('Email or Password are incorrect.');
      }
      const passwordIsValid = await bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) {
        throw new Error('Email or Password are incorrect.')
      }
      // if (user.activated === false) {
      //   throw new Error('Account not activated. Check your email for activation link.') 
      // }
    });
  }),
]}

module.exports = router;