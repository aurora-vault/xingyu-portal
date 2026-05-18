import { reactive, watch } from 'vue'
import { siteData } from './site'
import type { SiteData } from './site'

const STORAGE_KEY = 'xingyu-site-data'

function loadInitial(): SiteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return JSON.parse(JSON.stringify(siteData))
}

export const site = reactive<SiteData>(loadInitial())

watch(site, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function resetSite(): void {
  const d = JSON.parse(JSON.stringify(siteData)) as SiteData
  site.brand = d.brand
  site.nav = d.nav
  site.hero = d.hero
  site.about = d.about
  site.features = d.features
  site.product = d.product
  site.roadmap = d.roadmap
  site.footer = d.footer
}
