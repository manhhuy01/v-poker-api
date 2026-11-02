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

  it('applies a per-player cooldown', () => {
    expect(charm.createCharm({ userName: 'huy', type: 'clover', now: 1000 }).charm).toBeDefined()
    expect(charm.createCharm({ userName: 'huy', type: 'clover', now: 2000 }).error).toBe('cooldown')
    // other players are not affected
    expect(charm.createCharm({ userName: 'an', type: 'clover', now: 2000 }).charm).toBeDefined()
    expect(charm.createCharm({ userName: 'huy', type: 'millennium-eye', now: 1000 + charm.COOLDOWN_MS }).charm.id).toBe(3)
  })
})
