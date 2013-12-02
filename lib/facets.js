var util = require("util");

var Facets = exports.Facets = {
		// Meem facets: for id, name, type, facets, properties, 
		"MeemInfo"       : Meem,
		
		// Hyperspace facets
		"Category"   : Category,

		// Basic facets
		"Unary"      : Unary,
		"Binary"     : Binary,
		"Linear"     : Linear,
};

var MeemInfo = function() {
	
};



exports.Facets = Facets;
exports.Binary = Binary;
exports.Linear = Linear;
exports.Category = Category;
