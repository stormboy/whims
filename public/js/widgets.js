define([
    	'views/widget/button',
    	'views/widget/linear_slider',
    	'views/widget/linear_dial',
    	'views/widget/linear_indicator',
    	'views/widget/linear_gauge',
    	'views/widget/line_chart',
    	'views/widget/video_feed',
    ], 
function(Button, LinearSlider, LinearDial, LinearIndicator, LinearGauge, LineChart, VideoFeed) {
	return {
		Button          : Button,
		LinearSlider    : LinearSlider,
		LinearDial      : LinearDial,
		LinearIndicator : LinearIndicator,
		LinearGauge     : LinearGauge,
		LineChart       : LineChart,
		VideoFeed       : VideoFeed,
	};
});