var touch = require('./touch');
var chart = require('./chart');
var browserify = require('browserify-middleware')

exports.init = function(app) {
	app.get('/',      touch.show);
	app.get('/touch', touch.show);
	app.get('/chart', chart.line);
	//app.get('/js/bundle.js', browserify('../lib/client/bundle.js'));
}

exports.error = function(err, req, res, next) {
	if (err) {
		var code = err.code || 500;
		var title = err.title || "Error";
		res.status(code);
		res.format({
			html: function(){
				res.render("errors/error", {
					title : title,
					message : err.message
				});
			},

			text: function(){
				res.send(err.message);
			},

			json: function(){
				res.json(JSON.stringify({
					title : title,
					message : err.message
				}));
			}
		})
	}
	else {
		next();
	}
}
