var MeemFactory = require("../lib/meemfactory").MeemFactory;

var basic = require("../lib/meems/basic");

var namespaces = {
		"basic" : basic
}

// test creating

console.log("ccreating BinaryScheduler");
var binaryScheduler = new basic.BinaryScheduler({});

// test the MeemFactory
var meemBus = null;
var mf = new MeemFactory(namespaces, meemBus);

console.log("using factory to create BinaryTimer");

var facets = {};
var properties = {};
var meemDef = {
		id : "12345678",
		type: "basic.BinaryTimer",
		facets: facets,
		properties: properties,
}

var meem = mf.create(meemDef);
