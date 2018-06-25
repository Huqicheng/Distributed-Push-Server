redis = require('redis');

function SessionController (terminal,channel) {
	
	this.sub = redis.createClient();
	this.pub = redis.createClient();
	
	// information
	this.terminal = terminal;
	this.channel = channel;
}

SessionController.prototype.subscribe = function(socket, subCallback) {
	// recieve the message
	this.sub.on('message', function(channel, message) {
		socket.emit('message', message);
	});
	var current = this;
	this.sub.on('subscribe', function(channel, count) {
		subCallback(channel, count);
	});
	this.sub.subscribe(this.channel);
};

SessionController.prototype.rejoin = function(socket, message, subCallback) {
	this.sub.on('message', function(channel, message) {
		socket.emit("message", message);
	});
	
	this.sub.on('subscribe', function(channel, count) {
		subCallback(channel,count);
	});
	this.sub.subscribe(this.channel);
};

SessionController.prototype.unsubscribe = function() {
	this.sub.unsubscribe(this.channel);
};

SessionController.prototype.publish = function(message) {
	this.pub.publish(this.channel, message);
};

SessionController.prototype.destroyRedis = function() {
	if (this.sub !== null) this.sub.quit();
	if (this.pub !== null) this.pub.quit();
};



module.exports = SessionController;