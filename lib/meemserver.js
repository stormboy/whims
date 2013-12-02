var MeemStore = require("./meemstore").MeemStore;
var MeemBus = require("./meembus").MeemBus;
var mqtt = require("mqtt");
var uuid = require('node-uuid');
var crypto = require('crypto');

var MeemServer = function(options) {
	this.subsystems = {};
	
	this.meemStore = new MeemStore(options ? options.store : null);
	
	this.mqttHost = options.mqttHost || "127.0.0.1";	// host for the MQTT server to connect to
	this.mqttPort = options.mqttPort || 1833;			// port for the MQTT server
	this.clientId = "meem_" + crypto.randomBytes(8).toString('hex');

	this.mqttClient = mqtt.createClient(this.mqttPort, this.mqttHost, {
		keepalive: 10000,
		client : clientId
	});

	this.meemBus = new MeemBus(mqttClient);
};

MeemServer.prototype.start = function() {
	// TODO start server
	
	// load subsystems
	
	// start subsystems
};

MeemServer.prototype.stop = function() {
	// TODO stop server
};

module.exports = MeemServer;