var meem = require("meem");
var config = require("./config");

config.namespace = {
	"org.meemplex.core" : meem.meems.core,
	"org.meemplex.demo" : meem.meems.demo,
	//"net.sugarcoding.upnp": require("meem-upnp"),
	//"net.sugarcoding.hue": require("meem-hue"),
	//"net.sugarcoding.nest": require("meem-nest"),
	//"net.sugarcoding.avr": require("meem-avr"),
	//"net.sugarcoding.zbee": require("meem-zbee"),
	//"net.sugarcoding.datalog": require("meem-datalog"),
	//"net.sugarcoding.raven": require("meem-raven"),
};

var meemServer = new meem.MeemServer(config);

meemServer.start();

if (true) {
 
	var meemDefs = {
		"5c74b28a-70af-4858-b46f-2072dfad8ac6": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 1000
			},
		},
		"0bbddf42-8802-4909-82df-6593d6f49ad5": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 2000
			},
		},
		"8308c249-9080-48e9-a87c-77cb74e82677": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 3000
			},
		},
		"8e8f8cc9-4c03-4973-9055-d842386be268": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 4000
			},
		},
		"6cba38a4-cc17-4c4f-a677-b0177ead44f0": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 5000
			},
		},
		"27b1206e-114a-476c-a36d-ae897d2a10a5": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 6000
			},
		},
		"0079e7a9-bf51-4355-9c14-e8d19376c760": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 7000
			},
		},
		"07962877-b639-49e3-a5d4-bcff491c53eb": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 8000
			},
		},
		"499b6384-b526-4339-bc4b-c9cf19f01c4e": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
				interval: 9000
			},
		},
		"100f4781-f4aa-4e31-ade8-35a56b70a1b4": {
			type: "org.meemplex.demo.BinaryTimer",
			content: {
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
	};
	
	for (var id in meemDefs) {
		var meemDef = meemDefs[id];
		meemDef.id = id;
		meemServer.addMeem(meemDef);
	}
}
