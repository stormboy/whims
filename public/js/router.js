// Filename: router.js
define([ 'jquery', 
         'underscore',
         'backbone', 
     	'meembus',
    	'ui',
    	'iscroll',
         'views/home', ], 
function($, _, Backbone, MeemBus, UI, iScroll, HomeView) {
	var TRACE = false;
	var title = "My Home";
	
	var controlPanel;
	
	var AppRouter = Backbone.Router.extend({
		routes : {
			"" : "showHome",
			"function/:fn" : "showFunction",
			"location/:loc" : "showLocation",
			'*actions' : 'defaultAction' // Default
		},

		showHome : function() {
			controlPanel.filterWidgets(".house");
			$("#title").text(title);
		},
		showFunction : function(fn) {
			controlPanel.filterWidgets("."+fn);
			$("#title").text(title + " | "  + fn);
		},
		showLocation : function(loc) {
			controlPanel.filterWidgets("."+loc);
			$("#title").text(title  + " | " + loc);
		},

		//homeView : new HomeView(),

	});

	var initialize = function() {
		var app_router = new AppRouter();

		$(document).ready(function() {
			var meemBus = new MeemBus();
			controlPanel = new UI.ControlPanel(meemBus, $("#title"), $("#controls"), $("#classSelectors"));
			controlPanel.getUI();

			controlPanel.on("layout", function() {
				controlsScroll.refresh();
			});
			
			// stop touch move from scrolling and bouncing screen
			// TODO will have to allow move for sliders and knobs
			$('body').on('touchmove', function(e) {
				e.preventDefault();
			});
			window.onresize = function() {
				$(document.body).width(window.innerWidth).height(window.innerHeight);
			};
			$(function() {
				window.onresize();
			});

			// javascript scrollers
			var controlsScroll = new iScroll('controlsContainer', { bounce: false });
		    var selectorScroll = new iScroll('selectorContainer', { bounce: false, hScrollbar: false, vScrollbar: false });
		    
			Backbone.history.start();
		});
	};

	return {
		initialize : initialize
	};
});