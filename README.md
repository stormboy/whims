MQTT Socket Gateway and Meem UI
===============================

This project provides a web interface a MQTT service. 
A browser or other Socket.IO client communicates to a MQTT server over standard HTTP/1.1 protocols. 
The topic structure and payload are specified in the Meemplex specifications (to be announced). 
S-Expressions are used as payload format.

The intention is that this can provide a gateway for "things" (e.g. devices, browsers, servers) to communicate with other things over standard web protocols.
This services provides the ability to add a layer of security to things communicating with the MQTT server.


How to Run
----------
The server is implemented in Node.js and may be run with

###Get Required Node.js Modules

    > npm install socket.io
    > npm install connect
    > npm install biwascheme

###Configure
---------

Update setting.js to point configure the port for the server to listen on and the connection of your MQTT server.

Configuration for the UI is in html/ui.json.  This specifies filters for determining which widgets to display on the screen as well as the set of sidgets to display.

In the future, the widgets displayed will be determined by a "hyperspace category" which will relate to an MQTT topic. 

###Run

Type the following in the root of the project

    > node whims.js

Then navigate to

    http://yourhost:yourport/

TODO
----

Initial content: Keep track of last values through so that last known values are stored, and provide a request-response mechanism on MQTT for getting initial content.

Lifecycle: pass on health of subscribed topics. Track via last-will-and-testament of MQTT and lifecycle messages.

Hyperspace: maintain a hierarchy of categories corresdonding to topics

Security: subscribe and publish to only those topics that are allowed to the client.