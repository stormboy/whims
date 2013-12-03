var util = require("util");
var meem = require("../meem");


/************************************************************************************
 * BinaryTimer
 * def includes id, type, property values
 ************************************************************************************/
var BinaryTimer = exports.BinaryTimer = 
function BinaryTimer(def) {
	var values = def.properties;
	def.facets = this._getFacets();
	def.properties = this._getProperties(def.properties);
	meem.Meem.call(this, def);

	// TODO put value setting in Meem 
	if (values) {
		for (name in values) {
			var value = values[name];
			if (typeof value != "undefined") {
				var prop = this.getProperty(name);
				prop.value = value;
			}
		}
	}

	this.value = false;		// the binary value
	this._sendToggle();
};
util.inherits(BinaryTimer, meem.Meem);

BinaryTimer.prototype._getProperties = function(config) {
	var properties = {
		interval: {
			description: "time beteen binary toggles, in milliseconds",
			type: Number,
			value: 5000
		}
	};
	return properties;
};

/**
 * Define the facets for this Meem.
 */
BinaryTimer.prototype._getFacets = function() {
	var self = this;

	var handleBinaryIn = function(message) {
		if (self.value != message.value) {
			self.value = message.value;
			self._resetTimer();
			// send value to output facet
			var outFacet = self.getFacet("binaryOut");
			outFacet.handleMessage({
				value: self.value
			});
		}
	};

	var handleBinaryOutRequest = function(request) {
		request.respond({
			value: self.value
		});
	};

	var facets = {
		binaryIn: {
			type: "org.meemplex.Binary", 
			direction: meem.Direction.IN, 
			description: "a description for the input",
			handleMessage: handleBinaryIn
		},
		binaryOut: {
			type: "org.meemplex.Binary", 
			direction: meem.Direction.OUT, 
			description: "a description for the output",
			handleContentRequest: handleBinaryOutRequest
		}
	};
	return facets;
};

BinaryTimer.prototype._sendToggle = function() {
	this.value = !this.value;
	this.getFacet("binaryOut").handleMessage({
		value: this.value
	});
	this._resetTimer();
};

BinaryTimer.prototype._resetTimer = function() {
	if (this.timer) {
		clearTimeout(this.timer);
	}
	var self = this;
	var interval = this.getProperty("interval").value;
	this.timer = setTimeout(function() {
		self._sendToggle();
	}, interval);
};

/************************************************************************************
 * BinaryScheduler
 ************************************************************************************/
var BinaryScheduler = exports.BinaryScheduler = 
function BinaryScheduler(def) {
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name);
	
	this.on("property", function(name, value) {
		switch(name) {
		case "schedule":
			// TODO parse schedule
			break;
		}
	});
};
util.inherits(BinaryScheduler, meem.Meem);


/************************************************************************************
 * LinearAnimator
 ************************************************************************************/
var LinearAnimator = exports.LinearAnimator = 
function LinearAnimator(def) {
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name);
};
util.inherits(LinearAnimator, meem.Meem);


/************************************************************************************
 * LinearScheduler
 ************************************************************************************/
var LinearScheduler = exports.LinearScheduler = 
function LinearScheduler(def) {
	// extends Meem
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name);
};
util.inherits(LinearScheduler, meem.Meem);

/**
 * Allows binary control of many other Binary controls.
 * Provides lineat outbound facets for a count of Meems with either of the 2 binary states.
 */
var GroupBinary = exports.GroupBinary = 
function GroupBinary(def) {
	// extends Meem
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name);
};
util.inherits(GroupBinary, meem.Meem);
