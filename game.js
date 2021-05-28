const utils = require('./utils')
const db = require('./db')
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
      isHavePlayerAllIn: false,
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
  winBalance: 0,
  showCard: false,
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

const setDealer = (userName) => {
  if (!data.players.length) {
    console.log('game.setDealer: không có players')
    return
  }
  if (!data.dealer && userName) {
    data.dealer = userName;
    return;
  } 
  if(!data.dealer){
    data.dealer = data.players[0].userName;
    return;
  }
}

const removeDealer = () => {
  data.dealer = undefined;
}

const addPlayer = ({ userName, balance }) => {
  if (!userName) {
    console.log('game.addPlayer: userName error')
    return;
  }
  if (!data.players.map(x => x.userName).includes(userName)) {
    data.players.push({
      userName,
      accBalance: balance || 0,
    });
  }
  setDealer(userName);
}

const getRoomInfo = (userName) => {
  let newData = JSON.parse(JSON.stringify(data));
  delete newData.cards
  Object.keys(data.position).forEach((pos) => {
    if (newData.position[pos].user) {
      let player = data.players.find(x => x.userName === newData.position[pos].user.userName);
      if (player) {
        newData.position[pos].user.accBalance = player.accBalance
      }

      if (!newData.position[pos].showCard && newData.position[pos].user.userName !== userName && (!newData.table.isShowDown || newData.position[pos].isFold)) {
        newData.position[pos] = {
          ...newData.position[pos],
          cards: newData.position[pos].cards.length ? ['u', 'u'] : [],
        }
      }
    }
  })
  return newData;
}

const updateSetting = ({ smallBlind }) => {
  data.setting.smallBlind = smallBlind;
  // data.setting.dealerAlsoPlayer = !!dealerAlsoPlayer
}

const updateProfile = async ({ userName, accBalance }) => {
  let player = data.players.find(x => x.userName === userName)
  if (!player) {
    console.log('update profile err no player')
  }
  player.accBalance = accBalance;
  await db.updateBalance({ balance: accBalance, userName });
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

const findNextPosition = ({ position }) => {
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
      data.position[curPosition].isPlaying
      // && data.position[curPosition].user && data.position[curPosition].user.accBalance > 0
    ) {
      foundPosition = curPosition;
    }
  } while (!foundPosition)
  return foundPosition;
}

