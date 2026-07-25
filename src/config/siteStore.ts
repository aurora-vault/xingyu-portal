import { reactive, watch } from 'vue'
import { siteData } from './site'
import type { SiteData } from './site'

export const site = reactive<SiteData>(JSON.parse(JSON.stringify(siteData)))

// 从服务端拉取配置，覆盖默认值
export async function fetchSiteConfig(): Promise<void> {
  try {
    const res = await fetch('/api/site-config')
    const json = await res.json()
    if (json.ok && json.data) applyConfig(json.data)
  } catch {}
}

// SSE 订阅：有人通过管理面板保存后，所有访客实时更新
export function subscribeSiteEvents(): () => void {
  const es = new EventSource('/api/site-config/events')
  es.onmessage = (e) => {
    try { applyConfig(JSON.parse(e.data)) } catch {}
  }
  return () => es.close()
}

// CMS 实时预览：接收 cms.xingyu.pro 推来的「编辑中」配置，覆盖本地 site（仅本 iframe 预览，
// 不落盘、不影响其他访客）。Vue 增量重渲染，整页不 reload —— 真·实时预览。
export function subscribePreviewMessages(): () => void {
  const allowed = (o: string) =>
    o === 'https://cms.xingyu.pro' || /^http:\/\/localhost:\d+$/.test(o)
  const handler = (e: MessageEvent) => {
    if (!allowed(e.origin)) return
    const data = e.data
    if (!data || data.__cmsPreview !== true || !data.site) return
    try { applyConfig(data.site as SiteData) } catch {}
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}

function applyConfig(data: SiteData) {
  site.brand    = data.brand
  site.nav      = data.nav
  // hero 做字段级合并：兼容旧版 site-config.json（缺 badge 时回落默认，不丢徽标）
  site.hero     = { ...site.hero, ...data.hero }
  site.about    = data.about
  site.features = data.features
  // product 做字段级合并：兼容旧版 site-config.json（缺 ctaText/h5Url 时回落默认，不崩）
  site.product  = { ...site.product, ...data.product }
  site.roadmap  = data.roadmap
  site.footer   = data.footer
}

export async function saveSiteConfig(password: string): Promise<{ ok: boolean; msg?: string }> {
  try {
    const res = await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(site),
    })
    return res.json()
  } catch {
    return { ok: false, msg: '网络错误' }
  }
}

export function resetSite(): void {
  applyConfig(JSON.parse(JSON.stringify(siteData)) as SiteData)
}
