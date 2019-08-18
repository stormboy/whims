WHIMS
=====
### (Web Hyperspace Interface via MQTT over SockJS)

This project provides a web interface to a MQTT service.  It also supplies a module for creating "things" that interact over MQTT.

A browser or other SockJS client communicates to a MQTT server over standard HTTP/1.1 protocols. 
The topic structure, messages and payload format are specified in the Meemplex specifications (to be announced). 

At this point in time, JSON is used as payload format.
e.g.
    {
        "value" : 2398,
        "unit" : "W",
        "timestamp" : "2013-09-13T13:49:39.000Z"
    }

The intention is that this can provide a gateway for "things" (e.g. devices, browsers, servers) to communicate with other things over standard web protocols.

This service provides the ability to add a layer of security to things communicating with the MQTT server.

How to Run
----------
The server is implemented in Node.js and depends on a few external modules.

###Get Required Node.js Modules

    > npm install

###Configure

Update setting.js to point configure the port for the web server to listen on and the connection details of your MQTT server.

Configuration for the UI is in html/ui.json.  This specifies filters for determining which widgets to display on the screen as well as the set of widgets to display.

In the future, the widgets displayed will be determined by a "hyperspace category" which will relate to an MQTT topic.

###Optimise

To compile the client-side javascript app.

	> ./node_modules/requirejs/bin/r.js -o app.build.js

This will optimise and bundle client files in the public-build folder.  If you run the app with NODE_ENV=production file will be served from this directory.

###Run

Make sure an MQTT server is running on the host and port specified in settings.json.

To run, type the following in the root of the project

    > npm start

or

    > node whims.js
    
or

	> nodemon

to automatically re-load the server after code changes, or

	> forevever start whims.js

to start the server on the background.
 
Then navigate to

    http://localhost:8000/
    
or if you are running on a different server or changed the "port" value in the configuration

    http://yourhost:yourport/

TODO
----

Lifecycle: pass on health of subscribed topics. Track via last-will-and-testament of MQTT and lifecycle messages.

Hyperspace: maintain a hierarchy of categories corresdonding to topics

Security: subscribe and publish to only those topics that are allowed to the client.

Storage: for editing and storing widgets for devices of interest.
 
Web interface to
<ul>
 <li>navigate categories and "things"</li>
 <li>configure UI to "things"</li>
 <li>register users</li>
 <li>share topics</li>
</ul>

Instructions for setting up nginx reverse proxy allowing for websockets.

Credits
-------

<a href="http://nodejs.org/">Node.js</a>

<a href="http://expressjs.com/">Express</a> web application framework for node.

<a href="https://github.com/adamvr/MQTT.js/">mqtt.js</a> MQTT module for Node.js.

<a href="https://github.com/sockjs">SockJS</a> for both server and client side of web communications.

<a href="http://socket.io/">Socket.IO</a> for both server and client side of web communications (previous versions of Whims).

<a href="http://requirejs.org/">RequireJS</a> for asynchronous module loading and for compiling/optimising (using r.js).

<a href="http://jquery.org/">jQuery</a>

<a href="http://http://backbonejs.org/">Backbone</a> and <a href="http://underscorejs.org/">Underscore</a>

<a href="https://github.com/hij1nx/EventEmitter2">EventEmitter2</a> replicating Node's EventEmitter behaviour on client-side.

<a href="http://d3js.org/">Data-Driven Documents (D3)</a> for graphs.

<a href="https://github.com/gentooboontoo/js-quantities/">JS-quantities</a> SI unit conversion.

<a href="http://isotope.metafizzy.co/">Isotope</a> for dynamic Javascript layout. This requires a <a href="http://metafizzy.co/#isotope-license">license</a> if you are to use it for commercial purposes. 

<a href="https://github.com/cubiq/iscroll">iScroll</a> for better scrolling with touch devices (no bounce-backs).

<a href="https://github.com/visionmedia/jade">Jade</a> for server page generation and client-widget templating.

<a href="http://www.simplefly.nl/icons">Simplefly</a> for icons on the demonstration UI.
