var crypto = require('crypto')
	, socketio = require('socket.io')
	, mqtt = require('./mqttclient')

/**
 * exported listen function
 */
exports.listen = function(server, options) {
	var log = options.log ? options.log : false;
	io = socketio.listen(server, { log: log });
	return new Whims(io, options);
}

/**
 * constructor 
 */
function Whims(io, options) {
	this.mqttHost = options.mqttHost || "127.0.0.1";	// host for the MQTT server to connect to
	this.mqttPort = options.mqttPort || 1833;			// port for the MQTT server
	var instance = this;
	io.sockets.on('connection', function(socket) {
		// handle socket connections
		Whims.connectionHandler(instance, socket);
	});
}

/**
 * A connection handler for a Socket.IO socket.
 */
Whims.connectionHandler = function(whims, socket) {
	// client to MQTT service
	var mqttClient;
	
	console.log("Client connected with io socket");

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
	
	// currently using a random string for MQTT client id. 
	// TODO get a client_id from the request (maybe stored in session)
	
	crypto.randomBytes(24, function(ex, buf) {
		var clientId = buf.toString('hex');
		
		// create an MQTT client for this socket, using a random client id
		mqttClient = new mqtt.MQTTClient(whims.mqttPort, whims.mqttHost, clientId);
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
}