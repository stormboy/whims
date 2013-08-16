
/***************************************************
 * Facet
 ***************************************************/
var Facet = function(name, type, direction, description) {
	this.name = name;
	this.type = type;					// type is namespace and type name, e.g. "basic.Binary", "hyperspace.Category"
	this.direction = direction;
	this.description = description;
}

Facet.prototype.getDefinition = function() {
	return {
		name: name,
		type: type,
		direction: direction,
		description: description,
	}
}

Facet.prototype.handleMessage = function(message) {
	console.log("facet " + this.name + " got message payload " + JSON.stringify(payload));
	this.emit("message", payload);
}

/**
 * request is a ContentRequest
 */
Facet.prototype.handleContentRequest = function(request) {
	this.emit("request", request);
}


var Direction = {
		IN  : "in",
		OUT : "out",
}


exports.Facet = Facet;
exports.Direction = Direction;