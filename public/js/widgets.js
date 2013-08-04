define([
    	'views/widget/button',
    	'views/widget/slider',
    	'views/widget/linear_indicator',
    	'views/widget/line_chart',
    	'views/widget/video_feed',
    ], 
function(Button, LinearSlider, LinearIndicator, LineChart, VideoFeed) {
	return {
		Button          : Button,
		LinearSlider    : LinearSlider,
		LinearIndicator : LinearIndicator,
		LineChart       : LineChart,
		VideoFeed       : VideoFeed,
	};
});