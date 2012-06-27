/**
 * BiwaScheme is used to parse S-Expressions
 */
var BiwaScheme = require('biwascheme');

function Facets() {
	this.facets = {
			"org.meemplex.Binary" : Binary,
			"org.meemplex.Linear" : Linear,
			"org.meemplex.Category" : Category 
		};
}

Facets.prototype.marshal = function(facetType, value) {
	var facet = this.facets[facetType];
	console.log("got facet type for marshal: " + facet);
	
	return facet.marshal(value);
}

Facets.prototype.unmarshal = function(facetType, expression) {
	var facet = this.facets[facetType];
	console.log("got facet type for unmarshal: " + facet);
	
	return facet.unmarshal(expression);
}



function Binary(name, direction) {
	this.name = name;
	this.direction = direction;
	this.type = "org.meemplex.Binary"
}

Binary.marshal = function(value) {
	return '(value ' + value + ')';
}

/**
 * (value true), (value false), (value #t) or (value #f)
 */
Binary.unmarshal = function(expression) {
	var parser = new BiwaScheme.Parser(expression);
	var obj = parser.getObject();
	if (BiwaScheme.isList(obj)) {
		var arr = obj.to_array();
		if (arr[0] == "'value") {
			return arr[1];
		}
	}
	return null;
}

function Linear(name, direction, unit) {
	this.name = name;
	this.direction = direction;
	this.unit = typeof unit !== 'undefined' ? unit : "nil";
	this.type = "org.meemplex.Linear"
}

Linear.marshal = function(value) {
	return '(value ' + value + ')';
}

/**
 * (value 10 Hz), (value 200 W), (value 100 C) or (value 24 sec)
 */
Linear.unmarshal = function(expression) {
	var parser = new BiwaScheme.Parser(expression);
	var obj = parser.getObject();
	if (BiwaScheme.isList(obj)) {
		var arr = obj.to_array();
		if (arr[0] == "'value") {
			return arr[1];
		}
	}
	return null;
}

function Category(name, direction) {
	this.name = name;
	this.direction = direction;
	this.type = "org.meemplex.Category"
}

/**
 * examples: 
 * { "add" : [ {name: "name1", entry: "meemId1"}, {name: "name2", entry: "meemId2"}, {name: "name3", entry: "meemId3"} ] }
 * { "remove" : [ {name: "name1", entry: "meemId1"}, {name: "name2", entry: "meemId2"}, {name: "name3", entry: "meemId3"} ] }
 * { "rename" : [ {from: "name1", to: "new name 1"}, {from: "name2", to: "new name 2"}, {from: "name3", to: "new name 3"} ] }
 */
Category.marshal = function(data) {
	return '(TODO)';
}

/**
 * examples:
 * (add (("name1" "meemId1") ("name2" "meemId2") ("name3" "meemId3")))
 * (remove (("name1" "meemId1") ("name2" "meemId2") ("name3" "meemId3")))
 * (rename (("name1" "new name 1") ("name2" "new name 2") ("name3" "new name 3")))
 */
Category.unmarshal = function(expression) {
	var parser = new BiwaScheme.Parser(expression);
	var obj = parser.getObject();
	if (BiwaScheme.isList(obj)) {
		var arr = obj.to_array();
		switch(arr[0]) {
		case "'add":
			return arr[1];		// TODO create JSON from array
		case "'remove":
			return arr[1];
		case "'rename":
			return arr[1];
		}
	}
	return null;
}

exports.Facets = Facets;
exports.Binary = Binary;
exports.Linear = Linear;
exports.Category = Category;
