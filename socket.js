const game = require('./game')

let io

const defaultRoom = 'v-poker-room-1'

const init = (http) => {
  io = require('socket.io')(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'DELETE']
    }
  });

  io.on("connection", (socket) => {
    const userName = socket.handshake.query.userName;
    if(!userName){
      console.log('io on connection !userName')
      return;
    }

    socket.join(defaultRoom)
    socket.join(userName);
    game.addPlayer({ userName: socket.handshake.query.userName })
    const roomInfo = game.getRoomInfo();

    io.to(defaultRoom).emit('data', roomInfo)
  
    socket.on('disconnect', () => {
      // socket.rooms.size === 0
    });
  });
}

module.exports = {
  io,
  init,
}