const game = require('./game')
const db = require('./db')

jest.mock('./db')

const createPlayers = () => ([
  { userName: 'a', userId: 1, accBalance: 100, startBalance: 100 },
  { userName: 'b', userId: 2, accBalance: 100, startBalance: 100 },
  { userName: 'c', userId: 3, accBalance: 100, startBalance: 100 },
])

const createPosition = ({ user, betBalance = 0, isFold = false, isPlaying = true, namePos = '', isThinking = false, winBalance = 0 }) => ({
  user,
  betBalance,
  isFold,
  namePos,
  cards: [],
  isThinking,
  isPlaying,
  winBalance,
  showCard: false,
  action: '',
})

const createData = ({ players, positions, table = {} }) => ({
  setting: { smallBlind: 1 },
  players,
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
    ...positions,
  },
  table: {
    start: false,
    preFlop: '',
    flop: '',
    turn: '',
    river: '',
    finish: false,
    firstActionPlayer: 1,
    pot: [{ users: [], balance: 0, isHavePlayerAllIn: false }],
    currentBet: 0,
    isShowDown: false,
    showDownAt: undefined,
    actions: [],
    ...table,
  },
  cards: [],
})

describe('game.removeFromTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    db.updateBalance.mockResolvedValue({})
    db.logGame.mockResolvedValue({})
  })

  test('không cho rời bàn khi đang trong ván và chưa fold', () => {
    const players = createPlayers()
    game.setData(createData({
      players,
      positions: {
        1: createPosition({ user: players[0], betBalance: 2, namePos: 'D' }),
        2: createPosition({ user: players[1], betBalance: 2, isThinking: true }),
      },
      table: { start: true, preFlop: true, currentBet: 2, pot: [{ users: ['a', 'b'], balance: 4 }] },
    }))

    const rs = game.removeFromTable({ userName: 'a' })

    const newData = game.getData()
    expect(rs.error).toBeDefined()
    expect(newData.position[1].user.userName).toBe('a')
    expect(newData.position[1].isPlaying).toBe(true)
    expect(db.updateBalance).not.toHaveBeenCalled()
    expect(db.logGame).not.toHaveBeenCalled()
  })

  test('cho rời bàn giữa ván khi đã fold: gom tiền đã cược vào pot và cập nhật DB', () => {
    const players = createPlayers()
    players[0].accBalance = 97 // đã cược 3
    game.setData(createData({
      players,
      positions: {
        1: createPosition({ user: players[0], betBalance: 3, isFold: true }),
        2: createPosition({ user: players[1], betBalance: 3, isThinking: true }),
      },
      table: { start: true, preFlop: true, currentBet: 3, pot: [{ users: ['b'], balance: 3 }] },
    }))

    const rs = game.removeFromTable({ userName: 'a' })

    const newData = game.getData()
    expect(rs).toEqual({})
    expect(newData.position[1]).toEqual({})
    // tiền đã cược của người fold vẫn phải nằm lại trong pot
    expect(newData.table.pot[0].balance).toBe(6)
    expect(players[0].accBalance).toBe(97)
    expect(db.updateBalance).toHaveBeenCalledWith({ userName: 'a', balance: 97 })
    expect(db.logGame).toHaveBeenCalledWith({ userId: 1, amount: 3, type: 'lose', balanceAfter: 97 })
    // vẫn giữ account trong danh sách players (chỉ rời bàn, không logout)
    expect(newData.players.map(x => x.userName)).toContain('a')
  })

  test('ván vẫn tiếp tục được sau khi người đã fold rời bàn', () => {
    const players = createPlayers()
    players[0].accBalance = 97
    players[1].accBalance = 97
    game.setData(createData({
      players,
      positions: {
        1: createPosition({ user: players[0], betBalance: 3, isFold: true }),
        2: createPosition({ user: players[1], betBalance: 3, isThinking: true }),
      },
      table: { start: true, preFlop: true, currentBet: 3, pot: [{ users: [], balance: 0 }] },
    }))

    game.removeFromTable({ userName: 'a' })
    const rs = game.playerAction({ type: 'CHECK', userName: 'b' })

    const newData = game.getData()
    expect(rs).toEqual({})
    expect(newData.table.finish).toBe(true)
    // b thắng cả pot gồm phần a đã cược (3 của a + 3 của b)
    expect(newData.position[2].winBalance).toBe(6)
    expect(newData.position[1]).toEqual({})
  })

  test('chuyển nút dealer sang ghế còn người khi người rời bàn đang giữ nút', () => {
    const players = createPlayers()
    players[0].accBalance = 97
    game.setData(createData({
      players,
      positions: {
        1: createPosition({ user: players[0], betBalance: 3, isFold: true, namePos: 'D' }),
        2: createPosition({ user: players[1], betBalance: 3, isThinking: true }),
        3: createPosition({ user: players[2], betBalance: 3, isFold: true }),
      },
      table: { start: true, preFlop: true, currentBet: 3, pot: [{ users: ['b'], balance: 3 }] },
    }))

    game.removeFromTable({ userName: 'a' })

    const newData = game.getData()
    expect(newData.position[1]).toEqual({})
    expect(newData.position[2].namePos).toBe('D')
    expect(newData.position[3].namePos).toBe('')
  })

  test('rời bàn khi ván đã kết thúc thì cộng winBalance và lưu số dư', () => {
    const players = createPlayers()
    players[0].accBalance = 60 // đã cược 40, thắng 120
    game.setData(createData({
      players,
      positions: {
        1: createPosition({ user: players[0], betBalance: 0, winBalance: 120, isFold: false }),
        2: createPosition({ user: players[1], betBalance: 0 }),
      },
      table: { start: true, preFlop: true, flop: ['2s', '3s', '4s'], turn: '5s', river: '6s', finish: true },
    }))

    const rs = game.removeFromTable({ userName: 'a' })

    const newData = game.getData()
    expect(rs).toEqual({})
    expect(newData.position[1]).toEqual({})
    expect(players[0].accBalance).toBe(180)
    expect(db.updateBalance).toHaveBeenCalledWith({ userName: 'a', balance: 180 })
    expect(db.logGame).toHaveBeenCalledWith({ userId: 1, amount: 80, type: 'win', balanceAfter: 180 })
  })

  test('rời bàn khi không ở trong ván thì không ghi DB', () => {
    const players = createPlayers()
    game.setData(createData({
      players,
      positions: {
        1: createPosition({ user: players[0], isPlaying: false, namePos: 'D' }),
        2: createPosition({ user: players[1], isPlaying: false }),
      },
    }))

    const rs = game.removeFromTable({ userName: 'a' })

    const newData = game.getData()
    expect(rs).toEqual({})
    expect(newData.position[1]).toEqual({})
    expect(db.updateBalance).not.toHaveBeenCalled()
    expect(db.logGame).not.toHaveBeenCalled()
  })

  test('báo lỗi khi người chơi không ở trên bàn', () => {
    const players = createPlayers()
    game.setData(createData({ players, positions: {} }))

    const rs = game.removeFromTable({ userName: 'a' })

    expect(rs.error).toBeDefined()
  })
})
