Web Hyperspace Interface via MQTT over Socket.IO (WHIMS)
================================================

This project provides a web interface a MQTT service.
A browser or other Socket.IO client communicates to a MQTT server over standard HTTP/1.1 protocols. 
The topic structure, messages and payload format are specified in the Meemplex specifications (to be announced). 
S-Expressions are used as payload format.

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

Type the following in the root of the project

    > npm start

or

    > node whims.js

Then navigate to

    http://localhost:8000/
    
or if you are running on a different server or changed the serverPort configuration

    http://yourhost:yourport/

TODO
----

Initial content: Keep track of last values through so that last known values are stored, and provide a request-response mechanism on MQTT for getting initial content.

Lifecycle: pass on health of subscribed topics. Track via last-will-and-testament of MQTT and lifecycle messages.

Hyperspace: maintain a hierarchy of categories corresdonding to topics

Security: subscribe and publish to only those topics that are allowed to the client.

Web interface to
<ul>
 <li>register users</li>
 <li>share topics</li>
 <li>navigate categories and "things"</li>
</ul>

Provide a straight WebSocket service so that clients who do not need the overhead of Socket.IO can connect. e.g. Arduinos
Arduino WebSocket client: https://github.com/krohling/ArduinoWebsocketClient
Or make a SocketIO client library for Arduino, based on SocketIO spec here: https://github.com/LearnBoost/socket.io-spec
Can wrap WS client (as is done here for Android https://github.com/koush/android-websockets/blob/master/src/com/codebutler/android_websockets/SocketIOClient.java)

Credits
-------

<a href="http://nodejs.org/">Node.js</a>

<a href="https://github.com/adamvr/MQTT.js">mqttjs</a> MQTT module for Node.js.

<a href="https://github.com/yilun/node_mqtt_client">node_mqtt_client</a> MQTTClient module for Node.js (no longer used). 
<a href="http://socket.io/">Socket.IO</a> for both server and client side of web communications.

<a href="http://jquery.org/">jQuery</a> and <a href="http://jqueryui.com/">jQeury UI</a>

<a href="http://isotope.metafizzy.co/">Isotope</a> for dynamic Javascript layout. This requires a <a href="http://metafizzy.co/#isotope-license">license</a> if you are to use it for commercial purposes. 

<a href="http://www.simplefly.nl/icons">Simplefly</a> for icons on the demonstration UI.
