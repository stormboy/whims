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

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
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
		// handle socket connections
		Whims.connectionHandler(instance, socket);
	});
}

/**
 * A connection handler for a Socket.IO socket.
 */
Whims.connectionHandler = function(whims, socket) {
	var requests = {};
	
	console.log("Client connected with io socket. id: " + socket.id);

	mqtt.createClient(whims.mqttPort, whims.mqttHost, function(err, mqttClient) {
		if (err) {
			console.log("got MQTT err: " + err);
			return;
		}
		var connected = false;
		var clientId = "whims_" + socket.id;
		
		// emit a hello event to the socket client
		socket.emit('connected', { message : '(value "socket connected")' });
	
		socket.on('disconnect', function() {				// on socket disconnection
			console.log("disconnecting mqtt client");
			mqttClient.disconnect();
		});
		socket.on('subscribe', function(topic) {
			console.log('subscribe to ' + topic);
			mqttClient.subscribe({topic: topic});
			
			// request initial content with random request ID
			crypto.randomBytes(24, function(ex, buf) {
				var requestId = buf.toString('hex');
				var responseTopic = clientId + "/" + requestId;
				requests[requestId] = topic;
				//console.log('subscribe to ' + topic);
				mqttClient.subscribe({topic: responseTopic});
				mqttClient.publish({
					topic: topic+"?",
					payload: responseTopic
				});
			});
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
				connected = true;
				startPing();
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
			connected = false;
			stopPing();
			console.log("mqtt close");
			socket.emit('sessionClosed', {
				message : '(value "MQTT connection closed")'
			});
		});
		mqttClient.on('error', function(e) {
			console.log('mqtt error %s', e);
		});
		mqttClient.on('publish', function(packet) {	// got data from subscribed topic
			if (packet.topic.startsWith(clientId)) {
				// message is a response to initial-content request
				var requestId = packet.topic.slice(clientId.length+1, packet.topic.length);
				var topic = requests[requestId];	// get the destination topic for the content
				if (topic) {
					console.log('received initial content: ' + topic + ' : ' + packet.payload);
					socket.emit('message', {
						topic : topic,
						message : packet.payload
					});
					delete requests[requestId];	// delete facet topic from initial-content topics
					mqttClient.unsubscribe({topic: packet.topic});	// unsubscribe from response topic
				}
			}
			else {
				console.log('received ' + packet.topic + ' : ' + packet.payload);
				socket.emit('message', {
					topic : packet.topic,
					message : packet.payload
				});
			}
		});
		
		// connect to the MQTT service
		mqttClient.connect({
			keepalive: 60,
			client: clientId
		});

		/**
		 * ping functions
		 */	
		var pingTimer;
		function ping() {
			if (connected) {
				console.log("pinging MQTT server");
				mqttClient.pingreq();
				setTimeout(ping, 60000);
			}
		}
		function startPing() {
			if (pingTimer) {
				clearTimeout(pingTimer);
			}
			setTimeout(ping, 60000);		// make sure we ping the server	
		}
		function stopPing() {
			if (pingTimer) {
				clearTimeout(pingTimer);
			}
		}
	});
}