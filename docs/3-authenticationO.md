







<code>// controllers/authController.js 
const bcrypt = require('bcrypt');
const User = require('../models/user');

// GET /signup
exports.signupPage = (req, res, next) => {
  res.render('auth/signup', { title: 'Signup' });
};

// POST /signup
exports.signup = async (req, res, next) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create(req.body);
    req.flash('success', 'Account Created.');
    res.redirect(`/users/${newUser._id}`);
  } catch (err) {
    next(err);
  }
};
</code>
<code>// controllers/usersController.js 
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const User = require('../models/user');

// GET /users
exports.list = (req, res, next) => {
  User.find()
  // User.find({activated: true}) adds a condition
    .sort({'username': 'asc'})
    .limit(50)
    .select('_id username email')
    .exec((err, users) => {
      if (err) { 
        next(err); 
      } else {
        res.render('users/list', { title: 'Users', users: users });
      }
    });
};

// GET /users/:id
exports.details = (req, res, next) => { 
  User.findById(req.params.id, (err, user) => {
    // if id not found mongoose throws CastError. 
    if (err || !user) {
      next(createError(404));
    } else {
      res.render('users/details', { title: 'User', user: user });
    }
  });
};

// GET /users/:id/update
exports.updatePage = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    // if id not found throws CastError. 
    if (err || !user) { 
      next(createError(404));
    } else {
      res.render('users/update', { title: 'Update User', user: user });
    }
  });
};

// POST /users/:id/update
exports.update = async (req, res, next) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {new: true, runValidators: true}
    );
    req.flash('success', 'Account Updated.');
    res.redirect(`/users/${user._id}`);
  } catch (err) {
    next(err);
  }
};

// GET /users/:id/delete
exports.deletePage = (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    // if id not found throws CastError. 
    if (err || !user) {
      next(createError(404));
    } else {
      res.render('users/delete', { title: 'Delete Account', user: user });
    }
  });
};

// POST users/:id/delete
exports.delete = (req, res, next) => {
  User.findByIdAndRemove(req.body.id, (err) => {
    if (err) { 
      next(err); 
    } else {
      req.flash('info', 'Account Deleted.');
      res.redirect('/');   
    }
  })
};</code>

<h4 id='views'>Views</h4>
Add navbar links for users and signup.
<code>// views/layouts/header.ejs 
&lt;nav&gt;
  &lt;a href=&quot;/&quot;&gt;Home&lt;/a&gt;
  &lt;a href=&quot;/protected&quot;&gt;protected&lt;/a&gt;
  &lt;a href=&quot;/users&quot;&gt;users&lt;/a&gt;
  &lt;a href=&quot;/signup&quot;&gt;signup&lt;/a&gt;
&lt;/nav&gt;
</code>

Add user views.
<code>// views/auth/signup.ejs
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;Sign Up&lt;/h1&gt;

&lt;% include ../layouts/form-errors %&gt;

&lt;form method=&quot;POST&quot; action=&quot;/signup&quot;&gt;
  &lt;div&gt;
    &lt;label for=&quot;username&quot;&gt;Username&lt;/label&gt;
    &lt;input type=&quot;text&quot; name=&quot;username&quot; value=&quot;&lt;%= typeof user === 'undefined' ? '' : user.username %&gt;&quot; maxlength=&quot;50&quot; required autofocus&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;label for=&quot;email&quot;&gt;Email&lt;/label&gt;
    &lt;input type=&quot;email&quot; name=&quot;email&quot; value=&quot;&lt;%= typeof user === 'undefined' ? '' : user.email %&gt;&quot; maxlength=&quot;50&quot; required&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;label for=&quot;password&quot;&gt;Password (must be at least 6 characters)&lt;/label&gt;
    &lt;input type=&quot;password&quot; name=&quot;password&quot; minlength=&quot;6&quot; maxlength=&quot;32&quot; required&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;label for=&quot;passwordConfirmation&quot;&gt;Confirm Password&lt;/label&gt;
    &lt;input type=&quot;password&quot; name=&quot;passwordConfirmation&quot; required&gt;
  &lt;/div&gt;

    &lt;button type=&quot;submit&quot;&gt;Submit&lt;/button&gt;
    &lt;span&gt;Already a member? &lt;a href=&quot;/login&quot;&gt;Log in&lt;/a&gt;&lt;/span&gt;
  &lt;/div&gt;
&lt;/form&gt;

