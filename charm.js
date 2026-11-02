// "Bùa may mắn": a player picks a spiritual charm that every player at the
// table sees on their seat for a short while.
const CHARM_TYPES = ['incense', 'clover', 'millennium-eye']

// Stop a single player from spamming the table.
const COOLDOWN_MS = 3000

let lastSentAt = {}
let count = 0

const createCharm = ({ userName, type, now = Date.now() }) => {
  if (!userName || !CHARM_TYPES.includes(type)) {
    return { error: 'invalid charm' }
  }
  if (userName in lastSentAt && now - lastSentAt[userName] < COOLDOWN_MS) {
    return { error: 'cooldown' }
  }
  lastSentAt[userName] = now
  count += 1
  return { charm: { id: count, userName, type, at: now } }
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
