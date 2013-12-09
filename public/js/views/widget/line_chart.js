define([ 'jquery', 
         'backbone', 
         'd3',
         'jade!templates/widgets/line_chart' ], 
function($, Backbone, d3, ChartTemplate) {
	
	var ChartView = Backbone.View.extend({

		initialize : function(options) {
			this.meemBus = options.meemBus;
			
			var self = this;
			
			this.render();
			this._initChart();
			
			// subscribe to incoming data updates
			this.meemBus.subscribe(this.model.path + "/" + this.model.inFacet, function(message) {
				self._acceptMessage(message);
			});
			
			// subscribe to initial request responses
			this.meemBus.subscribe(this.model.responsePath, function(message) {
				self._data = message;
				self._handleData(self._data);
			});

			// request data when connected
			this.meemBus.on("connected", function() {
				if (!self._data) {
					self._requestData();
				}
			});
			this.meemBus.on("disconnected", function() {
				// ???
			});
			
			// if already connected, request data
			if (this.meemBus.isConnected()) {
				self._requestData();
			}
		},
		
		model : {
			name: "Graph",
			unit: "Watts",
			path: "/house/meter/power",
			inFacet: "demand",
			responsePath: "/response/house/meter/power",
			queryPath: "/data/log",
			meemBus: null,
		},
		
		render: function () { 
			var self = this;
			var compiledTemplate = ChartTemplate(this.model);
			this.setElement($(compiledTemplate).get());
			
			// add a refresh function to the element
			this.el.refresh = function() {
				self.refresh();
			};
			
			return this;
		},
		
		// refresh line-chart axes and labels
		refresh: function() {
			/*
			var c = this.chartStuff;
			var svg = c.svg.transition();
			svg.select(".x.axis") 	// update the x axis
			    .duration(750)
			    .call(c.xAxis);
			svg.select(".y.axis") 	// update the y axis
			    .duration(750)
			    .call(c.yAxis);
			svg.select(".y.unit")	// update the unit label
			    .text(this.model.unit || "");
			 */
		},

		events: {
		},

		_acceptMessage: function(message) {
			try {
				var timestamp = message.timestamp;
				var value = message.value;
				
				// TODO unit conversion
				//value = UnitTools.convert(data.value, data.unit, this.unit);
				
				var format = d3.time.format.iso;
				var time = format.parse(timestamp).getTime();
				var val = [time, value];
				this._data.values[this._data.values.length] = val;
				this._handleData(this._data);
			}
			catch (e) {
				// problem
			}
		},
		
		_requestData: function() {
			var format = d3.time.format.iso;
			var time = d3.time.hour.offset(new Date(), -(this.model.hours || 1));	// start time is x hours ago

			// /data/log?/path=/house/meter/power/demand&from=2013-03-08T18:49:10.000Z => /response/12345"			
			var topic = this.model.queryPath + "?/path=" + this.model.path + "/" + this.model.inFacet;
			topic += "&from=" + format(time) + "&max=10000";
			var message = this.model.responsePath;
			console.log("--- requesting data: " + topic);
			this.meemBus.publish(topic, message);
		},
		
		_initChart: function() {
			var self = this;
			var c = {};
			this.chartStuff = c;
			c.margin = {top: 20, right: 20, bottom: 30, left: 50};
			c.width = 320 - c.margin.left - c.margin.right;
			c.height = 240 - c.margin.top - c.margin.bottom;
			  
			c.x = d3.time.scale()
			      .range([0, c.width]);
			  
			c.y = d3.scale.linear()
			      .range([c.height, 0]);
			  
			c.xAxis = d3.svg.axis()
			      .scale(c.x)
			      .orient("bottom")
			      .ticks(4);
			  
			c.yAxis = d3.svg.axis()
			      .scale(c.y)
			      .orient("left")
			      .ticks(5);
			  
			c.line = d3.svg.line()
			      .interpolate("basis") 
			      .x(function(d) { return c.x(d[0]); })
			      .y(function(d) { return c.y(d[1]); });
			  
			c.svg = d3.select(this.$el.find(".chart")[0]).append("svg")
				.attr("width", c.width + c.margin.left + c.margin.right)
				.attr("height", c.height + c.margin.top + c.margin.bottom)
				.append("g")
				.attr("transform", "translate(" + c.margin.left + "," + c.margin.top + ")");
		},
		
		_data: null,
		
		_chartDrawn: false,
		
		_handleData: function(data) {
			var c = this.chartStuff;
			// pre-processing
			data.values.forEach(function(d) {
				d[0] = new Date(d[0]);
				d[1] = +d[1];			// make value a number
			});
			c.x.domain(d3.extent(data.values, function(d) { return d[0]; }));
			c.y.domain(d3.extent(data.values, function(d) { return d[1]; }));

			if (this._chartDrawn) {
				var svg = c.svg.transition();
		        svg.select(".line")   // change the line
		            .duration(750)
		            .attr("d", c.line(data.values));
		        svg.select(".x.axis") // change the x axis
		            .duration(750)
		            .call(c.xAxis);
		        svg.select(".y.axis") // change the y axis
		            .duration(750)
		            .call(c.yAxis);				
			}
			else {
				c.svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + c.height + ")")
				   .call(c.xAxis);
	
				c.svg.append("g").attr("class", "y axis")
				   .call(c.yAxis)
				   .append("text")
				   .attr("class", "y unit")
				   .attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end")
				   .text(this.model.unit || "");
	
				c.svg.append("path").datum(data.values).attr("class", "line").attr("d", c.line);

				this._chartDrawn = true;
			}
		},
		
	});
	
	return ChartView;
});