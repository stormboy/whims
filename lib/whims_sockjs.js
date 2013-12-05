var crypto = require("crypto")
  , sockjs = require("sockjs")
  , mqtt = require("mqtt");

var TRACE = true;		// extra logging

/**
 * exported listen function
 */
exports.listen = function(server, options) {
	var log = options.log ? options.log : false;
	
	// sockjs version
	var sockOptions = options.sockjs || {};
	var sockets = sockjs.createServer(sockOptions);
	sockets.installHandlers(server, { prefix: '/meem' });

	return new Whims(sockets, options.mqtt);
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
	this.mqttHost = options.host || "127.0.0.1";	// host for the MQTT server to connect to
	this.mqttPort = options.port || 1833;			// port for the MQTT server

	var self = this;

	sockets.on('connection', function(socket) {
		socket.send = function(message) {
			console.log("sending message: " + JSON.stringify(message));
			socket.write(JSON.stringify(message));
		};
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
		console.log("Client connected with socket. id: " + socket.id);
	}

	var connected = false;
	var clientId = "whims_" + socket.id;

	var mqttClient = mqtt.createClient(this.mqttPort, this.mqttHost, {
		keepalive: 10000,
		client : clientId
	});

	// emit a "hello" event to the socket client
	socket.send({
		type: 'connected', 
		data: {
			message : "socket connected"
		}
	});

	/* ------------------ handle SocketIO events -------------- */
	socket.on('data', function(message) {
		message = JSON.parse(message);
		switch(message.type) {
			
			case 'subscribe':
				var topic = message.topic;
				if (TRACE) {
					console.log('subscribe to ' + topic);
				}
				mqttClient.subscribe(topic);		// TODO emit successful subscription
		
				// request initial content with random request ID
				crypto.randomBytes(24, function(ex, buf) {
					var requestId = buf.toString('hex');
					var responseTopic = clientId + "/" + requestId;
					requests[requestId] = topic;	// keep track of responseTopic for later unsubscribing when response comes
					mqttClient.subscribe(responseTopic, function(err, granted){
						// publish request on successful callback from subscribe
						mqttClient.publish(topic + "?", responseTopic);
					});
				});
				break;
				
			case 'unsubscribe':
				var topic = message.topic;
				if (TRACE) {
					console.log('unsubscribe from ' + topic);
				}
				mqttClient.unsubscribe(topic);
				break;
				
			case 'publish':
				var data = message.data;
				if (TRACE) {
					console.log('publish to ' + data.topic + " : " + data.message);
				}
				mqttClient.publish(data.topic, data.message);
				break;
				
			default:
				// unhandled message
				console.log("unhandled message: " + message);
		}
	});

	socket.on('close', function() { // on socket disconnection
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
		socket.send({
			type: 'sessionOpened',
			data: {
				message : { value : "MQTT connected" }
			}
		});
	});
	mqttClient.on('close', function() {
		connected = false;
		if (TRACE) {
			console.log("MQTT close");
		}
		socket.send({
			type: 'sessionClosed',
			data: {
				message : { value : "MQTT connection closed" }
			}
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
				socket.send({
					type: 'message',
					data: {
						topic : respTopic,
						message : payload
					}
				});
				delete requests[requestId];					// delete facet topic from initial-content topics
				mqttClient.unsubscribe(topic);				// unsubscribe from response topic
			}
		} else {
			if (TRACE) {
				console.log('received ' + topic + ' : ' + payload);
			}
			socket.send({
				type: 'message',
				data: {
					topic : topic,
					message : payload
				}
			});
		}
	});
	mqttClient.on('error', function(e) {
		console.log('MQTT error %s', e);
	});

};