&lt;% include ../layouts/footer %&gt;
</code>
<code>// views/users/list.ejs 
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;Users&lt;/h1&gt;

&lt;ul&gt;
  &lt;% users.forEach(function(user) { %&gt;
    &lt;li&gt;&lt;a href=&quot;/users/&lt;%= user.id %&gt;&quot;&gt;&lt;%= user.username %&gt; - &lt;%= user.email %&gt;&lt;/a&gt;&lt;/li&gt;
  &lt;% }); %&gt;
&lt;/ul&gt;

&lt;% include ../layouts/footer %&gt;</code>
<code>// views/users/details.ejs 
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;User Info Page&lt;/h1&gt;
&lt;hr&gt;
&lt;p&gt;&lt;b&gt;ID:&lt;/b&gt; &lt;%= user.id %&gt;&lt;/p&gt;
&lt;p&gt;&lt;b&gt;Username:&lt;/b&gt; &lt;%= user.username %&gt;&lt;/p&gt;
&lt;p&gt;&lt;b&gt;Email:&lt;/b&gt; &lt;%= user.email %&gt;&lt;/p&gt;
&lt;% if (user.role) { %&gt;
  &lt;p&gt;&lt;b&gt;Role:&lt;/b&gt; &lt;%= user.role %&gt;&lt;/p&gt;
&lt;% } %&gt;

&lt;a href=&quot;/users/&lt;%= user.id %&gt;/update&quot; class='btn btn-info'&gt;Update&lt;/a&gt;
&lt;a href=&quot;/users/&lt;%= user.id %&gt;/delete&quot;&gt;Delete&lt;/a&gt;

&lt;% include ../layouts/footer %&gt;</code>
<code>// views/users/update.ejs 
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;User Settings&lt;/h1&gt;

&lt;% include ../layouts/form-errors %&gt;

&lt;form method=&quot;POST&quot; action=&quot;/users/&lt;%= user._id %&gt;/update&quot;&gt;
  &lt;div class='form-group'&gt;
    &lt;label for=&quot;username&quot;&gt;Userame&lt;/label&gt;
    &lt;input type=&quot;text&quot; name=&quot;username&quot; value=&quot;&lt;%= typeof user === 'undefined' ? '' : user.username %&gt;&quot; maxlength=&quot;50&quot; required&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;label for=&quot;email&quot;&gt;Email&lt;/label&gt;
    &lt;input type=&quot;email&quot; name=&quot;email&quot; value=&quot;&lt;%= typeof user === 'undefined' ? '' : user.email %&gt;&quot; required&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;label for=&quot;password&quot;&gt;Change Password (must be at least 6 characters)&lt;/label&gt;
    &lt;input type=&quot;password&quot; name=&quot;password&quot; minlength=&quot;6&quot; maxlength=&quot;32&quot;&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;label for=&quot;passwordConfirmation&quot;&gt;Confirm Password&lt;/label&gt;
    &lt;input type=&quot;password&quot; name=&quot;passwordConfirmation&quot;&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;button type=&quot;submit&quot;&gt;Submit&lt;/button&gt;
    &lt;a href=&quot;/users/&lt;%= user._id %&gt;&quot;&gt;Cancel&lt;/a&gt;
  &lt;/div&gt;
&lt;/form&gt;

&lt;hr&gt;

&lt;h3&gt;Delete Account&lt;/h3&gt;
&lt;a href=&quot;/users/&lt;%= user._id %&gt;/delete&quot;&gt;Delete&lt;/a&gt;

&lt;% include ../layouts/footer %&gt;</code>
<code>// views/users/delete.ejs 
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;Delete Account: &lt;%= user.username %&gt;&lt;/h1&gt;

&lt;hr&gt;
&lt;p&gt;
  Are you sure you want to delete this account?
  &lt;form method='POST' action='/users/&lt;%= user._id %&gt;/delete'&gt;
    &lt;input type=&quot;hidden&quot; name=&quot;id&quot; value=&quot;&lt;%= user._id %&gt;&quot;&gt;
    &lt;button type='submit'&gt;Yes - Delete Account&lt;/button&gt;
    &lt;a href=&quot;/users/&lt;%= user.id %&gt;&quot;&gt;No - Cancel&lt;/a&gt;
  &lt;/form&gt;
&lt;/p&gt;

&lt;% include ../layouts/footer %&gt;</code>
Restart the app and test it to make sure all 4 CRUD actions work. And you should see the flash messages after signup, update and delete.

