
var Unary = exports.Unary = function() {
	
}

var Binary = exports.Binary = function(name, direction) {
	this.name = name;
	this.direction = direction;
	this.type = "org.meemplex.Binary"
}

Binary.marshal = function(value) {
	return {
		"value" : value
	};
}

/**
 * (value true), (value false), (value #t) or (value #f)
 */
Binary.unmarshal = function(expression) {
}

function Linear(name, direction, unit) {
	this.name = name;
	this.direction = direction;
	this.unit = typeof unit !== 'undefined' ? unit : "nil";
	this.type = "org.meemplex.Linear"
}

Linear.marshal = function(value, unit) {
	return {
		"value" : value,
		"unit" : unit,
	}
}

/**
 * (value 10 Hz), (value 200 W), (value 100 C) or (value 24 sec)
 */
Linear.unmarshal = function(expression) {
	return JSON.parse(expression);
}