const findPreviousPosition = ({ position, isPlaying = true }) => {
  let foundPosition = undefined;
  let curPosition = +position;
  do {
    curPosition -= 1;
    if (curPosition == 0) {
      curPosition = Object.keys(data.position).length;
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
  if (data.table.start) {
    return { error: 'Ván đã bắt đầu không set dealer lại được' }
  }
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

  if (playerCanPlay < totalPlayers) {
    return { error: 'Có người trên bàn chưa có tiền' }
  }

  const dealerPosition = Object.keys(data.position).find(p => data.position[p].namePos === 'D');
  if (!dealerPosition) {
    return { error: 'Không tìm thấy vị trí dealer' };
  }
  const smallBlindPosition = findNextPosition({ position: dealerPosition })
  if (smallBlindPosition === dealerPosition) {
    return { error: 'Không đủ người chơi' };
  }
  data.position[smallBlindPosition] = positionBet({ position: smallBlindPosition, bet: data.setting.smallBlind });
  const bigBlindPosition = findNextPosition({ position: smallBlindPosition });
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
    let nextPosition = findNextPosition({ position });
    if (!data.position[nextPosition].isFold && +data.position[nextPosition].betBalance < +data.position[position].betBalance && +data.position[nextPosition].user.accBalance != 0) {
      data.table.firstActionPlayer = +nextPosition;
    } else {
      position = nextPosition;
      count++;
    }
  } while (!data.table.firstActionPlayer && count < 20)

  if (!data.table.firstActionPlayer) {
    data.table.firstActionPlayer = +dealerPosition;
    [1, 2, 3].forEach(() => {
      data.table.firstActionPlayer = +findNextPosition({ position: data.table.firstActionPlayer })
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

  let nextPosition = dealerPosition;
  let count = 0;
  let isFindNext = true;
  let isFound = false
  do {
    count++;
    nextPosition = findNextPosition({ position: nextPosition });
    if (nextPosition != dealerPosition && !data.position[nextPosition].isFold && data.position[nextPosition].user.accBalance != 0) {
      isFindNext = false;
      isFound = true;
    }
    // đã chạy đc 1 vòng
    if (dealerPosition == nextPosition) {
      isFindNext = false;
      isFound = false;
    }
    // loop forever
    if (count > 10) {
      isFindNext = false;
      isFound = false;
    }
  } while (isFindNext)
  if (isFound) {
    data.table.firstActionPlayer = +nextPosition;
    data.position[nextPosition].isThinking = true;
    return {}
  } else {
    return { error: 'Không tìm thấy vị trí action ' }
  }


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
  data.cards.push(...burnCard)

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
  data.cards.push(...burnCard)

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
  data.cards.push(...burnCard)

  if (data.table.isShowDown) {
    return processNextStepGame();
  }
  return setNextDealerAction();
}

const finish = ({ isShowDown = true }) => {

  if (!data.table.start && isShowDown) {
    return { error: 'Ván chưa bắt đầu' }
  }

  if (!data.table.preFlop && isShowDown) {
    return { error: 'chưa chia pre flop' }
  }

  if (!data.table.flop && isShowDown) {
    return { error: 'chưa chia flop' }
  }

  if (!data.table.turn && isShowDown) {
    return { error: 'chưa chia turn' }
  }

  if (!data.table.river && isShowDown) {
    return { error: 'chưa chia river' }
  }

  // so bài chia tiền
  if (isShowDown) {
    Object.keys(data.position).forEach(p => {
      if (data.position[p].cards?.length) {
        data.position[p].resultCard = utils.getHighestCards([...data.table.flop, data.table.turn, data.table.river, ...data.position[p].cards]);
      }
    })
  }


  data.table.pot.forEach(pot => {
    let positions = Object.keys(data.position).filter(p => pot.users.includes(data.position[p].user?.userName) && data.position[p].isPlaying && !data.position[p].isFold);
    let bestHands = [positions[0]];
    if (positions.length > 1) {
      positions.forEach(p => {
        if (p !== bestHands[0]) {
          let compare = utils.compare({
            handA: [...data.table.flop, data.table.turn, data.table.river, ...data.position[p].cards],
            handB: [...data.table.flop, data.table.turn, data.table.river, ...data.position[bestHands[0]].cards],
          })
          if (compare > 0) {
            bestHands = [p]
          } else if (compare == 0) {
            bestHands.push(p)
          }
        }
      })
    }
    let winBalance = Math.floor(pot.balance / bestHands.length);
    bestHands.forEach(p => {
      data.position[p].winBalance += winBalance;
    })
  })

  data.table.finish = true;
  data.table.isShowDown = isShowDown;
  data.table.pot = [
    {
      users: [],
      balance: 0,
      isHavePlayerAllIn: false,
    }
  ]

  return {}
}

const collectTablePot = () => {
  // gom tiền trước vòng tiếp theo 

  data.table.currentBet = 0;
  //split pot

  let betPositions = Object.keys(data.position).filter(p => data.position[p].isPlaying && data.position[p].betBalance > 0 && data.position[p].user);

  if (betPositions.length) {
    do {
      betPositions.sort((a, b) => data.position[a].betBalance - data.position[b].betBalance);
      let minBetBalance = data.position[betPositions[0]].betBalance;
      if (data.table.pot[data.table.pot.length - 1].isHavePlayerAllIn) {
        data.table.pot.push({
          users: [],
          balance: 0,
          isHavePlayerAllIn: false,
        })
      }
      let pot = data.table.pot[data.table.pot.length - 1];
      betPositions.forEach(s => {
        if (!data.position[s].isFold && !pot.users.includes(data.position[s].user.userName)) {
          pot.users.push(data.position[s].user.userName);
        }
        pot.balance += minBetBalance;
        data.position[s].betBalance -= minBetBalance;
        if (data.position[s].user.accBalance == 0 && data.position[s].betBalance == 0) {
          pot.isHavePlayerAllIn = true;
        }
      })
      betPositions = betPositions.filter(p => data.position[p].betBalance > 0);
    } while (betPositions.length)
  }

}

const processNextStepGame = () => {

  const positionThinking = Object.keys(data.position).find(p => data.position[p].isThinking);
  if (!positionThinking && !data.table.isShowDown) {
    return { error: 'Không tìm thấy vị trí đang action' }
  }
  if (!data.table.isShowDown) {
    data.position[positionThinking].isThinking = false;
    if (isOnePlayer()) {
      collectTablePot();
      return finish({ isShowDown: false });
    }
    let nextPosition = positionThinking;
    let count = 0;
    let isFindNext = true;
    let isFound = false
    do {
      count++;
      nextPosition = findNextPosition({ position: nextPosition });
      if (nextPosition != positionThinking && !data.position[nextPosition].isFold && data.position[nextPosition].user.accBalance != 0) {
        isFindNext = false;
        isFound = true;
      }
      // đã chạy đc 1 vòng
      if (data.table.firstActionPlayer == nextPosition) {
        isFindNext = false;
        isFound = false;
      }
      // loop forever
      if (count > 10) {
        isFindNext = false;
        isFound = false;
      }
    } while (isFindNext)
    if (isFound) {
      data.position[nextPosition].isThinking = true;
      return {}
    }
  }

  collectTablePot();

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

const playerBet = ({ position, betBalance, isAllIn = false }) => {
  if (!isAllIn) {
    betBalance = +betBalance;

    if (betBalance == 'NaN') {
      return { error: 'Số tiền bet phải là số' }
    }
    if (betBalance < data.table.currentBet) {
      return { error: `Số tiền bet phải lớn hơn ${data.table.currentBet}`, }
    }
    if (betBalance < data.setting.smallBlind * 2) {
      return { error: `Số tiền bet phải lớn hơn big blind ${data.setting.smallBlind}`, }
    }
    if (betBalance % data.setting.smallBlind != 0) {
      return { error: `Số tiền bet phải là bội số của ${data.setting.smallBlind}` }
    }
    if (betBalance == 0 && data.table.flop) {
      return { error: 'Số tiền bet không được bằng 0' }
    }
  }
  if (isAllIn) {
    betBalance = data.position[position].user.accBalance + data.position[position].betBalance;
  }

  if (betBalance <= 0) {
    return { error: 'Số tiền bet không nhỏ hơn hoặc bằng 0' }
  }

  if (betBalance > data.position[position].user.accBalance + data.position[position].betBalance) {
    return { error: 'Số tiền bet lớn hơn số tiền hiện có' }
  }
  data.position[position].user.accBalance = data.position[position].user.accBalance + data.position[position].betBalance - betBalance;
  data.position[position].betBalance = +betBalance;
  if (betBalance > data.table.currentBet) {
    if (data.table.preFlop) {
      data.table.firstActionPlayer = +position;
    }
    data.table.currentBet = betBalance;
  }
  if (data.table.preFlop) {
    return processNextStepGame();
  }
  return {}

}

const playerCall = ({ position }) => {
  if (!data.table.preFlop) {
    return { error: 'Action call không hợp lệ' }
  }
  if (data.table.currentBet == 0) {
    return { error: 'Action call không được chấp nhận khi không có ai bet' }
  }
  if (data.position[position].user.accBalance + data.position[position].betBalance < data.table.currentBet) {
    // all-in
    data.position[position].betBalance = data.position[position].user.accBalance + data.position[position].betBalance;
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

const playerShowCard = ({ position }) => {
  if(!data.table.finish){
    return { error: 'Ván chưa kết thúc'}
  }
  if(data.position[position].isFold){
    return { error: 'Bạn đã bỏ bài'}
  }
  data.position[position].showCard = true;
  return {}
}

const playerAction = ({ userName, type, betBalance = 0, isAllIn = false }) => {

  if (!data.table.start) {
    return { error: 'ván chưa bắt đầu' }
  }
  if (data.table.finish && type != 'SHOW') {
    return { error: 'Ván vừa kết thúc, chờ ván bắt đầu' }
  }

  let position = Object.keys(data.position).find(x => data.position[x].user?.userName === userName);
  if (!position) {
    return { error: 'Bạn đang không trên bàn' }
  }

  let dataPosition = data.position[position]

  if (!data.table.finish && !dataPosition.isThinking && !(data.table.start && !data.table.preFlop)) {
    return { error: 'Chưa tới lượt' }
  }

  if (!dataPosition.isPlaying) {
    return { error: 'Bạn không có trong lượt chơi' }
  }

  if (data.table.preFlop && dataPosition.betBalance && !dataPosition.user.accBalance) {
    return { error: 'Bạn đã all in' }
  }

  switch (type) {
    case 'BET':
      return playerBet({ position, betBalance, isAllIn })
    case 'CHECK':
      return playerCheck({ position })
    case 'CALL':
      return playerCall({ position })
    case 'FOLD':
      return playerFold({ position })
    case 'SHOW':
      return playerShowCard({ position })
    default:
      break;
  }
  return { error: 'Không có action nào đc diễn ra' }
}

const reset = async () => {

  let dealerPosition = Object.keys(data.position).find(p => data.position[p].namePos == 'D');
  if (dealerPosition) {
    const nextDealerPosition = findNextPosition({ position: dealerPosition });
    data.position[dealerPosition].namePos = ''
    data.position[nextDealerPosition].namePos = 'D'
  }
  Object.keys(data.position).forEach(p => {
    if (data.position[p].user) {
      data.position[p].user.accBalance += ((data.position[p].winBalance || 0) + (data.position[p].betBalance || 0));
      db.updateBalance({ userName: data.position[p].user.userName, balance: data.position[p].user.accBalance })
      let player = data.players.find(player => player.userName === data.position[p].user.userName);
      if (player) {
        player.accBalance = data.position[p].user.accBalance;
      }
      data.position[p].winBalance = 0;
    }
    if (data.position[p].cards?.length) {
      data.cards.push(...data.position[p].cards)
      data.position[p].cards = []
    }
    data.position[p] = {
      ...POSITION,
      user: data.position[p].user,
      namePos: data.position[p].namePos,
    }
  })
  if (data.table.flop) {
    data.cards.push(...data.table.flop);
  }
  if (data.table.turn) {
    data.cards.push(data.table.turn)
  }
  if (data.table.river) {
    data.cards.push(data.table.river)
  }
  data.table = {
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
  }
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
  playerAction,
  reset,
  removeDealer,
}