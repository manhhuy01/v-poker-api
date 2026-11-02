// Cấu hình CORS dùng chung cho Express (index.js) và Socket.IO (socket.js)
//
// Lưu ý: header Origin KHÔNG bao giờ có dấu "/" ở cuối và không chứa path,
// nên pattern bên dưới không được viết kèm "/" (vd: https://v-poker-*.vercel.app/ là sai).

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://v-poker.vercel.app',
]

// Slug team trên Vercel — buộc URL preview phải thuộc team này, không nhận
// mọi project tên "v-poker-*" (ai cũng tạo được project như vậy trên Vercel).
const VERCEL_TEAM_SLUG = 'nguyen-manh-huys-projects'

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Các dạng URL thật của team:
//   https://v-poker-<hash>-<team>.vercel.app
//   https://v-poker-<hash>-git-<branch>-<team>.vercel.app
// vd: https://v-poker-vkzf-git-ui-v2-nguyen-manh-huys-projects.vercel.app
const ALLOWED_ORIGIN_PATTERNS = [
  new RegExp(
    `^https://v-poker-[a-z0-9-]+-${escapeRegex(VERCEL_TEAM_SLUG)}\\.vercel\\.app$`,
    'i'
  ),
]

// origin = undefined khi request không phải từ browser (curl, app native, same-origin)
const isOriginAllowed = (origin) => {
  if (!origin) return true
  return (
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
  )
}

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

// Socket.IO: cùng danh sách trên, nhưng trả false (không gắn header) thay vì throw
const socketCorsOptions = {
  origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
  methods: ['GET', 'POST', 'DELETE'],
}

module.exports = {
  ALLOWED_ORIGINS,
  ALLOWED_ORIGIN_PATTERNS,
  isOriginAllowed,
  corsOptions,
  socketCorsOptions,
}
