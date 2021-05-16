const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');

const data = {
  setting: {
    smallBlind: 10,
    dealerAlsoPlayer: true,
  },
  dealer: undefined,
  players: [
    // userName
    // accBalance
  ],
  position: {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {},
    9: {},
  }

}

const POSITION = {
  user: undefined,
  betBalance: 0,
  isFold: false,
  namePos: '',
  cards: [],
  isThinking: false,
  isPlaying: false,
}

const authDealer = (req, res, next) => {
  if (data.dealer && req?.user?.userName === data.dealer) {
    req.user.isDealer = true;
    return next();
  }
  next();
}

const setDealer = () => {
  if (!data.players.length) {
    console.log('game.setDealer: không có players')
    return
  }
  data.dealer = data.players[0].userName;
}

const addPlayer = ({ userName }) => {
  // let userStr = cryptr.decrypt(token);
  if (!userName) {
    console.log('game.addPlayer: userName error')
    return;
  }
  // const userName = userStr.split('|')[0]
  if (!data.players.map(x => x.userName).includes(userName)) {
    data.players.push({
      userName,
      accBalance: 0,
    });
    // const emptyPosition = Object.keys(data.position).filter(p => !data.position[p].user)
    // data.position[emptyPosition[0]] = {
    //   ...POSITION,
    //   user: {
    //     userName,
    //     accBalance: 0,
    //   }
    // }
  }
  setDealer();
}

const getRoomInfo = () => {
  let newData = { ...data };
  Object.keys(data.position).forEach((pos) => {
    if (newData.position[pos].user) {
      let player = data.players.find(x => x.userName === newData.position[pos].user.userName);
      if (player) {
        newData.position[pos].user.accBalance = player.accBalance
      }
    }
  })
  return newData;
}

const updateSetting = ({ smallBlind, dealerAlsoPlayer }) => {
  data.setting.smallBlind = smallBlind;
  data.setting.dealerAlsoPlayer = !!dealerAlsoPlayer
}

const updateProfile = ({ userName, accBalance }) => {
  let player = data.players.find(x => x.userName === userName)
  if (!player) {
    console.log('update profile err no player')
  }
  player.accBalance = accBalance;

}

const getAllPlayers = () => data.players;

const joinTable = ({ userName, position }) => {
  let player = data.players.find(x => x.userName === userName)
  if (!player) return;
  if (data.position[position].user) {
    return { error: 'Chỗ này có người rồi' }
  }
  if (!data.position[position]?.user) {
    data.position[+position] = {
      ...POSITION,
      user: player,
    }
  }
  return {}
}

const removeFromTable = ({ userName }) => {
  let position = Object.keys(data.position).find(x => data.position[x]?.user?.userName === userName);
  if (!position) return { error: 'Không tim thấy ng này trên bàn' }
  if (data.position[position].isPlaying) {
    return { error: 'Đang chơi không remove đc' }
  }

  data.position[position] = {}
  return {}
}

const transferDealerRole = ({ userName }) => {
  let player = data.players.find(x => x.userName === userName)
  if (!player) {
    return { error: 'không tìm thấy người này' }
  }

  data.dealer = userName;
  return {}
}

const findNextPosition = (position) => {

}

const setDealerPosition = ({ userName }) => {
  let player = data.players.find(x => x.userName === userName)
  if (!player) {
    return { error: 'Không tìm thấy người này' }
  }

  let position = Object.keys(data.position).find(x => data.position[x]?.user?.userName === userName);
  if(!position){
    return { error: 'Người này không trên bàn chơi' }

  }
  const totalPlayerOnTable = Object.keys(data.position).map(x=>data.position[x].user).filter(Boolean).length;
  if(totalPlayerOnTable < 2){
    return { error: 'Bàn chưa đủ người chơi'}
  }
  Object.keys(data.position).forEach((p)=> data.position[p].namePos = '')
  data.position[position].namePos = 'D';

  return {}
}

module.exports = {
  authDealer,
  addPlayer,
  setDealer,
  getRoomInfo,
  updateSetting,
  updateProfile,
  getAllPlayers,
  joinTable,
  removeFromTable,
  transferDealerRole,
  setDealerPosition,
}