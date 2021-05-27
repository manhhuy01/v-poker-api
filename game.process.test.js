const game = require('./game')
const db = require('./db')

jest.mock('./db');
db.updateBalance.mockResolvedValue({})

const cards = [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
]

describe('game process', () => {
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

  test('process normal', () => {

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
          betBalance: 0,
          isFold: false,
          namePos: 'D',
          cards: [],
          isThinking: false,
          isPlaying: false,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 20,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: false,
        },
        3: {
          user: {
            userName: 'c',
            accBalance: 20,
          },
          betBalance: 0,
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
        start: false,
        preFlop: '',
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: 2,
        pot: [
          {
            users: [],
            balance: 0,
          }
        ],
        currentBet: 0,
      },
      cards,
    }

    game.setData(data);
    game.startGame();
    game.playerAction({ type: 'BET', userName: 'a', betBalance: 4 });

    game.preFlop();
    let newData = game.getData();
    expect(newData.position[2].isThinking).toBe(true);
    expect(newData.position[1].cards.length).toBe(2);
    expect(newData.position[2].cards.length).toBe(2);
    expect(newData.position[3].cards.length).toBe(2);

    game.playerAction({ type: 'CALL', userName: 'b' })
    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(false);
    expect(newData.position[2].user.accBalance).toBe(16);
    expect(newData.position[2].betBalance).toBe(4);
    expect(newData.position[3].isThinking).toBe(true);

    game.playerAction({ type: 'CALL', userName: 'c' })
    game.playerAction({ type: 'CHECK', userName: 'a' })
    newData = game.getData();
    expect(newData.position[3].isThinking).toBe(false);
    expect(newData.position[3].user.accBalance).toBe(16);
    expect(newData.position[3].betBalance).toBe(0);

    expect(newData.table.pot[0].balance).toBe(12);
    expect(!!newData.table.flop).toBe(true);
    expect(newData.position[2].isThinking).toBe(true);

    game.playerAction({ type: 'CHECK', userName: 'b' })
    newData = game.getData();
    expect(newData.position[3].isThinking).toBe(true);

    game.playerAction({ type: 'CHECK', userName: 'c' })
    newData = game.getData();
    expect(newData.position[1].isThinking).toBe(true);

    game.playerAction({ type: 'BET', userName: 'a', betBalance: '4' })
    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(true);
    expect(newData.table.firstActionPlayer).toBe(1);

    game.playerAction({ type: 'CALL', userName: 'b' })
    game.playerAction({ type: 'CALL', userName: 'c' })
    newData = game.getData();
    expect(!!newData.table.turn).toBe(true);
    expect(newData.position[2].isThinking).toBe(true);
    expect(newData.table.pot[0].balance).toBe(24);

    game.playerAction({ type: 'CHECK', userName: 'b' })
    game.playerAction({ type: 'BET', userName: 'c', betBalance: '12' })
    newData = game.getData();
    expect(newData.position[1].isThinking).toBe(true);
    expect(newData.table.firstActionPlayer).toBe(3);

    game.playerAction({ type: 'CALL', userName: 'a' })
    game.playerAction({ type: 'FOLD', userName: 'b' })

    newData = game.getData();
    expect(!!newData.table.river).toBe(true);
    expect(newData.position[3].isThinking).toBe(false);
    expect(newData.table.firstActionPlayer).toBe(3);
    expect(newData.table.pot[0].balance).toBe(0);


    expect(!!newData.table.finish).toBe(true);
    expect(newData.table.flop.concat([newData.table.turn, newData.table.river]).length).toBe(5);
  })

  test('process normal 2', () => {

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
          betBalance: 0,
          isFold: false,
          namePos: 'D',
          cards: [],
          isThinking: false,
          isPlaying: false,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 20,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: false,
        },
        3: {
          user: {
            userName: 'c',
            accBalance: 20,
          },
          betBalance: 0,
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
        start: false,
        preFlop: '',
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: undefined,
        pot: [
          {
            users: [],
            balance: 0,
          }
        ],
        currentBet: 0,
      },
      cards,
    }

    game.setData(data);
    game.startGame();
    let newData = game.getData();
    expect(newData.table.currentBet).toBe(2);
    game.preFlop();
    newData = game.getData();
    expect(newData.position[1].isThinking).toBe(true);

    let rs = game.playerAction({ type: 'CALL', userName: 'a' })
    newData = game.getData();
    expect(rs.error).toBe(undefined);
  })
  test('process all in 1', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 0,
          },
          betBalance: 12,
          isFold: false,
          namePos: 'D',
          cards: ['Jc', '6c'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 12,
          },
          betBalance: 0,
          isFold: true,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        3: {
          user: {
            userName: 'c',
            accBalance: 12,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: ['Jd', '8s'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
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
        flop: ['6s', '8h', 'Qh'],
        turn: 'Kh',
        river: 'Js',
        finish: false,
        firstActionPlayer: 1,
        pot: [
          {
            users: ['a', 'b', 'c'],
            balance: 24,
          },
        ],
        currentBet: 12,
      },
      cards,
    }

    game.setData(data);

    game.playerAction({ type: 'CALL', userName: 'c' })

    newData = game.getData();
    expect(newData.position[3].isThinking).toBe(false);
    expect(newData.table.pot[0].balance).toBe(0);
    expect(newData.position[3].winBalance).toBe(48);

    expect(!!newData.table.finish).toBe(true);
    expect(newData.table.flop.concat([newData.table.turn, newData.table.river]).length).toBe(5);
  })

  test('process all in 2', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 0,
          },
          betBalance: 12,
          isFold: false,
          namePos: 'D',
          cards: ['Jc', '6c'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 40,
          },
          betBalance: 0,
          isFold: true,
          namePos: '',
          cards: ['Kh', 'As'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
        },
        3: {},
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
        flop: ['6s', '8h', 'Qh'],
        turn: 'Kh',
        river: '',
        finish: false,
        firstActionPlayer: 1,
        pot: [
          {
            users: ['a', 'b',],
            balance: 24,
          },
        ],
        currentBet: 12,
      },
      cards,
    }

    game.setData(data);

    game.playerAction({ type: 'CALL', userName: 'b' })

    newData = game.getData();

    expect(!!newData.table.finish).toBe(true);
    expect(newData.table.flop.concat([newData.table.turn, newData.table.river]).length).toBe(5);
  })


  test('process fold 1', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 0,
          },
          betBalance: 12,
          isFold: false,
          namePos: 'D',
          cards: ['Jc', '6c'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 12,
          },
          betBalance: 0,
          isFold: true,
          namePos: '',
          cards: ['10h', '3s'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        3: {
          user: {
            userName: 'c',
            accBalance: 12,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: ['Jd', '8s'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
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
        flop: ['6s', '8h', 'Qh'],
        turn: 'Kh',
        river: 'Js',
        finish: false,
        firstActionPlayer: 1,
        pot: [
          {
            users: ['a', 'b', 'c'],
            balance: 24,
          },
        ],
        currentBet: 12,
      },
      cards: [
        '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
        '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
        '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
        '2c', '3c',
      ],
    }

    game.setData(data);

    game.playerAction({ type: 'FOLD', userName: 'c' })

    newData = game.getData();
    expect(newData.position[3].isThinking).toBe(false);
    expect(newData.table.pot[0].balance).toBe(0);
    expect(newData.position[1].winBalance).toBe(36);
    expect(newData.position[2].winBalance).toBe(0);
    expect(newData.position[3].winBalance).toBe(0);

    expect(!!newData.table.finish).toBe(true);
    expect(newData.table.flop.concat([newData.table.turn, newData.table.river]).length).toBe(5);

    game.reset();
    newData = game.getData();
    expect(newData.cards.length).toBe(52);
    expect(newData.position[1].cards.length).toBe(0);
    expect(newData.position[2].cards.length).toBe(0);
    expect(newData.position[3].cards.length).toBe(0);
  })

  test('process fold 2', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 12,
          },
          betBalance: 2,
          isFold: false,
          namePos: 'D',
          cards: ['Jc', '6c'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 12,
          },
          betBalance: 1,
          isFold: true,
          namePos: '',
          cards: ['10h', '3s'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
        },
        3: {
          user: {
            userName: 'c',
            accBalance: 12,
          },
          betBalance: 2,
          isFold: false,
          namePos: '',
          cards: ['Jd', '8s'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
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
        preFlop: false,
        flop: undefined,
        turn: undefined,
        river: undefined,
        finish: false,
        firstActionPlayer: 3,
        pot: [
          {
            users: [],
            balance: 0,
          },
        ],
        currentBet: 2,
      },
      cards: [
        '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
        '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
        '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
        '2c', '3c',
      ],
    }

    game.setData(data);

    game.playerAction({ type: 'FOLD', userName: 'b' })

    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(false);
    expect(newData.table.pot[0].balance).toBe(5);
    expect(newData.table.pot.length).toBe(1);

    expect(newData.table.pot.length).toBe(1);
  })

  test('process fold 3', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 12,
          },
          betBalance: 2,
          isFold: false,
          namePos: 'D',
          cards: ['Jc', '6c'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 12,
          },
          betBalance: 1,
          isFold: true,
          namePos: '',
          cards: ['10h', '3s'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
        },
        3: {},
        4: {},
        5: {},
        6: {},
        7: {},
        8: {},
        9: {},
      },
      table: {
        start: true,
        preFlop: false,
        flop: undefined,
        turn: undefined,
        river: undefined,
        finish: false,
        firstActionPlayer: 3,
        pot: [
          {
            users: [],
            balance: 0,
          },
        ],
        currentBet: 2,
        isShowDown: false,
      },
      cards: [
        '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
        '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
        '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
        '2c', '3c',
      ],
    }

    game.setData(data);

    game.playerAction({ type: 'FOLD', userName: 'b' })

    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(false);
    expect(newData.position[1].winBalance).toBe(3);
    expect(newData.table.finish).toBe(true);
    expect(newData.table.isShowDown).toBe(false);
  })

  test('process check 1', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players,
      position: {
        1: {
          user: {
            userName: 'a',
            accBalance: 12,
          },
          betBalance: 0,
          isFold: false,
          namePos: 'D',
          cards: ['Jc', '6c'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 12,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: ['3s', '5d'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
        },
        3: {},
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
        flop: ['4c', '5d', '9c'],
        turn: '9h',
        river: '4s',
        finish: false,
        firstActionPlayer: 1,
        pot: [
          {
            users: ['a', 'b'],
            balance: 4,
          },
        ],
        currentBet: 0,
        isShowDown: false,
      },
      cards: [
        '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
        '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
        '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
        '2c', '3c',
      ],
    }

    game.setData(data);

    game.playerAction({ type: 'CHECK', userName: 'b' })

    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(false);
    expect(newData.position[2].resultCard.name).toBe('twoPair');

    expect(newData.position[2].winBalance).toBe(4);

    expect(newData.table.finish).toBe(true);
    expect(newData.table.isShowDown).toBe(true);
  })


  test('process normal-full', () => {

    const data = {
      setting: {
        smallBlind: 1,
      },
      players: [
        {
          userName: '1',
          accBalance: 500
        },
        {
          userName: '2',
          accBalance: 200
        },
        {
          userName: '3',
          accBalance: 500
        },
        {
          userName: '4',
          accBalance: 500
        },
        {
          userName: '5',
          accBalance: 500
        },
        {
          userName: '6',
          accBalance: 500
        },
        {
          userName: '7',
          accBalance: 500
        },
        {
          userName: '8',
          accBalance: 500
        },
        {
          userName: '9',
          accBalance: 500
        }
      ],
      position: {
        1: {
          user: {
            userName: '1',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        2: {
          user: {
            userName: '2',
            accBalance: 200,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        3: {
          user: {
            userName: '3',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        4: {
          user: {
            userName: '4',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        5: {
          user: {
            userName: '5',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        6: {
          user: {
            userName: '6',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        7: {
          user: {
            userName: '7',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        8: {
          user: {
            userName: '8',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        9: {
          user: {
            userName: '9',
            accBalance: 500,
          },
          betBalance: 0,
          isFold: false,
          namePos: '',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
      },
      table: {
        start: false,
        preFlop: '',
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: undefined,
        pot: [
          {
            users: [],
            balance: 0,
          }
        ],
        currentBet: 0,
      },
      cards: [
        '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
        '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
        '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
        '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
      ],
    }
    let newData;
    game.setData(data);
    game.setDealerPosition({ userName: '1' })
    game.startGame();
    game.playerAction({ type: 'BET', userName: '4', betBalance: 4 });
    game.preFlop();
    newData = game.getData();
    expect(newData.position[5].isThinking).toBe(true)
    game.playerAction({ type: 'CALL', userName: '5' });
    game.playerAction({ type: 'FOLD', userName: '6', });
    game.playerAction({ type: 'CALL', userName: '7', });
    game.playerAction({ type: 'CALL', userName: '8', });
    game.playerAction({ type: 'CALL', userName: '9', });
    game.playerAction({ type: 'CALL', userName: '1', });
    game.playerAction({ type: 'CALL', userName: '2', });
    game.playerAction({ type: 'CALL', userName: '3', });
    game.playerAction({ type: 'CHECK', userName: '4', });
    newData = game.getData();
    // flop
    expect(newData.position[2].isThinking).toBe(true)

    game.playerAction({ type: 'CHECK', userName: '2', });
    game.playerAction({ type: 'CHECK', userName: '3', });
    game.playerAction({ type: 'CHECK', userName: '4', });
    game.playerAction({ type: 'CHECK', userName: '5', });

    newData = game.getData();
    expect(newData.position[6].isThinking).toBe(false)
    expect(newData.position[7].isThinking).toBe(true)

    game.playerAction({ type: 'BET', userName: '7', betBalance: 10 });
    game.playerAction({ type: 'CALL', userName: '8', });
    game.playerAction({ type: 'CALL', userName: '9', });
    game.playerAction({ type: 'FOLD', userName: '1', });
    game.playerAction({ type: 'CALL', userName: '2', });
    game.playerAction({ type: 'CALL', userName: '3', });
    game.playerAction({ type: 'CALL', userName: '4', });
    game.playerAction({ type: 'BET', userName: '5', betBalance: 20 });

    newData = game.getData();
    expect(newData.position[7].isThinking).toBe(true)
    game.playerAction({ type: 'CALL', userName: '7', });
    game.playerAction({ type: 'FOLD', userName: '8', });
    game.playerAction({ type: 'CALL', userName: '9', });

    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(true)
    expect(newData.table.firstActionPlayer).toBe(5)

    game.playerAction({ type: 'CALL', userName: '2', });
    game.playerAction({ type: 'FOLD', userName: '3', });
    game.playerAction({ type: 'FOLD', userName: '4', });
    // turn
    newData = game.getData();
    expect(newData.table.firstActionPlayer).toBe(2)
    game.playerAction({ type: 'CHECK', userName: '2', });

    newData = game.getData();
    expect(newData.position[5].isThinking).toBe(true)
    game.playerAction({ type: 'CHECK', userName: '5', });

    newData = game.getData();
    expect(newData.position[7].isThinking).toBe(true)
    game.playerAction({ type: 'CHECK', userName: '7', });

    newData = game.getData();
    expect(newData.position[9].isThinking).toBe(true)
    game.playerAction({ type: 'BET', userName: '9', betBalance: 10 });

    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(true)
    expect(newData.table.firstActionPlayer).toBe(9)
    game.playerAction({ type: 'FOLD', userName: '2' });

    newData = game.getData();
    expect(newData.position[5].isThinking).toBe(true)
    game.playerAction({ type: 'CALL', userName: '5' });

    newData = game.getData();
    expect(newData.position[7].isThinking).toBe(true)
    game.playerAction({ type: 'BET', userName: '7', isAllIn: true });

    // river
    newData = game.getData();
    expect(newData.position[9].isThinking).toBe(true)
    game.playerAction({ type: 'FOLD', userName: '9' });

    newData = game.getData();
    expect(newData.position[5].isThinking).toBe(true)
    game.playerAction({ type: 'CALL', userName: '5' });
    // show down
    newData = game.getData();
    expect(newData.table.finish).toBe(true)

  })
})