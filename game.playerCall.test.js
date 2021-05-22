const game = require('./game')

const cards = [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
]

describe('playerCall', () => {
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

  test('call normal', () => {

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
          betBalance: 2,
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
      cards,
      table: {
        start: true,
        preFlop: true,
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: 2,
        pot: 0,
        currentBet: 4,
      },
    }

    game.setData(data);
    let rs = game.playerAction({ type: 'CALL', userName: 'b' });
    let newData = game.getData();
    expect(rs.error).toBe(undefined);
    expect(newData.position[2].betBalance).toBe(4);
    expect(newData.position[2].user.accBalance).toBe(18);
    expect(newData.position[3].isThinking).toBe(true);

  })
  test('call all in', () => {

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
          betBalance: 10,
          isFold: false,
          namePos: 'D',
          cards: [],
          isThinking: false,
          isPlaying: true,
        },
        2: {
          user: {
            userName: 'b',
            accBalance: 8,
          },
          betBalance: 0,
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
        start: true,
        preFlop: true,
        flop: '',
        turn: '',
        river: '',
        finish: false,
        firstActionPlayer: 2,
        pot: 0,
        currentBet: 10,
      },
      cards,
    }

    game.setData(data);
    let rs = game.playerAction({ type: 'CALL', userName: 'b' });
    let newData = game.getData();
    expect(rs.error).toBe(undefined);
    expect(newData.position[2].betBalance).toBe(8);
    expect(newData.position[2].user.accBalance).toBe(0);
    expect(newData.position[3].isThinking).toBe(true);

  })
})