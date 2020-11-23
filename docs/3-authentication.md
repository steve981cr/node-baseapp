# Authentication and Authorization

## Overview

We will set up an authentication system for a Node.js with Express application based on user accounts with a unique email address.  
This guide covers Authentication in the broader sense, meaning it will do three things. Add a User collection with all the CRUD (Create-Read-Update-Delete) actions. Add a login action for authentication to ensure the user is who they say they are. And add authorization to restrict access to specific pages.  
The first part of this guide sets up the base application.

## User Collection
Creating an authentication system is a bit complicated so we'll do it in steps. That way you can test it and fix any problems you encounter along the way. Start by making a plain User collection with CRUD actions without any of the authentication logic other than hashing the password.
We are using the MVC (Model-View-Controller) architecture.
We are using User as the name of the user collection, but you can use a different name such as Member, Account, etc.

### Generate a model and db migration file
`sequelize model:generate --name User --attributes username:string,email:string,password:string,role:string,activationToken:string,activated:boolean,resetToken:string,resetSentAt:date`

* Modify the migration file to:
  * Make email required and unique. 
  * Set activated default value to false.
  * Add a unique index on email. 
  * Role is set to type string, but it could also be an array type if users can have multiple roles. (Only works with Postgres jsonb)
  * Wrap the whole up migration in a transaction so if the index creation fails the table will not be added. 
* See the migration file for the full code.

* Migrate the DB: `sequelize db:migrate`

---
## Setup
### Create files and folders
```
touch routes/users.js
touch routes/auth.js
mkdir views/users
touch views/users/list.ejs
touch views/users/details.ejs
touch views/users/update.ejs
touch views/users/delete.ejs
touch views/users/details.ejs
mkdir views/auth
touch views/auth/signup.ejs
touch views/auth/login.ejs
touch views/auth/forgot-password.ejs
touch views/auth/reset-password.ejs
touch views/pages/protected.ejs
```
### Install packages
`npm install bcrypt`  
`npm install jsonwebtoken` 
* Assumes express, http-errors, and express-validator have already been installed.
---
## Add Auth and User Routes
* Add routes for authentication (signup, login, logout)
* Include placeholders for the callback/handler functions. These can optionally be placed in a separate controller file.
* Include placeholders for validation.

#### **`routes/users.js`**
``` javascript
// routes/auth.js
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

// Users Controller Function Placeholders
function signupForm(req, res, next) {};
function signup(req, res, next) {};
function loginForm(req, res, next) {};
function login(req, res, next) {};
function logout(req, res, next) {};

// Form Validator & Sanitizer Middleware Placeholders
function validateSignup() { return []}
function validateLogin() { return []}

module.exports = router;
```
* Add RESTful routes for the User collection. 
* Exclude create, since that is handled through the auth signup route.
* Include placeholders for the controller and validation functions.

#### **`routes/users.js`**
``` javascript
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

// Users Controller Function Placeholders
function list(req, res, next) {};
function detail(req, res, next) {};
function updateForm(req, res, next) {};
function update(req, res, next) {};
function deleteForm(req, res, next) {};
function destroy(req, res, next) {};

// Form Validator & Sanitizer Middleware Placeholders
function validateForm() {return []}

module.exports = router;
```
* **App.js file:** Import the routers and add them as middleware. Express Generator has already done this for *users* collection.
#### **`app.js`**
``` js
...
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
...
app.use('/users', usersRouter);
app.use('/auth', authRouter);
```
---
## Controller Functions
### Router methods
* Syntax: `router.METHOD(path, callback [, callback ...])`
* The router methods such as router.get() and router.post() have two required arguments. 
* First is the URL path such as '/about' or '/signup'.
* Followed by at least one callback function.
* The last handles the HTTP request and returns a response. In the Model-View-Controller design pattern, this function is called a controller function. 
* If there are two or more callback functions then the middle ones are middleware that process the request in some way, such as validating form inputs, or authenticating the user.
* These callback functions can be defined directly in the route, elsewhere in the routes file, or in a separate controller module. We will define them as separate functions in the router file.

---
## Signup
* Standard RESTful routes for a collection include GET Create for a Create form POST Create to Create a new instance of the collection. 
* The User collection will have the standard RESTful routes to create, update and delete users, and read user lists and detail. 
* However, our app will add an authentication layer for users to sign them up, and log them in and out.
* We will use separate authentication and user route paths.
* Instead of putting that with the users routes, it is in the auth routes as signup.

### bcrypt
* For security reasons, don't save raw passwords to the database in case the DB is compromised. Instead make the saved passwords indecipherable by hashing them with the bcrypt package.
* Bcrypt Docs: <a href="https://github.com/kelektiv/node.bcrypt.js#readme">Readme</a>
* Install bcrypt: `npm install bcrypt`

