var MeemBus = require("./meem-bus").MeemBus;
var ControlPanel = require("./ui").ControlPanel;

$(document).ready(function() {
	var meemBus = new MeemBus();
	var controlPanel = new ControlPanel(meemBus, $("#title"), $("#controls"), $("#classSelectors"));
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
	}
	$(function() {
		window.onresize();
	});
	
	// javascript scrollers
	var controlsScroll = new iScroll('controlsContainer', { bounce: false });
    var selectorScroll = new iScroll('selectorContainer', { bounce: false, hScrollbar: false, vScrollbar: false });

});