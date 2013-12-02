var util = require("util");
var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');

var TRACE = true;
var MAX_LISTENERS = 1000;
var REQ_TIMEOUT = 20000;		// timeout for content requests, in milliseconds 

/**
 * Provides Meem Facet communication over MQTT.
 * 
 * Local Meem messaging:
 * - Receiving messages for an inbound Facet
 * - Sending messages from an outbound Facet
 * 
 * Remote Meem messaging
 * - Sending messages to an inbound Facet
 * - Receiving messages from an outboundFacet
 * 
 * Content requests for local Meem:
 * - Receiving content/state requests.
 * - Sending content
 * 
 * Content requests for remote Meem:
 * - Requesting content/state from a Facet
 * - Receiving content/state from a Facet
 * 
 * TODO allow local messages too.
 */
var MeemBus = function(mqttClient) {
	EventEmitter.call(this);

	var self = this;
	
	this.setMaxListeners(MAX_LISTENERS);
	
	this._messageEmitter = new EventEmitter();
	this._messageEmitter.setMaxListeners(MAX_LISTENERS);
	
	this._requestEmitter = new EventEmitter();
	this._requestEmitter.setMaxListeners(MAX_LISTENERS);

	this._subscriptions = {};		// a hash of MQTT topics to subscribe to mapped to the number of client subscriptions requested
	
	this._mqttClient = mqttClient;
	
	this._init(mqttClient);
};

util.inherits(MeemBus, EventEmitter);

MeemBus.prototype.sendMessage = function(topic, message) {
	this._mqttClient.publish(topic, JSON.stringify(message));
};

/**
 * Add message listener
 * handler is a message handler
 */
MeemBus.prototype.onMessage = function(topic, handler) {
	this._messageEmitter.on(topic, handler);
	this._addSubscription(topic);
};

MeemBus.prototype.removeMessageHandler = function(topic, handler) {
	this._messageEmitter.removeListener(topic, handler);
	this._removeSubscription( topic );
};


MeemBus.prototype.makeRequest = function(topic, query, requestId, cb) {
	var self = this;
	if (typeof requestId == 'function') {
		cb = requestId;
		requestId = crypto.randomBytes(8).toString('hex');
	}
	if (typeof requestId == 'undefined') {
		requestId = crypto.randomBytes(8).toString('hex');
	}
	var responseTopic = "/response/" + requestId;
	
	this._mqttClient.subscribe(responseTopic);
	
	var requestTopic = topic + "?";
	if (query) {
		requestTopic += "/" + marshalQuery(query);
	}
	
	this._mqttClient.publish(requestTopic, responseTopic);
	
	var t = setTimeout(function() {
		if (typeof cb != 'undefined') {
			var err = new Error("timeout waiting for response");
			cb(err);
		}
		self._mqttClient.unsubscribe(responseTopic);
	}, REQ_TIMEOUT);

	this._messageEmitter.once(responseTopic, function(payload) {
		t.clearTimeout();
		if (typeof cb != 'undefined') {
			cb(null, payload);
		}
		self._mqttClient.unsubscribe(responseTopic);
	});
};

/**
 * Add content-request listener
 * handler is a request handler
 */
MeemBus.prototype.onRequest = function(topic, handler) {
	this._requestEmitter.on(topic, handler);
	this._addSubscription( topic + "?" );
	this._addSubscription( topic + "?/#" );
};

MeemBus.prototype.removeRequestHandler = function(topic, handler) {
	this._requestEmitter.removeListener(topic, handler);
	this._removeSubscription( topic + "?" );
	this._removeSubscription( topic + "?/#" );
};


MeemBus.prototype._addSubscription = function(topic) {
	if (this._subscriptions[topic]) {
		this._subscriptions[topic]++;
	}
	else {
		this._subscriptions[topic] = 1;
	}
	
	if (this._connected) {
		this._mqttClient.subscribe( topic );
	}
};

MeemBus.prototype._removeSubscription = function(topic) {
	if (this._subscriptions[topic]) {
		this._subscriptions[topic]--;
		if (this._subscriptions[topic] == 0 && this._mqttClient.connected) {
			// no remaining listeners on this topic so unsubscribe from MQTT topic
			this._mqttClient.unsubscribe(topic);
		}
	}
};

/**
 * subscribe to all subscription requests
 */
MeemBus.prototype._subscribe = function() {
	for (topic in this._subscriptions) {
		if (TRACE) {
			console.log("subscribing to topic: " + topic);
		}
		this._mqttClient.subscribe(topic);
	}
};

MeemBus.prototype._init = function(mqttClient) {
	var self = this;
	
	if (TRACE) {
		console.log("initialise MQTT connection");
	}
	
	// add handlers to MQTT client

	mqttClient.on('connect', function() {
		if (TRACE) {
			console.log('MQTT sessionOpened');
		}
		self._subscribe();	// subscribe to control and request topics
		self.emit("online");
	});
	
	mqttClient.on('close', function() {
		if (TRACE) {
			console.log('MQTT close');
		}
		self.emit("offline");
	});
	
	mqttClient.on('error', function(e) {
		if (TRACE) {
			console.log('MQTT error: ' + e);
		}
	});
	
	mqttClient.addListener('message', function(topic, payload) {
		// got data from subscribed topic
		if (TRACE) {
			console.log('received ' + topic + ' : ' + payload);
		}

		// check if message is a request for current value, send response
		var i = topic.indexOf("?");
		if (i > 0) {
			self._handleContentRequest(topic, payload);
		}
		else {
			var message = JSON.parse(payload);
			self._handleMessage(topic, message);
		}
	});
};


MeemBus.prototype._handleContentRequest = function(topic, payload) {
	var i = topic.indexOf("?");
	var requestTopic = topic.slice(0, i);
	var responseTopic = payload;
	var query = topic.slice(i);
	
	if (topic.length > i+2) {
		var queryString = topic.slice(i+2);
		query = unmarshalQuery(queryString);
	}
	
	var request = new ContentRequest(this, responseTopic, query);

	this._requestEmitter.emit(requestTopic, request);
};

/**
 * Handle an input MQTT message
 */
MeemBus.prototype._handleMessage = function(topic, message) {
	this._messageEmitter.emit(topic, message);
};


/*********************************************************
 * ContentRequest
 *********************************************************/

var ContentRequest = function(bus, responseTopic, query) {
	this.bus = bus;
	this.responseTopic = responseTopic;
	this.query = query;
};

ContentRequest.prototype.respond = function(message) {
	this.bus.sendMessage(this.responseTopic, message);
};

/*********************************************************
 * utility functions
 *********************************************************/

function unmarshalQuery(query) {
	var result = {};
	var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        var name = decodeURIComponent(pair[0]);
        result[name] = decodeURIComponent(pair[1]);
    }
    return result;
}

function marshalQuery(query) {
	var result = "";
	for (var name in query) {
		var val = query[name];
		result +=  encodeURIComponent(name) + "=" + encodeURIComponent(val) + "&";
	}
	return result;
}


/*********************************************************
 * Exports
 *********************************************************/
module.exports = MeemBus;