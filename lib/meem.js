var util = require("util");
var EventEmitter = require("events").EventEmitter;
var Facet = require("./facet").Facet;
var Direction = require("./facet").Direction;
var Property = require("./property").Property;

/***************************************************
 * Meem has
 * - id (uuid)
 * - facets : for communication with other meems
 * - configuration properties
 * - content (values of properties)
 ***************************************************/
/**
 * TODO output facets that provide this meem's facets.
 */

var Meem = function(def, content) {
	this.id = def.id;
	this.type = def.type;									// combination of namespace and type name, e.g. "zigbee.BinarySwitch"
	this.description = def.description;
	this.facetDefs = def.facets;
	this.inFacets = {};
	this.outFacets = {};
	this.properties = {};

	this._createFacets(def.facets);
	this._createProperties(def.properties);

	this.setContent(content);

//	this.emit("facets:in", this.inFacets);
//	this.emit("facets:out", this.outFacets);
//	this.emit("properties", this.properties);

};

/**
 * Connect to bus
 */
Meem.prototype.connect = function(bus) {
	var self = this;
	for (var name in this.inFacets) {
		var facet = this.inFacets[name];
		var topic   = "/meem/" + this.id + "/in/" + facet.name;
		bus.onMessage(topic, facet.handleMessage);	// listen for incoming messages
	}

	// subscribe to outbound facet content requests
	for (var name in this.outFacets) {
		var facet = this.outFacets[name];
		this._connectOutFacet(bus, facet);
	}
};

Meem.prototype._connectOutFacet = function(bus, facet) {
	var topic   = "/meem/" + this.id + "/out/" + facet.name;
	bus.onRequest(topic, function(request) {
		facet.handleContentRequest(request);	// listen for content request on outbound facet
	});
	facet.on("message", function(message) {
		bus.sendMessage(topic, message);
	});
};

Meem.prototype.disconnect = function(bus) {
	for (var name in this.inFacets) {
		var facet = this.inFacets[name];
		var topic   = "/meem/" + this.id + "/in/" + facet.name;
		bus.removeListener(topic, facet.handleMessage);
	}

	// subscribe to outbound facet content requests
	for (var name in this.outFacets) {
		var facet = this.outFacets[name];
		var topic   = "/meem/" + this.id + "/out/" + facet.name + "?";
		bus.removeListener(topic, facet.handleContentRequest);
		facet.removeAllListeners("message");
	}
};

Meem.prototype._createFacets = function(facetDefs) {

	for (var name in facetDefs) {
		var def = facetDefs[name];
		def.name = name;
		//console.log("got facet def: " + JSON.stringify(def));
		var facet = this._createFacet(def);
		switch(facet.direction) {
		case Direction.IN:
			this.inFacets[name] = facet;
			break;
		case Direction.OUT:
			this.outFacets[name] = facet;
			break;
		default:
			console.log("invalid direction: " + facet.direction);
		}
	}
	
	var self = this;
	
	// Add MeemDefinition facet
	var handleMeemDefinitionRequest = function(request) {
		request.respond(self.getDefinition());
	};
	var def = {
		name: "meemDefinition",
		type: "org.meemplex.MeemDefinition", 
		direction: Direction.OUT, 
		description: "Meem definition",
		handleContentRequest: handleMeemDefinitionRequest
	};
	this.facetDefs[def.name] = def;			// add facet def to facetsDefs
	this.outFacets[def.name] = this._createFacet(def);
	
	// TODO add outbound properties facet

	// add inbound property facet
	var handleInProperty = function(message) {
		self.setPropertyValue(message.name, message.value);
	};
	def = {
		name: "meemProperties",
		type: "org.meemplex.Properties", 
		direction: Direction.IN, 
		description: "Meem properties",
		handleContentRequest: handleInProperty
	};
	this.facetDefs[def.name] = def;			// add facet def to facetsDefs
	this.inFacets[def.name]  = this._createFacet(def);

	// TODO add inbound and outbound lifecycle facets

	// TODO add inbound and outbound dependency Facets
};

Meem.prototype._createFacet = function(def) {
	console.log("creating facet: " + def.name);
	var facet = new Facet(def.name, def.type, def.direction, def.description);
	if (def.handleMessage) {
		facet.handleMessage = def.handleMessage;
	}
	if (def.handleContentRequest) {
		facet.handleContentRequest = def.handleContentRequest;
	}
	return facet;
};

Meem.prototype._createProperties = function(propDefs) {
	for (var name in propDefs) {
		var def = propDefs[name];
		def.name = name;
		this.properties[name] = this._createProperty(def);
	}
	return this.properties;
};

Meem.prototype._createProperty = function(def) {
	var property = new Property(def.name, def.type, def.description, def.value);
	return property;
};

Meem.prototype.getDefinition = function() {
	return {
		id          : this.id,
		type        : this.type,
		description : this.description,
		facets      : this.facetDefs,
		properties  : this.properties
	};
};

Meem.prototype.getFacet = function(name) {
	var facet = this.inFacets[name];
	if (!facet) {
		facet = this.outFacets[name];
	}
	return facet;
};

/**
 * Configuration properties.
 */
Meem.prototype.getProperties = function() {
	return this.properties;
};

Meem.prototype.getProperty = function(name) {
	return this.properties[name];
};

Meem.prototype.getPropertyValue = function(name) {
	if (this.properties[name]) {
		return this.properties[name].value;
	}
	else {
		return;
	}
};

Meem.prototype.setPropertyValue = function(name, value) {
	var property = this.getProperty(name);
	if (typeof property != 'undefined') {
		property.value = value;
		this.emit("property", name, value);			// emit event to signal property change
	}
	else {
		console.log("undefined property: " + name);
	}
};


/**
 * Persisted content.
 */
Meem.prototype.getContent = function() {
	return content;
};

Meem.prototype.setContent = function(content) {
	if (typeof content != 'undefined') {
		this.content = content;
		// TODO update property values
		this.emit("content");			// emit event to signal content change
	}
};

/***************************************************
 * Exports
 ***************************************************/

exports.Meem = Meem;
exports.Facet = Facet;
exports.Property = Property;
exports.Direction = Direction;
