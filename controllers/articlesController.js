const { Article } = require('../models');
const createError = require('http-errors');
const { body, validationResult } = require('express-validator');

// Form Validator & Sanitizer Middleware
exports.validateForm = [
  body('title').trim().not().isEmpty().withMessage('Title is required.')
  .isLength({ max: 200 }).withMessage('Title should not exceed 200 characters.')
  .matches(/^[\w'",.!?\- ]+$/).withMessage(`Title should only contain letters, numbers, spaces, and '",.!?- characters.`),
  body('content').trim().escape()
  .isLength({ min: 3 }).withMessage('Article content must be at least 3 characters.')
  .isLength({ max: 5000 }).withMessage('Article content should not exceed 5000 characters.'),
]

// GET /articles
exports.list = async (req, res, next) => {
  try {
    const articles = await Article.findAll({ 
      // where: {published: true},
      order: [['createdAt', 'DESC']]
    });    
    // res.send(articles);
    res.render('articles/list', { title: 'Articles', articles: articles });
  } catch (err) {
    console.log('Error querying articles', JSON.stringify(err))
    // return res.send(err); // API response
    return next(err);
  }
};

// GET /articles/:id
exports.details = async (req, res, next) => { 
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      // return res.status(404).send('article not found');
      return next(createError(404));
    }
    // res.send(article);
    res.render('articles/details', { title: 'Article', article: article });    
  } catch (err) {
    console.log('Error querying article', JSON.stringify(err))
    // return res.send(err);
    return next(err);    
  }
};

// GET /articles/create
exports.createForm = (req, res, next) => {
  res.render('articles/create', { title: 'Create Article' });
};

// POST /articles/create
exports.create = async (req, res, next) => {
  // Check request's validation result. Wrap errors in an object with useful functions.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('articles/create', { article: req.body, errors: errors.array() });
  }
  try {
    const article = await Article.create(req.body);
    // res.send(article);
    // req.flash('success', 'Article has been created.');
    res.redirect(`/articles/${article.id}`);    
  } catch (err) {
    console.log('Error creating a article', JSON.stringify(article))
    // return res.status(400).send(err);
    return next(err);    
  }
};


// GET /articles/:id/update
exports.updateForm = async (req, res, next) => { 
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      // return res.status(404).send('article not found');
      return next(createError(404)); 
    }
    // res.send(article);
    res.render('articles/update', { title: 'Update Article', article: article  });    
  } catch (err) {
    console.log('Error finding article', JSON.stringify(err))
    // return res.send(err);
    return next(err);    
  }
};

// POST /articles/:id/update
exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('articles/update', { article: req.body, errors: errors.array() });
  }
  try {
    const id = parseInt(req.params.id);
    const article = await Article.findByPk(id);    
    const { title, content, published } = req.body;
    await article.update({ title, content, published });
    // res.send(contact);
    res.redirect(`/articles/${id}`); 
  } catch (err) {
    console.log('Error updating article', JSON.stringify(err));
    // res.status(400).send(err);
    return next(err);    
  }
};

// GET /articles/:id/delete
exports.deleteForm = async (req, res, next) => {
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
};

// POST articles/:id/delete
exports.delete = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const article = await Article.findByPk(id);    
    await article.destroy();
    // res.send({ id });
    //req.flash('info', 'Article has been deleted.');
    res.redirect('/articles');
  } catch (err) {
    console.log('Error deleting article', JSON.stringify(err))
    // res.status(400).send(err);
    return next(err);    
  }
};