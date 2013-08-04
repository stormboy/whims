WHIMS
=====
###(Web Hyperspace Interface via MQTT over Socket.IO)

This project provides a web interface a MQTT service.
A browser or other Socket.IO client communicates to a MQTT server over standard HTTP/1.1 protocols. 
The topic structure, messages and payload format are specified in the Meemplex specifications (to be announced). 

For now, JSON is used as payload format.
e.g.
    {
        "value" : 2398,
        "unit" : "W",
        "timestamp" : "2013-09-13T13:49:39.000Z"
    }

The intention is that this can provide a gateway for "things" (e.g. devices, browsers, servers) to communicate with other things over standard web protocols.
This services provides the ability to add a layer of security to things communicating with the MQTT server.


How to Run
----------
The server is implemented in Node.js and depends on a few external modules.

###Get Required Node.js Modules

    > npm install

###Configure

Update setting.js to point configure the port for the server to listen on and the connection of your MQTT server.

Configuration for the UI is in html/ui.json.  This specifies filters for determining which widgets to display on the screen as well as the set of sidgets to display.

In the future, the widgets displayed will be determined by a "hyperspace category" which will relate to an MQTT topic. 

###Run

Make sure an MQTT server is running on localhost, or where mqttHost is set in settings.json.

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
    
or if you are running on a different server or changed the serverPort configuration

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

Provide a straight WebSocket service so that clients who do not need the overhead of Socket.IO can connect. e.g. Arduinos

Arduino WebSocket client: https://github.com/krohling/ArduinoWebsocketClient

Or make a SocketIO client library for Arduino, based on SocketIO spec here: https://github.com/LearnBoost/socket.io-spec

Can wrap WS client (as is done here for Android https://github.com/koush/android-websockets/blob/master/src/com/codebutler/android_websockets/SocketIOClient.java)

Credits
-------

<a href="http://nodejs.org/">Node.js</a>

<a href="http://expressjs.com/">Express</a> web application framework for node.

<a href="https://github.com/adamvr/MQTT.js">mqttjs</a> MQTT module for Node.js.

<a href="http://socket.io/">Socket.IO</a> for both server and client side of web communications.

<a href="http://jquery.org/">jQuery</a> and <a href="http://jqueryui.com/">jQeury UI</a>

<a href="http://jquerymobile.com/">jQuery Mobile</a>

<a href="http://d3js.org/">Data-Driven Documents (D3)</a> for graphs.

<a href="http://isotope.metafizzy.co/">Isotope</a> for dynamic Javascript layout. This requires a <a href="http://metafizzy.co/#isotope-license">license</a> if you are to use it for commercial purposes. 

<a href="https://github.com/cubiq/iscroll">iScroll</a> for better scrolling with touch devices.

<a href="http://www.simplefly.nl/icons">Simplefly</a> for icons on the demonstration UI.
