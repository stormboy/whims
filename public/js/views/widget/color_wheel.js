define([ 'jquery',
		 'colorwheel',
         'backbone',
		'jade!templates/widgets/color_wheel' ], 
function($, Colorwheel, Backbone, WheelTemplate) {
	
	/**
	 * Model attibutes:
	 * name: widget.name,
	 * path: widget.path,
	 * unit: widget.unit,
	 * symbol: widget.symbol,
	 * inFacet: widget.inFacet,
	 * outFacet: widget.outFacet,
	 */
	var WheelView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			this.model = {
				name: "Colorwheel",
				unit: "rgb",
				path: "",
				step: 1,
				inFacet: "out/colorOutput",
				outFacet: "in/colorInput",
			};
			for (var attrname in options.model) { this.model[attrname] = options.model[attrname]; }	// copy options to model

			this.render();
			
			this.meemBus = options.meemBus;
			this.meemBus.subscribe(options.model.path + "/" + options.model.inFacet, function(message) {
				self._handleMessage(message);
			});
			
			this.meemBus.subscribe(this.model.path + "/out/propertiesOut", function(message) {
				self._handleProperties(message);
			});
		},
		
		render: function () { 
			var self = this;
			var compiledTemplate = WheelTemplate(this.model);
			this.setElement($(compiledTemplate).get());
			
			this.cw = Raphael.colorwheel(this.$el.find(".colorwheel")[0], 110, 180);
			this.cw.color("#CCC");

			this.cw.onchange(function(color) { 
				//console.log("color: " + JSON.stringify(color));
				self._sendValue({
					r: Math.round(color.r), 
					g: Math.round(color.g),
					b: Math.round(color.b)
				});
			});
			
			return this;
		},

		events: {
//			"click #onElement  .toggleButton"     : "doOn",
//			"click #offElement .toggleButton"     : "doOff",
		},

		_sendValue: function(value) {
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = JSON.stringify({ value: value, unit: this.model.unit });
			this.meemBus.publish(topic, message);
		},
		
		_handleMessage: function(message) {
			try {
				//console.log("got value: " + message.value);
				var rgb = message.value;
				if ( !rgbEqual(this.lastValue, rgb) ) {
					this.cw.color(rgbToHex(rgb));
					this.lastValue = rgb;
				}
			}
			catch (e) {
				// problem
				console.error(e);
			}
		},
		_handleProperties: function(message) {
			try {
				switch(message.type) {
				case "propertyChange":
					if (message.property.name == "name") {
						this.$el.find(".widgetTitle").html(message.property.value);
					}
					break;
				case "properties":
					if (message.properties.name) {
						this.$el.find(".widgetTitle").html(message.properties.name.value);
					}
					break;
				}
			}
			catch (e) {
			}
		}
	});
	
	function rgbEqual(c1, c2) {
		return c1 && c2 && c1.r == c2.r && c1.g == c2.g && c1.b == c2.b;
	}
	
	function componentToHex(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}
	
	function rgbToHex(rgb) {
		var r = rgb.r, g = rgb.g, b = rgb.b;
	    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	
	function parseColor(input) {
		var m = input.match(/^#([0-9a-f]{3})$/i)[1];
		if (m) {
		    // in three-character format, each value is multiplied by 0x11 to give an even scale from 0x00 to 0xff
		    return {
		        r: parseInt(m.charAt(0),16)*0x11,
		        g: parseInt(m.charAt(1),16)*0x11,
		        b: parseInt(m.charAt(2),16)*0x11
		    };
		}
		m = input.match(/^#([0-9a-f]{6})$/i)[1];
		if (m) {
		    return {
		        r: parseInt(m.substr(0,2),16),
		        g: parseInt(m.substr(2,2),16),
		        b: parseInt(m.substr(4,2),16)
		    };
		}
		m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
		if (m) {
		    return { r: m[1], g: m[2], B: m[3] };
		}
    }
	
	return WheelView;
});