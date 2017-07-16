const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');


// Connect to DB
 mongoose.Promise = global.Promise;
const db = mongoose.connect(config.database, {
   useMongoClient: true
});

// Check connection
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
  console.log(err);
});

// Init App
const app = express();

app.set('port', (process.env.PORT || 5000));

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//Set Publinc Folder
app.use(express.static(path.join(__dirname, 'public')));

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Express Session Middleware
app.use(session({
  secret: 'yoursecret',
  resave: true,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Bring in Models
let Article = require('./models/article');

//Home Route
app.get('/', (req, res) => {
  Article.find((err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
// Routes
app.use('/articles', articles);
app.use('/users', users);

// Start Server
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
