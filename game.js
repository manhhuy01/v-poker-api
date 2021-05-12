const Cryptr = require('cryptr');
const cryptr = new Cryptr('manhhuy-v-poker-keys');

const data = {
  dealer: undefined,
  players: []
  
}

const setDealer = () => {
  if(!data.players.length){
    console.log('game.setDealer: không có players')
    return 
  }
  data.dealer = data.players[0];
}

const addPlayer = ({ userName }) => {
  // let userStr = cryptr.decrypt(token);
  if(!userName) {
    console.log('game.addPlayer: userName error')
    return;
  }
  // const userName = userStr.split('|')[0]
  if(!data.players.includes(userName)){
    data.players.push(userName);
  }
  setDealer();
}

const getRoomInfo = () => {
  return data;
}

module.exports = {
  addPlayer,
  setDealer,
  getRoomInfo,
}