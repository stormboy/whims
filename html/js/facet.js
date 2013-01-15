/**
 * Used to marshal and umarshal messages.
 * 
 * BiwaScheme is used to parse S-Expressions and must be included before this file
 */
//var BiwaScheme = require('biwascheme');

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

/*
Facets.prototype.displayObject = function(o) {
	if (BiwaScheme.isSymbol(o)) {
		console.log("parsed object: " + o + " is a symbol");
	}
	else if (BiwaScheme.isList(o)) {
		this.displayList(o);
	}
	else if (BiwaScheme.isPair(o)) {
		console.log("parsed object: " + o + " is a pair");
	}
	else {
		console.log("parsed object: " + o + " is a " + typeof(o) + "");
	}
}

Facets.prototype.displayList = function(list) {
	var msg = "";
	var arr = list.to_array();
	for (var i=0; i<arr.length; i++) {
		msg += arr[i] + " ";
	}
	console.log("parsed object: " + list + " is a list: " + msg + "");
	
	// TODO check first object in the list
	for (var i=0; i<arr.length; i++) {
		this.displayObject(arr[i]);
	}
}

Facets.prototype.expressionTest = function() {
	var expression = "(value #t (1 2 \"3\") (a . 3) 10:abcdefghij)";
	console.log("expression: " + expression + "");
	
	var parser = new BiwaScheme.Parser(expression);
	while ((obj = parser.getObject()) != BiwaScheme.Parser.EOS) {
		this.displayObject(obj);
	}
}
*/




function Binary(name, direction) {
	this.name = name;
	this.direction = direction;
}

Binary.type = "org.meemplex.Binary";

Binary.marshal = function(value) {
	//return '(value ' + value + ')';
	return JSON.stringify({value: value});
}

/**
 * (value true), (value false), (value #t) or (value #f)
 */
Binary.unmarshal = function(expression) {
	message = JSON.parse(expression);
	return message.value;
/*
	var parser = new BiwaScheme.Parser(expression);
	var obj = parser.getObject();
	if (BiwaScheme.isList(obj)) {
		var arr = obj.to_array();
		if (arr[0] == "'value") {
			return arr[1];
		}
	}
	return null;
*/
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