### Signup form
* Add the html/ejs for the signup form.
* The below is without Bootstrap classes. The actual file contains basic Bootstrap styling.

#### **`views/auth/signup.ejs`**
``` html
<% include ../layouts/header %>

<h1>Sign Up</h1>

<% include ../layouts/form-errors %>

<form method="POST" action="/auth/signup">
  <div>
    <label for="username">Username</label>
    <input type="text" name="username" value="<%= typeof user === 'undefined' ? '' : user.username %>" maxlength="50" required autofocus>
  </div>

  <div>
    <label for="email">Email</label>
    <input type="email" name="email" value="<%= typeof user === 'undefined' ? '' : user.email %>" maxlength="50" required>
  </div>

  <div>
    <label for="password">Password (must be at least 6 characters)</label>
    <input type="password" name="password" minlength="6" maxlength="32" required>
  </div>

  <div>
    <label for="passwordConfirmation">Confirm Password</label>
    <input type="password" name="passwordConfirmation" required>
  </div>

    <button type="submit">Submit</button>
    <span>Already a member? <a href="/auth/login">Log in</a></span>
  </div>
</form>

<% include ../layouts/footer %>
```

### Navbar
* Add signup link to the navbar.
#### **`views/layouts/header.ejs`**
``` html
<li class="nav-item"><a href="/auth/signup" class='nav-link'>Signup</a></li>
```

### Controller Functions
#### **`routes/auth.js`**
``` js
// Routes
router.get('/signup', signupForm);
router.post('/signup', validateSignup(), signup);
...
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
```
### Validation/Sanitation
* The signup router function contains validation middleware.
* The signup controller function starts with validation error handling statements. Right now the validation function is empty so commenting out the error handling statements won't affect anything.
* Populate the validateSignup function at the bottom of routes/auth.js. The function returns an array where there is an element for each field that gets validated.
* It doesn't have to be a function. You could just assign the array to a variable called validatesSignup, but you would have to place it above the routes that reference it. Since functions are hoisted you can place them after the router function that calls it. 
``` js
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
```
* You can now referesh the browser, click on the signup link, and test the validator for invalid fields. The form uses html form validators as well.
* A valid signup, however, will stall on the redirect to the detail page since that hasn't been populated yet. 
---
## User List and Detail 
* Create the list and detail controller functions and views.

### Controller functions
* Get all users ordered by username.
#### **`routes/users.js`**
``` js
// Routes
router.get('/', list);
router.get('/:id', detail);
...
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
};

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
};
```

### Views
* Below are basic views for the list and detail pages. The actual files include some basic Bootstrap classes not shown here.
#### **`views/users/list.ejs`**
``` html
<% include ../layouts/header %>

<h1>Users</h1>
<hr>
<ul>
  <% users.forEach(function(user) { %>
    <li><a href="/users/<%= user.id %>"><%= user.username %> - <%= user.email %></a></li>
  <% }); %>
</ul>

<% include ../layouts/footer %>
```

#### **`views/users/detail.ejs`**
``` html
<% include ../layouts/header %>

<h2 class='mt-4'>
  <%= user.username %> Account
  <a href="/users/<%= user.id %>/update" class='btn btn-info float-right'>Settings</a>
</h2>
<hr>
<p><b>Email:</b> <%= user.email %></p>
<% if (user.role) { %>
  <p><b>Role:</b> <%= user.role %></p>
<% } %>

<% include ../layouts/footer %>
```

### Navbar
* Add users link to the navbar.
#### **`views/layouts/header.ejs`**
``` html
<li class="nav-item"><a href="/users" class='nav-link'>Users</a></li>
```

* You can now sign up a user and it will redirect to the user detail page.
* And go to the users list page from the navbar.

---
## User Update/Settings
### Controller Functions
* There are two routes. One to display the Update form and one to post it.
#### **`routes/users.js`**
``` js
router.get('/:id/update', updateForm);
router.post('/:id/update', validateForm(), update);
...
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
};

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
  // if errors send the errors and original request body back.
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

```
### Validation/Sanitation
* Add the validateForm function at the bottom of the routes/users.js file.
``` js
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
```

