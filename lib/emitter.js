var ctrl = require("./session_controller"),
      SessionController = ctrl.SessionController,
      redis = require('redis');

function Emitter () {
	
	this.pub = redis.createClient();

}

Emitter.prototype.publish = function(channel,message) {
	this.pub.publish(channel, message);
};

module.exports = Emitter;