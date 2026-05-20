'use strict'

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'
const CONFIG_FILE = path.join(__dirname, 'data', 'site-config.json')
const DIST_DIR = path.join(__dirname, '..', 'dist')

app.use(cors())
app.use(express.json())

// 静态文件托管（生产环境）
app.use(express.static(DIST_DIR))

// SSE 客户端列表
const sseClients = new Set()

// GET /api/site-config — 读取配置
app.get('/api/site-config', (req, res) => {
  if (!fs.existsSync(CONFIG_FILE)) {
    return res.json({ ok: true, data: null }) // 返回 null 表示使用前端默认值
  }
  const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
  res.json({ ok: true, data: JSON.parse(raw) })
})

// POST /api/site-config — 保存配置（需要管理员密码）
app.post('/api/site-config', (req, res) => {
  const auth = req.headers['x-admin-password']
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, msg: '密码错误' })
  }
  const config = req.body
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ ok: false, msg: '数据格式错误' })
  }
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')

  // 推送给所有 SSE 客户端
  const payload = `data: ${JSON.stringify(config)}\n\n`
  for (const client of sseClients) {
    client.write(payload)
  }

  res.json({ ok: true })
})

// GET /api/site-config/events — SSE 长连接
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
  console.log(`[xingyu-official] server running on port ${PORT}`)
})
