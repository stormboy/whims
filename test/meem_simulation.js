var MeemFactory = require("../lib/meemfactory");
var MeemBus = require("../lib/meembus");
var mqtt = require("mqtt");

var namespaces = {
	"basic" : require("../lib/meems/basic")
};

// test the MeemFactory
var mqttClient = mqtt.createClient(1883, '192.168.0.23');
var meemBus = new MeemBus(mqttClient);
var mf = new MeemFactory(namespaces, meemBus);

var meemDefs = {
	"5c74b28a-70af-4858-b46f-2072dfad8ac6": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 1000
		},
	},
	"0bbddf42-8802-4909-82df-6593d6f49ad5": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 2000
		},
	},
	"8308c249-9080-48e9-a87c-77cb74e82677": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 3000
		},
	},
	"8e8f8cc9-4c03-4973-9055-d842386be268": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 4000
		},
	},
	"6cba38a4-cc17-4c4f-a677-b0177ead44f0": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 5000
		},
	},
	"27b1206e-114a-476c-a36d-ae897d2a10a5": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 6000
		},
	},
	"0079e7a9-bf51-4355-9c14-e8d19376c760": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 7000
		},
	},
	"07962877-b639-49e3-a5d4-bcff491c53eb": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 8000
		},
	},
	"499b6384-b526-4339-bc4b-c9cf19f01c4e": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 9000
		},
	},
	"100f4781-f4aa-4e31-ade8-35a56b70a1b4": {
		type: "basic.BinaryTimer",
		properties: {
			interval: 10000
		},
		dependencies: [{
			facet: "binaryIn",
			reference: {
				meem: "499b6384-b526-4339-bc4b-c9cf19f01c4e",
				facet: "binaryOut"
			},
			type: "strong"
		}]
	},
}

for (var id in meemDefs) {
	var meemDef = meemDefs[id];
	meemDef.id = id;
	var meem = mf.create(meemDef);
}
