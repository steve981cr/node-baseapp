const express = require('express');
const router = express.Router();

// Pages routes
router.get('/', home);
router.get('/about', about);

// Pages Controller Functions
// GET /
function home(req, res) {
  res.render('pages/home', { title: 'Node BaseApp' });
};
// GET /about
function about(req, res) {
  res.render('pages/about', { title: 'About' });
};

module.exports = router;