<h4 id='validation'>Validation</h4>
<b>Express-validator Docs:</b> <a href="https://express-validator.github.io/docs/">Getting Started</a> | <a href="https://express-validator.github.io/docs/check-api.html">API</a>

Install the express-validator package.
<kbd>npm install express-validator</kbd>
Add form validation variables in the controllers to apply express-validator's validation/sanitation methods to the form data. Then modify the signup and update functions to handle validation errors.
<code>// controllers/authController.js 
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

exports.validateSignup = [
  // validate username not empty.
  body('username').trim().not().isEmpty().withMessage('Username cannot be blank.'),
  // change email to lowercase, validate not empty, valid format, not in use.
  body('email')
    .not().isEmpty().withMessage('Email cannot be blank.')
    .isEmail().withMessage('Email format is invalid.')
    .normalizeEmail()
    .custom((value) => {
      return User.findOne({email: value}).then(user => {
        if (user) {
          return Promise.reject('Email is already in use');
        }
      });
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

// GET /signup
exports.signupPage = (req, res, next) => {
  res.render('auth/signup', { title: 'Signup' });
};

// POST /signup
exports.signup = async (req, res, next) => {
  // Create object of any validation errors from the request.
  const errors = validationResult(req);
  // if errors send the errors and original request body back.
  if (!errors.isEmpty()) {
    return res.render('auth/signup', { user: req.body, errors: errors.array() });
  }
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create(req.body);
    req.flash('success', 'Account Created.');
    res.redirect(`/users/${user._id}`);
  } catch (err) {
    next(err);
  }  
};
</code>
<code>// controllers/usersController.js 
...
const { body, validationResult } = require('express-validator');
...
exports.validateForm = [
  // Validate username not empty.
  body('username').trim().not().isEmpty().withMessage('Username cannot be blank.'),
  // Change email to lowercase, validate not empty, valid format, is not in use if changed.
  body('email')
    .not().isEmpty().withMessage('Email cannot be blank.')
    .isEmail().withMessage('Email format is invalid.')
    .normalizeEmail()
    // Validate that a changed email is not already in use.
    .custom((value, { req }) => {
      return User.findOne({email: value}).then(user => {
        if (user && user._id.toString() !== req.params.id) {
          return Promise.reject('Email is already in use');
        }
      });
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
];
...
// POST /users/:id/update
exports.update =   async (req, res, next) => {
  const user = {
    username: req.body.username,
    email: req.body.email,
    _id: req.params.id
  }; 

  // Create object of any validation errors from the request.
  const errors = validationResult(req);
  // if errors send the errors and original request body back.
  if (!errors.isEmpty()) {
    return res.render('users/update', { user: user, errors: errors.array() });
  }
  try {
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await User.findByIdAndUpdate(
      req.params.id, 
      user, 
      {new: true}
    );
    req.flash('success', 'Account Updated.');
    res.redirect(`/users/${user._id}`);
  } catch (err) {
    next(err);
  }
};
</code>
Insert the validation as middleware to the routes.
<code>// routes/index.js
...
router.post('/signup', authController.validateSignup, authController.signup);
...
router.post('/users/:id/update', usersController.validateForm, usersController.update);
</code>
Test it out to make sure you are getting the relevant validation errors.

<h2 id='authentication'>Authentication</h2>
<b>Jsonwebtoken Docs:</b> <a href="https://github.com/auth0/node-jsonwebtoken">Readme</a>
If we want to restrict pages to registered users, specific users, or specific user roles then we first need to authenticate who the user is.
We will add login and logout actions, and will store a JSON web token, that identifies the user, in a cookie.
Install the jsonwebtoken package.
<kbd>npm install jsonwebtoken</kbd>

<h4 id='login-out'>Log In/Out</h4>
Add login and logout routes, including inserting the validateLogin middleware function defined in the authController.
<code>// routes/index.js 
...
// Auth routes
...
router.get('/login', authController.loginPage);
router.post('/login', authController.validateLogin, authController.login);
router.get('/logout', authController.logout);
</code>

Add Login and logout controller actions.
<code>// controllers/authController.js 
const jwt = require('jsonwebtoken');
...
// GET /login
exports.loginPage = (req, res, next) => {       
  res.render('auth/login', { title: "Log In" });
};

// POST /login
exports.validateLogin = [
  // change email to lowercase, validate not empty.
  body('email')
  .not().isEmpty().withMessage('Email cannot be blank.')
  .normalizeEmail()
  // custom validator gets user object from DB from email, rejects if not present, compares user.password to hashed password from login.
  .custom((value, {req}) => {
    return User.findOne({email: value}).then(async (user) => {
      if (!user) {
        return Promise.reject('Email or Password are incorrect.');
      }
      const passwordIsValid = await bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) {
        // return Promise.reject('Email or Password are incorrect.');
        throw new Error('Email or Password are incorrect.')
      }
      // if (user.activated === false) {
      //   throw new Error('Account not activated. Check your email for activation link.') 
      // }
    });
  }),
]
exports.login = async (req, res, next) => {
  // Create object of any validation errors from the request.
  const errors = validationResult(req);
  // if errors send the errors and original request body back.
  if (!errors.isEmpty()) {
    res.render('auth/login', { user: req.body, errors: errors.array() });
  } else {
    User.findOne({email: req.body.email}).then((user) => {
      // the jwt and cookie each have their own expirations.
      const token = jwt.sign(
        { user: { id: user._id, username: user.username, role: user.role }}, 
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
exports.logout = (req, res, next) => {
  res.clearCookie('jwt');
  req.flash('info', 'Logged out.');
  res.redirect('/');
};
</code>

Add currentUser to local storage. This is used for conditional statements in the view files. For instance show logout button if there is a currentUser and login button if not.
Make sure to place this before app.use('/', router); or the page will display before getting the currentUser object.
<code>// app.js 
const jwt = require('jsonwebtoken');
...
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
...
app.use('/', router);
</code>
Populate the login form page.
<code>// views/auth/login.ejs 
<% include ../layouts/header %>

&lt;h1&gt;Log In&lt;/h1&gt;

<% include ../layouts/form-errors %>

&lt;form method=&quot;POST&quot; action=&quot;/login&quot;&gt;
  &lt;div&gt;
    &lt;label for=&quot;email&quot;&gt;Email&lt;/label&gt;
    &lt;input type=&quot;email&quot; name=&quot;email&quot; value=&quot;&lt;%= typeof user === 'undefined' ? '' : user.email %&gt;&quot; required autofocus&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;label for=&quot;password&quot;&gt;Password&lt;/label&gt; (&lt;a href=&quot;/forgot-password&quot; tabindex=&quot;-1&quot;&gt;Forgot Password?&lt;/a&gt;)
    &lt;input type=&quot;password&quot; name=&quot;password&quot; required&gt;
  &lt;/div&gt;

  &lt;div&gt;
    &lt;button type=&quot;submit&quot;&gt;Submit&lt;/button&gt;
    &lt;span&gt;New user? &lt;a href=&quot;/signup&quot;&gt;Sign up now!&lt;/a&gt;&lt;/span&gt;
  &lt;/div&gt;
&lt;/form&gt;

<% include ../layouts/footer %>
</code>
Add login and logout routes to the navbar.
<code>// views/layouts/header.ejs 
...
&lt;nav&gt;
  &lt;a href=&quot;/&quot;&gt;Home&lt;/a&gt;
  &lt;% if(!currentUser){ %&gt;
    &lt;a class=&quot;nav-link&quot; href=&quot;/signup&quot;&gt;Sign Up&lt;/a&gt;
    &lt;a class=&quot;nav-link&quot; href=&quot;/login&quot;&gt;Log In&lt;/a&gt; 
  &lt;% } else { %&gt;
    &lt;a href=&quot;/protected&quot;&gt;protected&lt;/a&gt;
    &lt;a href=&quot;/users&quot;&gt;users&lt;/a&gt;        
    &lt;a href=&quot;/users/&lt;%= currentUser.id %&gt;&quot;&gt;&lt;%= currentUser.username %&gt; Profile&lt;/a&gt;
    &lt;a href=&quot;/users/&lt;%= currentUser.id %&gt;/update&quot;&gt;Settings&lt;/a&gt;
    &lt;a href=&quot;/logout&quot;&gt;Log Out&lt;/a&gt;         
  &lt;% } %&gt;
&lt;/nav&gt;
</code>
We have not dealt with activation yet so you can try to log in a user and will get a response that the user is not yet activated. In the authController login action you can temporarily comment out the validation, then you can log users in and out. The navbar menu items should change depending on whether the user is logged in or not.
<code>
// if (user.activated === false) {
//   throw new Error('Account not activated. Check your email for activation link.') 
// }
</code>

Log in user when they sign up by adding the below to the end of the authController signup action:
<code>// controllers/authController.js 
...
try {
  req.body.password = await bcrypt.hash(req.body.password, 10);
  const user = await User.create(req.body);
<b>  // On success - login user and redirect.
  const token = jwt.sign(
    { user: { id: user._id, username: user.username, role: user.role }}, 
    process.env.SECRET, 
    { expiresIn: '1y' }
  );
  res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });</b>
  req.flash('success', 'Account Created.');
  res.redirect(`/users/${user._id}`);
} ...
</code>
When a user deletes their account they need to be logged out. To do that add one statement to the users controller delete function that clears the jwt cookie.

<code>// controllers/usersController.js 
...
// POST users/:id/delete
exports.delete = (req, res, next) => {
  User.findByIdAndRemove(req.body.id, (err) => {
    if (err) { 
      next(err); 
    } else {
      res.clearCookie('jwt');
      req.flash('info', 'Account Deleted.');
      res.redirect('/');   
    }
  })
};
</code>

Test that a user is automatically logged in when they successfully sign up.

<h4 id='activate-account'>Activate Account</h4>
<b>Sendgrid:</b> <a href="https://sendgrid.com/">Website</a>
<b>@sendgrid/mail Docs:</b> <a href="https://www.npmjs.com/package/@sendgrid/mail">npm package</a>
<b>Crypto-random-string Docs:</b> <a href="https://github.com/sindresorhus/crypto-random-string#readme">Readme</a>
Send email to the user when they register. The user must click the link in the email to activate their account. This is to ensure the email address they provided is valid and belongs to them.
There are multiple email providers you can choose from. This type of email is called transactional, as opposed to email marketing. Sendgrid is a leading provider of transactional email and offers a free account of up to 100 emails/day.
You don't have to have an account to follow along. You can use the sendgrid package but just print the email to your terminal without even connecting to sendgrid.

Install the required packages.
<kbd>npm install crypto-random-string @sendgrid/mail</kbd>
• crypto-random-string package will generate a token to use when sending the activation email.

Add route.
<code>// routes/index.js 
...
// Auth routes
router.get('/activate-account', authController.activateAccount);
...
</code>
• Import the cryptoRandomString, sgMail, and ejs modules to the auth controller.
• Add a helper function that sends an activation email. 
• Modify the signup action to call it. 
• Add the activate-account action.
• In validateLogin uncomment the custom validation that checks for activation. 
<code>// controllers/authController.js 
const cryptoRandomString = require('crypto-random-string');
const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
...
// Helper function for signup action
const sendActivationEmail = async (username, email, token) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const html = await ejs.renderFile(
    __dirname + "/../views/email/activate-account.ejs",
    {username: username, email: email, token: token }
  );
  const msg = {
    to: email,
    from: 'no-reply@example.com',
    subject: 'Account activation',
    html: html
  };
  try {
    // View email in the console without sending it.
    console.log('Activation Email: ', msg); 
    // Uncomment below to send the email.
    // await sgMail.send(msg);
    console.log('Email has been sent!');
  } catch(err) {
    console.log('There was an error sending the email. Error: ' + err);
  }
};

// POST /signup
exports.signup = async (req, res, next) => {
  // Create object of any validation errors from the request.
  const errors = validationResult(req);
  // if errors send the errors and original request body back.
  if (!errors.isEmpty()) {
    return res.render('auth/signup', { user: req.body, errors: errors.array() });
  }
  try {
    const token = await cryptoRandomString({length: 10, type: 'url-safe'});
    const username = req.body.username;
    const email = req.body.email;
    sendActivationEmail(username, email, token);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = User.create({
      username: username,
      email: email,
      password: hashedPassword,
      activationToken: token
    });
    req.flash('info', 'Please check your email to activate your account.');
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

// GET /activate-account
exports.activateAccount = async (req, res, next) => { 
  if (!req.query.token || !req.query.email) {
    req.flash('warning', 'Token or email was not provided.');
    return res.redirect('/');
  }
  const user = await User.findOne({ email: req.query.email }); 
  if (!user || user.activationToken !== req.query.token) {
    req.flash('warning', 'Could not activate account.');
    return res.redirect('/');
  } 
  User.findByIdAndUpdate(user._id, {activated: true}, (err) => {
    if (err) { 
      return next(err); 
    }
    // On success - login user and redirect.
    const token = jwt.sign(
      { user: { id: user._id, username: user.username, role: user.role }}, 
      process.env.SECRET, 
      { expiresIn: '1y' }
    );
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
    req.flash('success', 'Your account is activated.');
    res.redirect(user.url);
  }); 
};
...
// POST /login
exports.validateLogin = [
  ...
      if (user.activated === false) {
        throw new Error('Account not activated. Check your email for activation link.') 
      }
    });
  }),
]
</code>
Create an email view directory and an email file.
In production you would change the domain from localhost:3000 to whatever your domain is.
<code>mkdir views/email
touch views/email/activate-account.ejs  
</code>
Populate the email file.
<code>// views/email/activate-account.ejs 
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;title&gt;Activate Account&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;h1&gt;Node-App-Authentication&lt;/h1&gt;
&lt;p&gt;Hi &lt;%= username %&gt;,&lt;/p&gt;

&lt;p&gt;Welcome to Node-App-Authentication. Click on the link below to activate your account:&lt;/p&gt;

&lt;a href=&quot;http://localhost:3000/activate-account?token=&lt;%= token %&gt;&amp;email=&lt;%= email %&gt;&quot;&gt;Activate&lt;/a&gt;
&lt;/body&gt;
&lt;/html&gt;
</code>

If you sign up for a Sendgrid account then put your sendgrid api key in the .env file. You only need to add this if you want to send an actual email.
<code>// .env 
SENDGRID_API_KEY=put-your-sendgrid-api-key-here
</code>

Now test it out. Create an account. Then go to the terminal, find where the email was printed. Copy and paste the URL to your browser. You should be activated.
To actually send an email through sendgrid, modify the auth controller sendActivationEmail function by changing the try block to:
<code>try {
  await sgMail.send(msg);
  console.log('Email has been sent!');
} 
</code>

<h2 id='authorization'>Authorization</h2>
To limit access to controller actions based on whether a user is logged in, is the correct user, or has the right role we need to add middleware to protect the routes.

Add a file to hold the auth middleware.
<kbd>touch routes/authMiddleware.js</kbd>

<code>// routes/authMiddleware.js 
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.isLoggedIn = (req, res, next) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.SECRET);
    next();
  } catch(err) {
    console.log(err.name + ': ' + err.message);
    res.redirect('/login'); 
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
      res.redirect('/login');
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
      res.redirect('/login');
    } else {
      res.redirect('/');
    }
  }
}
</code>
Import the middleware to the routes file and add the relevant middleware to the routes that need to be restricted.
<code>// routes/index.js 
const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');
<b>const auth = require('./authMiddleware');</b>
// Pages routes
router.get('/', pagesController.home);
<b>router.get('/protected', auth.isLoggedIn, pagesController.protected);</b>
// Auth routes
router.get('/signup', authController.signupPage);
router.post('/signup', authController.signup);
router.get('/activate-account', authController.activateAccount);
router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Users routes
<b>router.get('/users', auth.isAdmin, usersController.list);
router.get('/users/:id', auth.isCorrectUser, usersController.details);
router.get('/users/:id/update', auth.isCorrectUser, usersController.updatePage);
router.post('/users/:id/update', auth.isCorrectUser, 
    usersController.validateForm, usersController.update);