### View
#### **`views/users/update.ejs`**
``` html
<% include ../layouts/header %>

<h1>User Settings</h1>

<% include ../layouts/form-errors %>

<form method="POST" action="/users/<%= user.id %>/update">
  <div>
    <label for="username">Userame</label>
    <input type="text" name="username" value="<%= typeof user === 'undefined' ? '' : user.username %>" maxlength="50" required>
  </div>

  <div>
    <label for="email">Email</label>
    <input type="email" name="email" value="<%= typeof user === 'undefined' ? '' : user.email %>" required>
  </div>

  <div>
    <label for="password">Change Password (must be at least 6 characters)</label>
    <input type="password" name="password" minlength="6" maxlength="32">
  </div>
  <div>
    <label for="passwordConfirmation">Confirm Password</label>
    <input type="password" name="passwordConfirmation">
  </div>

  <div>
    <button type="submit">Submit</button>
    <a href="/users/<%= user.id %>">Cancel</a>
  </div>
</form>

<hr>

<h3>Delete Account</h3>
<a href="/users/<%= user.id %>/delete">Delete</a>

<% include ../layouts/footer %>
```

---
## User Delete
* Create the delete controller functions and view.

### Controller functions
#### **`routes/users.js`**
``` js
// Routes
router.get('/:id/delete', deleteForm);
router.post('/:id/delete', destroy);
...
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
```

### View
#### **`views/users/delete.ejs`**
``` html
<% include ../layouts/header %>

<h1>Delete Account: <%= user.username %></h1>

<hr>
<p>
  Are you sure you want to delete this account?
  <form method='POST' action='/users/<%= user.id %>/delete'>
    <input type="hidden" name="id" value="<%= user.id %>">
    <button type='submit'>Yes - Delete Account</button>
    <a href="/users/<%= user.id %>">No - Cancel</a>
  </form>
</p>

<% include ../layouts/footer %>
```

---
## Login and out
To restrict pages to registered users, specific users, or specific user roles you need to authenticate who the user is.
To do this, add login and logout functions, and store a JSON web token that identifies the user in a cookie.
* Use the jsonwebtoken package.
* Jsonwebtoken Docs: <a href="https://github.com/auth0/node-jsonwebtoken">Readme</a>

### SECRET
Jsonwebtoken requires you add an environmental variable called SECRET to the .env file in development. 
#### **`routes/users.js`**
```
SECRET=add-some-secret-string-here
```

### Controller Functions and Views
#### **`routes/users.js`**
``` js
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
```

### View
#### **`views/auth/login.ejs`**
``` html
<% include ../layouts/header %>

<h1>Log In</h1>

<% include ../layouts/form-errors %>

<form method="POST" action="/auth/login">
  <div>
    <label for="email">Email</label>
    <input type="email" name="email" value="<%= typeof user === 'undefined' ? '' : user.email %>" required autofocus>
  </div>

  <div>
    <label for="password">Password</label> (<a href="/auth/forgot-password" tabindex="-1">Forgot Password?</a>)
    <input type="password" name="password" required>
  </div>

  <div>
    <button type="submit">Submit</button>
    <span>New user? <a href="/auth/signup">Sign up now!</a></span>
  </div>
</form>

<% include ../layouts/footer %>
```

### Validation
* Use Express-Validator to confirm that email and password credentials.
* Comment out checking of the account is activated until that functionality is added.
``` js
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
```
---
## CurrentUser
* Add currentUser to local storage. This is used for conditional statements in the view files. For instance show logout button if there is a currentUser and login button if not.
* Make sure to place this before app.use('/', router); or the page will display before getting the currentUser object.
#### **`app.js`**
``` js
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
```

### Navbar
* Add login and logout links to the navbar.
* Use a conditional to show logout link if user is logged in and signup and login links if not.
#### **`views/layouts/header.ejs`**
``` html
...
<% if(!currentUser){ %>
  <li class="nav-item"><a class="nav-link" href="/auth/signup">Sign Up</a></li>
  <li class="nav-item"><a class="nav-link" href="/auth/login">Log In</a></li>   
<% } else { %>
  <li class="nav-item"><a class="nav-link" href="/auth/logout">Log out</a></li>         
<% } %>
...
```

---
## Authorization

* To limit access to controller actions based on whether a user is logged in, is the correct user, or has the right role we need to add middleware to protect the routes.
* Add a module file to hold the auth middleware:
`touch routes/authMiddleware.js`
* Populate the file with functions to check if a user is logged in, if user role is admin, or if user is the correct user.
#### **`routes/authMiddleware.js`**
``` js
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
```
* To only allow logged-in users to access a page, import the middleware module to the router and add isLoggedIn as a callback to the router function before calling the handler functions.
* For example, you may only want registered users to be able to post an article.

#### **`routes/articles.js`**
``` js
const auth = require('./authMiddleware');
...
router.get('/create', auth.isLoggedIn, createForm);
router.post('/create', auth.isLoggedIn, validateForm(), create);
...
```
* To only show the create button to logged in users add a conditional:
#### **`views/articles/list.ejs`**
``` html
<% if(currentUser) { %>
  <a href='/articles/create' class='btn btn-primary float-right'>
Create new article</a>
<% } %>
```