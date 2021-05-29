const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const game = require('./game')
const chat = require('./chat')
const db = require('./db')
let io

const defaultRoom = 'v-poker-room-1'

const updateGame = (userName) => {
  let data = game.getRoomInfo(userName)
  io.to(userName).emit('data', data);
}

const updateAllPlayer = () => {
  let players = game.getAllPlayers();
  players.forEach((player) => {
    let data = game.getRoomInfo(player.userName)
    io.to(player.userName).emit('data', data);
  })
}

const notifyToAllPlayer = ({ action }) => {
  io.to(defaultRoom).emit('notification', action)
}

const init = (http) => {
  io = require('socket.io')(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'DELETE']
    }
  });

  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.query.token;
      const userName = (cryptr.decrypt(token) || '').split('|')[0]
      if (!userName) {
        return;
      }
      let info = await db.getInfoAccount({ userName })
      socket.join(defaultRoom)
      socket.join(userName);
      game.addPlayer({ userName, balance: info?.data?.balance })
      updateAllPlayer();
      io.to(defaultRoom).emit('chat', chat.getData());

      socket.on('sendMessage', ({ message, userName }) => {
        chat.setMessage({message, userName})
        socket.broadcast.to(defaultRoom).emit('chat', chat.getData());
      })

      socket.on('disconnect', async () => {
        const ids = await io.in(defaultRoom).allSockets();
        if (!ids.size) {
          game.removeDealer()
        }
      });
    } catch (err) {
      console.log('io connection err', err)
    }

  });
}


module.exports = {
  io,
  init,
  updateGame,
  updateAllPlayer,
  notifyToAllPlayer,
}