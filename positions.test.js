const { FULL_TABLE_POSITIONS, POSITION_PRIORITY, getPositionNames } = require('./positions')

describe('positions.getPositionNames', () => {
  it('xếp đủ 9 vị trí theo chiều thuận của sòng bài tính từ dealer', () => {
    expect(getPositionNames(9)).toEqual([
      'D',
      'SB',
      'BB',
      'UTG',
      'UTG+1',
      'UTG+2',
      'LJ',
      'HJ',
      'CO',
    ])
    expect(FULL_TABLE_POSITIONS).toHaveLength(9)
  })

  it('giữ D và ưu tiên các vị trí đầu danh sách khi bàn ít người', () => {
    // 6 người: D, SB, BB, CO, UTG và HJ (thứ tự quanh bàn: D, SB, BB, UTG, HJ, CO)
    expect(getPositionNames(6)).toEqual(['D', 'SB', 'BB', 'UTG', 'HJ', 'CO'])
    expect(getPositionNames(8)).toEqual(['D', 'SB', 'BB', 'UTG', 'UTG+1', 'LJ', 'HJ', 'CO'])
    expect(getPositionNames(7)).toEqual(['D', 'SB', 'BB', 'UTG', 'LJ', 'HJ', 'CO'])
    expect(getPositionNames(5)).toEqual(['D', 'SB', 'BB', 'UTG', 'CO'])
    expect(getPositionNames(4)).toEqual(['D', 'SB', 'BB', 'CO'])
    expect(getPositionNames(3)).toEqual(['D', 'SB', 'BB'])
    expect(getPositionNames(2)).toEqual(['D', 'SB'])
    expect(getPositionNames(1)).toEqual(['D'])
  })

  it('luôn giữ D là vị trí ưu tiên số 1', () => {
    expect(POSITION_PRIORITY[0]).toBe('D')
    expect([...POSITION_PRIORITY].sort()).toEqual([...FULL_TABLE_POSITIONS].sort())
  })

  it('không trả về vị trí nào khi bàn không có người và bỏ qua số người không hợp lệ', () => {
    expect(getPositionNames(0)).toEqual([])
    expect(getPositionNames()).toEqual([])
    expect(getPositionNames('abc')).toEqual([])
    expect(getPositionNames(-2)).toEqual([])
    // nhiều hơn 9 người cũng chỉ có tối đa 9 vị trí
    expect(getPositionNames(12)).toEqual(getPositionNames(9))
  })
})
