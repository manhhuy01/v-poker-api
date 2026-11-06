// "Bùa may mắn": a player picks a spiritual charm that every player at the
// table sees on their seat for a short while.
const CHARM_TYPES = ['incense', 'clover', 'millennium-eye', 'money', 'angry', 'dice']

// The dice is rolled by the sender's client; every seat replays that same roll.
const isDiceValue = (value) => Number.isInteger(value) && value >= 1 && value <= 6

// Stop a single player from spamming the table.
const COOLDOWN_MS = 3000

let lastSentAt = {}
let count = 0

const createCharm = ({ userName, type, value, now = Date.now() }) => {
  if (!userName || !CHARM_TYPES.includes(type)) {
    return { error: 'invalid charm' }
  }
  if (type === 'dice' && !isDiceValue(value)) {
    return { error: 'invalid dice value' }
  }
  if (userName in lastSentAt && now - lastSentAt[userName] < COOLDOWN_MS) {
    return { error: 'cooldown' }
  }
  lastSentAt[userName] = now
  count += 1
  const created = { id: count, userName, type, at: now }
  if (type === 'dice') created.value = value
  return { charm: created }
}

const reset = () => {
  lastSentAt = {}
  count = 0
}

module.exports = {
  CHARM_TYPES,
  COOLDOWN_MS,
  createCharm,
  reset,
}
