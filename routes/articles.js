const express = require('express');
const router = express.Router();

// Bring in Models
let Article = require('../models/article');
let User = require('../models/user');

// Access Control
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('add_article', {
    title: 'Add Article'
  });
});

// Add Submit POST Route
router.post('/add', (req, res) => {
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // Get Errors
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      res.render('add_article', {
        title: 'Add Article',
        errors: result.array()
      })
    } else {
      newArticle = {
        title: req.body.title,
        author: req.user._id,
        body: req.body.body
      }
      let article = new Article(newArticle);
      article.save((err) => {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash('success', 'Article Added');
          res.redirect('/');
        }
      });
    }
  });
});

//Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
      title: 'Edit Article',
      article: article
    });
  })
});

// Update Article
router.post('/edit/:id', (req, res) => {
  article = {
    title: req.body.title,
    author: req.body.author,
    body: req.body.body
  }

  Article.findByIdAndUpdate(req.params.id, article, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated')
      res.redirect('/');
    }
  });
});

// Delete Article
router.delete('/:id', (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

//Get Single Article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});



module.exports = router;
