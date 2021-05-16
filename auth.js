const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');
const db = require('./db')

const login = async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    res.status(400)
    res.send('err')
  }
  let { error, data } = await db.getUser({ userName, password });
  if (error) {
    res.status(404);
    res.send({ error })
  } else {
    res.send({ token: data.token })
  }
}

const register = async (req, res) => {
  // validate
  const { userName, password } = req.body;
  if (!userName || !password) {
    res.status(400)
    res.send('err')
  }
  let result = await db.createUser({ userName, password });
  if (result.error) {
    res.status(400)
    switch (result.error.code) {
      case '23505':
        res.send(JSON.stringify({ error: 'Username đã tồn tại' }))
        break;
      default:
        res.send(JSON.stringify({ error: 'lỗi qq gì rồi ' }))
    }
  } else {
    res.send({ token: result.token })
  }
}

const decryptToken = async (req, res, next) => {
  // validate
  let { token } = req.cookies;
  if (!token) {
    token = req.query.token;
  }
  if (!token) return next()
  
  try {
    let userStr = cryptr.decrypt(token);
    if(!userStr) next();
    req.user = {
      userName: userStr.split('|')[0]
    }
    next()
  } catch(err){
    console.log(err)
    next()
  }
  // console.log(token, encryptor.decrypt(token))
 

}

const getInfo = async (req, res) => {
  const { user } = req;
  if (!user) {
    res.status(400);
    res.send({ error: 'không tìm thấy' })
  } else {
    res.send({ userName: user.userName })
  }
}

module.exports = {
  login,
  register,
  decryptToken,
  getInfo
}