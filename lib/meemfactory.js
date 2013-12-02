var meem = require("./meem");

var Meem = meem.Meem;

/**
 * Creates meems.
 */

var MeemFactory = function(namespaces, meemBus) {
	this._ns = namespaces;
	this._meemBus = meemBus;
};


MeemFactory.prototype.create = function(def) {
	console.log("creating meem: " + JSON.stringify(def));
	var meem = null;
	
	// TODO lookup class 
	var cls = this._getClass(def.type);
	if (cls) {
		console.log("got class: " + cls.name);
		meem = new cls(def);
	}
	else {
		meem = new Meem(def);
	}
	
	if (meem instanceof Meem) {
		meem.connect(this._meemBus);
	}
	else {
		console.log("object is not a Meem");
	}
	
	return meem;
};

MeemFactory.prototype._getClass = function(type) {
	var terms = type.split(".");
	var ns = terms[0];
	var className = terms[1];
	
	//console.log("ns : cls = " + ns + " : " + className)
	
	var namespace = this._ns[ns];
	
	//console.log("namespace for " + ns + " : " + namespace);
	
	return namespace[className]
};


module.exports = MeemFactory;
