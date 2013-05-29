var crypto = require('crypto')
  , socketio = require('socket.io')
  , mqtt = require("mqtt");

var TRACE = true;		// extra logging

/**
 * exported listen function
 */
exports.listen = function(server, options) {
	var log = options.log ? options.log : false;
	io = socketio.listen(server, {
		log : log
	});
	return new Whims(io, options);
}

if ( typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}

/**
 * constructor
 */
function Whims(io, options) {
	this.mqttHost = options.mqttHost || "127.0.0.1";	// host for the MQTT server to connect to
	this.mqttPort = options.mqttPort || 1833;			// port for the MQTT server

	var instance = this;

	io.sockets.on('connection', function(socket) {
		instance.connectionHandler(socket);				// handle socket connections
	});
}

/**
 * A connection handler for a Socket.IO socket.
 */
Whims.prototype.connectionHandler = function(socket) {
	var instance = this;
	var requests = {};

	if (TRACE) {
		console.log("Client connected with io socket. id: " + socket.id);
	}


	//mqtt.createClient(this.mqttPort, this.mqttHost, function(err, mqttClient) {
		// if (err) {
		// 	console.log("error while creating MQTT client to " + instance.mqttHost + ": " + err);
		// 	return;
		// }

		var connected = false;
		var clientId = "whims_" + socket.id;

		var mqttClient = mqtt.createClient(this.mqttPort, this.mqttHost, {
			keepalive: 10000,
			client : clientId
		});

		// emit a hello event to the socket client
		socket.emit('connected', {
			message : '(value "socket connected")'
		});

		socket.on('disconnect', function() {// on socket disconnection
			if (TRACE) {
				console.log("disconnecting mqtt client");
			}
			mqttClient.end();
		});
		socket.on('subscribe', function(topic) {
			if (TRACE) {
				console.log('subscribe to ' + topic);
			}
			mqttClient.subscribe(topic);		// TODO emit successful subscription

			// request initial content with random request ID
			crypto.randomBytes(24, function(ex, buf) {
				var requestId = buf.toString('hex');
				var responseTopic = clientId + "/" + requestId;
				requests[requestId] = topic;
				//console.log('subscribe to ' + topic);
				mqttClient.subscribe(responseTopic);
				// TODO do publish on successful callback from subscribe
				mqttClient.publish(topic + "?", responseTopic);
			});
		});
		socket.on('unsubscribe', function(topic) {
			if (TRACE) {
				console.log('unsubscribe from ' + topic);
			}
			mqttClient.unsubscribe(topic);
		});
		socket.on('publish', function(data) {
			if (TRACE) {
				console.log('publish to ' + data.topic + " : " + data.message);
			}
			mqttClient.publish(data.topic, data.message);
		});

		mqttClient.on('connect', function() {
			if (TRACE) {
				console.log("Client connected to MQTT server");
			}
			// if (packet.returnCode === 0) {
				connected = true;
				//startPing();
				socket.emit('sessionOpened', {
					message : { value : "MQTT connected" }
				});
			// }
			// else {
			// 	socket.emit('sessionClosed', {
			// 		message : { value : "MQTT connection failed" }
			// 	});
			// }
		});
		mqttClient.on('close', function() {
			connected = false;
			stopPing();
			if (TRACE) {
				console.log("MQTT close");
			}
			socket.emit('sessionClosed', {
				message : { value : "MQTT connection closed" }
			});
		});
		mqttClient.on('error', function(e) {
			console.log('MQTT error %s', e);
		});
		mqttClient.on('message', function(topic, payload) {				// got data from subscribed topic
			if (topic.startsWith(clientId)) {			// message is a response to initial-content request
				var requestId = topic.slice(clientId.length + 1, topic.length);
				var respTopic = requests[requestId];				// get the destination topic for the content
				if (respTopic) {
					if (TRACE) {
						console.log('MQTT received initial content: ' + respTopic + ' : ' + payload);
					}
					socket.emit('message', {
						topic : respTopic,
						message : payload
					});
					delete requests[requestId];					// delete facet topic from initial-content topics
					mqttClient.unsubscribe(topic);				// unsubscribe from response topic
				}
			} else {
				if (TRACE) {
					console.log('received ' + topic + ' : ' + payload);
				}
				socket.emit('message', {
					topic : topic,
					message : payload
				});
			}
		});

		// connect to the MQTT service
		//mqttClient.connect({
		//	keepalive : 60,
		//	client : clientId
		//});

		/**
		 * ping functions
		 */
		var pingTimer;
		function ping() {
			if (connected) {
				if (TRACE) {
					console.log("pinging MQTT server");
				}
				mqttClient.pingreq();
				setTimeout(ping, 60000);
			}
		}

		function startPing() {
			if (pingTimer) {
				clearTimeout(pingTimer);
			}
			setTimeout(ping, 60000);			// make sure we ping the server
		}

		function stopPing() {
			if (pingTimer) {
				clearTimeout(pingTimer);
			}
		}

	//});
}