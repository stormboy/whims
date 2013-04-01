/**
 * Used to marshal and umarshal messages.
 */

function Facets() {
	this.facets = {};
	this.facets[Binary.type]  = Binary;
	this.facets[Linear.type] = Linear,
	this.facets[Category.type] = Category 
}

Facets.prototype.marshal = function(facetType, value) {
	var facet = this.facets[facetType];
	//console.log("got facet type for marshal: " + facet);
	
	return facet.marshal(value);
}

Facets.prototype.unmarshal = function(facetType, expression) {
	var facet = this.facets[facetType];
	//console.log("got facet type for unmarshal: " + facet);
	
	return facet.unmarshal(expression);
}


function Binary(name, direction) {
	this.name = name;
	this.direction = direction;
}

Binary.type = "org.meemplex.Binary";

Binary.marshal = function(value) {
	return JSON.stringify({
		value: value
	});
}

/**
 * (value true), (value false), (value #t) or (value #f)
 */
Binary.unmarshal = function(expression) {
	if (typeof expression == "undefined" || expression == null || expression == "") {
		return null;
	}
	var message = JSON.parse(expression);
	var value = message.value ? true : false;
	return value;
}


/**
 * A facet for passing contiuous values.
 */
function Linear(name, direction, unit) {
	this.name = name;
	this.direction = direction;
	this.unit = typeof unit !== 'undefined' ? unit : "nil";
}

Linear.type = "org.meemplex.Linear";

Linear.marshal = function(value, unit, timestamp) {
	var message = {
		value : value
	}
	if (unit) {
		message.unit = unit;
	}
	if (timestamp) {
		message.timestamp = timestamp;
	}
	
	return JSON.stringify(message);
}

/**
 * { value: 10, unit: 'Hz' }
 * { value: 200, unit: 'W' }
 * { value: 100, unit: 'C' }
 * { value: 24, unit: 'sec' }
 */
Linear.unmarshal = function(expression) {
	var message = JSON.parse(expression);
	return message;
}


/**
 * A facet for adding and removing entries to a category.
 */
function Category(name, direction) {
	this.name = name;
	this.direction = direction;
}

Category.type = "org.meemplex.Category"

/**
 * examples: 
 * { "add" : [ {name: "name1", entry: "meemId1"}, {name: "name2", entry: "meemId2"}, {name: "name3", entry: "meemId3"} ] }
 * { "remove" : [ {name: "name1", entry: "meemId1"}, {name: "name2", entry: "meemId2"}, {name: "name3", entry: "meemId3"} ] }
 * { "rename" : [ {from: "name1", to: "new name 1"}, {from: "name2", to: "new name 2"}, {from: "name3", to: "new name 3"} ] }
 */
Category.marshal = function(data) {
	var message = JSON.stringify(data);
	return message;
}

/**
 * examples:
 * { "add" : [ {name: "name1", entry: "meemId1"}, {name: "name2", entry: "meemId2"}, {name: "name3", entry: "meemId3"} ] }
 * { "remove" : [ {name: "name1", entry: "meemId1"}, {name: "name2", entry: "meemId2"}, {name: "name3", entry: "meemId3"} ] }
 * { "rename" : [ {from: "name1", to: "new name 1"}, {from: "name2", to: "new name 2"}, {from: "name3", to: "new name 3"} ] }
 */
Category.unmarshal = function(expression) {
	return JSON.parse(expression);
}

