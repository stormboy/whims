var util = require("util");
var EventEmitter = require("events").EventEmitter;

/***************************************************
 * Facet
 ***************************************************/
var Facet = function(name, type, direction, description) {
	EventEmitter.call(this);
	
	this.name = name;
	this.type = type;					// type is namespace and type name, e.g. "basic.Binary", "hyperspace.Category"
	this.direction = direction;
	this.description = description;
};

util.inherits(Facet, EventEmitter);

Facet.prototype.getDefinition = function() {
	return {
		name: name,
		type: type,
		direction: direction,
		description: description,
	};
};

Facet.prototype.handleMessage = function(message) {
	//console.log("facet " + this.name + " got message payload " + JSON.stringify(message));
	this.emit("message", message);
};

/**
 * request is a ContentRequest
 */
Facet.prototype.handleContentRequest = function(request) {
	this.emit("request", request);
};

Facet.prototype.addOutTopic = function() {
};

Facet.prototype.removeOutTopic = function() {
};

Facet.prototype.addInTopic = function() {
};

Facet.prototype.removeInTopic = function() {
};

var Direction = {
		IN  : "in",
		OUT : "out",
};


exports.Facet = Facet;
exports.Direction = Direction;