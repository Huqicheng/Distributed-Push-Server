var Server = require("../").Server;
var BasicHandler = require("../").BasicHandler;
var SessionController = require("../").SessionController;

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



options = {
	workers : 2
}


server_ = new Server();
// register events
server_.config(new RedisHandler());

server_.run(options, 8000)