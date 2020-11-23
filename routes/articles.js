const express = require('express');
const router = express.Router();
const { Article, User } = require('../models');
const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const auth = require('./authMiddleware');
 
// Articles routes
router.get('/', list);
router.get('/create', auth.isLoggedIn, createForm);
router.post('/create', auth.isLoggedIn, validateForm(), create);
router.get('/:id', detail);
router.get('/:id/update', updateForm);
router.post('/:id/update', validateForm(), update);
router.get('/:id/delete', deleteForm);
router.post('/:id/delete', destroy);

// Articles Controller Functions (i.e., router callback/handler functions)
// Optionally, put these in a controllers/articlesController.js file and import it.
// GET /articles
async function list(req, res, next) {
  try {
    const articles = await Article.findAll({ 
      where: {published: true},
      attributes: ['id', 'title', 'published', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });    
    // res.send(articles);
    res.render('articles/list', { title: 'Articles', articles: articles });
  } catch (err) {
    console.log('Error querying articles', JSON.stringify(err));
    // return res.send(err); // API response
    return next(err);
  }
}

// GET /articles/:id
async function detail(req, res, next) { 
  try {
    const article = await Article.findByPk(req.params.id, {include: User});
    if (!article) {
      // return res.status(404).send('article not found');
      return next(createError(404));
    }
    // res.send(article);
    res.render('articles/detail', { title: 'Article', 
      article: article });    
  } catch (err) {
    console.log('Error querying article', JSON.stringify(err))
    // return res.send(err);
    return next(err);    
  }
}

// GET /articles/create
function createForm(req, res, next) {
  res.render('articles/create', { title: 'Create Article' });
}

// POST /articles/create
async function create(req, res, next) {
  // Check request's validation result. Wrap errors in an object.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('articles/create', { title: 'Create Article', 
      article: req.body, errors: errors.array() });
  }
  try {
    // const article = await Article.create(req.body);
    const article = Article.build(req.body);
    article.userId = res.locals.currentUser.id;
    await article.save();
    // res.send(article);
    req.flash('success', 'Article has been created.');
    res.redirect(`/articles/${article.id}`);    
  } catch (err) {
    console.log('Error creating a article', JSON.stringify(article))
    // return res.status(400).send(err);
    return next(err);    
  }
}

// GET /articles/:id/update
async function updateForm(req, res, next) { 
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      // return res.status(404).send('article not found');
      return next(createError(404)); 
    }
    // res.send(article);
    res.render('articles/update', { title: 'Update Article', 
      article: article  });    
  } catch (err) {
    console.log('Error finding article', JSON.stringify(err))
    // return res.send(err);
    return next(err);    
  }
}

// POST /articles/:id/update
async function update(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('articles/update', { title: 'Update Article', article: req.body, errors: errors.array() });
  }
  try {
    const id = parseInt(req.params.id);
    const article = await Article.findByPk(id);    
    const { title, content, published } = req.body;
    await article.update({ title, content, published });
    // res.send(contact);
    req.flash('info', 'Article has been updated.');
    res.redirect(`/articles/${id}`); 
  } catch (err) {
    console.log('Error updating article', JSON.stringify(err));
    // res.status(400).send(err);
    return next(err);    
  }
}

// GET /articles/:id/delete
async function deleteForm(req, res, next) {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      // return res.status(404).send('article not found');
      return next(createError(404)); 
    }
    // res.send(article);
    res.render('articles/delete', { title: 'Delete Article', article: article });    
  } catch (err) {
    console.log('Error finding article', JSON.stringify(err));
    // return res.send(err);
    return next(err);    
  }
}

// POST articles/:id/delete
async function destroy(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const article = await Article.findByPk(id);    
    await article.destroy();
    // res.send({ id });
    req.flash('info', 'Article has been deleted.');
    res.redirect('/articles');
  } catch (err) {
    console.log('Error deleting article', JSON.stringify(err))
    // res.status(400).send(err);
    return next(err);    
  }
}


// Form Validator & Sanitizer Middleware
// To make it a variable instead of a function, move it above the routes and assign it:
//   const validateForm = [...];
//   Then in the router function change validateForm() to validateForm.
function validateForm() {
  return [
    body('title').trim().not().isEmpty()
    .withMessage('Title is required.').isLength({ max: 200 })
    .withMessage('Title should not exceed 200 characters.')
    .matches(/^[\w'",.!?\- ]+$/)
    .withMessage(`Title should only contain letters, numbers, spaces, and '",.!?- characters.`),
    body('content').trim().escape().isLength({ min: 3 })
    .withMessage('Article content must be at least 3 characters.')
    .isLength({ max: 5000 })
    .withMessage('Article content should not exceed 5000 characters.'),
  ]
}

module.exports = router;