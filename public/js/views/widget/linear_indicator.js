define([ 'jquery', 
         'backbone', 
         'quantities',
		'jade!templates/widgets/linear_indicator' ], 
function($, Backbone, Qty, LinearTemplate) {
	
	/**
	 * Add comma separators to large numbers
	 */
	function addCommas(nStr) {
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

	var LinearView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			this.model = {
				name: "Indicator",
				path: "",
				inFacet: "out/linearOutput",
				unit: "W",
			};
			for (var attrname in options.model) { this.model[attrname] = options.model[attrname]; }	// copy options to model

			this.meemBus = options.meemBus;
			
			this.meemBus.subscribe(this.model.path + "/" + this.model.inFacet, function(message) {
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
		},

		_acceptMessage: function(message) {
			try {
				var value = message.value;
				// TODO convert unit
				// value = UnitTool.convert(value, payload.unit, this.unit);
				if (this.lastValue != value) {
					var displayValue = value;
					var altValue = value;
					var unit = message.unit ? message.unit : "";
					var valueString = value + unit;
					if (this.model.unit) {
						// convert to configured units
						var qty = new Qty(valueString);
						displayValue = qty.toString(this.model.unit, 0);
					}
					if (this.model.altUnit) {
						var qty = new Qty(valueString);
						altValue = qty.to(this.model.altUnit).toPrec(0.1).scalar + " " + this.model.altUnit;
					}
					else {
						altValue = addCommas(value) + " " + unit;
					}
					this.$el.find(".toggleButton").text( addCommas(displayValue) );	// TODO convert units
					this.$el.find(".name").text( altValue );

					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
				console.log("problem accepting message: " + e);
			}
		},
	});
	
	return LinearView;
});