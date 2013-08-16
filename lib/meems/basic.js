var util = require("util");
var meem = require("../meem");


/************************************************************************************
 * BinaryTimer
 ************************************************************************************/
var BinaryTimer = exports.BinaryTimer = 
function BinaryTimer(def) {
	meem.Meem.call(this, def);
	
	console.log("created: " + this.constructor.name)
}
util.inherits(BinaryTimer, meem.Meem);


/************************************************************************************
 * BinaryScheduler
 ************************************************************************************/
var BinaryScheduler = exports.BinaryScheduler = 
function BinaryScheduler(def) {
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name)
}
util.inherits(BinaryScheduler, meem.Meem);


/************************************************************************************
 * LinearAnimator
 ************************************************************************************/
var LinearAnimator = exports.LinearAnimator = 
function LinearAnimator(def) {
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name)
}
util.inherits(LinearAnimator, meem.Meem);


/************************************************************************************
 * LinearScheduler
 ************************************************************************************/
var LinearScheduler = exports.LinearScheduler = 
function LinearScheduler(def) {
	// extends Meem
	meem.Meem.call(this, def);
	console.log("created: " + this.constructor.name)
}
util.inherits(LinearScheduler, meem.Meem);
