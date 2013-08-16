
var Category = exports.Category = function(name, direction) {
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

/**
 * examples:
 * (add (("name1" "meemId1") ("name2" "meemId2") ("name3" "meemId3")))
 * (remove (("name1" "meemId1") ("name2" "meemId2") ("name3" "meemId3")))
 * (rename (("name1" "new name 1") ("name2" "new name 2") ("name3" "new name 3")))
 */

