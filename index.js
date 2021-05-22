const PORT = process.env.PORT || 7000;

const express = require('express');
const cookieParser = require('cookie-parser')

const app = express();

const auth = require('./auth')
const game = require('./game')

const cors = require('cors');

var whitelist = ['http://localhost:3000', 'https://v-poker.vercel.app']
var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}


app.use(cookieParser())
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))

const socket = require('./socket');
const http = require('http').createServer(app);
socket.init(http);

app.get('/', (req, res) => res.send('hello'));
app.post('/register', auth.register)
app.post('/login', auth.login)
app.get('/acc/info', auth.decryptToken, auth.getInfo)
app.post('/game/updateSetting', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  if (!req.body.smallBlind) {
    return res.sendStatus(400)
  }
  game.updateSetting(req.body)
  socket.updateGame(req.user.userName);
  return res.send({})
})

app.post('/game/updateProfile', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  if (!req.body.userName || +req.body.accBalance == 'NaN' || req.body.accBalance < 0) {
    return res.sendStatus(400)
  }
  game.updateProfile(req.body)
  socket.updateAllPlayer();

  return res.send({})
})

app.post('/game/joinTable', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  if (!req.body.userName || +req.body.position == 'NaN' || req.body.position < 0) {
    return res.sendStatus(400)
  }
  let rs = game.joinTable(req.body)
  socket.updateAllPlayer();

  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/removeFromTable', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  if (!req.body.userName) {
    return res.sendStatus(400)
  }
  let rs = game.removeFromTable(req.body)
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/transferDealerRole', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  if (!req.body.userName) {
    return res.sendStatus(400)
  }
  let rs = game.transferDealerRole(req.body)
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/setDealerPosition', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  if (!req.body.userName) {
    return res.sendStatus(400)
  }
  let rs = game.setDealerPosition(req.body)
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/start', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  let rs = game.startGame()
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/shuffleCards', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  let rs = game.shuffleCards()
  // tạm thời xào bài chưa cần thông báo chơi players
  // socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/preFlop', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  let rs = game.preFlop()
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/game/flop', auth.decryptToken, game.authDealer, (req, res) => {
  if (!req?.user?.isDealer) {
    return res.sendStatus(401);
  }
  let rs = game.flop()
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})

app.post('/player/action', auth.decryptToken, (req, res) => {
  if (!req?.user) {
    return res.sendStatus(401);
  }
  let rs = game.playerAction({ ...req.body, userName: req.user.userName })
  socket.updateAllPlayer();
  if (rs.error) res.status(400)
  return res.send({ error: rs.error })
})


http.listen(PORT, () => console.log(`Listening on ${PORT}`));