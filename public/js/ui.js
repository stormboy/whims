/**
 * Main user interface objects.
 * Control Panel
 */
define([
    	'jquery',
    	'router',
    	'widgets',
    	'util',
    	'eventemitter',
    	'isotope',
    ], 
function($, Router, Widgets, Util, EventEmitter) {

	/**
	 * Example:
	 * new ControlPanel(meemBus, $("#title"), $("#controls"), $("#classSelectors"));
	 */
	
	var TRACE = false;
	
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
		};
	};
	Util.inherits(ControlPanel, EventEmitter);
		
		
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
	};
		
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
	};
	
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
			var markup = "<button type='button' id='" + filterId + "', value='" + filterId + "' class='btn btn-default " + filter.type + "'>" + filter.name + "</input>";
			$el = $( markup );
			
			var selectorElement;
			if (filter.type == "function") {
				selectorElement = $(this.selectorElement.children()[0]); // $("#functionSelectors");
			}
			else if (filter.type == "location") {
				selectorElement = $(this.selectorElement.children()[1]); //$("#locationSelectors");
			}
	
			//selectorElement.controlgroup( "container" ).append( $el );
			selectorElement.append( $el );
			//$( $el[1] ).checkboxradio();
	
			$el.click(function() {
				var f = self.classFilters[this.id];
				if (f) {
					self.functionFilter = null;
					self.locationFilter = null;
					switch (f.type) {
					case "location":
						self.locationFilter = "." + f['class'];
						window.location.assign( '#location/' + f['class'] );
						break;
					case "function":
						self.functionFilter = "." + f['class'];
						location.href='#function/' + f['class'];
						break;
					}
					//self.doFilter();
				}
			});
			//selectorElement.controlgroup("refresh");
		}
		
		//this.selectorElement.controlgroup("refresh");
		
		// create UI control/state widgets
		for (var i=0; i<data.widgets.length; i++) {
			var widgetId = "_widget" + i;
			var widget = data.widgets[i];
			this.addWidget(widgetId, widget);
		}
	
		if (TRACE) {
			console.log("laying out with isotope");
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
	};
	
	/**
	 * Add a widget to the controls panel.
	 * 
	 * @param {Object} widgetId
	 * @param {Object} widget
	 */
	ControlPanel.prototype.addWidget = function(widgetId, widget) {
		var self = this;
		
		if (self.updateTimeout) {
			// clear re-layout timer
			clearTimeout(self.updateTimeout);
		}
		
		if (TRACE) {
			console.log("adding widget: " + widget.widget);
		}
		
		switch (widget.widget) {
		
		case "BinaryButton":
			widget.id = widgetId;
			var button = new Widgets.Button({
				meemBus : self.meemBus,
				model   : widget,
			});
			this.controlsElement.append(button.$el);
			break;
			
		case "VideoFeed":
			widget.id = widgetId;
			var view = new Widgets.VideoFeed({
				meemBus : self.meemBus,
				model   : widget,
			});
			this.controlsElement.append(view.$el);
			break;

		case "LinearSlider":
			widget.id = widgetId;
			var view = new Widgets.LinearSlider({
				meemBus : self.meemBus,
				model   : widget,
			});
			this.controlsElement.append(view.$el);
			break;

		case "LinearIndicator":
			widget.id = widgetId;
			var view = new Widgets.LinearIndicator({
				meemBus : self.meemBus,
				model   : widget,
			});
			this.controlsElement.append(view.$el);
			break;
			
		case "DataChart":
			widget.id = widgetId;
			var view = new Widgets.LineChart({
				meemBus : self.meemBus,
				model   : widget,
			});
			this.controlsElement.append(view.$el);
			break;
			
		// TODO more widget types
		}
		
		// relayout isotope container
		self.updateTimeout = setTimeout(function() {
			console.log("updating controls panel");
			self.controlsElement.isotope({
				layoutMode : 'fitRows'
			});
			self.updateTimeout = null;
		}, 100);
	
	};
	
	return {
		ControlPanel: ControlPanel
	};
});