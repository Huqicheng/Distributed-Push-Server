// https://blog.csdn.net/wizard_hu/article/details/50512847

// https://peihsinsu.gitbooks.io/node-js-500-samples/content/mdfiles/socket.io.html

// https://vsaravagi.wordpress.com/2015/08/24/using-sticky-session-with-socket-io-and-nodejs/

// http://maxprog.net.pl/wp-content/uploads/2017/05/Screen-Shot-2017-05-03-at-19.36.46.png

// https://my.oschina.net/u/750011/blog/332846
/*
*   1. npm install socket.io
#   2. npm install sticky-session
*   3. node server.js
*   
*/



var cluster = require('cluster'),
    os = require('os');

var sticky = require('sticky-session');

var url = require('url')

var app = require('http').createServer(), 
    io = require('socket.io').listen(app), 
    fs = require('fs');

var BasicHandler = require('./handler.js');

class Server{
  constructor() {
    this.app = require('http').createServer();
    this.io = require('socket.io').listen(this.app);
  }

  
  config(handler) {
    if (handler == null || handler == undefined) {
      handler = new BasicHandler();
    }
    this.io.sockets.on('connection', function (socket) { // the actual socket callback
      handler.onConnected(socket);

      socket.on('message', function (data) { // receiving chat messages
        handler.onMessageRecieved(socket, data);
      });

      socket.on('disconnect', function() { // disconnect from a socket - might happen quite frequently depending on network quality
        handler.onDisconnected(socket);
      });
    });


  }

  setHttpHandler(handler) {
    this.app = require('http').createServer(handler);
  }

  run(options, port) {
    this.io.set('heartbeat timeout', 10000); 
    this.io.set('heartbeat interval', 40000);
    // using sticky to ensure that the connection from the same ip will be connected to the same worker
    // Default: the worker number will be the number of cores of your cpu
    if (!sticky.listen(this.app, port, options)){
        // master
        this.app.once("listening", function() {
        console.log('server started on 8000 port.');
      });

      if(cluster.isMaster){
        console.log("Master Server started on port " + port)
      }
    }else{
      console.log("Worker " + cluster.worker.id + "is working" );
    }
  }

}


module.exports = Server;







