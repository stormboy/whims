
  
define([ 'jquery',
		'backbone',
		'justgage',
		'jade!templates/widgets/linear_gauge' ], 
function($, Backbone, JustGage, GaugeTemplate) {
	
	var GaugeView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			
			// defaults
			this.model = {
				name: "Gauge",
				path: "",
				inFacet: "out/linearOutput",
				unit: "W",
				min: 0,
				max: 100
			};
			for (var attrname in options.model) { this.model[attrname] = options.model[attrname]; }	// copy options to model

			this.meemBus = options.meemBus;
			this.meemBus.subscribe(this.model.path + "/" + this.model.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
			this.render();
		},
		
		render: function () { 
			var compiledTemplate = GaugeTemplate(this.model);
			this.setElement($(compiledTemplate).get());
			
			var self = this;
			
			// add a refresh function to the element
			this.el.refresh = function() {
				self.refresh();
			};

			setTimeout(function() {
				self.justGage = new JustGage({
					id:    self.model.id,
					value: 0, 
					min:   self.model.min,
					max:   self.model.max,
					title: self.model.name,
					label: self.model.unit,
					valueFontColor: "#cccccc",
					levelColors: ["#11ee11", "#adff2f", "#ff8c00", "#ee1111"],
					levelColorsGradient: true,
					showMinMax: false,
					titleFontColor: "#CCC",
					titleFontSize: 14,
				});
			}, 50);

			return this;
		},

		events: {
			//"click #onElement  .toggleButton"     : "doOn",
			//"click #offElement .toggleButton"     : "doOff",
		},
		
		refresh: function() {
			// self.justGage = new JustGage({
				// id:    this.model.id,
				// value: this.lastValue, 
				// min:   this.model.min,
				// max:   this.model.max,
				// title: this.model.name
			// });
		},

		_acceptMessage: function(message) {
			//console.log("handing binary message: " + message);
			try {
				var value = message.value;
				if (this.lastValue != value) {
					this.justGage.refresh(value);
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
			}
		},
	});
	
	return GaugeView;
});