router.get('/users/:id/delete', auth.isCorrectUser, usersController.deletePage);
router.post('/users/:id/delete', auth.isCorrectUser, usersController.delete);</b>
module.exports = router;
</code>
Test it out by trying to access the protected page when logged out. You should be redirected to the login page.
http://localhost:3000/protected 
If you log in you should be able to access it.
If you try to access the user detail page of a different user you'll be redirected to the home page. 
If you try to access the users page you should also be redirected to the home page if you do not have an admin role.
We did not add the ability to add an admin role to a user because that's a highly restricted role. To add it directly in the database open the mongo shell.
<kbd>mongo</kbd>
Go to the database.
<kbd>use my_local_db</kbd>
View all your users.
<kbd>db.users.find()</kbd>
Get the id of the user you want to make an admin and then update them.
<kbd>db.users.update({"_id" : ObjectId("id-string-here")},{ $set: {role: "admin"}})</kbd>
Now if that user tries to access the users route they should get access.

<h2 id='forgot-password'>Forgot Password</h2>
There is a forgot password link in the login form that doesn't go anywhere.
We'll make a page where they enter their email address.
If the email address is in the system we'll generate a reset token, save it to the database along with the current timestamp, and send an email with a link to change the password. The user has two hours to access it.
When the user clicks on the link in the email they are taken to a password reset page where they can set their password and are logged in.

