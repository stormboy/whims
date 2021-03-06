define([ 'jquery', 
         'backbone', 
		'jade!templates/widgets/linear_slider' ], 
function($, Backbone, LinearTemplate) {
	
	/**
	 * Model attibutes:
	 * name: widget.name,
	 * path: widget.path,
	 * unit: widget.unit,
	 * symbol: widget.symbol,
	 * inFacet: widget.inFacet,
	 * outFacet: widget.outFacet,
	 */
	var LinearView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			this.model = {
				name: "Slider",
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
			var compiledTemplate = LinearTemplate(this.model);
			this.setElement($(compiledTemplate).get());
			
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
					// display value and animate 
					//this.$el.find("#offElement .number").text(value ? "0" : "1");
					//this.$el.find("#onElement .number").text(value ? "1" : "0");
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
			}
		},
	});
	
	return LinearView;
});