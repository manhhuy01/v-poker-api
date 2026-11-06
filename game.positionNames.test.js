const game = require('./game')
const db = require('./db')

jest.mock('./db')

const createPlayers = (count) => Array.from({ length: count }, (_, i) => ({
  userName: `p${i + 1}`,
  userId: i + 1,
  accBalance: 100,
  startBalance: 100,
}))

const createPosition = ({ user, namePos = '', isPlaying = true }) => ({
  user,
  betBalance: 0,
  isFold: false,
  namePos,
  cards: [],
  isThinking: false,
  isPlaying,
  winBalance: 0,
  showCard: false,
  action: '',
})

const createData = ({ players, positions = {}, table = {} }) => ({
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
    firstActionPlayer: undefined,
    pot: [{ users: [], balance: 0, isHavePlayerAllIn: false }],
    currentBet: 0,
    isShowDown: false,
    showDownAt: undefined,
    actions: [],
    ...table,
  },
  cards: [],
})

const namePosOfSeats = (position) => Object.keys(position).reduce((rs, seat) => {
  if (position[seat].user) {
    rs[seat] = position[seat].namePos
  }
  return rs
}, {})

describe('game position names', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    db.updateBalance.mockResolvedValue({})
    db.logGame.mockResolvedValue({})
    db.logPoker.mockResolvedValue({ data: 1 })
  })

  const joinAll = (players, seats) => {
    seats.forEach((seat, index) => game.joinTable({ userName: players[index].userName, position: seat }))
  }

  test('gán tên vị trí theo chiều thuận của sòng bài tính từ ghế dealer đầu tiên', () => {
    const players = createPlayers(6)
    game.setData(createData({ players }))

    joinAll(players, [1, 2, 3, 4, 5, 6])

    expect(namePosOfSeats(game.getData().position)).toEqual({
      1: 'D',
      2: 'SB',
      3: 'BB',
      4: 'UTG',
      5: 'HJ',
      6: 'CO',
    })
  })

  test('bàn đủ 9 người có đủ 9 vị trí, tính cả khi dealer không ở ghế 1', () => {
    const players = createPlayers(9)
    game.setData(createData({ players }))

    // dealer ngồi ghế 4 trước, sau đó mọi người vào các ghế còn lại
    game.joinTable({ userName: players[0].userName, position: 4 })
    joinAll(players.slice(1), [5, 6, 7, 8, 9, 1, 2, 3])

    expect(namePosOfSeats(game.getData().position)).toEqual({
      4: 'D',
      5: 'SB',
      6: 'BB',
      7: 'UTG',
      8: 'UTG+1',
      9: 'UTG+2',
      1: 'LJ',
      2: 'HJ',
      3: 'CO',
    })
  })

  test('rời bàn thì các ghế còn lại được tính lại vị trí và ghế trống không có tên', () => {
    const players = createPlayers(6)
    game.setData(createData({ players }))
    joinAll(players, [1, 2, 3, 4, 5, 6])

    // p3 ở ghế 3 (BB) rời bàn, còn 5 người: D, SB, BB, UTG, CO
    game.removeFromTable({ userName: 'p3' })

    expect(game.getData().position[3]).toEqual({})
    expect(namePosOfSeats(game.getData().position)).toEqual({
      1: 'D',
      2: 'SB',
      4: 'BB',
      5: 'UTG',
      6: 'CO',
    })
  })

  test('người giữ nút dealer rời bàn thì nút chuyển sang ghế kế tiếp và tên vị trí xoay theo', () => {
    const players = createPlayers(6)
    game.setData(createData({ players }))
    joinAll(players, [1, 2, 3, 4, 5, 6])

    game.removeFromTable({ userName: 'p1' })

    expect(namePosOfSeats(game.getData().position)).toEqual({
      2: 'D',
      3: 'SB',
      4: 'BB',
      5: 'UTG',
      6: 'CO',
    })
  })

  test('reset chuyển nút dealer sang người kế tiếp rồi tính lại tên vị trí', async () => {
    const players = createPlayers(6)
    game.setData(createData({ players }))
    joinAll(players, [1, 2, 3, 4, 5, 6])
    // sau một ván thì mọi người đều đang chơi, nút dealer mới chuyển được
    Object.values(game.getData().position).forEach((position) => {
      if (position.user) position.isPlaying = true
    })

    await game.reset()

    expect(namePosOfSeats(game.getData().position)).toEqual({
      2: 'D',
      3: 'SB',
      4: 'BB',
      5: 'UTG',
      6: 'HJ',
      1: 'CO',
    })
  })

  test('bàn 2 người chỉ có D và SB', () => {
    const players = createPlayers(2)
    game.setData(createData({ players }))

    joinAll(players, [1, 9])

    expect(namePosOfSeats(game.getData().position)).toEqual({
      1: 'D',
      9: 'SB',
    })
  })

  test('setDealerPosition đặt nút ở ghế được chọn và xoay lại tên vị trí', () => {
    const players = createPlayers(6)
    game.setData(createData({ players }))
    joinAll(players, [1, 2, 3, 4, 5, 6])

    game.setDealerPosition({ userName: 'p4' })

    expect(namePosOfSeats(game.getData().position)).toEqual({
      4: 'D',
      5: 'SB',
      6: 'BB',
      1: 'UTG',
      2: 'HJ',
      3: 'CO',
    })
  })

  test('không đổi tên vị trí khi đang giữa ván, reset mới tính lại cho ván sau', async () => {
    const players = createPlayers(6)
    game.setData(createData({ players }))
    joinAll(players, [1, 2, 3, 4, 5, 6])
    Object.values(game.getData().position).forEach((position) => {
      if (position.user) position.isPlaying = true
    })

    // giả lập ván đang chạy: p3 (BB) đã fold rồi rời bàn
    const data = game.getData()
    data.table = { ...data.table, start: true, preFlop: true, currentBet: 2 }
    data.position[3].isFold = true

    game.removeFromTable({ userName: 'p3' })

    // vị trí lúc chia bài của những người còn lại không bị xoay giữa ván
    expect(namePosOfSeats(game.getData().position)).toEqual({
      1: 'D',
      2: 'SB',
      4: 'UTG',
      5: 'HJ',
      6: 'CO',
    })

    await game.reset()

    // ván sau: nút sang ghế 2, còn 5 người nên có D, SB, BB, UTG, CO
    expect(namePosOfSeats(game.getData().position)).toEqual({
      2: 'D',
      4: 'SB',
      5: 'BB',
      6: 'UTG',
      1: 'CO',
    })
  })

  test('không gán tên vị trí cho ghế trống', () => {
    const players = createPlayers(3)
    game.setData(createData({ players }))

    joinAll(players, [2, 5, 7])

    const data = game.getData()
    expect(data.position[1].namePos).toBe('')
    expect(data.position[3].namePos).toBe('')
    expect(namePosOfSeats(data.position)).toEqual({
      2: 'D',
      5: 'SB',
      7: 'BB',
    })
  })
})
