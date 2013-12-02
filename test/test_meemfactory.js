var MeemFactory = require("../lib/meemfactory");
var MeemBus = require("../lib/meembus");
var facet = require("../lib/facet");
var mqtt = require("mqtt");

var basic = require("../lib/meems/basic");

var namespaces = {
		"basic" : basic
};

// test creating

console.log("ccreating BinaryScheduler");
var binaryScheduler = new basic.BinaryScheduler({});

// test the MeemFactory
var mqttClient = mqtt.createClient(1883, '192.168.0.23');
var meemBus = new MeemBus(mqttClient);
var mf = new MeemFactory(namespaces, meemBus);

console.log("using factory to create BinaryTimer");

var properties = {};
var meemDef = {
		id : "123456789ABCDEF",
		type: "basic.BinaryTimer",
		properties: properties,
};

var meem = mf.create(meemDef);
