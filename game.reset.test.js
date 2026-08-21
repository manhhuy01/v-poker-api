const game = require('./game')
const db = require('./db')

jest.mock('./db');
db.updateBalance.mockResolvedValue({})
db.logGame.mockResolvedValue({})
db.logPoker.mockResolvedValue({ data: 1 })

describe('game reset poker log', () => {
  test('stores game data with actions then clears memory', async () => {
    const data = {
      setting: { smallBlind: 1 },
      players: [
        { userName: 'a', accBalance: 20 },
        { userName: 'b', accBalance: 20 },
      ],
      position: {
        1: {
          user: { userName: 'a', accBalance: 20, startBalance: 20 },
          betBalance: 4,
          isFold: false,
          namePos: 'D',
          cards: ['As', 'Ks'],
          isThinking: false,
          isPlaying: true,
          winBalance: 0,
          showCard: false,
          action: 'bet',
        },
        2: {
          user: { userName: 'b', accBalance: 16, startBalance: 20 },
          betBalance: 4,
          isFold: false,
          namePos: '',
          cards: ['Qs', 'Js'],
          isThinking: true,
          isPlaying: true,
          winBalance: 0,
          showCard: false,
          action: 'call',
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
        flop: ['2s', '3s', '4s'],
        turn: '5s',
        river: '6s',
        finish: true,
        firstActionPlayer: 2,
        pot: [{ users: ['a', 'b'], balance: 8, isHavePlayerAllIn: false }],
        currentBet: 4,
        isShowDown: false,
        showDownAt: undefined,
        actions: [
          { user: 'a', action: 'bet', amount: 4 },
          { user: 'b', action: 'call', amount: 4 },
        ],
      },
      cards: ['7s', '8s'],
    }

    game.setData(data);
    await game.reset();

    expect(db.logGame.mock.calls[0][0].pokerLogId).toBe(1);
    expect(db.logPoker).toHaveBeenCalledWith({
      data: expect.objectContaining({
        table: expect.objectContaining({
          actions: [
            { user: 'a', action: 'bet', amount: 4 },
            { user: 'b', action: 'call', amount: 4 },
          ],
        }),
      })
    });

    expect(db.logPoker.mock.calls[0][0].data.table.actions).toEqual(
      [
          { user: 'a', action: 'bet', amount: 4 },
          { user: 'b', action: 'call', amount: 4 },
      ]
    );

    const newData = game.getData();
    expect(newData.table.actions).toEqual([]);
  });
})
