/**
 * An app that serves html, css and js files, as well as providing a
 * socket.io wrapper around an MQTT service. 
 * 
 * Author: Warren Bloomer
 */

var config = require('./settings')						// get settings
	, http = require("./lib/http")						// get server handlers
	, server = require('http').createServer(http.requestHandler)	// create http server with http handler
	, whims = require('./lib/whims')
	, events = require('events')

// HTTP server listens on configured port.
var serverPort = config.serverPort || 80;		// port for running the HTTP server.
server.listen(serverPort);

// create whims service (MQTT over socket.io)
var options = { mqttHost: config.mqttHost, mqttPort: config.mqttPort, log : config.log };
whims.listen(server, options);

// catch uncaught exceptions
process.on('uncaughtException', function(err) {
	console.log("Uncaught exception:", err);
});
