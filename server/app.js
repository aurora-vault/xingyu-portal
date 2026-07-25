'use strict'

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// 管理员凭证（单账号，从 env；未来需多用户/RBAC 再扩展）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret'
const JWT_EXPIRES_IN = '8h'

// 官网配置文件（唯一数据源，前后台共用）
const CONFIG_FILE = path.join(__dirname, 'data', 'site-config.json')
const DIST_DIR = path.join(__dirname, '..', 'dist')

// CORS：官网（同源）+ 内容管理后台 cms.xingyu.pro + 本地开发
const ALLOWED_ORIGINS = [
  'https://xingyu.pro',
  'https://www.xingyu.pro',
  'https://cms.xingyu.pro',
  /^http:\/\/localhost:\d+$/,
]
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: false }))
app.use(express.json())

// 静态文件托管（生产环境，官网）
app.use(express.static(DIST_DIR))

// 登录限速：防暴破
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, msg: '尝试过于频繁，请稍后再试' },
})

// SSE 客户端列表（官网访客 + 后台预览 iframe）
const sseClients = new Set()

// JWT 校验中间件
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ ok: false, msg: '未登录' })
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ ok: false, msg: '登录已过期，请重新登录' })
  }
}

// POST /api/admin/login — 登录，签发 JWT
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {}
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, msg: '用户名或密码错误' })
  }
  const token = jwt.sign({ sub: username, role: 'admin' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
  res.json({ ok: true, data: { token, username } })
})

// GET /api/site-config — 读取配置（公开，官网访客也要读）
app.get('/api/site-config', (req, res) => {
  if (!fs.existsSync(CONFIG_FILE)) {
    return res.json({ ok: true, data: null }) // null 表示用前端默认值
  }
  const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
  res.json({ ok: true, data: JSON.parse(raw) })
})

// POST /api/site-config — 保存配置（需 JWT）
app.post('/api/site-config', requireAdmin, (req, res) => {
  const config = req.body
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ ok: false, msg: '数据格式错误' })
  }
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')

  // 推送给所有 SSE 客户端（官网访客 + 后台预览 iframe）
  const payload = `data: ${JSON.stringify(config)}\n\n`
  for (const client of sseClients) {
    client.write(payload)
  }

  res.json({ ok: true })
})

// GET /api/site-config/events — SSE 长连接（公开，官网订阅实时更新）
app.get('/api/site-config/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  sseClients.add(res)

  // 心跳，防止代理断连
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(res)
  })
})

// SPA fallback
app.get('*', (req, res) => {
  const index = path.join(DIST_DIR, 'index.html')
  if (fs.existsSync(index)) {
    res.sendFile(index)
  } else {
    res.status(404).send('Not found')
  }
})

app.listen(PORT, () => {
  console.log(`[xingyu-portal] server running on port ${PORT}`)
})
