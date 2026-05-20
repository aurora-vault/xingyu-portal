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

function applyConfig(data: SiteData) {
  site.brand    = data.brand
  site.nav      = data.nav
  site.hero     = data.hero
  site.about    = data.about
  site.features = data.features
  site.product  = data.product
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
