const PORT = process.env.PORT || 7000;

const express = require('express');
const app = express();

const auth = require('./auth')

const cors = require('cors');

app.use(express.json());
app.use(cors());


const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'DELETE']
    }
  });

app.get('/', (req, res) => res.send('hello'));
app.post('/signup', auth.signup)
app.post('/login', auth.login)


http.listen(PORT, () => console.log(`Listening on ${PORT}`));