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
		console.log(data);
		let msg = JSON.parse(data);
		if (msg.type == "join") {
			socket.sessionController = new SessionController(msg.user,msg.channel);
      		socket.sessionController.subscribe(socket, function(channel, count){
      			var joinMessage = JSON.stringify({type: 'control', user: socket.sessionController.user, msg: ' joined the channel' });
				socket.sessionController.publish(joinMessage);
      		});
      		return;
		}

		if (msg.type == "message") {
      		if (socket.sessionController == null) {
        		// implicit login - socket can be timed out or disconnected
        		socket.sessionController = new SessionController(msg.user,msg.channel);
        		socket.sessionController.rejoin(socket, msg, function(channel, count){
        			var rejoin = JSON.stringify({type: 'control', user: socket.sessionController.user, msg: ' rejoined the channel' });
					socket.sessionController.publish(rejoin);
					var reply = JSON.stringify({type: 'message', user: msg.user, msg: msg.msg });
					socket.sessionController.publish(reply);
        		});
      		} else {
        		var reply = JSON.stringify({type: 'message', user: msg.user, msg: msg.msg });
        		socket.sessionController.publish(reply);
      		}
      		return;
		}
	}

	onConnected(socket) {
		console.log(socket.id);
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