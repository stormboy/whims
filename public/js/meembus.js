/**
 * Meem protocol over sockjs
 */
/**
 * TODO parse messages that are not objects, assuming the payload is JSON.
 */
define([
    	'jquery',
    	'router',
    	'util',
    	'eventemitter',
    	'sockjs'
    ], 
function($, Router, Util, EventEmitter, SockJS) {
	
	var TRACE = false;
	var MAX_LISTENERS = 1000;
	
	var MIN_RECON_INTERVAL = 10;
	var MAX_RECON_INTERVAL = 10000;
	
	/**
	 * Allows Meem communications to occur over sockjs
	 */
	var MeemBus = function(options) {
		EventEmitter.call(this);
		
		options = options || {};
	
		this.socketUrl = options.socketUrl || "/socket";			// socket on the same server
		this.setMaxListeners(MAX_LISTENERS);	// increase maximum listeners
		
		this.subscriptions = {};		// a hash of MQTT topics to subscribe to mapped to the number of client subscriptions requested
		this.sessionOpened = false;
		this._reconnectionInterval = MIN_RECON_INTERVAL;
		if (TRACE) {
			console.log("creating new socket");
		}
		this._createSocket();		
	};
	Util.inherits(MeemBus, EventEmitter);
	
	MeemBus.prototype.isConnected = function() {
		return this.sessionOpened;
	};
	
	/**
	 * Subscribe to a topic on the server.
	 * @param {Object} topic
	 */
	MeemBus.prototype.subscribe = function(topic, listener) {
		this.on(topic, listener);		// add listener to this object
	
		if (this.subscriptions[topic]) {
			this.subscriptions[topic]++;
		}
		else {
			this.subscriptions[topic] = 1;
		}
		
		if (this.sessionOpened) {
			this.socket.send(JSON.stringify({
				type: "subscribe",
				topic: topic
			}));	// subscribe to events from server
		}
	};
	
	/**
	 * Unsubscribe from a topic.
	 * @param {Object} topic
	 */
	MeemBus.prototype.unsubscribe = function(topic, listener) {
		this.removeListener(topic, listener);
		
		// make sure no other subscriptions to this topic exist. 
		if (this.subscriptions[topic]) {
			this.subscriptions[topic]--;
		}
		
		if (this.sessionOpened) {
			if (this.subscriptions[topic] == 0) {
				// unsubscribe if no remaining listeners on this topic
				this.socket.send(JSON.stringify({
					type: "unsubscribe", 
					topic: topic
				}));
			}
		}
	};
	
	/**
	 * Send a message to the server.
	 * 
	 * @param {Object} topic
	 * @param {Object} message
	 */
	MeemBus.prototype.publish = function(topic, message) {
		if (this.sessionOpened) {
			this.socket.send(JSON.stringify({
				type: "publish", 
				data: { topic: topic, message: message }
			}));
		}
		// TODO perhaps cache publish events for a while until connected
	};
	
	MeemBus.prototype.close = function() {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	};


	/**
	 * The amount of time before trying to reconnect socket
	 */
	MeemBus.prototype._getReconnectionInterval = function() {
		if (this._reconnectionInterval > MAX_RECON_INTERVAL) {
			this._reconnectionInterval = MAX_RECON_INTERVAL;
		}
		else if (this._reconnectionInterval < MAX_RECON_INTERVAL) {
			this._reconnectionInterval *= 1.2;
			this._reconnectionInterval = this._reconnectionInterval > MAX_RECON_INTERVAL ? MAX_RECON_INTERVAL : this._reconnectionInterval;
		}
		return this._reconnectionInterval;
	};

	MeemBus.prototype._createSocket = function() {
		this.socket = new SockJS(this.socketUrl);
		
		var self = this;
	
		this.socket.onopen = function () {
			if (TRACE) {
				console.log('socket connected');
			}
			self._reconnectionInterval = MIN_RECON_INTERVAL;	// reset reconnection interval
		};
		
		this.socket.onclose = function () {
			if (TRACE) {
				console.log('socket disconnected');
			}
			self.emit("disconnected");
			// try to reconnect after an interval
			self._reconTimeout = setTimeout(function() {
				self._createSocket();
			}, self._getReconnectionInterval());
		};

		this.socket.onmessage = function (message) {
			message = JSON.parse(message.data);
			switch(message.type) {
				
				case 'sessionOpened': 			// connected to MQTT service
					var data = message.data || {};
					self.sessionOpened = true;
					if (TRACE) {
						console.log('sessionOpened: ' + data.message);
					}
			
					// do desired subscriptions 
					for (var topic in self.subscriptions) {
						if (TRACE) {
							console.log("subscribing to topic: " + topic);
						}
						self.socket.send(JSON.stringify({
							type: 'subscribe', 
							topic: topic
						}));
					}
			
					// TODO wait for all subscriptions? before
					self.emit("connected");
					break;
					
				case 'sessionClosed': 			// disconnected from MQTT service
					self.sessionOpened = false;
					self.emit("disconnected");
					break;
					
				case 'message': 				// handle incoming MQTT message
					var data = message.data || {};
					if (TRACE) {
						//console.log('message topic: ' + data.topic + ' message: ' + data.message);
					}
					var message = (typeof data.message == 'string') ? JSON.parse(data.message) : data.message;
					self.emit(data.topic, message);
					break;
					
				default:
					// unhandled message
					//console.log("unhandled message: " + message.type);
			}
		};
	};
	
	return MeemBus;
});