Create the view and email files.
<code>touch views/auth/forgot-password.ejs 
touch views/auth/reset-password.ejs 
touch views/email/reset-password.ejs 
</code>
Add routes.
<code>// routes/index.js 
// Auth routes
...
router.get('/forgot-password', authController.forgotPasswordPage);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password', authController.resetPasswordPage);
router.post('/reset-password', authController.resetPassword);
</code>
Add controller actions and a sendResetPasswordEmail helper function.
<code>// controllers/authController.js 
// GET /password-reset
exports.forgotPasswordPage = (req, res, next) => {   
  res.render('auth/forgot-password', { title: 'Forgot Password' });
};

// Helper function for handleForgotPassword action.
const sendResetPasswordEmail = async (email, token) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const html = await ejs.renderFile(
    __dirname + "/../views/email/reset-password.ejs",
    {email: email, token: token }
  );
  const msg = {
    to: email,
    from: 'no-reply@example.com',
    subject: 'Reset Password',
    html: html
  };
  try {
    // View email in the console without sending it.
    console.log('Password Reset Email: ', msg);
    // Uncomment below to send the email.
    // const status = await sgMail.send(msg);
    console.log('Email has been sent!');
  } catch(err) {
    console.log('There was an error sending the email. Error: ' + err);
  }
};

