var express      = require('express');	
var session = require('express-session');	
var app          = express(); 				
var bodyParser   = require('body-parser'); 	
var morgan       = require('morgan'); 		
var mongoose     = require('mongoose');
var config 	     = require('./config');
var path 	     = require('path');
var cookieParser = require('cookie-parser');

/**
* use body parser so we can grab information from POST requests
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up a secret to encrypt cookies
var MONTH_LENGTH_MS = 86400000*30 // sessions last for one month
app.use(session({ secret : '6170', resave : true, saveUninitialized : true, cookie : {maxAge: MONTH_LENGTH_MS} }));

/**
* configure our app to handle CORS requests
*/
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

/**
* log all requests to the console 
*/
app.use(morgan('dev'));

/** 
* connect to our database
*/
// mongoose.connect(config.database); 
// Connect to either the MONGOLAB_URI or to the local database.
// mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/mymongodb' || config.database);
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'mongodb://localhost/ideatedb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

/**
* set static files location
* used for requests that our frontend will make
*/
app.use(express.static(__dirname + '/public'));

/**
* api routes
*/
var boardRoutes = require('./app/routes/board_routes')(app, express);
var userRoutes = require('./app/routes/user_routes')(app, express);
app.use('/board', boardRoutes);
app.use('/users', userRoutes);

/**
* main catchall route
* send users to frontend
* has to be registered after api routes
*/
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

/**
* Catch 404 and forward to error handler
*/
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
* Start the server
*/
app.listen(config.port);
console.log('Listen on port ' + config.port);