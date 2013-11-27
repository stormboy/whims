define([
	'jquery',
	'router',
], 
function($, Router) {

	var initialize = function(){
		Router.initialize();
	};

	return {
		initialize: initialize
	};
});
