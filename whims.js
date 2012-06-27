/**
 * An app that serves html, css and js files, as well as providing a
 * socket.io wrapper around an MQTT service. 
 * 
 * Author: Warren Bloomer (warren@sugarcoding.net)
 */

// get settings
var config = require('./settings');
var serverPort = config.serverPort;		// port for running this HTTP server.
var mqttHost = config.mqttHost;			// host for the MQTT server to connect to
var mqttPort = config.mqttPort;			// port for the MQTT server

var app = require('http').createServer(httpHandler)
	, io = require('socket.io').listen(app, { log : false })
	, fs = require('fs')
	, path = require('path')
//	, connect = require('connect')
	, events = require('events')
	, mqtt = require('./lib/mqttclient');

app.listen(serverPort);

/**
 *  io.socket connection
 */
io.sockets.on('connection', function(socket) {
	// client to MQTT service
	var mqttClient;

	// emit a hello event to the socket client
	socket.emit('connected', { message : '(value "socket connected")' });

	socket.on('disconnect', function() {				// on socket disconnection
		console.log("disconnecting mqtt client");
		if (mqttClient) {
			mqttClient.disconnect();
		}
	});
	socket.on('subscribe', function(topic) {
		console.log('subscribe to ' + topic);
		mqttClient.subscribe(topic);
	});
	socket.on('unsubscribe', function(topic) {
		console.log('unsubscribe from ' + topic);
		mqttClient.unsubscribe(topic);
	});
	socket.on('publish', function(data) {
		console.log('publish to ' + data.topic + " : " + data.message);
		mqttClient.publish(data.topic, data.message);
	});
	
	// currently using a random string for MQTT client id. TODO get a client_id from the request (maybe stored in session)
	require('crypto').randomBytes(24, function(ex, buf) {
		var clientId = buf.toString('hex');
		
		// create an MQTT client for this socket, using a random client id
		mqttClient = new mqtt.MQTTClient(mqttPort || 1883, mqttHost || '127.0.0.1', clientId);
		mqttClient.addListener('sessionOpened', function() {
			socket.emit('sessionOpened', {
				message : '(value "MQTT connected")'
			});
		});
		mqttClient.addListener('openSessionFailed', function() {
			socket.emit('sessionClosed', {
				message : '(value "MQTT connection failed")'
			});
		});
		mqttClient.addListener('connectTimeOut', function() {
			// ??? seems to timeout a lot
		});
		mqttClient.addListener('mqttData', function(topic, payload) {
			// got data from subscribed topic
			console.log('received ' + topic + ' : ' + payload);
			socket.emit('message', {
				topic : topic.toString(),
				message : payload.toString()
			});
		});
	});
});

/**
 * handle errors
 */
emitter = new events.EventEmitter();
emitter.on('error', function(err) { 
	console.log("Error from emitter:", err) 
});

/**
 * catch uncaught exceptions
 */
process.on('uncaughtException', function(err) {
	console.log("Uncaught exception:", err);
});

/**
 * HTTP server handler
 */
function httpHandler(request, response) {
	var filePath = 'html' + request.url;
	if (filePath == 'html/') {
		filePath = 'html/index.html';
	}
	var extname = path.extname(filePath);
	console.log("getting: " + filePath);
	var contentType = 'text/html';
	switch (extname) {
	case '.js':
	case '.json':
		contentType = 'text/javascript';
		break;
	case '.css':
		contentType = 'text/css';
		break;
	case '.jpg':
	case '.jpeg':
		contentType = 'image/jpeg';
		break;
	case '.gif':
		contentType = 'image/gif';
		break;
	case '.png':
		contentType = 'image/png';
		break;
	}
	path.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				} else {
					response.writeHead(200, { 'Content-Type' : contentType });
					response.end(content, 'utf-8');
				}
			});
		} else {
			response.writeHead(404);
			response.end();
		}
	});
}
