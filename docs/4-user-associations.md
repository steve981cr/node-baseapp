# User One-to-Many Association<br><small>One user has many of a collection (Articles)</small>
## Add userId column to the articles table
* Create a DB migration file:
`sequelize migration:create --name addUseridToArticles`
* Populate the migration file
#### **`migrations/addUseridToArticles.js`**
``` js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Articles', // table name 
      'userId', // new field name
      { 
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId',
        }        
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Articles',  'userId')
  }
};
```
* Run the migration: `sequelize db:migrate`

---
## Models - Add hasMany() belongsTo() associations
* Add belongsTo() association to Article.
* On delete (i.e., when the associated user is deleted) set userId to NULL.
* Add the userId field to the model. Type is INTEGER
#### **`models/article.js`**
``` js
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'SET NULL'
      })
    }
  };
  Article.init({
    ...
    userId: DataTypes.INTEGER,
  }
};
```

* Add hasTo() association to User.
#### **`models/user.js`**
``` js
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Article, {
        foreignKey: 'userId',
      })
    }
  };
  ...
};
```

---
## Article Create Controller function and View
* Add userId to the article create controller function.
* Use the build method to create a local JS Article instance.
* Get the userId from the currentUser local variable set when a user logs in. This is set in the app.js file. 
* Assign it to the article instance.
* Then save the article instance to the db.

#### **`routes/articles.js`**
``` js
// POST /articles/create
async function create(req, res, next) {
  ...
  try {
    const article = Article.build(req.body);
    article.userId = res.locals.currentUser.id;
    await article.save();
    req.flash('success', 'Article has been created.');
    res.redirect(`/articles/${article.id}`);    
  } ...
};
```

---
## Article Detail Controller function and View
#### **`routes/articles.js`**
``` js
const { Article, User } = require('../models');
...
// GET /articles/:id
async function details(req, res, next) { 
  try {
    const article = await Article.findByPk(req.params.id, {include: User});
    if (!article) { return next(createError(404)) }
    res.render('articles/details', { title: 'Article', 
      article: article });    
  } catch (err) {
    return next(err);    
  }
};
```
* Add username to the article details page. To make username optional, wrap it in a conditional. Otherwise remove the if clause.
#### **`views/articles/list.js`**
```
<% if (article.User) { %>
  <strong>By:</strong> <%= article.User.username %> <br>
<% } %>
```

---
## Add userId to existing articles directly in the DB
* You can add userId to articles using SQL in the SQLite shell.
* Open the SQLite shell: `sqlite3 database.sqlite3`  
* Add userId to existing article records.
```
UPDATE articles SET userId = 1 WHERE id = 1;
UPDATE articles SET userId = 1 WHERE id = 2;
UPDATE articles SET userId = 2 WHERE id = 3;
```
* Close the shell: `Ctrl+D`