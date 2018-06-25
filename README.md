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
```js
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
The example of a server using pub/sub is in /example/index.js <br>
The test front-end file is /example/index.html
#### Install
```
npm install https://github.com/Huqicheng/Distributed-Push-Server.git
```
#### Run the server
```
node /example/node.js
```
#### Test
Open the index.html file in your browser.
