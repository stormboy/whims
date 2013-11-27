var crypto = require("crypto")
  /, socketio = require("socket.io")
  , mqtt = require("mqtt");

var TRACE = true;		// extra logging

/**
 * exported listen function
 */
exports.listen = function(server, options) {
	var log = options.log ? options.log : false;
	
	// socket.io version
	var io = socketio.listen(server, { log : log });
	var sockets = io.sockets;
	
	return new Whims(sockets, options);
};

if ( typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
}

/**
 * constructor
 */
function Whims(sockets, options) {
	this.mqttHost = options.mqttHost || "127.0.0.1";	// host for the MQTT server to connect to
	this.mqttPort = options.mqttPort || 1833;			// port for the MQTT server

	var self = this;

	sockets.on('connection', function(socket) {
		self.connectionHandler(socket);				// handle socket connections
	});
}

/**
 * A connection handler for a Socket.IO socket.
 */
Whims.prototype.connectionHandler = function(socket) {
	var instance = this;
	var requests = {};			// hash of content-request request-id to topic whose content is requested

	if (TRACE) {
		console.log("Client connected with io socket. id: " + socket.id);
	}

	var connected = false;
	var clientId = "whims_" + socket.id;

	var mqttClient = mqtt.createClient(this.mqttPort, this.mqttHost, {
		keepalive: 10000,
		client : clientId
	});

	// emit a "hello" event to the socket client
	socket.emit('connected', {
		message : "socket connected"
	});

	/* ------------------ handle SocketIO events -------------- */

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
			mqttClient.subscribe(responseTopic, function(err, granted){
				// publish request on successful callback from subscribe
				mqttClient.publish(topic + "?", responseTopic);
			});
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
	socket.on('disconnect', function() { // on socket disconnection
		if (TRACE) {
			console.log("disconnecting mqtt client");
		}
		mqttClient.end();
	});

	/* --------------- handle MQTT client events ----------------- */

	mqttClient.on('connect', function() {
		if (TRACE) {
			console.log("Client connected to MQTT server");
		}
		connected = true;
		socket.emit('sessionOpened', {
			message : { value : "MQTT connected" }
		});
	});
	mqttClient.on('close', function() {
		connected = false;
		if (TRACE) {
			console.log("MQTT close");
		}
		socket.emit('sessionClosed', {
			message : { value : "MQTT connection closed" }
		});
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
	mqttClient.on('error', function(e) {
		console.log('MQTT error %s', e);
	});

};