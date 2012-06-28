
/**
 * A binary button widget
 */
$(function() {
	
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
			
			// on button
			this.onElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			this.onNumber =  $("<p>",    { "class": "number" }).appendTo(this.onElement);
			this.onSymbol =  $("<h3>",   { "class": "symbol" }).appendTo(this.onElement);
			this.onButton =  $("<span>", { "class": "toggleButton", html: this.options.onSymbol }).appendTo(this.onSymbol).button();
			this.onName =    $("<h2>",   { "class": "name", text: this.options.onText }).appendTo(this.onElement);
			
			// off button
			this.offElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			this.offNumber =  $("<p>",    { "class": "number" }).appendTo(this.offElement);
			this.offSymbol =  $("<h3>",   { "class": "symbol" }).appendTo(this.offElement);
			this.offButton =  $("<span>", { "class": "toggleButton", html: this.options.offSymbol }).appendTo(this.offSymbol).button();
			this.offName =    $("<h2>",   { "class": "name", text: this.options.offText }).appendTo(this.offElement);

			// bind click events on the changer button to the random method
			// in 1.9 would use this._bind( this.onButton, { click: "sendValue" });
			var that = this;
			this.onButton.bind("click.sendValue", function() {
				// _bind would handle this check
				if (that.options.disabled) {
					return;
				}
				that.sendValue.apply(that, [event, true]);
			});
			this.offButton.bind("click.sendValue", function() {
				// _bind would handle this check
				if (that.options.disabled) {
					return;
				}
				arguments[arguments.length] = false;
				that.sendValue.apply(that, [event, false] );
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
				var topic = this.options.path + "/" + this.options.outFacet;
				var message = "(value " + value + ")";
				publish(topic, message);
			}
		},

		_acceptMessage: function( message ) {
			var value = message.indexOf("true") >= 0;
			console.log('button got value: ' + value);

			this.onNumber.text(value ? "1" : "0");
			this.offNumber.text(value ? "0" : "1");
			if (value) {
				//this.onElement.effect("pulsate", {direction: "up", distance: 3}, 100);
				this.onElement.effect("shake", {direction: "up", distance: 3}, 90);
			}
			else {
				this.offElement.effect("shake", {direction: "up", distance: 3}, 90);
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
});


