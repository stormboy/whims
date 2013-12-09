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
				inFacet: "out/linearOutput",
				outFacet: "in/linearInput",
			};
			for (var attrname in options.model) { this.model[attrname] = options.model[attrname]; }	// copy options to model

			this.meemBus = options.meemBus;
			this.meemBus.subscribe(options.model.path + "/" + options.model.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
			this.render();
		},
		
		render: function () { 
			var compiledTemplate = DialTemplate(this.model);
			this.setElement($(compiledTemplate).get());

			var self = this;
			this.$el.find("input").knob({
				min: this.model.min,
				max: this.model.max,
				angleOffset: -125,
				angleArc: 250,
				width: 160,
				height: 140,
				release: function(value) { 
					console.log("release: " + value); 
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
		
		_acceptMessage: function(message) {
			try {
				var value = message.value;
				if (this.lastValue != value) {
					this.$el.val(value);		// display value
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
			}
		},
	});
	
	return DialView;
});