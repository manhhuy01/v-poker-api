const charm = require('./charm')

describe('charm.createCharm', () => {
  beforeEach(() => charm.reset())

  it('creates a charm for a known type', () => {
    const rs = charm.createCharm({ userName: 'huy', type: 'incense', now: 1000 })
    expect(rs.error).toBeUndefined()
    expect(rs.charm).toEqual({ id: 1, userName: 'huy', type: 'incense', at: 1000 })
  })

  it('rejects unknown types and missing user', () => {
    expect(charm.createCharm({ userName: 'huy', type: '<script>' }).error).toBeDefined()
    expect(charm.createCharm({ userName: '', type: 'clover' }).error).toBeDefined()
  })

  it('accepts the new charm types', () => {
    ;['money', 'angry'].forEach((type, i) => {
      const rs = charm.createCharm({ userName: `p${i}`, type, now: 1000 })
      expect(rs.charm).toEqual({ id: i + 1, userName: `p${i}`, type, at: 1000 })
    })
  })

  it('passes the rolled dice value through to everyone', () => {
    const rs = charm.createCharm({ userName: 'huy', type: 'dice', value: 4, now: 1000 })
    expect(rs.charm).toEqual({ id: 1, userName: 'huy', type: 'dice', value: 4, at: 1000 })
  })

  it('rejects a dice without a valid 1-6 value', () => {
    ;[undefined, 0, 7, 2.5, '3', null].forEach((value, i) => {
      expect(charm.createCharm({ userName: `p${i}`, type: 'dice', value }).error).toBe('invalid dice value')
    })
  })

  it('does not attach a value to other charms', () => {
    const rs = charm.createCharm({ userName: 'huy', type: 'clover', value: 6, now: 1000 })
    expect(rs.charm.value).toBeUndefined()
  })

  it('applies a per-player cooldown', () => {
    expect(charm.createCharm({ userName: 'huy', type: 'clover', now: 1000 }).charm).toBeDefined()
    expect(charm.createCharm({ userName: 'huy', type: 'clover', now: 2000 }).error).toBe('cooldown')
    // other players are not affected
    expect(charm.createCharm({ userName: 'an', type: 'clover', now: 2000 }).charm).toBeDefined()
    expect(charm.createCharm({ userName: 'huy', type: 'millennium-eye', now: 1000 + charm.COOLDOWN_MS }).charm.id).toBe(3)
  })
})
