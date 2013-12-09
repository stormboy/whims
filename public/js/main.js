require.config({
	"baseUrl": "js",
	"paths": {
		jquery :              "lib/jquery-2.0.3.min",
		underscore :          "lib/underscore-min",
		backbone :            "lib/backbone-min",
		sockjs :              "lib/sockjs-0.3.min",
		isotope :             "lib/jquery.isotope.min",
		d3 :                  "lib/d3.v3.min",
		raphael:              "lib/raphael-min",
		iscroll :             "lib/iscroll",
		bootstrap :           "lib/bootstrap.min",
		text :                "lib/text",
		jade :                "lib/jade",
		templates :           "../templates",
		eventemitter :        "lib/eventemitter2",
		//swiper :              "./lib/idangerous.swiper-2.0.min",
		quantities :          "lib/quantities",
		justgage :            "lib/justgage.1.0.1",
		jqueryknob :          "lib/jquery.knob",
		util :                "lib/util",
	},
	"shim": {
		underscore : {
			exports :        "_"
		},
		backbone : {
			deps :           ["underscore", "jquery"],
			exports :        "Backbone",
		},
		socketio : {
			exports : "io",
		},
//		eventemitter : {
//			exports : "eventemitter"
//		},
		bootstrap :          ["jquery"],
		isotope :            ["jquery"],
		raphael :            ["jquery"],
		justgage :           ["raphael"],
		jqueryknob :         ["jquery"],
		d3 : {
            exports :        "d3",
	 	},
		iscroll : {
			exports :        "iScroll",
		},
		swiper : {
			exports :        "swiper"
		}
	}	
});

require(["app"],
	function(App){
		//console.log("initialising app");
		App.initialize();
});
