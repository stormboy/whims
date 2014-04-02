define([ 'jquery',
		 'jqueryknob',
         'backbone',
		'jade!templates/widgets/linear_dial' ], 
function($, Knob, Backbone, DialTemplate) {
	
	/**
	 * Model attibutes:
	 * name: widget.name,
	 * path: widget.path,
	 * unit: widget.unit,
	 * symbol: widget.symbol,
	 * inFacet: widget.inFacet,
	 * outFacet: widget.outFacet,
	 */
	var DialView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			this.model = {
				name: "Dial",
				unit: "W",
				path: "",
				step: 1,
				inFacet: "out/linearOutput",
				outFacet: "in/linearInput",
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
			var compiledTemplate = DialTemplate(this.model);
			this.setElement($(compiledTemplate).get());

			var self = this;
			this.$el.find("input").knob({
				min: this.model.min,
				max: this.model.max,
				step: this.model.step,
				angleOffset: -125,
				angleArc: 250,
				// angleOffset: -90,
				// angleArc: 180,
				width: 160,
				height: 140,
				release: function(value) { 
					//console.log("release: " + value); 
				},
				change: function(value) { 
					self._sendValue(value); 
				}
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
				var value = message.value;
				if (this.lastValue != value) {
					this.$el.find("input").val(value).change();		// display value
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
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
	
	return DialView;
});