// POST /password-reset
exports.forgotPassword = [
  // change email to lowercase, validate not empty.
  body('email')
    .not().isEmpty().withMessage('Email cannot be blank.')
    .normalizeEmail()
    // custom validator gets user object from DB from email, rejects if not found.
    .custom((value, {req}) => {
      return User.findOne({email: value}).then(async (user) => {
        if (!user) {
          return Promise.reject('Email address not found.');
        }
      });
    }),
  async (req, res, next) => {
    // Create object of any validation errors from the request.
    const errors = validationResult(req);
    // if errors send the errors and original request body back.
    if (!errors.isEmpty()) {
      res.render('auth/forgot-password', { user: req.body, errors: errors.array() });
    } else {
      const token = await cryptoRandomString({length: 10, type: 'url-safe'});
      const user = await User.findOneAndUpdate(
        {email: req.body.email}, 
        {resetToken: token, resetSentAt: Date.now()}, 
        {new: true}
      );
      sendResetPasswordEmail(user.email, token);

      req.flash('info', 'Email sent with password reset instructions.');
      res.redirect('/');
    }
  }
];

// GET /reset-password
exports.resetPasswordPage = (req, res, next) => {
  res.render(
    'auth/reset-password', 
    { title: 'Reset Password', user: {email: req.query.email, resetToken: req.query.token}}
  );
};

