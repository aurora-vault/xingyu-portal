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
// 总台审计上报服务令牌(配了才上报到 ops 统一审计流;不配则只用本地审计)
const AUDIT_REPORT_TOKEN = process.env.AUDIT_REPORT_TOKEN || ''

const CONFIG_FILE = path.join(__dirname, 'data', 'site-config.json')
const HISTORY_FILE = path.join(__dirname, 'data', 'site-config-history.json')
const HISTORY_MAX = 100
const AUDIT_FILE = path.join(__dirname, 'data', 'site-config-audit.json')
const AUDIT_MAX = 200
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

// 内省缓存:token -> { value: { allowed, admin }, exp }(30s,避免每请求一跳 companion-api)
const introspectCache = new Map()
const INTROSPECT_TTL = 30000

// 返回 { allowed, admin };admin = { nickname, username, adminId, role } | null(来自 companion 内省,可信)
async function introspect(token) {
  const now = Date.now()
  const cached = introspectCache.get(token)
  if (cached && cached.exp > now) return cached.value

  let allowed = false
  let admin = null
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
      if (allowed) {
        // /admin/me 返回 id(不是 adminId);容错读取,缺失字段统一 null
        admin = {
          nickname: me.nickname ?? null,
          username: me.username ?? null,
          adminId: me.id ?? me.adminId ?? null,
          role: me.role ?? null,
        }
      }
    }
  } catch {
    // companion-api 不可达 → 保守拒绝,admin 保持 null
  }
  const value = { allowed, admin }
  introspectCache.set(token, { value, exp: now + INTROSPECT_TTL })
  return value
}

// 内省认证中间件
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return res.status(401).json({ ok: false, msg: '未登录' })
  introspect(token)
    .then(({ allowed, admin }) => {
      if (!allowed) {
        return res
          .status(403)
          .json({ ok: false, msg: '无官网编辑权限(需超管或被指派为本工具管理员)' })
      }
      req.admin = admin // 操作人身份(后端内省,可信)
      req.actorHint = req.headers['x-actor-hint'] || '' // CMS 传的兜底昵称
      next()
    })
    .catch(() => res.status(401).json({ ok: false, msg: '会话验证失败' }))
}

// 向总台上报审计事件(B,可选;best-effort,失败仅 console.warn 不阻断,不 await)
async function reportAuditEvent({ adminId, action, targetType, targetId, detail, payload }) {
  if (!AUDIT_REPORT_TOKEN || !adminId) return // 未配 token 或无 actor → 跳过
  try {
    const res = await fetch(COMPANION_API + '/admin/audit/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Audit-Report-Token': AUDIT_REPORT_TOKEN,
      },
      body: JSON.stringify({
        toolSlug: CMS_TOOL_SLUG,
        actorAdminId: adminId,
        action,
        targetType: targetType || 'site_config',
        targetId: targetId || 'portal',
        detail: detail || '',
        payload: payload || {},
      }),
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn('[reportAuditEvent] 上报非 200:', res.status, txt.slice(0, 200))
    }
  } catch (e) {
    console.warn('[reportAuditEvent] 上报失败:', e.message)
  }
}

// GET /api/site-config — 读取配置(公开,官网访客也要读)
app.get('/api/site-config', (req, res) => {
  if (!fs.existsSync(CONFIG_FILE)) return res.json({ ok: true, data: null })
  res.json({ ok: true, data: JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) })
})

