var util = require("util");
var EventEmitter = require("events").EventEmitter;
var Facet = require("./facet").Facet;
var Direction = require("./facet").Facet;
var Property = require("./property").Property;

/***************************************************
 * Meem has
 * - id (uuid)
 * - facets : for communication with other meems
 * - configuration properties
 * - content (values of properties)
 ***************************************************/

var Meem = function(def, content) {
	this.id = def.id;
	this.type = def.type;									// combination of namespace and type name, e.g. "zigbee.BinarySwitch"
	this.inFacets = {};
	this.outFacets = {};
	this.properties = {};
	
	this._createFacets(def.facets);
	this._createProperties(def.properties);

	this.setContent(content);

//	this.emit("facets:in", this.inFacets);
//	this.emit("facets:out", this.outFacets);
//	this.emit("properties", this.properties);

}

/**
 * Connect to bus
 */
Meem.prototype.connect = function(bus) {

	for (var name in this.inFacets) {
		var facet = this.inFacets[name];
		var topic   = "/meem/" + this.id + "/in/" + facet.name;
		bus.onMessage(topic, facet.handleMessage);
	}

	// subscribe to outbound facet content requests
	for (var name in this.outFacets) {
		var facet = this.outFacets[name];
		var topic   = "/meem/" + this.id + "/out/" + facet.name;
		bus.onRequest(topic, facet.handleRequest);
	}
}

Meem.prototype.connect = function(bus) {
	for (var name in this.inFacets) {
		var facet = this.inFacets[name];
		var topic   = "/meem/" + this.id + "/in/" + facet.name;
		bus.removeListener(topic, facet.handler);
	}

	// subscribe to outbound facet content requests
	for (var name in this.inFacets) {
		var facet = this.inFacets[name];
		var topic   = "/meem/" + this.id + "/out/" + facet.name + "?";
		bus.removeListener(topic, facet.handler);
	}
}

Meem.prototype._createFacets = function(facetDefs) {

	for (var name in facetDefs) {
		var def = facetDefs[name];
		var facet = this._createFacet(def);
		switch(facet.direction) {
		case Direction.IN:
			inFacets[name] = facet;
			break;
		case Direction.OUT:
			outFacets[name] = facet;
			break;
		default:
			console.log("invalid direction: " + facet.direction);
		}
	}
}

Meem.prototype._createFacet = function(def) {
	var facet = new Facet(def.name. def.type, def.direction, def.description);
	return facet;
}

Meem.prototype._createProperties = function(propDefs) {
	for (var name in propDefs) {
		var def = propDefs[name];
		this.properties[name] = this._createProperty(def);
	}
	return this.properties;
}

Meem.prototype._createProperty = function(def) {
	var property = new Property(def.name. def.type);
	return property;
}

Meem.prototype.getDefinition = function() {
	return {
		id          : "",
		type        : "",
		description : "",
		facets      : {},
		properties  : {}
	}
}

Meem.prototype.getContent = function(content) {
	return content;
}

Meem.prototype.setContent = function(content) {
	if (typeof content != 'undefined') {
		this.content = content;
		// TODO update property values
		this.emit("content");			// emit event to signal content change
	}
}

/**
 * 
 */
Meem.prototype.getProperties = function() {
	return this.properties;
}

Meem.prototype.getProperty = function(name) {
	return this.properties[name];
}

Meem.prototype.setProperty = function(name, value) {
	var property = this.getProperty(name);
	if (typeof property != 'undefined') {
		property.setValue(value);
	}
}



/***************************************************
 * Exports
 ***************************************************/

exports.Meem = Meem;
exports.Facet = Facet;
exports.Property = Property;
exports.Direction = Direction;
