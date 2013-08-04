define([ 'jquery', 
         'backbone', 
		'jade!templates/widgets/linear_indicator' ], 
function($, Backbone, LinearTemplate) {
	
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
			this.meemBus = options.meemBus;
			
			this.meemBus.subscribe(options.model.path + "/" + options.model.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
			this.render();
		},
		
		model : {
			name: "Indicator",
			path: "",
			inFacet: "out/linearOutput",
			unit: "W",
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
				var payload = JSON.parse(message)
				var value = payload.value;
				// TODO convert unit
				// value = UnitTool.convert(value, payload.unit, this.unit);
				if (this.lastValue != value) {
					this.$el.find(".name").text( addCommas(value) );
					//this.linearElement.stop(true);		// cancel previous effects
					//this.linearElement.effect("shake", {direction: "up", distance: 3}, 90);
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