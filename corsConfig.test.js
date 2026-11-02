const { isOriginAllowed, corsOptions } = require('./corsConfig')

describe('isOriginAllowed', () => {
  test('origin có trong danh sách chính xác', () => {
    expect(isOriginAllowed('https://v-poker.vercel.app')).toBe(true)
    expect(isOriginAllowed('http://localhost:3000')).toBe(true)
    expect(isOriginAllowed('http://192.168.101.35:3000')).toBe(true)
  })

  test('khớp URL preview của team nguyen-manh-huys-projects', () => {
    // URL thật của team
    expect(
      isOriginAllowed(
        'https://v-poker-vkzf-git-ui-v2-nguyen-manh-huys-projects.vercel.app'
      )
    ).toBe(true)
    // deployment URL (không có phần git-<branch>)
    expect(
      isOriginAllowed('https://v-poker-k2j9x-nguyen-manh-huys-projects.vercel.app')
    ).toBe(true)
    expect(
      isOriginAllowed('https://v-poker-git-main-nguyen-manh-huys-projects.vercel.app')
    ).toBe(true)
  })

  test('không khớp thì chặn', () => {
    expect(isOriginAllowed('https://evil.com')).toBe(false)
    // project v-poker-* nhưng không thuộc team của mình
    expect(isOriginAllowed('https://v-poker-evil.vercel.app')).toBe(false)
    expect(isOriginAllowed('https://v-poker-abc.vercel.app')).toBe(false)
    expect(isOriginAllowed('https://v-poker-abc-other-team.vercel.app')).toBe(false)
    // team slug chỉ là hậu tố của domain khác
    expect(
      isOriginAllowed(
        'https://v-poker-abc-nguyen-manh-huys-projects.vercel.app.evil.com'
      )
    ).toBe(false)
    expect(isOriginAllowed('http://v-poker-abc-nguyen-manh-huys-projects.vercel.app')).toBe(
      false
    )
    // Origin header không bao giờ có "/" ở cuối
    expect(
      isOriginAllowed('https://v-poker-vkzf-nguyen-manh-huys-projects.vercel.app/')
    ).toBe(false)
  })

  test('request không gửi Origin header thì cho qua', () => {
    expect(isOriginAllowed(undefined)).toBe(true)
    expect(isOriginAllowed('')).toBe(true)
  })
})

describe('corsOptions.origin', () => {
  test('gọi callback(true) với origin hợp lệ', (done) => {
    const origin =
      'https://v-poker-vkzf-git-ui-v2-nguyen-manh-huys-projects.vercel.app'
    corsOptions.origin(origin, (err, allowed) => {
      expect(err).toBeNull()
      expect(allowed).toBe(true)
      done()
    })
  })

  test('trả error với origin lạ', (done) => {
    corsOptions.origin('https://v-poker-evil.vercel.app', (err) => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('Not allowed by CORS')
      done()
    })
  })
})
