define([ 'jquery', 
         'backbone', 
     	'meembus',
    	'ui',
    	'iscroll',
         'jade!templates/home' ], 
function($, Backbone, MeemBus, UI, iScroll, HomeTemplate) {

	var HomeView = Backbone.View.extend({

		initialize : function() {
			this.render();
			
			var meemBus = new MeemBus();
			
			var controlPanel = new UI.ControlPanel(meemBus, this.$el.find("#title"), this.$el.find("#controls"), this.$el.find("#classSelectors"));
			controlPanel.getUI();
			
//			controlPanel.on("layout", function() {
//				controlsScroll.refresh();
//			});
			
			// stop touch move from scrolling and bouncing screen
			// TODO will have to allow move for sliders and knobs
			$('body').on('touchmove', function(e) {
				e.preventDefault();
			});
			window.onresize = function() {
				$(document.body).width(window.innerWidth).height(window.innerHeight);
			}
			$(function() {
				window.onresize();
			});
			
			// javascript scrollers
//			var controlsScroll = new iScroll('controlsContainer', { bounce: false });
//		    var selectorScroll = new iScroll('selectorContainer', { bounce: false, hScrollbar: false, vScrollbar: false });

		},

		model : {
			name : "My Name"
		},

		render : function() {
			var compiledTemplate = HomeTemplate(this.model);
			this.$el.html(compiledTemplate);
			return this;
		}

	});

	return HomeView;
});