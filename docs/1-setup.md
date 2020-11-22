# Setup a Node.js App from scratch
* These are the instructions that were used to create the initial structure of this app. 
* You can recreate it by following these instructions.
* Assumes you have node.js installed on your computer and are familiar with the basic UNIX CLI commands.

---
## Generate an app and install dependencies
* Use express-generator to: 
  * Create an app skeleton;
  * Change directories into the project folder;
  * Install the dependencies;
  * And add dotenv package for environmental variables.
  * Add express-session and express-flash to enable flash.

```
npx express-generator node-baseapp --view=ejs --git
cd node-baseapp
npm install
npm install dotenv express-session express-flash
```

---
## Make some modifications to the file structure
* Most of the generated file struction will stay as is.
* Changes: 
  * Add view folders and files for layouts and general pages.
  * Move the index and error pages to the pages folder. Rename index to home.
  * Add .env file to hold environmental variables.
```
mkdir views/layouts
touch views/layouts/header.ejs
touch views/layouts/footer.ejs
mkdir views/pages
touch views/pages/about.ejs
mv views/index.ejs views/pages/home.ejs
mv views/error.ejs views/pages/error.ejs
touch .env
```

---
## The app.js file 
* Express-generator populated the app.js file but we need to make some changes to reflect the modifications to the file structure and the npm packages we added.
* the app.js file contains all the below revisions.
### The changes made:
* Change the variable declarations from var to const.
* Add imports for the session, flash and environmental variables packages we installed.
* Log the port that the app is listening on.
* Add middleware for session and flash.
* Change the location of the error.ejs file since we moved it to the pages folder.

---
## Environmental Variables
* The .env file sets environmental variables that can be used throughout the app.
* The variables are added to Node's process.env object.
* If you want to run the app on a port other than 3000, set the PORT property: `PORT=3000` to 3001 or some other number.
* To use express-sessions you need to add a SECRET property: `SECRET=mysecret`
* Make sure the .env file is in your .gitignore file so you don't expose any sensitive data. To see what the .env file should look like, see the .env.example file.

---
## Routes
* Change the routes file.
  * This file is a module that is imported into the app.js file. 
    * It contains all the app's routes. 
    * The Route callback functions are contained in the controller file(s).
  * Import Express and generate a Router instance.
  * Import the pagesController.
  * Add routes related to the pages controller to the router instance. Specifically, GET requests for the home and about pages.
  * Export the router instance.
```
// routes/index.js 
const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

// Pages routes
router.get('/', pagesController.home);
router.get('/about', pagesController.about);

module.exports = router;
```

---
## Controller
* The controller contains the handler functions for each route.
* These functions merely render the specified HTML templates in the views/pages folder. 
* They also pass an object to the template for a property for title.
```
// controllers/pagesController.js 
// GET /
exports.home = (req, res) => {
  res.render('pages/home', { title: 'Base App' });
};

// GET /about
exports.about = (req, res) => {
  res.render('pages/about', { title: 'About' });
};
```

---
## Views 
### Layout
* The views/layouts folder contains files for the header and footer. These are called partials because they only contain a partial page. 
* They are included in the other HTML template files.
* The header.ejs file contains the navigation bar and displays flash messages.
* There is also a partial for form-errors that is included in form template files.

### Bootstrap
* Bootstrap is a popular styling framework that includes both CSS and JavaScript files. It also requires jQuery and Popper.js.
* For practice apps, to avoid loading these files for every app you can use the CDN version from https://getbootstrap.com. Just be aware it will only load with a working internet connection. 
* For production apps you can use the CDN or install the npm packages: npm install bootstrap jquery popper.js. In this app we are using the CDN.
* The bootstrap CSS link is in the views/layouts/header.ejs partial.
* The Bootstrap, jQuery, and Popper.js CDN links are in the footer.ejs partial.

### Home and About pages
* The views/pages folder contains the view templates for the pages templates - home and about.

---
## Run the App
Run the start script in the package.json file with:
```npm start```  
View the app in the browser at:
```http://localhost:3000```

---
Next add an Articles Collection: [2-Collection](./2-collection.md)