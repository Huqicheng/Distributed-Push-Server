# Distributed Push Server

## Requirements
```
socket.io 
sticky-session
cluster
redis
```
## Components
#### 1. BasicHandler
"BasicHandler" is the base class of message handlers, it provides onConnected(socket), onDisconnected(socket), onMessageRecieved(socket, data) methods. <br>

An example of definition of a customized message handler.
```
// customize your own Message Handler
class MyHandler extends BasicHandler {
	onMessageRecieved(socket, data) {
		let msg = data;
		if (msg.type == "login") {
			socket.broadcast.emit('someone_connected', {'id' : data.socket_id})
		}
	}

	onConnected(socket) {
		socket.emit('connected', {});
	}
}
```

#### 2. Server
"Server" is the encapsulation of a socket server based on socket-io.
``` js
// options of the server, the same as the options of sticky-session.
options = {
	workers : 2
}

// create the server
server_ = new Server();

// register events
server_.config(new RedisHandler());

// bind the server to port 8000 and run it using the defined options
server_.run(options, 8000)
```

#### 3. SessionController
"SessionController" is provided for Reids Pub/Sub commands.


## How to use it
```js
// some components of this tool
var Server = require("../").Server;
var BasicHandler = require("../").BasicHandler;
var SessionController = require("../").SessionController;

// customize your own Message Handler
class MyHandler extends BasicHandler {
	onMessageRecieved(socket, data) {
		let msg = data;
		if (msg.type == "login") {
			socket.broadcast.emit('someone_connected', {'id' : data.socket_id})
		}
	}

	onConnected(socket) {
		socket.emit('connected', {});
	}
}

// Another Handler implemented with Pub/Sub of Redis
class RedisHandler extends BasicHandler {
	onMessageRecieved(socket, data) {
		let msg = data;
		if (msg.type == "join") {
			socket.sessionController = new SessionController(msg.user,msg.channel);
      			socket.sessionController.subscribe(socket);
      			return;
		}

		if (msg.type == "chat") {
      			if (socket.sessionController == null) {
        			// implicit login - socket can be timed out or disconnected
        			socket.sessionController = new SessionController(msg.user,msg.channel);
        			socket.sessionController.rejoin(socket, msg);
      			} else {
        			var reply = JSON.stringify({type: 'chat', user: msg.user, msg: msg.msg });
        			socket.sessionController.publish(reply);
      			}
      			return;
		}
	}

	onConnected(socket) {
		
	}

	onDisconnected(socket) {
		if (socket.sessionController == null) return;
      		socket.sessionController.unsubscribe();
      		var leaveMessage = JSON.stringify({type: 'control', user: socket.sessionController.user, msg: ' left the channel' });
      		socket.sessionController.publish(leaveMessage);
      		socket.sessionController.destroyRedis();
	}
}


// options of the server
options = {
	workers : 2
}

// create the server
server_ = new Server();

// register events
server_.config(new RedisHandler());

server_.run(options, 8000)
```
