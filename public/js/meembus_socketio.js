/**
 * Meem protocol over io.socket
 */
define([
    	'jquery',
    	'router',
    	'util',
    	'eventemitter',
    	'socketio'
    ], 
function($, Router, Util, EventEmitter, io) {
	
	var TRACE = true;
	var MAX_LISTENERS = 1000;
	
	/**
	 * Allows Meem communications to occur over socket.io
	 */
	var MeemBus = function(options) {
		EventEmitter.call(this);
		
		options = options || {};
	
		this.socketUrl = options.socketUrl || "/";			// socket on the same server
		this.setMaxListeners(MAX_LISTENERS);	// increase maximum listeners
		
		this.subscriptions = {};		// a hash of MQTT topics to subscribe to mapped to the number of client subscriptions requested
		this.sessionOpened = false;
		this.socket = io.connect(this.socketUrl);				// IO socket
		
		var self = this;
	
		this.socket.on('connected', function (data) {
			if (TRACE) {
				console.log('socket connected: ' + data.message);
			}
		});
		
		this.socket.on('disconnected', function (data) {
			if (TRACE) {
				console.log('socket disconnected: ' + data.message);
			}
		});
	
		// a handler for 
		this.socket.on('sessionOpened', function (data) {		// connected to MQTT service
			self.sessionOpened = true;
			if (TRACE) {
				console.log('sessionOpened: ' + data.message);
			}
	
			// do desired subscriptions 
			for (topic in self.subscriptions) {
				if (TRACE) {
					console.log("subscribing to topic: " + topic);
				}
				self.socket.emit('subscribe', topic);
			}
	
			// TODO wait for all subscriptions? before
			self.emit("connected");
		});
		
		this.socket.on('sessionClosed', function (data) {		// disconnected from MQTT service
			self.sessionOpened = false;
			self.emit("disconnected");
		});
		
		// a handler for incoming MQTT messages
		this.socket.on('message', function (data) {
			if (TRACE) {
				console.log('message topic: ' + data.topic + ' message: ' + data.message);
			}
			self.emit(data.topic, data.message);
		});
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
			this.socket.emit("subscribe", topic);	// subscribe to events from server
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
				this.socket.emit("unsubscribe", topic);
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
			this.socket.emit("publish", { topic: topic, message: message });
		}
		// TODO perhaps cache publish events for a while until connected
	};
	
	return MeemBus;
});