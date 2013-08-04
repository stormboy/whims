/**
 * An app that serves html, css and js files, as well as providing a
 * socket.io wrapper around an MQTT service. 
 * 
 * Author: Warren Bloomer
 */

var config  = require('./settings')			// get settings
var whims   = require('./lib/whims')
var express = require('express')
var http    = require('http')
var path    = require('path')
var routes  = require('./routes');

// create the expressjs app
var app = express();

app.locals.basepath = config.basePath || "";  // set basepath variable

app.set('port', config.serverPort || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
  
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(function(req,res,next){							// put request path in req.locals for access by views
    res.locals.path = req.path; // put path in req
    next();
});
app.use(app.router);
app.use(routes.error);									// error catch-all
app.use(function(req,res){								// if we get to this point, resource is not found
	res.status(404);
    res.render('errors/404.jade');
});

app.configure('production', function() {
  app.set('view cache', true);
});

app.configure('development', function() {
  app.use(express.errorHandler());
  app.locals.pretty = true;
});

routes.init(app);

// HTTP server listens on configured port.
var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log("Whims server listening on port " + app.get('port'));
});

// create whims service (MQTT over socket.io)
var options = { 
	mqttHost: config.mqttHost, 
	mqttPort: config.mqttPort, 
	log : config.log 
};
console.log("options: " + JSON.stringify(options));

whims.listen(server, options);

// catch uncaught exceptions
process.on('uncaughtException', function(err) {
	console.log("Uncaught exception:", err);
});
