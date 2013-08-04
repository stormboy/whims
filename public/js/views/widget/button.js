define([ 'jquery', 
         'backbone', 
		'jade!templates/widgets/simple_button' ], 
function($, Backbone, ButtonTemplate) {
	
	var ButtonView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			this.meemBus = options.meemBus;
			this.meemBus.subscribe(options.model.path + "/" + options.model.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
			this.render();
		},
		
		model : {
			name: "Button",
			path: "",
			inFacet: "out/binaryOutput",
			outFacet: "in/binaryInput",
			onSymbol: "on",
			offSymbol: "off",
			onText: "on",
			offText: "off",
		},
		
		render: function () { 
			var compiledTemplate = ButtonTemplate(this.model);
			this.setElement($(compiledTemplate).get());
			
			return this;
		},

		events: {
			"click #onElement  .toggleButton"     : "doOn",
			"click #offElement .toggleButton"     : "doOff",
		},

		doOn: function(event) {
			console.log("sending on");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = JSON.stringify({ value: true });
			this.meemBus.publish(topic, message);
		},
		
		doOff: function(event) {
			console.log("sending off");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = JSON.stringify({ value: false });
			this.meemBus.publish(topic, message);
		},
		
		_acceptMessage: function(message) {
			console.log("handing binary message: " + message);
			try {
				var value = JSON.parse(message).value;
				if (this.lastValue != value) {
					this.$el.find("#offElement .number").text(value ? "0" : "1");
					this.$el.find("#onElement .number").text(value ? "1" : "0");
					
					// animate button
//					if (value) {
//						this.onElement.stop(true);		// cancel previous effects
//						this.onElement.effect("shake", {direction: "up", distance: 3}, 90);
//					}
//					else {
//						this.offElement.stop(true);		// cancel previous effects
//						this.offElement.effect("shake", {direction: "up", distance: 3}, 90);
//					}
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
			}
		},
	});
	
	return ButtonView;
});
