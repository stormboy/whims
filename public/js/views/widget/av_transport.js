define([ 'jquery', 
         'backbone', 
         'raphael',
         'jade!templates/widgets/av_transport' ], 
function($, Backbone, Raphael, TransportTemplate) {
	
	var AvTransportView = Backbone.View.extend({

		initialize : function(options) {
			var self = this;
			
			// defaults
			this.model = {
				name: "AV Transport",
				path: "",
				inFacet: "out/transportOutput",
				outFacet: "in/transportInput"
			};
			for (var attrname in options.model) { this.model[attrname] = options.model[attrname]; }	// copy options to model
			
			this.meemBus = options.meemBus;
			this.meemBus.subscribe(this.model.path + "/" + this.model.inFacet, function(message) {
				self._handleMessage(message);
			});
			
			this.render();
		},
		
		render: function () { 
			var compiledTemplate = TransportTemplate(this.model);
			this.setElement($(compiledTemplate).get());
			
			var color = "#ccc";
			var scale = 1.5;
			var prevPath = "M24.316,5.318,9.833,13.682,9.833,5.5,5.5,5.5,5.5,25.5,9.833,25.5,9.833,17.318,24.316,25.682z";
			var nextPath = "M21.167,5.5,21.167,13.681,6.684,5.318,6.684,25.682,21.167,17.318,21.167,25.5,25.5,25.5,25.5,5.5z";
			var playPath = "M6.684,25.682L24.316,15.5L6.684,5.318V25.682z";
			var pausePath = "M4.082,4.083v2.999h22.835V4.083H4.082zM4.082,20.306h22.835v-2.999H4.082V20.306zM4.082,13.694h22.835v-2.999H4.082V13.694zM4.082,26.917h22.835v-2.999H4.082V26.917z";
			var stopPath = "M5.5,5.5h20v20h-20z";
			var rewPath = "M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z";
			var fwdPath = "M25.5,15.5,15.2,9.552,15.2,15.153,5.5,9.552,5.5,21.447,15.2,15.847,15.2,21.447z";
			
			playPaper = new Raphael(this.$el.find(".play").get(0), 50, 50);
			playPaper.path(playPath).attr({fill: color, stroke: "none"}).scale(scale);
			
			pausePaper = new Raphael(this.$el.find(".pause").get(0));
			pausePaper.path(pausePath).attr({fill: color, stroke: "none"}).scale(scale);
			
			stopPaper = new Raphael(this.$el.find(".stop").get(0));
			stopPaper.path(stopPath).attr({fill: color, stroke: "none"}).scale(scale);
			
			previousPaper = new Raphael(this.$el.find(".previous").get(0));
			previousPaper.path(prevPath).attr({fill: color, stroke: "none"}).scale(scale);
			
			nextPaper = new Raphael(this.$el.find(".next").get(0));
			nextPaper.path(nextPath).attr({fill: color, stroke: "none"}).scale(scale);
			
			rewPaper = new Raphael(this.$el.find(".rewind").get(0));
			rewPaper.path(rewPath).attr({fill: color, stroke: "none"}).scale(scale);
			
			fwdPaper = new Raphael(this.$el.find(".fastforward").get(0));
			fwdPaper.path(fwdPath).attr({fill: color, stroke: "none"}).scale(scale);
			
			return this;
		},

		events: {
			"click .play"     : "doPlay",
			"click .pause"    : "doPause",
			"click .stop"     : "doStop",
			"click .seek"     : "doSeek",
		},

		doPlay: function(event) {
			console.log("AvTransport: play");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = { value: "play" };
			this.meemBus.publish(topic, message);
		},
		
		doPause: function(event) {
			console.log("AvTransport: pause");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = { value: "pause" };
			this.meemBus.publish(topic, message);
		},
		
		doStop: function(event) {
			console.log("AvTransport: stop");
			var topic = this.model.path + "/" + this.model.outFacet;
			var message = { value: "stop" };
			this.meemBus.publish(topic, message);
		},
		
		_handleMessage: function(message) {
			try {
				var value = message.value;
				if (this.lastValue != value) {
					// TODO handle new value
					
					this.lastValue = value;
				}
			}
			catch (e) {
				// problem
			}
		},
	});
	
	return AvTransportView;
});
