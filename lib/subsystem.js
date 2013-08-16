
var Subsystem = function(doc, meemStore, meemFactory) {
	this.id = doc.id;
	this.name = doc.name;
	this.description = doc.desc;
	this.meems = {};
	
	this.meemStore = meemStore;
	this.meemBus = meemBus;
	
	this._loadMeems(meemStore, doc.meems);		// doc.meems is an array of meem ids
}

Subsystem.prototype.start = function(meem) {
	
}

Subsystem.prototype.stop = function(meem) {
	
}

Subsystem.prototype.addMeem = function(meem) {
	
}

Subsystem.prototype.getMeem = function(name) {
	
}

Subsystem.prototype.removeMeem = function(id) {
	// stop meem
	// remove from persistent store
}
