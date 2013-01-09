var crypto = require('crypto')
	, socketio = require('socket.io')
    , mqtt = require("mqttjs");
    
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
	
	console.log("Client connected with io socket");

	mqtt.createClient(whims.mqttPort, whims.mqttHost, function(err, mqttClient) {
		if (err) {
			console.log("got MQTT err: " + err);
		}
		
		// emit a hello event to the socket client
		socket.emit('connected', { message : '(value "socket connected")' });
	
		socket.on('disconnect', function() {				// on socket disconnection
			console.log("disconnecting mqtt client");
			mqttClient.disconnect();
		});
		socket.on('subscribe', function(topic) {
			console.log('subscribe to ' + topic);
			mqttClient.subscribe({topic: topic});
		});
		socket.on('unsubscribe', function(topic) {
			console.log('unsubscribe from ' + topic);
			mqttClient.unsubscribe({topic: topic});
		});
		socket.on('publish', function(data) {
			console.log('publish to ' + data.topic + " : " + data.message);
			mqttClient.publish({topic: data.topic, payload: data.message});
		});

		mqttClient.on('connack', function(packet) {
			console.log("Client connected to MQTT server");
			if (packet.returnCode === 0) {
				socket.emit('sessionOpened', {
					message : '(value "MQTT connected")'
				});
			}
			else {
				socket.emit('sessionClosed', {
					message : '(value "MQTT connection failed")'
				});
			}
		});
		mqttClient.on('close', function() {
			console.log("mqtt close");
			socket.emit('sessionClosed', {
				message : '(value "MQTT connection failed")'
			});
		});
		mqttClient.on('error', function(e) {
			console.log('mqtt error %s', e);
		});
		mqttClient.on('publish', function(packet) {
			// got data from subscribed topic
			console.log('received ' + packet.topic + ' : ' + packet.payload);
			socket.emit('message', {
				topic : packet.topic,
				message : packet.payload
			});
		});
		
		// connect to the MQTT service
		mqttClient.connect({keepalive: 60});
	
		// make sure we ping the server	
		var ping = function() {
			console.log("pinging MQTT server");
			mqttClient.pingreq();
			setTimeout(ping, 60000);
		}
		setTimeout(ping, 60000);
	});
}