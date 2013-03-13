/**
 * An app that serves html, css and js files, as well as providing a
 * socket.io wrapper around an MQTT service. 
 * 
 * Author: Warren Bloomer
 */

config = require('./settings')			// get settings
whims = require('./lib/whims')
express = require('express')
http = require('http')
path = require('path')

var app = express();

app.configure(function() {
  app.set('port', config.serverPort || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.engine('jade', require('jade').__express);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(app.router);
});

app.configure('production', function() {
  app.set('view cache', true);
});

app.configure('development', function() {
  app.use(express.errorHandler());
  app.locals.pretty = true;
});


// HTTP server listens on configured port.
var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log("Whims server listening on port " + app.get('port'));
});

// create whims service (MQTT over socket.io)
var options = { mqttHost: config.mqttHost, mqttPort: config.mqttPort, log : config.log };
whims.listen(server, options);

// catch uncaught exceptions
process.on('uncaughtException', function(err) {
	console.log("Uncaught exception:", err);
});
