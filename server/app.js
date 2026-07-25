'use strict'

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
// 信任 NPM 反向代理一层:使 req.ip 按真实客户端 IP
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3000

// companion-api 内省端点(验证 cms 传来的 SSO token,不持任何密钥)
const COMPANION_API = process.env.COMPANION_API_BASE || 'https://api.xingyu.pro/v1/companion'
// 本 cms 工具的 slug(面板注册用;内省后判断 managedTools 是否含它)
const CMS_TOOL_SLUG = process.env.CMS_TOOL_SLUG || 'portal-cms'

const CONFIG_FILE = path.join(__dirname, 'data', 'site-config.json')
const HISTORY_FILE = path.join(__dirname, 'data', 'site-config-history.json')
const HISTORY_MAX = 100
const DIST_DIR = path.join(__dirname, '..', 'dist')

const ALLOWED_ORIGINS = [
  'https://xingyu.pro',
  'https://www.xingyu.pro',
  'https://cms.xingyu.pro',
  /^http:\/\/localhost:\d+$/,
]
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: false }))
app.use(express.json())
app.use(express.static(DIST_DIR))

const sseClients = new Set()

// 内省缓存:token -> { allowed, exp }(30s,避免每请求一跳 companion-api)
const introspectCache = new Map()
const INTROSPECT_TTL = 30000

async function introspect(token) {
  const now = Date.now()
  const cached = introspectCache.get(token)
  if (cached && cached.exp > now) return cached.allowed

  let allowed = false
  try {
    const res = await fetch(COMPANION_API + '/admin/me', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (res.ok) {
      const json = await res.json()
      const me = json.data || json
      allowed =
        me.role === 'super' ||
        (Array.isArray(me.managedTools) && me.managedTools.includes(CMS_TOOL_SLUG))
    }
  } catch {
    // companion-api 不可达 → 保守拒绝
  }
  introspectCache.set(token, { allowed, exp: now + INTROSPECT_TTL })
  return allowed
}

// 内省认证中间件
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ ok: false, msg: '未登录' })
  introspect(token)
    .then((allowed) => {
      if (!allowed) {
        return res
          .status(403)
          .json({ ok: false, msg: '无官网编辑权限(需超管或被指派为本工具管理员)' })
      }
      next()
    })
    .catch(() => res.status(401).json({ ok: false, msg: '会话验证失败' }))
}

// GET /api/site-config — 读取配置(公开,官网访客也要读)
app.get('/api/site-config', (req, res) => {
  if (!fs.existsSync(CONFIG_FILE)) return res.json({ ok: true, data: null })
  res.json({ ok: true, data: JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) })
})

// POST /api/site-config — 保存配置(内省认证)
app.post('/api/site-config', requireAdmin, (req, res) => {
  const config = req.body
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ ok: false, msg: '数据格式错误' })
  }
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')

  // 推送给所有 SSE 客户端(官网访客 + 后台预览 iframe)
  const payload = `data: ${JSON.stringify(config)}\n\n`
  for (const client of sseClients) client.write(payload)

  res.json({ ok: true })
})

// ---------- 版本历史(site-config-history.json,每次发布自动存档,FIFO 上限 100) ----------
function readHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'))
  } catch {
    return []
  }
}
function writeHistory(list) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true })
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

// GET /api/site-config/history — 历史列表(含完整 config,单条 ~2KB)
app.get('/api/site-config/history', requireAdmin, (req, res) => {
  res.json({ ok: true, data: readHistory() })
})

// POST /api/site-config/history — 新增一条存档(CMS 保存后自动调)
app.post('/api/site-config/history', requireAdmin, (req, res) => {
  const { name, config } = req.body || {}
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ ok: false, msg: '缺少 config' })
  }
  const list = readHistory()
  const rec = {
    id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
    name: String(name || '').slice(0, 60),
    createdAt: new Date().toISOString(),
    config,
  }
  list.unshift(rec)
  if (list.length > HISTORY_MAX) list.length = HISTORY_MAX
  writeHistory(list)
  res.json({ ok: true, data: rec })
})

// PATCH /api/site-config/history/:id — 改名
app.patch('/api/site-config/history/:id', requireAdmin, (req, res) => {
  const { name } = req.body || {}
  const list = readHistory()
  const rec = list.find((r) => r.id === req.params.id)
  if (!rec) return res.status(404).json({ ok: false, msg: '记录不存在' })
  rec.name = String(name || '').slice(0, 60)
  writeHistory(list)
  res.json({ ok: true, data: rec })
})

// DELETE /api/site-config/history/:id — 删除
app.delete('/api/site-config/history/:id', requireAdmin, (req, res) => {
  const list = readHistory()
  const next = list.filter((r) => r.id !== req.params.id)
  if (next.length === list.length) {
    return res.status(404).json({ ok: false, msg: '记录不存在' })
  }
  writeHistory(next)
  res.json({ ok: true })
})

// GET /api/site-config/events — SSE 长连接(公开,官网订阅实时更新)
app.get('/api/site-config/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  sseClients.add(res)
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000)
  req.on('close', () => {
    clearInterval(heartbeat)
    sseClients.delete(res)
  })
})

// SPA fallback
app.get('*', (req, res) => {
  const index = path.join(DIST_DIR, 'index.html')
  if (fs.existsSync(index)) res.sendFile(index)
  else res.status(404).send('Not found')
})

app.listen(PORT, () => {
  console.log(`[xingyu-portal] server running on port ${PORT} (introspect via ${COMPANION_API})`)
})