// POST /api/site-config — 保存配置(内省认证)+ 自动记审计(字段级 diff)
app.post('/api/site-config', requireAdmin, (req, res) => {
  const newConfig = req.body
  if (!newConfig || typeof newConfig !== 'object') {
    return res.status(400).json({ ok: false, msg: '数据格式错误' })
  }

  // 读旧 config 做差异比对(不存在/损坏 → {})
  let oldConfig = {}
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      oldConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }
  } catch {
    oldConfig = {}
  }

  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8')

  // 生成审计记录(失败不阻断发布,对齐 history 策略)
  try {
    const isFirstPublish = !oldConfig || Object.keys(oldConfig).length === 0
    let changes, summary
    if (isFirstPublish) {
      changes = [{ path: '*', from: null, to: '(完整配置)' }]
      summary = '首次发布(导入完整配置)'
    } else {
      changes = diffConfigs(oldConfig, newConfig)
      summary = `修改了 ${changes.length} 处`
    }
    if (changes.length > 0) {
      const a = req.admin || {}
      const hint = (req.actorHint || '').trim()
      const actor = a.nickname || a.username || hint || '未知'
      const rec = {
        id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
        at: new Date().toISOString(),
        actor,
        actorId: a.adminId || null,
        role: a.role || null,
        changes,
        summary,
      }
      const list = readAudit()
      list.unshift(rec)
      if (list.length > AUDIT_MAX) list.length = AUDIT_MAX
      writeAudit(list)
      // best-effort 上报总台统一审计流(失败仅告警,不阻断发布;不 await)
      reportAuditEvent({
        adminId: a.adminId,
        action: isFirstPublish ? 'site_config.first_publish' : 'site_config.publish',
        targetType: 'site_config',
        targetId: 'portal',
        detail: summary,
        payload: {
          changesCount: changes.length,
          sample: changes.slice(0, 3).map((c) => ({ path: c.path })),
          auditId: rec.id,
        },
      })
    }
  } catch {
    /* 审计写入失败不影响发布 */
  }

  // 推送给所有 SSE 客户端(官网访客 + 后台预览 iframe)
  const payload = `data: ${JSON.stringify(newConfig)}\n\n`
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

// ---------- 操作审计(site-config-audit.json,每次发布自动记字段级 diff,FIFO 上限 200) ----------
function readAudit() {
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'))
  } catch {
    return []
  }
}
function writeAudit(list) {
  fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true })
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

// ---------- 配置差异工具(纯 JS 递归,产出 [{ path, from, to }]) ----------
function truncate(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v.length > 60 ? v.slice(0, 60) + '…' : v
  if (typeof v === 'number' || typeof v === 'boolean') return v
  const s = JSON.stringify(v)
  return s.length > 60 ? s.slice(0, 60) + '…' : s
}
function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}
function diffNode(oldV, newV, path, out) {
  if (oldV === newV) return
  if (isPlainObject(oldV) && isPlainObject(newV)) return diffObject(oldV, newV, path, out)
  if (Array.isArray(oldV) && Array.isArray(newV)) return diffArray(oldV, newV, path, out)
  out.push({ path, from: truncate(oldV), to: truncate(newV) })
}
function diffObject(oldO, newO, path, out) {
  const keys = new Set([...Object.keys(oldO), ...Object.keys(newO)])
  for (const k of keys) {
    const childPath = path ? `${path}.${k}` : k
    if (!(k in oldO)) out.push({ path: childPath, from: null, to: truncate(newO[k]) })
    else if (!(k in newO)) out.push({ path: childPath, from: truncate(oldO[k]), to: null })
    else diffNode(oldO[k], newO[k], childPath, out)
  }
}
function diffArray(oldA, newA, path, out) {
  const max = Math.max(oldA.length, newA.length)
  for (let i = 0; i < max; i++) {
    const childPath = `${path}[${i}]`
    if (i >= oldA.length) out.push({ path: childPath, from: null, to: truncate(newA[i]) })
    else if (i >= newA.length) out.push({ path: childPath, from: truncate(oldA[i]), to: null })
    else diffNode(oldA[i], newA[i], childPath, out)
  }
}
function diffConfigs(oldCfg, newCfg) {
  const out = []
  diffNode(oldCfg, newCfg, '', out)
  return out
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

// GET /api/site-config/audit — 操作审计列表(字段级 diff,只读)
app.get('/api/site-config/audit', requireAdmin, (req, res) => {
  res.json({ ok: true, data: readAudit() })
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
