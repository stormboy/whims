var TRACE = false;

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

/**
 * Define widgets
 */
$(function() {
	
	/**
	 * A binary button widget
	 */
	// the widget definition, where "meemplex" is the namespace, "binaryButton" the widget name
	$.widget( "meemplex.binaryButton", {
		// default options
		options: {
			name: "Button",
			path: "",
			inFacet: "out/binaryOutput",
			outFacet: "in/binaryInput",
			onSymbol: "on",
			offSymbol: "off",
			onText: "on",
			offText: "off",
			socket: null,

			// callbacks
			change: null,
			sendValue: null
		},

		// the constructor
		_create: function() {
			this.element.addClass( "widget" ).disableSelection();	// prevent double click to select text
			this.title     = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
			
			// off button
			this.offElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			this.offNumber =  $("<p>",    { "class": "number" }).appendTo(this.offElement);
			this.offSymbol =  $("<h3>",   { "class": "symbol" }).appendTo(this.offElement);
			this.offButton =  $("<span>", { "class": "toggleButton", html: this.options.offSymbol }).appendTo(this.offSymbol);
			this.offName =    $("<h2>",   { "class": "name", text: this.options.offText }).appendTo(this.offElement);

			// on button
			this.onElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			this.onNumber =  $("<p>",    { "class": "number" }).appendTo(this.onElement);
			this.onSymbol =  $("<h3>",   { "class": "symbol" }).appendTo(this.onElement);
			this.onButton =  $("<span>", { "class": "toggleButton", html: this.options.onSymbol }).appendTo(this.onSymbol);
			this.onName =    $("<h2>",   { "class": "name", text: this.options.onText }).appendTo(this.onElement);
			
			var that = this;

			// bind click events on the button to the sendValue method
			this.onButton.on("click", function(event) {
				that.sendValue.apply(that, [event, true]);
			});
			this.offButton.on("click", function(event) {
				that.sendValue.apply(that, [event, false]);
				//that.sendValue(event, false);
			});

			this.options.socket.on('message', function (data) {
				//console.log('button got message. topic: ' + data.topic + ' message: ' + data.message);
				if (data.topic == that.options.path + "/" + that.options.inFacet) {
					that._acceptMessage(data.message);
				}
			});
			// subscribe or defer subscribe
			subscribe(this.options.path + "/" + this.options.inFacet);
			
			this._refresh();
		},

		// called when created, and later when changing options
		_refresh: function() {
			this.element.css( "background-color", "rgb(" +
				this.options.red +"," +
				this.options.green + "," +
				this.options.blue + ")"
			);

			// trigger a callback/event
			this._trigger( "change" );
		},

		// a public method to send a value can be called directly via .sendValue( boolean )
		sendValue: function( event, value ) {
			// trigger an event, check if it's cancelled
			if ( this._trigger( "sendValue", event, value ) !== false ) {
				// TODO include "unit" and maybe timestamp
				var topic = this.options.path + "/" + this.options.outFacet;
				var message = JSON.stringify({value: value});
				if (TRACE) {
					console.log("sending value: " + value + " on topic " + topic);
				}
				publish(topic, message);
			}
		},

		_acceptMessage: function( message ) {
			if (TRACE) {
				console.log('button got message: ' + message);
			}

			var value = Binary.unmarshal(message);
			var currentValue = this.onNumber.text() == "1" ? true : (this.offNumber.text() == "1" ? false : null);

			if (currentValue != value) {
				this.onNumber.text(value ? "1" : "0");
				this.offNumber.text(value ? "0" : "1");
				if (value) {
					this.onElement.stop(true);		// cancel previous effects
					this.onElement.effect("shake", {direction: "up", distance: 3}, 90);
				}
				else {
					this.offElement.stop(true);		// cancel previous effects
					this.offElement.effect("shake", {direction: "up", distance: 3}, 90);
				}
			}
		},
		
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			// remove generated elements
			this.onButton.remove();
			this.offButton.remove();

			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			this._refresh();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			switch( key ) {
			case "inFacet":
			case "outFacet":
				if (!value || value.length == 0) {
					return;
				}
			}

			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
			//this._super( "_setOption", key, value );
		}
	});
	

	/**
	 * A simple video feed, initially for mjpeg streams
	 */
	$.widget( "meemplex.videoFeed", {
		// default options
		options: {
			name: "Video Feed",
			url: "",
			width: "352",
			height: "240",
		},

		// the constructor
		_create: function() {
			this.element.addClass( "widget" ).disableSelection();	// prevent double click to select text
			this.title     = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
			
			// on button
			this.videoElement = $("<img>",  {
				"class": "videoFeed", 
				"src": this.options.url,
				"style": "width: " + this.options.width + "px; height: " + this.options.height + "px;",
			}).appendTo(this.element);
			this._refresh();
		},

		// called when created, and later when changing options
		_refresh: function() {
			// trigger a callback/event
			this._trigger( "change" );
		},
		
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			// TODO set img src to "#" before removing.

			// remove generated elements
			this.videoElement.remove();

			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			this._refresh();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {

			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
			//this._super( "_setOption", key, value );
		}
	});
	
	
	// the widget definition, where "meemplex" is the namespace, "linearIndicator" the widget name
	$.widget( "meemplex.linearIndicator", {
		// default options
		options: {
			name: "Indicator",
			path: "",
			inFacet: "out/linearOutput",
			unit: "W",
			socket: null,

			// callbacks
			change: null,
		},

		// the constructor
		_create: function() {
			this.element.addClass( "widget" ).disableSelection();	// prevent double click to select text
			this.title     = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
			this.linearElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			this.unit =  $("<p>",    { "class": "number", html: this.options.unit }).appendTo(this.linearElement);
			this.symbol =  $("<h3>",   { "class": "symbol" }).appendTo(this.linearElement);
			this.main =  $("<span>", { "class": "toggleButton", html: this.options.symbol }).appendTo(this.symbol);
			this.value =    $("<h2>",   { "class": "name", text: this.options.value }).appendTo(this.linearElement);

			var that = this;			
			this.options.socket.on('message', function (data) {
				if (data.topic == that.options.path + "/" + that.options.inFacet) {	// check if message is for this widget
					that._acceptMessage(data.message);
				}
			});
			// subscribe or defer subscribe
			subscribe(this.options.path + "/" + this.options.inFacet);
			
			this._refresh();
		},

		// called when created, and later when changing options
		_refresh: function() {
			this.element.css( "background-color", "rgb(" +
				this.options.red +"," +
				this.options.green + "," +
				this.options.blue + ")"
			);

			this._trigger( "change" );
		},

		_acceptMessage: function( message ) {
			var value = JSON.parse(message);
			//console.log('linear got value: ' + value.value);

			if (this.value.text() != value.value) {
				this.value.text(value.value);
				this.linearElement.stop(true);		// cancel previous effects
				this.linearElement.effect("shake", {direction: "up", distance: 3}, 90);
			}
		},
		
		_destroy: function() {
			this.linearElement.remove();
			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		_setOptions: function() {
			$.Widget.prototype._setOptions.apply( this, arguments );
			this._refresh();
		},

		_setOption: function( key, value ) {
			switch( key ) {
			case "inFacet":
				if (!value || value.length == 0) {
					return;
				}
			}
			$.Widget.prototype._setOption.call( this, key, value );
		}
	});
	
	
	
	/**
	 * A linear slider widget
	 */
	$.widget( "meemplex.linearSlider", {
		// default options
		options: {
			name: "Slider",
			unit: "W",
			path: "",
			inFacet: "out/linearOutput",
			outFacet: "in/linearInput",
			socket: null,

			// callbacks
			change: null,
			sendValue: null
		},

		// the constructor
		_create: function() {
			var that = this;

			this.element.addClass( "widget" ).disableSelection();	// prevent double click to select text
			this.title     = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
			
			this.sliderElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			this.unit =  $("<p>",    { "class": "number", html: this.options.unit }).appendTo(this.sliderElement);
			//this.number =  $("<p>",    { "class": "number" }).appendTo(this.sliderElement);
			this.symbol =  $("<div>",   { "class": "symbol" }).appendTo(this.sliderElement);
			//this.button =  $("<span>", { "class": "toggleButton", html: this.options.symbol }).appendTo(this.symbol).button();
			this.name =    $("<h2>",   { "class": "name", text: this.options.text }).appendTo(this.sliderElement);
			
			// slider
			this.slider = $("<div>", { "class": "slider" }).appendTo(this.symbol).slider({
				orientation: "vertical",
				range: "min",
				min: -80,
				max: 12,
				step: 0.5,
				value: -40,
				slide: function( event, ui ) {
					that.sendValue.apply(that, [event, ui.value]);
				}
			});
			
			this.options.socket.on('message', function (data) {
				//console.log('button got message. topic: ' + data.topic + ' message: ' + data.message);
				if (data.topic == that.options.path + "/" + that.options.inFacet) {
					that._acceptMessage(data.message);
				}
			});
			// subscribe or defer subscribe
			//console.log('subscribing to topic: ' + this.options.path + "/" + this.options.inFacet);
			subscribe(this.options.path + "/" + this.options.inFacet);
			
			this._refresh();
		},

		// called when created, and later when changing options
		_refresh: function() {
			this.element.css( "background-color", "rgb(" +
				this.options.red +"," +
				this.options.green + "," +
				this.options.blue + ")"
			);

			// trigger a callback/event
			this._trigger( "change" );
		},

		// a public method to send a value can be called directly via .sendValue( boolean )
		sendValue: function( event, value ) {
			// trigger an event, check if it's canceled
			if ( this._trigger( "sendValue", event, value ) !== false ) {
				if (this.value != value) { 
					// TODO include "unit" and maybe timestamp
					var topic = this.options.path + "/" + this.options.outFacet;
					var message = JSON.stringify({value: value});
					//if (TRACE) {
						console.log("publishing value " + value + " on " + topic);
					//}
					publish(topic, message);
				}
			}
		},

		_acceptMessage: function( message ) {
			if (TRACE) {
				console.log('button got message: ' + message);
			}

			var value = Linear.unmarshal(message);

			if (this.value != value) {
				this.value = value;
				this.name.text(value);
				this.sliderElement.effect("shake", {direction: "up", distance: 3}, 90);
				this.slider.slider( "option", "value", value );
			}
		},
		
		// events bound via _bind are removed automatically
		// revert other modifications here
		_destroy: function() {
			// remove generated elements
			this.onButton.remove();
			this.offButton.remove();

			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		// _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// in 1.9 would use _superApply
			$.Widget.prototype._setOptions.apply( this, arguments );
			this._refresh();
		},

		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			switch( key ) {
			case "inFacet":
			case "outFacet":
				if (!value || value.length == 0) {
					return;
				}
			}

			// in 1.9 would use _super
			$.Widget.prototype._setOption.call( this, key, value );
			//this._super( "_setOption", key, value );
		}
	});
	
});


