const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
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
    try {
      const token = socket.handshake.query.token;
      const userName = (cryptr.decrypt(token) || '').split('|')[0]
      if(!userName){
        console.log('io on connection !userName')
        return;
      }
  
      socket.join(defaultRoom)
      socket.join(userName);
      game.addPlayer({ userName })
      const roomInfo = game.getRoomInfo();
  
      io.to(defaultRoom).emit('data', roomInfo)
    
      socket.on('disconnect', () => {
        // socket.rooms.size === 0
      });
    } catch (err){
      console.log('io connection err', err)
    }

  });
}

module.exports = {
  io,
  init,
}