// GET /
exports.home = (req, res) => {
  res.render('pages/home', { title: 'appName' });
};

// GET /about
exports.about = (req, res) => {
  res.render('pages/about', { title: 'About' });
};