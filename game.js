const utils = require('./utils')

let data = {
  setting: {
    smallBlind: 1,
    // dealerAlsoPlayer: true,
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
  },
  table: {
    start: false,
    preFlop: '',
    flop: '',
    turn: '',
    river: '',
    finish: false,
    firstActionPlayer: undefined,
    pot: [{
      users: [],
      balance: 0,
    }],
    currentBet: 0,
    isShowDown: false,
  },
  cards: [
    '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
    '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
    '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
    '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
  ]

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

const setData = (d) => data = d;
const getData = () => data;

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

const updateSetting = ({ smallBlind }) => {
  data.setting.smallBlind = smallBlind;
  // data.setting.dealerAlsoPlayer = !!dealerAlsoPlayer
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

const findNextPosition = ({ position, isPlaying = false }) => {
  let foundPosition = undefined;
  let curPosition = +position;
  do {
    curPosition += 1;
    if (curPosition > Object.keys(data.position).length) {
      curPosition = 1;
    }
    if (+curPosition === +position) {
      foundPosition = curPosition;
    }
    if (
      !data.position[curPosition].isFold &&
      data.position[curPosition].isPlaying === isPlaying &&
      data.position[curPosition].user && data.position[curPosition].user.accBalance > 0
    ) {
      foundPosition = curPosition;
    }
  } while (!foundPosition)
  return foundPosition;
}

const isOnePlayer = () => {
  return Object.keys(data.position)
    .filter(p => data.position[p].user)
    .filter(p => data.position[p].isPlaying)
    .filter(p => !data.position[p].isFold)
    .length === 1
}

const isShowDown = () => {
  return Object.keys(data.position)
    .filter(p => data.position[p].user)
    .filter(p => data.position[p].isPlaying)
    .filter(p => !data.position[p].isFold)
    .filter(p => data.position[p].user.accBalance)
    .length < 2
}

const setDealerPosition = ({ userName }) => {
  let player = data.players.find(x => x.userName === userName)
  if (!player) {
    return { error: 'Không tìm thấy người này' }
  }

  let position = Object.keys(data.position).find(x => data.position[x]?.user?.userName === userName);
  if (!position) {
    return { error: 'Người này không trên bàn chơi' }

  }
  const totalPlayerOnTable = Object.keys(data.position).map(x => data.position[x].user).filter(Boolean).length;
  if (totalPlayerOnTable < 2) {
    return { error: 'Bàn chưa đủ người chơi' }
  }
  Object.keys(data.position).forEach((p) => data.position[p].namePos = '')
  data.position[position].namePos = 'D';

  return {}
}

const positionBet = ({ position, bet = 0 }) => {
  let newPos = { ...data.position[position] }
  newPos.betBalance = +Math.min(bet, newPos.user.accBalance);
  newPos.user.accBalance -= newPos.betBalance;
  return newPos
}

const startGame = () => {
  [1, 2, 3, 4, 5].forEach(() => {
    data.cards = utils.shuffle(data.cards);
  })

  //set playing
  Object.keys(data.position).forEach(p => {
    if (data.position[p].user?.accBalance > 0) {
      data.position[p].isPlaying = true;
    } else {
      data.position[p].isPlaying = false;
    }
  })

  const totalPlayers = Object.keys(data.position).map(p => data.position[p].user).filter(Boolean)
  if (totalPlayers.length < 2) {
    return { error: 'Chưa đủ người chơi' }

  }
  const playerCanPlay = totalPlayers.filter(x => x.accBalance);
  if (playerCanPlay.length < 2) {
    return { error: 'Người chơi chưa đủ tiền' }
  }

  const dealerPosition = Object.keys(data.position).find(p => data.position[p].namePos === 'D');
  if (!dealerPosition) {
    return { error: 'Không tìm thấy vị trí dealer' };
  }
  const smallBlindPosition = findNextPosition({ position: dealerPosition, isPlaying: true })
  if (smallBlindPosition === dealerPosition) {
    return { error: 'Không đủ người chơi' };
  }
  data.position[smallBlindPosition] = positionBet({ position: smallBlindPosition, bet: data.setting.smallBlind });
  const bigBlindPosition = findNextPosition({ position: smallBlindPosition, isPlaying: true });
  if (bigBlindPosition === smallBlindPosition) {
    return { error: 'không đủ người chơi big blind' };
  }
  data.position[bigBlindPosition] = positionBet({ position: bigBlindPosition, bet: data.setting.smallBlind * 2 });
  data.table.start = true;
  data.table.currentBet = data.setting.smallBlind * 2;

  return {};

}

const shuffleCards = () => {
  if (data.table.preFlop) {
    return { error: 'Ván đã bắt đầu, đừng sóc lọ nữa' }
  }
  data.cards = utils.shuffle(data.cards)
  return {}
}

const preFlop = () => {
  if (!data.table.start) {
    return { error: 'Ván chưa bắt đầu' }
  }

  if (data.table.finish) {
    return { error: 'Ván đã kết thúc' }
  }

  const positionPlayings = Object.keys(data.position).filter(p => data.position[p].user && data.position[p].isPlaying);
  if (positionPlayings.length < 2) {
    return { error: 'Không đủ người chơi' }
  }

  let dealerPosition = Object.keys(data.position).find(x => data.position[x].namePos === 'D');
  if (!dealerPosition) {
    return { error: 'Không tìm thấy dealer position' }
  }
  // chia bài cho user

  [1, 2].forEach(() => {
    positionPlayings.forEach(p => {
      let card = data.cards.splice(0, 1);
      data.position[p].cards = [...data.position[p].cards, card[0]];
    })
  })
  data.table.preFlop = true;

  // find first action player
  let position = dealerPosition
  let count = 0;
  do {
    let nextPosition = findNextPosition({ position, isPlaying: true });
    if (+data.position[nextPosition].betBalance < +data.position[position].betBalance && +data.position[nextPosition].user.accBalance != 0) {
      data.table.firstActionPlayer = +nextPosition;
    } else {
      position = nextPosition;
      count++;
    }
  } while (!data.table.firstActionPlayer && count < 20)

  if (!data.table.firstActionPlayer) {
    data.table.firstActionPlayer = +dealerPosition;
    [1, 2, 3].forEach(() => {
      data.table.firstActionPlayer = +findNextPosition({ position: data.table.firstActionPlayer, isPlaying: true })
    })
  }

  data.position[data.table.firstActionPlayer].isThinking = true;

  return {}
}


const setNextDealerAction = () => {
  const dealerPosition = Object.keys(data.position).find(p => data.position[p].namePos === 'D');
  if (!dealerPosition) {
    return { error: 'không tìm thấy dealer' }
  }
  const nextPosition = findNextPosition({ position: dealerPosition, isPlaying: true });
  if (nextPosition == dealerPosition) {
    return { error: 'Không tìm thấy vị trí action ' }
  }
  data.table.firstActionPlayer = +nextPosition;
  data.position[nextPosition].isThinking = true;
  return {}
}

const flop = () => {

  if (!data.table.start) {
    return { error: 'Ván chưa bắt đầu' }
  }

  if (data.table.finish) {
    return { error: 'Ván đã kết thúc' }
  }

  if (!data.table.preFlop) {
    return { error: 'chưa chia pre flop' }
  }


  const positionPlayings = Object.keys(data.position).filter(p => data.position[p].user && data.position[p].isPlaying);
  if (positionPlayings.length < 2) {
    return { error: 'Không đủ người chơi' }
  }

  if (isOnePlayer()) {
    return finish({ isShowDown: false });
  }

  if (isShowDown()) {
    data.table.isShowDown = true;
  }

  let burnCard = data.cards.splice(0, 1);
  data.table.Flop = [];
  [1, 2, 3].forEach(() => {
    let card = data.cards.splice(0, 1);
    data.table.flop = [...data.table.flop, card[0]]
  })
  data.cards.push(burnCard)

  const dealerPosition = Object.keys(data.position).find(p => data.position[p].namePos === 'D');
  if (!dealerPosition) {
    return { error: 'không tìm thấy dealer' }
  }
  if (data.table.isShowDown) {
    return processNextStepGame();
  }
  return setNextDealerAction();

}

const turn = () => {

  if (!data.table.start) {
    return { error: 'Ván chưa bắt đầu' }
  }

  if (data.table.finish) {
    return { error: 'Ván đã kết thúc' }
  }

  if (!data.table.preFlop) {
    return { error: 'chưa chia pre flop' }
  }

  if (!data.table.flop) {
    return { error: 'chưa chia flop' }
  }

  if (isOnePlayer()) {
    return finish({ isShowDown: false });
  }

  if (isShowDown()) {
    data.table.isShowDown = true;
  }

  let burnCard = data.cards.splice(0, 1);
  data.table.turn = data.cards.splice(0, 1)[0];
  data.cards.push(burnCard)

  if (data.table.isShowDown) {
    return processNextStepGame();
  }
  return setNextDealerAction();
}

const river = () => {

  if (!data.table.start) {
    return { error: 'Ván chưa bắt đầu' }
  }

  if (!data.table.preFlop) {
    return { error: 'chưa chia pre flop' }
  }

  if (!data.table.flop) {
    return { error: 'chưa chia flop' }
  }

  if (!data.table.turn) {
    return { error: 'chưa chia turn' }
  }

  if (data.table.finish) {
    return { error: 'Ván đã kết thúc' }
  }

  if (isOnePlayer()) {
    return finish({ isShowDown: false });
  }

  if (isShowDown()) {
    data.table.isShowDown = true;
  }

  let burnCard = data.cards.splice(0, 1);
  data.table.river = data.cards.splice(0, 1)[0];
  data.cards.push(burnCard)

  if (data.table.isShowDown) {
    return processNextStepGame();
  }
  return setNextDealerAction();
}

const finish = ({ isShowDown = true }) => {

  if (!data.table.start) {
    return { error: 'Ván chưa bắt đầu' }
  }

  if (!data.table.preFlop) {
    return { error: 'chưa chia pre flop' }
  }

  if (!data.table.flop) {
    return { error: 'chưa chia flop' }
  }

  if (!data.table.turn) {
    return { error: 'chưa chia turn' }
  }

  if (!data.table.river) {
    return { error: 'chưa chia river' }
  }

  // so bài chia tiền

  data.table.finish = true;
  data.table.isShowDown = isShowDown;

  return {}
}

const processNextStepGame = () => {
  const positionThinking = Object.keys(data.position).find(p => data.position[p].isThinking);
  if (!positionThinking && !data.table.isShowDown) {
    return { error: 'Không tìm thấy vị trí đang action' }
  }
  if (!data.table.isShowDown) {
    data.position[positionThinking].isThinking = false;
    const nextPosition = findNextPosition({ position: positionThinking, isPlaying: true });
    if (nextPosition != positionThinking && data.table.firstActionPlayer != nextPosition
    ) {
      data.position[nextPosition].isThinking = true;
      return {}
    }
  }

  // gom tiền trước vòng tiếp theo 

  data.table.currentBet = 0;
  //split pot
  Object.keys(data.position).forEach(p => {
    if (data.position[p].betBalance > 0) {
      data.table.pot[0].balance += data.position[p].betBalance;
      if (!data.table.pot[0].users.includes(data.position[p].user.userName)) {
        data.table.pot[0].users.push(data.position[p].user.userName)
      }
      data.position[p].betBalance = 0;
    }
  })

  if (data.table.preFlop && !data.table.flop) {
    return flop();
  }
  if (data.table.flop && !data.table.turn) {
    return turn();
  }
  if (data.table.turn && !data.table.river) {
    return river();
  }

  return finish({ isShowDown: true });
}

const playerBet = ({ position, betBalance }) => {
  betBalance = +betBalance;
  if (betBalance == 'NaN') {
    return { error: 'Số tiền bet phải là số' }
  }
  if (betBalance <= data.table.currentBet) {
    return { error: `Số tiền bet phải lớn hơn ${data.table.currentBet}`, }
  }
  if (betBalance % data.setting.smallBlind != 0) {
    return { error: `Số tiền bet phải là bội số của ${data.setting.smallBlind}` }
  }

  if (betBalance < 0) {
    return { error: 'Số tiền bet không được nhỏ hơn 0' }
  }

  if (betBalance == 0 && data.table.flop) {
    return { error: 'Số tiền bet không được bằng 0' }
  }

  if (betBalance > data.position[position].user.accBalance + data.position[position].betBalance) {
    return { error: 'Số tiền bet lớn hơn số tiền hiện có' }
  }
  data.position[position].user.accBalance = data.position[position].user.accBalance + data.position[position].betBalance - betBalance;
  data.position[position].betBalance = +betBalance;
  if (betBalance > data.table.currentBet) {
    data.table.firstActionPlayer = +position;
    data.table.currentBet = betBalance;
  }
  return processNextStepGame();

}

const playerCall = ({ position }) => {
  if(!data.table.preFlop){
    return { error: 'Action call không hợp lệ'}
  }
  if (data.table.currentBet == 0) {
    return { error: 'Action call không được chấp nhận khi không có ai bet' }
  }
  if (data.position[position].user.accBalance + data.position[position].betBalance < data.table.currentBet) {
    // all-in
    data.position[position].betBalance = data.position[position].user.accBalance;
    data.position[position].user.accBalance = 0;

  } else {
    data.position[position].user.accBalance = data.position[position].user.accBalance + data.position[position].betBalance - data.table.currentBet;
    data.position[position].betBalance = data.table.currentBet;
  }

  return processNextStepGame();

}

const playerCheck = ({ position }) => {
  if (data.position[position].betBalance < data.table.currentBet) {
    return { error: 'Không được check' }
  }
  return processNextStepGame();
}

const playerFold = ({ position }) => {
  if (data.position[position].user.accBalance === 0) {
    return { error: 'All in không được fold' }
  }
  data.position[position].isFold = true;
  return processNextStepGame();
}

const playerAction = ({ userName, type, betBalance = 0 }) => {

  if (!data.table.start) {
    return { error: 'ván chưa bắt đầu' }
  }
  if (data.table.finish) {
    return { error: 'Ván vừa kết thúc, chờ ván bắt đầu' }
  }

  let position = Object.keys(data.position).find(x => data.position[x].user?.userName === userName);
  if (!position) {
    return { error: 'Bạn đang không trên bàn' }
  }

  let dataPosition = data.position[position]

  if (!dataPosition.isThinking && !(data.table.start && !data.table.preFlop)) {
    return { error: 'Chưa tới lượt' }
  }

  if (!dataPosition.isPlaying) {
    return { error: 'Bạn không có trong lượt chơi' }
  }

  if (dataPosition.betBalance && !dataPosition.user.accBalance) {
    return { error: 'Bạn đã all in' }
  }

  switch (type) {
    case 'BET':
      return playerBet({ position, betBalance })
    case 'CHECK':
      return playerCheck({ position })
    case 'CALL':
      return playerCall({ position })
    case 'FOLD':
      return playerFold({ position })
    default:
      break;
  }
  return { error: 'Không có action nào đc diễn ra' }
}

module.exports = {
  setData,
  getData,
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
  startGame,
  shuffleCards,
  preFlop,
  flop,
  playerAction,
}