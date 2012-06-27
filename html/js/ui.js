/**
 * A UI using MQTT over io.socket
 */

// socket on the same server
var socketUrl = "/";

var pendingSubscriptions = [];
var sessionOpened = false;
var socket;

function subscribe(topic) {
	if (sessionOpened) {
		socket.emit("subscribe", topic);
	}
	else {
		pendingSubscriptions.push(topic);
	}
}

function unsubscribe(topic) {
	if (sessionOpened) {
		// TODO make sure no other subscriptions to this topic should exist. 
		socket.emit("unsubscribe", topic);
	}
}

function publish(topic, message) {
	if (sessionOpened) {
		socket.emit("publish", { topic: topic, message: message });
	}
}

$(document).ready(function() {
	socket = io.connect(socketUrl);
	
	socket.on('connected', function (data) {
	});
	
	socket.on('disconnected', function (data) {
	});

	// a handler for 
	socket.on('sessionOpened', function (data) {		// connected to MQTT service
		sessionOpened = true;
		$("#publish").show();
		console.log('sessionOpened: ' + data);

		// do pending subscriptions 
		while (pendingSubscriptions.length > 0) {
			var topic = pendingSubscriptions.shift();
			socket.emit('subscribe', topic);
		}
	});
	
	// a handler for incoming MQTT messages
	socket.on('message', function (data) {
		console.log('message topic: ' + data.topic + ' message: ' + data.message);
		$('#messages').append('<tr><td>' + data.topic + "</td><td>" + data.message + '</td>');
	});
	
	// a click handler for the publish button
	$('#publish').click(function() {
		show_expr ("(string-append \"foo\" \"bar\")");
		
		var topic = $('#topic').val();
		var message = $('#message').val();
		socket.emit('publish', { topic: topic, message: message });
	});

	// display a filtered set of widgets as per selector
	function filterWidgets(selector) {
		$("#controls").isotope( { filter : selector } );
	}
	
	var functionFilter = "*";
	var locationFilter = "*";
	function doFilter() {
		if (functionFilter == null) {
			if (locationFilter == null) {
				filterWidgets("*");
			}
			else {
				filterWidgets(locationFilter);
			}
		}
		else {
			if (locationFilter == null) {
				filterWidgets(functionFilter);
			}
			else {
				filterWidgets(functionFilter + locationFilter);
			}
		}
	}

	// a map of class filters
	var classFilters = {};
	
	/*
	 * get UI configuration data 
	 */
	$.getJSON('ui.json', function(data) {
		
		$("#title").html(data.title);
		
		// create filter buttons
		for (var i=0; i<data.filters.length; i++) {
			var filter = data.filters[i];
			var filterId = "_filter" + i;
			classFilters[filterId] = filter;
			$("#classSelectors").append("<button id='" + filterId + "' class='" + filter.type + "'>" + filter.name + "<button");
			$("#"+filterId).click(function() {
				var f = classFilters[this.id];
				functionFilter = null;
				locationFilter = null;
				switch (f.type) {
				case "location":
					locationFilter = "." + f['class'];
					break;
				case "function":
					functionFilter = "." + f['class'];
					break;
				}
				doFilter();
			});
		}
		
		// create UI control/state widgets
		for (var i=0; i<data.widgets.length; i++) {
			var widget = data.widgets[i];
			var widgetId = "_widget" + i;
			$("#controls").append("<div id='" + widgetId + "' class='" + widget.classes + "'></div>");
			
			switch (widget.widget) {
			case "BinaryButton":
				$( "#" + widgetId ).binaryButton({ 
					name: widget.name,
					path: widget.path,
					inFacet: widget.inFacet,
					outFacet: widget.outFacet,
					offText: widget.offText,
					onSymbol: widget.onSymbol,
					offSymbol: widget.offSymbol,
					onText: widget.onText, 
					offText: widget.offText,
					socket: socket
				});
				break;
			case "VideoFeed":
				$( "#" + widgetId ).videoFeed({
					name: widget.name,
					url: widget.url,
					width: widget.width,
					height: widget.height
				});
				break;
				
			// TODO more widget types
			}
		}

		// initiate isotope layout on the #controls element
		$("#controls").isotope({
			layoutMode : 'fitRows',
			masonry : {
				columnWidth : 100
			},
			masonryHorizontal : {
				rowHeight : 100
			},
			cellsByRow : {
				columnWidth : 290,
				rowHeight : 400
			}
		});
		
		filterWidgets(".house");
	});
	
	
	// marshal / unmarshal test
	/*
	var facets = new Facets();
	
	exp = facets.marshal("org.meemplex.Binary", true);
	console.log("marshal: " + exp);
	
	exp = facets.marshal("org.meemplex.Linear", 100);
	console.log("marshal: " + exp);
	
	exp = facets.marshal("org.meemplex.Linear", 245);
	console.log("marshal: " + exp);
	
	//var exp = facets.Binary.marshal(true);
	var val = Binary.unmarshal("(value #t)");
	console.log("val: " + val);
	*/
	
});
