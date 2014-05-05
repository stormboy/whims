var touch = require('./touch');
var chart = require('./chart');
var browserify = require('browserify-middleware')

exports.init = function(app) {
	app.get('/',      touch.show);
	app.get('/touch', touch.show);
	app.get('/chart', chart.line);
	app.get('/camera', exports.camera);
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

var http = require("http");

/**
 * TODO genericise this proxy for web cameras
 */
exports.camera = function(req, res) {
	var options = {hostname: "192.168.0.2", path: "/mjpg/video.mjpg?resolution=352x240"};
	var proxy_request = http.request(options);
	proxy_request.addListener('response', function (proxy_response) {
		proxy_response.addListener('data', function(chunk) {
			res.write(chunk, 'binary');
		});
		proxy_response.addListener('end', function() {
			res.end();
		});
		res.writeHead(proxy_response.statusCode, proxy_response.headers);
	});
	req.addListener('data', function(chunk) {
		proxy_request.write(chunk, 'binary');
	});
	req.addListener('end', function() {
		proxy_request.end();
	});
};
