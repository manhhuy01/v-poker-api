// Tên vị trí quanh bàn khi đủ 9 ghế, xếp theo chiều thuận của sòng bài
// (chiều kim đồng hồ) tính từ nút dealer:
// D -> SB -> BB -> UTG -> UTG+1 -> UTG+2 -> LJ -> HJ -> CO -> (D)
const FULL_TABLE_POSITIONS = [
  'D',
  'SB',
  'BB',
  'UTG',
  'UTG+1',
  'UTG+2',
  'LJ',
  'HJ',
  'CO',
]

// Bàn ít hơn 9 người thì giữ vị trí theo thứ tự ưu tiên này: luôn có D, sau đó
// bỏ dần từ cuối danh sách. Ví dụ 6 người: D, SB, BB, UTG, HJ, CO.
const POSITION_PRIORITY = [
  'D',
  'SB',
  'BB',
  'CO',
  'UTG',
  'HJ',
  'LJ',
  'UTG+1',
  'UTG+2',
]

// Trả về tên các vị trí cho `playerCount` người chơi, đã xếp theo chiều thuận
// của sòng bài để gán lần lượt cho các ghế có người, bắt đầu từ ghế dealer.
const getPositionNames = (playerCount) => {
  const count = Math.min(Math.max(Math.floor(Number(playerCount) || 0), 0), FULL_TABLE_POSITIONS.length)
  if (!count) {
    return []
  }
  const kept = new Set(POSITION_PRIORITY.slice(0, count))
  return FULL_TABLE_POSITIONS.filter((name) => kept.has(name))
}

module.exports = {
  FULL_TABLE_POSITIONS,
  POSITION_PRIORITY,
  getPositionNames,
}
