const game = require('./game')

const cards = [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
]

describe('playerBet', () => {
  let players = [
    {
      userName: 'a',
      accBalance: 20,
    },
    {
      userName: 'b',
      accBalance: 20,
    },
    {
      userName: 'c',
      accBalance: 20,
    }
  ];

  test('bet 1 normal', ()=> {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 20,
          },
          betBalance: 4,
          isFold: false,
          namePos: 'D',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 20,
          },
          betBalance: 1,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: true,
          isPlaying: true,
        },
        3: {
          user: {
            userName: 'c',
            accBalance: 20,
          },
          betBalance: 2,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        4: {},
        5: {},
        6: {},
        7: {},
        8: {},
        9: {},
      },
      table: {
        start: true,
        preFlop: '',
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: 2,
        pot: 0,
        currentBet: 0,
      },
      cards,
    }

    game.setData(data);
    let rs = game.playerAction({ type: 'BET', userName: 'b', betBalance: 4 });
    expect(rs.error).toBe(undefined);

  })
  test('bet-all-in', ()=> {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 20,
          },
          betBalance: 20,
          isFold: false,
          namePos: 'D',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        2: {},
        3: {
          user: {
            userName: 'c',
            accBalance: 2,
          },
          betBalance: 8,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: true,
          isPlaying: true,
        },
        4: {},
        5: {},
        6: {},
        7: {},
        8: {},
        9: {},
      },
      table: {
        start: true,
        preFlop: true,
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: 2,
        pot: 0,
        currentBet: 0,
      },
      cards,
    }

    game.setData(data);
    let rs = game.playerAction({ type: 'BET', userName: 'c', betBalance: 10 });
    let newData = game.getData();
    expect(rs.error).toBe(undefined);
    expect(newData.position[1].isThinking).toBe(true);

  })

  test('bet-all-in 2', ()=> {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 58,
          },
          betBalance: 0,
          isFold: false,
          namePos: 'D',
          cards: ['8s', '9c'],
          isThinking: false,
          isPlaying: true,
        },
        2: {},
        3: {
          user: {
            userName: 'c',
            accBalance: 87,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: ['6h', '5d'],
          isThinking: true,
          isPlaying: true,
        },
        4: {},
        5: {},
        6: {},
        7: {},
        8: {},
        9: {},
      },
      table: {
        start: true,
        preFlop: true,
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: 2,
        pot: 0,
        currentBet: 0,
      },
      cards,
    }

    game.setData(data);
    let rs = game.playerAction({ type: 'BET', userName: 'c', betBalance: 87, isAllIn: true });
    let newData = game.getData();
    expect(newData.position[3].user.accBalance).toBe(0);

  })
})