const db = require('./db')

const login = async (req, res) => {
  const {userName, password} = req.body;
  if(!userName || !password) {
    res.status(400)
    res.send('err')
  }
  let {error, data} = await db.getUser({userName, password});
  if(error){
    res.status(400);
    res.send(error)
  }else {
    res.send(data)
  }
}

const signup = async (req, res) => {
  // validate
  const {userName, password} = req.body;
  if(!userName || !password) {
    res.status(400)
    res.send('err')
  }
  let result = await db.createUser({userName, password});
  if(result.error){
    res.status(400)
    switch (result.error.code) {
      case '23505': 
        res.send('Username đã tồn tại')
      default: 
        res.send('lỗi qq gì rồi')
    }
  } else {
    res.send('success')
  }
}

module.exports = {
  login,
  signup
}