// POST /reset-password
exports.resetPassword = [
  // Validate password at least 6 chars, passwordConfirmation matches password.
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
    .custom(async (value, { req }) => {
      if (!req.query.token || !req.query.email) { 
        throw new Error('Reset email or token is invalid'); 
      }      
      if (value !== req.body.passwordConfirmation) {
        throw new Error('Password confirmation does not match password');
      }
      let user = await User.findOne({ email: req.query.email, resetToken: req.query.token }); 
      if (!user) { 
        throw new Error('Reset email or token is invalid'); 
      }
      // validate not more than 2 hours.
      if (Date.now() - user.resetSentAt > 72000000) {
        throw new Error('Password Reset has Expired.');
      }
      // Indicates the success of this synchronous custom validator
      return true;    
    }
  ),
  async (req, res, next) => {

    // Create object of any validation errors from the request.
    const errors = validationResult(req);

    // if errors send the errors and original request body back.
    if (!errors.isEmpty()) {
      res.render('auth/reset-password', { user: req.body, errors: errors.array() });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);     
      const user = await User.findOneAndUpdate(
        {email: req.query.email}, 
        {password: hashedPassword}, 
        { new: true}
      );
      // create the signed json web token expiring in 1 year. 
      const jwtToken = await jwt.sign(
        { user: { id: user._id, username: user.username, role: user.role }}, 
        process.env.SECRET, 
        { expiresIn: '1y' }
      );
      // Assign the jwt to the cookie expiring in 1 year. 
      // Adding option secure: true only allows https.           
      res.cookie('jwt', jwtToken, { httpOnly: true, maxAge: 31536000000 });       
      req.flash('success', 'Password has been reset.');
      res.redirect(user.url);
    }
  }
];
</code>

