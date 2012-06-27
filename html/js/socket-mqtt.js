/**
 * Code for the io.socket MQTT
 */

// socket on the same server
var socketUrl = "/";

var numSubscriptions = 0;
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
		// TODO make sure no other subscriptions to this topic exist before unsubscribing. 
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
		console.log('socket connected: ' + data);
	});
	
	socket.on('disconnected', function (data) {
		console.log('socket disconnected: ' + data);
	});

	// a handler for when MQTT service is connected
	socket.on('sessionOpened', function (data) {		// connected to MQTT service
		console.log('MQTT session opened: ' + data);
		
		sessionOpened = true;
		$("#publish").show();			// show the publish button
		$("#subscribe").show();			// show the publish button
		
		// do pending subscriptions 
		while (pendingSubscriptions.length > 0) {
			var topic = pendingSubscriptions.shift();
			socket.emit('subscribe', topic);
		}
	});
	
	socket.on('sessionClosed', function (data) {		// disconnected from MQTT service
		console.log('MQTT session closed: ' + data);
	});
	
	// a handler for incoming MQTT messages
	socket.on('message', function (data) {
		console.log('incoming message topic: ' + data.topic + ' message: ' + data.message);
		$('#messages').append('<tr><td>' + data.topic + "</td><td>" + data.message + '</td>');
	});
	
	// a click handler for the subscribe button
	$('#subscribe').click(function() {
		var topic = $('#subscribeTopic').val();
		subscribe(topic);
		var rowId = "subRow" + numSubscriptions;
		var buttonId = "subButton" + numSubscriptions;
		numSubscriptions++;
		$('#subscriptions').append("<tr id='" + rowId + "'><td>" + topic + "</td><td><button id='" + buttonId + "'>unsubscribe</button></td>");
		$("#" + buttonId).click(function() {
			unsubscribe(topic);
			$("#"+rowId).remove();
		});
	});
	
	// a click handler for the publish button
	$('#publish').click(function() {
		var topic = $('#topic').val();
		var message = $('#message').val();
		publish (topic, message);
	});

});
