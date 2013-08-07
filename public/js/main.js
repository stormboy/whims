require.config({
	"baseUrl": "js",
	"paths": {
		jquery :              "./lib/jquery-1.9.1.min",
		underscore :          "./lib/underscore-min",
		backbone :            "./lib/backbone-min",
		socketio :            "../socket.io/socket.io",
		//socketio :            "/socket.io/socket.io",
		isotope :             "./lib/jquery.isotope.min",
		d3 :                  "./lib/d3.v3.min",
		iscroll :             "./lib/iscroll",
		bootstrap :           "./lib/bootstrap.min",
		text :                "./lib/text",
		jade :                "./lib/jade",
		templates :           "../templates",
		eventemitter :        "./lib/eventemitter2",
		util :                "./lib/util",
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
		d3 : {
            exports :        "d3",
	 	},
		iscroll : {
			exports :        "iScroll",
		},
	}	
});

require(["app"],
	function(App){
		console.log("initialising app");
		App.initialize();
});
