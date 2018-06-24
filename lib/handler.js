var cluster = require('cluster');

class BasicHandler{
  constructor() {
    
  }

  onMessageRecieved(socket, data) {
    console.log('Socket ' + socket.id +' send message:'+ data+', Worker ' + cluster.worker.id);
    return;
  }

  onDisconnected(socket) {
    console.log('Socket ' + socket.id +' disconnected. Worker ' + cluster.worker.id);
    return;
  }

  onConnected(socket) {
    console.log('Socket ' + socket.id +' connected. Worker ' + cluster.worker.id);
    return;
  }


}





module.exports = BasicHandler;







