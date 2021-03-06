define([
    	'views/widget/button',
    	'views/widget/linear_slider',
    	'views/widget/linear_dial',
    	'views/widget/linear_indicator',
    	'views/widget/linear_gauge',
    	'views/widget/line_chart',
    	'views/widget/video_feed',
    	'views/widget/av_transport',
    	'views/widget/color_wheel',
    ], 
function(Button, LinearSlider, LinearDial, LinearIndicator, LinearGauge, LineChart, VideoFeed, AvTransport, ColorWheel) {
	var Widgets = {
		Button          : Button,
		LinearSlider    : LinearSlider,
		LinearDial      : LinearDial,
		LinearIndicator : LinearIndicator,
		LinearGauge     : LinearGauge,
		LineChart       : LineChart,
		VideoFeed       : VideoFeed,
		AvTransport     : AvTransport,
		ColorWheel      : ColorWheel,
	};
	
	var WidgetFactory = {
		create: function(spec, meemBus) {
			var component;
			
			switch (spec.widget) {
		
			case "BinaryButton":
				component = new Widgets.Button({
					meemBus : meemBus,
					model   : spec,
				});
				break;
				
			case "VideoFeed":
				component = new Widgets.VideoFeed({
					meemBus : meemBus,
					model   : spec,
				});
				break;
	
			case "LinearSlider":
				component = new Widgets.LinearSlider({
					meemBus : meemBus,
					model   : spec,
				});
				break;
	
			case "LinearDial":
				component = new Widgets.LinearDial({
					meemBus : meemBus,
					model   : spec,
				});
				break;
	
			case "LinearGauge":
				component = new Widgets.LinearGauge({
					meemBus : meemBus,
					model   : spec,
				});
				break;
				
			case "LinearIndicator":
				component = new Widgets.LinearIndicator({
					meemBus : meemBus,
					model   : spec,
				});
				break;

			case "DataChart":
				component = new Widgets.LineChart({
					meemBus : meemBus,
					model   : spec,
				});
				break;
				
			case "AvTransport":
				component = new Widgets.AvTransport({
					meemBus : meemBus,
					model   : spec,
				});
				break;
				
			case "ColorWheel":
				component = new Widgets.ColorWheel({
					meemBus : meemBus,
					model   : spec,
				});
				break;
				
			// TODO more widget types
			}
			
			return component;
		},
	};
	
	return WidgetFactory;
});