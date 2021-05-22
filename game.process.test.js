const game = require('./game')

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

    game.playerAction({ type: 'CHECK', userName: 'b'})
    newData = game.getData();
    expect(newData.position[3].isThinking).toBe(true);

    game.playerAction({ type: 'CHECK', userName: 'c'})
    newData = game.getData();
    expect(newData.position[1].isThinking).toBe(true);

    game.playerAction({ type: 'BET', userName: 'a', betBalance: '4'})
    newData = game.getData();
    expect(newData.position[2].isThinking).toBe(true);
    expect(newData.table.firstActionPlayer).toBe(1);

    game.playerAction({ type: 'CALL', userName: 'b'})
    game.playerAction({ type: 'CALL', userName: 'c'})
    newData = game.getData();
    expect(!!newData.table.turn).toBe(true);
    expect(newData.position[2].isThinking).toBe(true);
    expect(newData.table.pot[0].balance).toBe(24);

    game.playerAction({ type: 'CHECK', userName: 'b'})
    game.playerAction({ type: 'BET', userName: 'c', betBalance: '12'})
    newData = game.getData();
    expect(newData.position[1].isThinking).toBe(true);
    expect(newData.table.firstActionPlayer).toBe(3);

    game.playerAction({ type: 'CALL', userName: 'a'})
    game.playerAction({ type: 'FOLD', userName: 'b'})

    newData = game.getData();
    expect(!!newData.table.river).toBe(true);
    expect(newData.position[3].isThinking).toBe(false);
    expect(newData.table.firstActionPlayer).toBe(3);
    expect(newData.table.pot[0].balance).toBe(48);

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


})