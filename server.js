'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var cors        = require('cors');
var MongoClient = require('mongodb').MongoClient;
var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');
const helmet    = require('helmet');
const MONGODB_CONNECTION_STRING = process.env.DB;

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Mitigate the Risk of Cross Site Scripting (XSS) Attacks with
app.use(helmet.xssFilter());

//Nothing from my website will be cached in my client as a security measure.
app.use(helmet.noCache());

// I will see that the site is powered by 'PHP 4.2.0' even though it isn't as a security measure.
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' })) ;
MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
  if(err) console.log('Database error: ' + err);

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app,db);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});
});
module.exports = app; //for unit/functional testing
