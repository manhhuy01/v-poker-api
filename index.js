const PORT = process.env.PORT || 7000;

const express = require('express');
const cookieParser = require('cookie-parser')

const app = express();

const auth = require('./auth')

const cors = require('cors');


app.use(cookieParser())
app.use(express.json());
app.use(cors());

const socket = require('./socket');
const http = require('http').createServer(app);
socket.init(http);

app.get('/', (req, res) => res.send('hello'));
app.post('/register', auth.register)
app.post('/login', auth.login)
app.get('/acc/info', auth.decryptToken, auth.getInfo)





http.listen(PORT, () => console.log(`Listening on ${PORT}`));