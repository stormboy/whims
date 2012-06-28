
var fs = require('fs')
	, path = require('path');

/**
 * HTTP server handler
 */
exports.requestHandler = function (request, response) {
	var filePath = 'html' + request.url;
	if (filePath == 'html/') {
		filePath = 'html/index.html';
	}
	var extname = path.extname(filePath);
	console.log("getting: " + filePath);
	var contentType = 'text/html';
	switch (extname) {
	case '.js':
	case '.json':
		contentType = 'text/javascript';
		break;
	case '.css':
		contentType = 'text/css';
		break;
	case '.jpg':
	case '.jpeg':
		contentType = 'image/jpeg';
		break;
	case '.gif':
		contentType = 'image/gif';
		break;
	case '.png':
		contentType = 'image/png';
		break;
	}
	path.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				} else {
					response.writeHead(200, { 'Content-Type' : contentType });
					response.end(content, 'utf-8');
				}
			});
		} else {
			response.writeHead(404);
			response.end();
		}
	});
}