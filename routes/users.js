const express = require('express');
const router = express.Router();
const { User } = require('../models');
const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// Users routes
router.get('/', list);
router.get('/:id', detail);
router.get('/:id/update', updateForm);
router.post('/:id/update', validateForm(), update);
router.get('/:id/delete', deleteForm);
router.post('/:id/delete', destroy);

// Users Controller Functions
// GET /users
async function list(req, res, next) {
  const users = await User.findAll({
    attributes: ['id', 'username', 'email'],
    order: [['username', 'ASC']]
  });
  try {
    res.render('users/list', { title: 'Users', users: users });
  } catch (err) {
    return next(err);
  }
}

// GET /users/:id
async function detail(req, res, next) { 
  try {
    const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'username', 'email']});
    if (!user) {
      return next(createError(404)); 
    }
    res.render('users/details', { title: 'User', user: user });    
  } catch (err) {
    return next(err);    
  }
}

// GET /users/:id/update
async function updateForm(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {attributes: ['id', 'username', 'email']});
    if (!user) {
      return next(createError(404)); 
    }
    res.render('users/update', { title: 'Update Account', user: user });    
  } catch (err) {
    return next(err);    
  }
}

// POST /users/:id/update
async function update(req, res, next) {
  const id = parseInt(req.params.id);
  // Create form data variable that adds in id and excludes password.
  const formData = {
    username: req.body.username,
    email: req.body.email,
    id: id
  }; 
  // Create object of any validation errors from the request.
  const errors = validationResult(req);
  // if errors send the errors and submitted form data body back.
  if (!errors.isEmpty()) {
    return res.render('users/update', { title: 'Update Account', user: formData, errors: errors.array() });
  }
  try {
    const user = await User.findByPk(id);
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.update(req.body)
    req.flash('success', 'Account Updated.');
    res.redirect(`/users/${id}`); 
  } catch (err) {
    return next(err);    
  }
}

// GET /users/:id/delete
async function deleteForm(req, res, next) {
  const user = await User.findByPk(req.params.id);
  try {
    if (!user) { return next(createError(404)) }
    res.render('users/delete', { title: 'Delete Account', user: user });    
  } catch (err) {
    return next(err);    
  }
};
// POST /users/:id/delete
async function destroy(req, res, next) {
  const id = parseInt(req.params.id);
  const user = await User.findByPk(id);
  try {
    await user.destroy();
    req.flash('info', 'Account Deleted.');
    res.redirect('/');
  } catch (err) {
    return next(err);    
  }
};

// Form Validator & Sanitizer Middleware
function validateForm() {return [
  // Validate username not empty.
  body('username').trim().not().isEmpty().withMessage('Username cannot be blank.'),
  // Change email to lowercase, validate not empty, valid format, is not in use if changed.
  body('email')
    .not().isEmpty().withMessage('Email cannot be blank.')
    .isEmail().withMessage('Email format is invalid.')
    .normalizeEmail()
    // Validate that a changed email is not already in use.
    .custom(async (value, { req }) => {
      const user = await User.findOne({where: {email: value}});
      if (user && user.id != req.params.id) {
        return Promise.reject('Email is already in use');
      }
    }),
  // Validate password is at least 6 chars long, matches password confirmation if changed.
  body('password')
    .isLength({ min: 6 }).optional({ checkFalsy: true })
    .withMessage('Password must be at least 6 characters.')
    .optional({ checkFalsy: true }).custom((value, { req }) => {
      if (value != req.body.passwordConfirmation) {
        throw new Error('Password confirmation does not match password');
      }
      // Indicates the success of this synchronous custom validator
      return true;    
    }
  ),
]}

module.exports = router;