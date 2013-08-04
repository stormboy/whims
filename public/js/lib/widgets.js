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
	 * the widget definition, where "meemplex" is the namespace, "binaryButton" the widget name
	 */
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
			meemBus: null,

			// callbacks
			change: null
		},
		
		lastValue: null,

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
				that.sendValue(event, true);
			});
			this.offButton.on("click", function(event) {
				that.sendValue(event, false);
			});

			this.options.meemBus.subscribe(this.options.path + "/" + this.options.inFacet, function(message) {
				that._acceptMessage(message);
			});
			
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
				var message = JSON.stringify({ value: value });
				if (TRACE) {
					console.log("sending value: " + value + " on topic " + topic);
				}
				this.options.meemBus.publish(topic, message);
			}
		},

		_acceptMessage: function( message ) {
			if (TRACE) {
				console.log('button got message: ' + message);
			}

			try {
				var value = JSON.parse(message).value;
				if (this.lastValue != value) {
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
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
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
			$.Widget.prototype._setOption.call( this, key, value );			// in 1.9 would use _super
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
			this.videoElement = $("<img>",  {
				"class": "videoFeed", 
				"src": this.options.url,
				"style": "width: " + this.options.width + "px; height: " + this.options.height + "px;",
			}).appendTo(this.element);
			this._refresh();
		},

		// called when created, and later when changing options
		_refresh: function() {
			this._trigger( "change" );
		},

		_destroy: function() {
			// TODO set img src to "#" before removing.

			// remove generated elements
			this.videoElement.remove();
			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		_setOptions: function() {
			$.Widget.prototype._setOptions.apply( this, arguments );			// in 1.9 would use _superApply
			this._refresh();
		},

		_setOption: function( key, value ) {
			$.Widget.prototype._setOption.call( this, key, value );			// in 1.9 would use _super
			//this._super( "_setOption", key, value );
		}
	});
	

	/**
	 * A Linear indicator widget
	 * the widget definition, where "meemplex" is the namespace, "linearIndicator" the widget name
	 */
	$.widget( "meemplex.linearIndicator", {
		options: {
			name: "Indicator",
			path: "",
			inFacet: "out/linearOutput",
			unit: "W",
			meemBus: null,

			// callbacks
			change: null,
		},
		
		lastValue: null,

		// the constructor
		_create: function() {
			this.element.addClass( "widget" ).disableSelection();	// prevent double click to select text
			this.title         = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
			this.linearElement = $("<div>",  { "class": "element" }).appendTo(this.element);
			
			this.unit          =  $("<p>",    { "class": "number", html: this.options.unit }).appendTo(this.linearElement);
			this.symbol        =  $("<h3>",   { "class": "symbol" }).appendTo(this.linearElement);
			this.value         =    $("<h2>",   { "class": "name", text: this.options.value }).appendTo(this.linearElement);
			
			this.main          =  $("<span>", { "class": "toggleButton", html: this.options.symbol }).appendTo(this.symbol);

			var self = this;
			this.options.meemBus.subscribe(this.options.path + "/" + this.options.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
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
			var payload = JSON.parse(message)
			var value = payload.value;
			// TODO convert unit
			// value = UnitTool.convert(value, payload.unit, this.unit);
			if (this.lastValue != value) {
				this.value.text( addCommas(value) );
				this.linearElement.stop(true);		// cancel previous effects
				this.linearElement.effect("shake", {direction: "up", distance: 3}, 90);
				this.lastValue = value;
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
			meemBus: null,

			// callbacks
			change: null
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
					that.sendValue(event, ui.value);
				}
			});
			
			this.options.meemBus.subscribe(that.options.path + "/" + that.options.inFacet, function(message) {
				that._acceptMessage(message);
			});
			
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
					var topic = this.options.path + "/" + this.options.outFacet;
					var unit = this.unit;
					var message = JSON.stringify({ value: value });			// include "unit" and maybe timestamp
					if (TRACE) {
						console.log("publishing value " + value + " on " + topic);
					}
					this.options.meemBus.publish(topic, message);
				}
			}
		},

		_acceptMessage: function( message ) {
			if (TRACE) {
				console.log('button got message: ' + message);
			}

			var data = JSON.parse(message);
			var value = data.value;
			
			// TODO unit conversion
			//value = UnitTools.convert(data.value, data.unit, this.unit);

			if (this.value != value) {
				this.value = value;
				this.name.text(value);
				this.sliderElement.effect("shake", {direction: "up", distance: 3}, 90);
				this.slider.slider( "option", "value", value );
			}
		},
		
		_destroy: function() {
			// remove generated elements
			this.onButton.remove();
			this.offButton.remove();

			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		_setOptions: function() {
			$.Widget.prototype._setOptions.apply( this, arguments );			// in 1.9 would use _superApply
			this._refresh();
		},

		_setOption: function( key, value ) {
			switch( key ) {
			case "inFacet":
			case "outFacet":
				if (!value || value.length == 0) {
					return;
				}
			}

			$.Widget.prototype._setOption.call( this, key, value );			// in 1.9 would use _super
			//this._super( "_setOption", key, value );
		}
	});
	
	/**
	 * 
	 */
	$.widget( "meemplex.linearSlider2", {
		// default options
		options: {
			name: "Slider",
			unit: "W",
			path: "",
			inFacet: "out/linearOutput",
			outFacet: "in/linearInput",
			meemBus: null,

			// callbacks
			change: null
		},

		// the constructor
		_create: function() {
			var that = this;

			this.element.addClass( "widget" ).disableSelection();	// prevent double click to select text
			this.title     = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
    		this.slider = $("<input>", { type: "range", name: "slider-1", id: "slider-1", min: "0", max: "100", value: "50" }).appendTo(this.element);
			this.element.trigger("create");
			this.options.meemBus.subscribe(that.options.path + "/" + that.options.inFacet, function(message) {
				that._acceptMessage(message);
			});

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
					var topic = this.options.path + "/" + this.options.outFacet;
					var unit = this.unit;
					var message = JSON.stringify({ value: value });			// include "unit" and maybe timestamp
					if (TRACE) {
						console.log("publishing value " + value + " on " + topic);
					}
					this.options.meemBus.publish(topic, message);
				}
			}
		},

		_acceptMessage: function( message ) {
			if (TRACE) {
				console.log('button got message: ' + message);
			}

			var data = JSON.parse(message);
			var value = data.value;
			
			// TODO unit conversion
			//value = UnitTools.convert(data.value, data.unit, this.unit);

			if (this.value != value) {
				this.value = value;
				this.name.text(value);
				this.sliderElement.effect("shake", {direction: "up", distance: 3}, 90);
				this.slider.slider( "option", "value", value );
			}
		},
		
		_destroy: function() {
			// remove generated elements
			this.onButton.remove();
			this.offButton.remove();

			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		_setOptions: function() {
			$.Widget.prototype._setOptions.apply( this, arguments );			// in 1.9 would use _superApply
			this._refresh();
		},

		_setOption: function( key, value ) {
			switch( key ) {
			case "inFacet":
			case "outFacet":
				if (!value || value.length == 0) {
					return;
				}
			}

			$.Widget.prototype._setOption.call( this, key, value );			// in 1.9 would use _super
			//this._super( "_setOption", key, value );
		}
	});
	
	/**
	 * topic:
	 * 	"/data/log?/path=/house/meter/power/demand&from=2013-02-08T18:49:10.000Z"
	 * message:
	 * 	"/response/12345"
	 * 
	 * topic:
	 * 	"/data/log?/path=/house/meter/power/demand&from=2013-02-08T18:49:10.000Z&to=2013-02-15T15:23:35.000Z
	 * message:
	 * 	"/response/12345"
	 */
	$.widget( "meemplex.lineGraph", {
		// default options
		options: {
			name: "Graph",
			unit: "Watts",
			path: "/house/meter/power",
			inFacet: "demand",
			responsePath: "/response/house/meter/power",
			queryPath: "/data/log",
			meemBus: null,

			// callbacks
			change: null
		},
		
		_data: null,
		_chartStuff: {},

		// the constructor
		_create: function() {
			var that = this;

			this.element.addClass("widget").disableSelection();	// prevent double click to select text
			this.title     = $("<div>",  { "class": "widgetTitle", text: this.options.name }).appendTo(this.element);
    		this.chart = $("<div>", { "class": "chart" }).appendTo(this.element);
			this.element.trigger("create");

			this.options.meemBus.subscribe(that.options.path + "/" + that.options.inFacet, function(message) {
				that._acceptMessage(message);
			});

			this.options.meemBus.subscribe(that.options.responsePath, function(message) {
				that._data = JSON.parse(message);
				that._handleData(that._data);
			});
			
			this._initChart();
			
			this.options.meemBus.on("connected", function() {
				if (!that._data) {
					that._requestData();
				}
			});
			this.options.meemBus.on("disconnected", function() {
				// ???
			});
			
			if (this.options.meemBus.isConnected()) {
				that._requestData();
			}
			
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
					var topic = this.options.path + "/" + this.options.outFacet;
					var unit = this.unit;
					var message = JSON.stringify({ value: value });			// include "unit" and maybe timestamp
					if (TRACE) {
						console.log("publishing value " + value + " on " + topic);
					}
					this.options.meemBus.publish(topic, message);
				}
			}
		},

		_acceptMessage: function( message ) {
			if (this._data) {						// add value to the chart
				var data = JSON.parse(message);
				var timestamp = data.timestamp;
				var value = data.value;
				
				// TODO unit conversion
				//value = UnitTools.convert(data.value, data.unit, this.unit);
				
				var format = d3.time.format.iso;
				var time = format.parse(timestamp).getTime();
				var val = [time, value];
				this._data.values[this._data.values.length] = val;
				this._handleData(this._data);
			}
		},
		
		_destroy: function() {
			// remove generated elements
			this.onButton.remove();
			this.offButton.remove();

			this.element
				.removeClass( "widget" )
				.enableSelection()
				.css( "background-color", "transparent" );
		},

		_setOptions: function() {
			$.Widget.prototype._setOptions.apply( this, arguments );			// in 1.9 would use _superApply
			this._refresh();
		},

		_setOption: function( key, value ) {
			switch( key ) {
			case "inFacet":
			case "outFacet":
				if (!value || value.length == 0) {
					return;
				}
			}

			$.Widget.prototype._setOption.call( this, key, value );			// in 1.9 would use _super
			//this._super( "_setOption", key, value );
		},
		
		_requestData: function() {
			var format = d3.time.format.iso;
			var time = d3.time.hour.offset(new Date(), -1);
			
			// /data/log?/path=/house/meter/power/demand&from=2013-03-08T18:49:10.000Z => /response/12345"			
			var topic = this.options.queryPath + "?/path=" + this.options.path + "/" + this.options.inFacet;
			topic += "&from=" + format(time) + "&max=10000";
			var message = this.options.responsePath;
			console.log("--- requesting data: " + topic);
			this.options.meemBus.publish(topic, message);
		},
		
		_initChart: function() {
			var self = this;
			var c = {}
			this.chartStuff = c;
			c.margin = {top: 20, right: 20, bottom: 30, left: 50};
			c.width = 320 - c.margin.left - c.margin.right;
			c.height = 240 - c.margin.top - c.margin.bottom;
			  
			c.x = d3.time.scale()
			      .range([0, c.width]);
			  
			c.y = d3.scale.linear()
			      .range([c.height, 0]);
			  
			c.xAxis = d3.svg.axis()
			      .scale(c.x)
			      .orient("bottom")
			      .ticks(4);
			  
			c.yAxis = d3.svg.axis()
			      .scale(c.y)
			      .orient("left")
			      .ticks(5);
			  
			c.line = d3.svg.line()
			      .interpolate("basis") 
			      .x(function(d) { return c.x(d[0]); })
			      .y(function(d) { return c.y(d[1]); });
			  
			c.svg = d3.select(this.chart[0]).append("svg")
			      .attr("width", c.width + c.margin.left + c.margin.right)
			      .attr("height", c.height + c.margin.top + c.margin.bottom)
			    .append("g")
			      .attr("transform", "translate(" + c.margin.left + "," + c.margin.top + ")");
		},
		
		_chartDrawn: false,
		
		_handleData: function(data) {
			var c = this.chartStuff;
			// pre-processing
			data.values.forEach(function(d) {
				d[0] = new Date(d[0]);
				d[1] = +d[1];			// make value a number
			});
			c.x.domain(d3.extent(data.values, function(d) { return d[0]; }));
			c.y.domain(d3.extent(data.values, function(d) { return d[1]; }));

			if (this._chartDrawn) {
				var svg = c.svg.transition();
		        svg.select(".line")   // change the line
		            .duration(750)
		            .attr("d", c.line(data.values));
		        svg.select(".x.axis") // change the x axis
		            .duration(750)
		            .call(c.xAxis);
		        svg.select(".y.axis") // change the y axis
		            .duration(750)
		            .call(c.yAxis);				
			}
			else {
				c.svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + c.height + ")")
				   .call(c.xAxis);
	
				c.svg.append("g").attr("class", "y axis")
				   .call(c.yAxis)
				   .append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end")
				   .text(this.options.unit);
	
				c.svg.append("path").datum(data.values).attr("class", "line").attr("d", c.line);
				
				this._chartDrawn = true;
			}
		},
	});
		
});