Add the forgot password form and reset password form.
<code>// views/auth/forgot-password.ejs 
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;Forgot Password&lt;/h1&gt;

&lt;% include ../layouts/form-errors %&gt;

&lt;form method=&quot;POST&quot; action=&quot;/forgot-password&quot;&gt;
  &lt;div&gt;
    &lt;label for=&quot;email&quot;&gt;Email&lt;/label&gt; 
    &lt;input type=&quot;email&quot; name=&quot;email&quot; value=&quot;&lt;%= typeof user === 'undefined' ? '' : user.email %&gt;&quot; required autofocus&gt;
  &lt;/div&gt;

  &lt;button type=&quot;submit&quot;&gt;Submit&lt;/button&gt;
&lt;/form&gt;

&lt;% include ../layouts/footer %&gt;
</code>
<code>// views/auth/reset-password.ejs 
&lt;% include ../layouts/header %&gt;

&lt;h1&gt;Reset Password&lt;/h1&gt;

&lt;% include ../layouts/form-errors %&gt;

&lt;form method=&quot;POST&quot; action=&quot;/reset-password?token=&lt;%= user.resetToken %&gt;&amp;email=&lt;%= user.email %&gt;&quot;&gt;
  &lt;input type=&quot;hidden&quot; name=&quot;email&quot; value=&quot;&lt;%= typeof user.email === 'undefined' ? '' : user.email %&gt;&quot;&gt;
  &lt;input type=&quot;hidden&quot; name=&quot;resetToken&quot; value=&quot;&lt;%= typeof user.resetToken === 'undefined' ? '' : user.resetToken %&gt;&quot;&gt;
  &lt;label for=&quot;password&quot;&gt;Password (must be at least 6 characters)&lt;/label&gt;
  &lt;input type=&quot;password&quot; name=&quot;password&quot; minlength=&quot;6&quot; maxlength=&quot;32&quot; required&gt;

  &lt;label for=&quot;passwordConfirmation&quot;&gt;Confirm Password&lt;/label&gt;
  &lt;input type=&quot;password&quot; name=&quot;passwordConfirmation&quot; required&gt;
  &lt;button type=&quot;submit&quot;&gt;Submit&lt;/button&gt;
&lt;/form&gt;

&lt;% include ../layouts/footer %&gt;
</code>
Add the reset password email. In production change the domain from localhost:3000 to your domain.
<code>// views/emails/reset-password.ejs 
&lt;h1&gt;Reset password&lt;/h1&gt;

&lt;p&gt;To reset your password click the link below:&lt;/p&gt;

&lt;a href=&quot;http://localhost:3000/reset-password?token=&lt;%= token %&gt;&amp;email=&lt;%= email %&gt;&quot;&gt;Reset password&lt;/a&gt;

&lt;p&gt;This link will expire in two hours.&lt;/p&gt;
&lt;p&gt;If you did not request your password to be reset, please ignore this email and your password will stay as it is.&lt;/p&gt;
</code>
Test it out by clicking the forgot password link from the login page. Enter a registered user's email and submit. Assuming the email is set to just print to the terminal then go to the terminal and copy the url from the reset link and paste it in the browser. You should now be able to reset the user's password. 

<h3 id='authentication-rationale'>Rationale</h3>
<b>Bcrypt or bcryptjs package?</b>
These do the same thing but bcryptjs is written in pure JavaScript while bcrypt has non-JS dependencies. Bcrypt is supposed to be faster than bcryptjs (I didn't confirm this). While I have installed bcrypt successfully here, I have had trouble installing it in the past so bcrypt.js is a viable alternative.

<h3 id='authentication-open-items'>Open Items</h3>
<b>What validator should be used? Mongoose's built-in validator, Express validator, or other?</b>
• Here we are using Express Validator.

<b>Should you sanitize the inputs?</b>
• Express-validator includes sanitation to escape HTML which will convert <, >, /, ', ", to HTML enitities (e.g., < into &amp;lt;). 

<b>How to store user info?</b>
• Using JSON web tokens stored in a cookie.

<b>Miscellaneous</b>
• In activate-account action, optionally set activationToken to null. No need to take up space in the DB if it's not needed anymore.
• Maybe use an env variable for the domain so you don't have to remember to change it in the email view files. Or use a conditional depending on the environment.
• Should you show an error on reset password if the user email is not in the system? Currently we are, but may be a good idea not to since it lets a potential bad actor know there is an account with that email.