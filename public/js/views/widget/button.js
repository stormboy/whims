define([ 'jquery', 
         'backbone', 
		'jade!templates/widgets/simple_button' ], 
function($, Backbone, ButtonTemplate) {
	
	var ButtonView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			
			// defaults
			this.model = {
				name: "Button",
				path: "",
				inFacet: "out/binaryOutput",
				outFacet: "in/binaryInput",
				onSymbol: "on",
				offSymbol: "off",
				onText: "on",
				offText: "off",
			};
			for (var attrname in options.model) { this.model[attrname] = options.model[attrname]; }	// copy options to model
			
			this.meemBus = options.meemBus;
			this.meemBus.subscribe(this.model.path + "/" + this.model.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
			this.render();
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
			//console.log("sending on");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = { value: true };
			this.meemBus.publish(topic, message);
		},
		
		doOff: function(event) {
			//console.log("sending off");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = { value: false };
			this.meemBus.publish(topic, message);
		},
		
		_acceptMessage: function(message) {
			//console.log("handing binary message: " + message);
			try {
				var value = message.value;
				if (this.lastValue != value) {
					$onEl = value ? this.$el.find("#onElement") : this.$el.find("#offElement");
					$offEl = value ? this.$el.find("#offElement") : this.$el.find("#onElement");
					
					$onEl.find(".number").text("1");
					$offEl.find(".number").text("");
					
					$onEl.css("-webkit-filter", "saturate(200%) brightness(150%)");
					//$onEl.css("border-style", "inset");
					$offEl.css("-webkit-filter", "none");
					//$offEl.css("border-style", "outset");
					
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
