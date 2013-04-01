var util = require('util');
var EventEmitter = require("events").EventEmitter;

/**
 * requires isotope
 */

/*
<div id="mainContainer">
	<h1 id="title">MQTT UI</h1>
	<div id="controlsContainer">
		<div id="controls" class="clearfix isotope fitRows">
		</div>
	</div>
	<div id="selectorContainer">
		<div id="classSelectors">
		</div>
	</div>
</div>
 */

/**
 * Example:
 * new ControlPanel(meemBus, $("#title"), $("#controls"), $("#classSelectors"));
 */

var TRACE = true;

/**
 * titleElement: jQuery wrapped element
 * controlsElement: jQuery wrapped element
 */ 
var ControlPanel = function(meemBus,  titleElement, controlsElement, selectorElement) {
	EventEmitter.call(this);
	
	if (TRACE) {
		console.log("creating Control Panel");
	}
	var self = this;
	this.meemBus = meemBus;
	this.titleElement = titleElement;
	this.controlsElement = controlsElement;
	this.selectorElement = selectorElement;
	
	this.functionFilter = "*";
	this.locationFilter = "*";
	
	// a map of class filters
	this.classFilters = {};

	// display a filtered set of widgets as per selector
	this.filterWidgets = function(selector) {
		self.controlsElement.isotope( { filter : selector } );
	}
}
util.inherits(ControlPanel, EventEmitter);
	
	
ControlPanel.prototype.doFilter = function() {
	if (this.functionFilter == null) {
		if (this.locationFilter == null) {
			this.filterWidgets("*");
		}
		else {
			this.filterWidgets(this.locationFilter);
		}
	}
	else {
		if (this.locationFilter == null) {
			this.filterWidgets(this.functionFilter);
		}
		else {
			this.filterWidgets(this.functionFilter + this.locationFilter);
		}
	}
}
	
/*
 * get UI configuration data 
 */
ControlPanel.prototype.getUI = function() {
	if (TRACE) {
		console.log("getting ui");
	}
	var self = this;
	$.getJSON('ui.json', function(data) {
		if (TRACE) {
			console.log("got ui data");
		}
		self.uiData(data);
	});
}

/**
 * Build UI from the descriptor
 * @param {Object} data
 */
ControlPanel.prototype.uiData = function(data) {
	var self = this;
	
	this.titleElement.html(data.title);
	
	// create filter buttons
	for (var i=0; i<data.filters.length; i++) {
		var filterId = "_filter" + i;
		var filter = data.filters[i];
		this.classFilters[filterId] = filter;
		
		// add class filter button to UI
		//this.selectorElement.append("<button id='" + filterId + "' class='" + filter.type + "'>" + filter.name + "<button");
		var markup = "<label for='" + filterId + "'>" + filter.name + "</label>" + 
			"<input type='radio' name='radio-option', id='" + filterId + "', value='" + filterId + "' class='" + filter.type + "'></input>";
		$el = $( markup );
		
		var selectorElement;
		if (filter.type == "function") {
			selectorElement = $(this.selectorElement.children()[0]); // $("#functionSelectors");
		}
		else if (filter.type == "location") {
			selectorElement = $(this.selectorElement.children()[1]); //$("#locationSelectors");
		}

        selectorElement.controlgroup( "container" ).append( $el );
		$( $el[1] ).checkboxradio();

		$el.click(function() {
			var f = self.classFilters[this.id];
			if (f) {
				self.functionFilter = null;
				self.locationFilter = null;
				switch (f.type) {
				case "location":
					self.locationFilter = "." + f['class'];
					break;
				case "function":
					self.functionFilter = "." + f['class'];
					break;
				}
				self.doFilter();
			}
		});
		selectorElement.controlgroup("refresh");
	}
	
	//this.selectorElement.controlgroup("refresh");
	
	// create UI control/state widgets
	for (var i=0; i<data.widgets.length; i++) {
		var widgetId = "_widget" + i;
		var widget = data.widgets[i];
		this.addWidget(widgetId, widget);
	}

	// initiate isotope layout on the #controls element
	this.controlsElement.isotope({
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
		},
		onLayout : function($elems, instance) {
			self.emit("layout");
		}
	});

	this.filterWidgets(".house");	// initial controls filter
}

/**
 * Add a widget to the controls panel.
 * 
 * @param {Object} widgetId
 * @param {Object} widget
 */
ControlPanel.prototype.addWidget = function(widgetId, widget) {
	var self = this;
	
	this.controlsElement.append("<div id='" + widgetId + "' class='" + widget.classes + "'></div>");
	
	if (TRACE) {
		console.log("adding widget: " + widget.widget);
	}
	
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
			meemBus: self.meemBus
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
	case "LinearSlider":
		$( "#" + widgetId ).linearSlider2({ 
			name: widget.name,
			path: widget.path,
			unit: widget.unit,
			symbol: widget.symbol,
			inFacet: widget.inFacet,
			outFacet: widget.outFacet,
			meemBus: self.meemBus
		});
		break;
	case "LinearIndicator":
		$( "#" + widgetId ).linearIndicator({ 
			name: widget.name,
			path: widget.path,
			unit: widget.unit,
			symbol: widget.symbol,
			inFacet: widget.inFacet,
			meemBus: self.meemBus
		});
		break;
	case "DataChart":
		$( "#" + widgetId ).lineGraph({ 
			name: widget.name,
			path: widget.path,
			unit: widget.unit,
			symbol: widget.symbol,
			inFacet: widget.inFacet,
			meemBus: self.meemBus
		});
		break;
		
	// TODO more widget types
	}
}

exports.ControlPanel = ControlPanel;
