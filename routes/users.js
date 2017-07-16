const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Proccess
router.post('/register', (req, res) => {
  const user = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    password2: req.body.password2
  }

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  // Get Errors
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      res.render('register', {
        errors: result.array()
      })
    } else {
      let newUser = new User({
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(err => {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash('success', 'You are now registered and can log in');
              res.redirect('/users/login');
            }
          })
        })
      });
    }
  });
});

// Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Proccess
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You Are logged out');
  res.redirect('/users/login');
});


module.exports = router;
