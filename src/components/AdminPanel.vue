<template>
  <div>
    <!-- 开关按钮 -->
    <button class="admin-toggle" @click="open = !open" title="管理面板">
      <svg v-if="!open" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- 抽屉遮罩 -->
    <transition name="fade">
      <div v-if="open" class="admin-mask" @click="open = false" />
    </transition>

    <!-- 抽屉主体 -->
    <transition name="slide">
      <aside v-if="open" class="admin-drawer">
        <div class="drawer-header">
          <span class="drawer-title">管理面板</span>
          <button class="reset-btn" @click="handleReset">恢复默认</button>
        </div>

        <div class="save-bar">
          <input
            class="pwd-input"
            type="password"
            v-model="adminPassword"
            placeholder="管理员密码"
            @keyup.enter="handleSave"
          />
          <button class="save-btn" :class="saveStatus" :disabled="saveStatus === 'saving'" @click="handleSave">
            {{ saveStatus === 'saving' ? '保存中…' : '保存并发布' }}
          </button>
        </div>
        <div v-if="saveMsg" class="save-msg" :class="saveStatus">{{ saveMsg }}</div>

        <nav class="drawer-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </nav>

        <div class="drawer-body">
          <!-- 品牌 -->
          <section v-if="activeTab === 'brand'">
            <Field label="品牌简称" v-model="site.brand.name" />
            <Field label="完整公司名" v-model="site.brand.fullName" />
            <Field label="品牌标语" v-model="site.brand.slogan" />
          </section>

          <!-- 导航 -->
          <section v-if="activeTab === 'nav'">
            <div v-for="(item, i) in site.nav" :key="i" class="list-item">
              <div class="list-item-fields">
                <Field label="ID（锚点）" v-model="item.id" compact />
                <Field label="显示名称" v-model="item.name" compact />
              </div>
              <div class="list-item-actions">
                <button @click="moveUp(site.nav, i)" :disabled="i === 0">↑</button>
                <button @click="moveDown(site.nav, i)" :disabled="i === site.nav.length - 1">↓</button>
                <button class="del" @click="site.nav.splice(i, 1)">删除</button>
              </div>
            </div>
            <button class="add-btn" @click="site.nav.push({ id: 'new-section', name: '新菜单项' })">+ 添加菜单项</button>
          </section>

          <!-- 首屏 -->
          <section v-if="activeTab === 'hero'">
            <Field label="主标题" v-model="site.hero.title" />
            <Field label="描述文字" v-model="site.hero.desc" type="textarea" />
            <Field label="主按钮文字" v-model="site.hero.ctaPrimary" />
            <Field label="副按钮文字" v-model="site.hero.ctaSecondary" />
          </section>

          <!-- 关于我们 -->
          <section v-if="activeTab === 'about'">
            <Field label="模块标题" v-model="site.about.title" />
            <Field label="介绍文字" v-model="site.about.desc" type="textarea" />
            <div class="field-label">标签</div>
            <div v-for="(tag, i) in site.about.tags" :key="i" class="tag-row">
              <input class="field-input" v-model="site.about.tags[i]" />
              <button class="del" @click="site.about.tags.splice(i, 1)">×</button>
            </div>
            <button class="add-btn" @click="site.about.tags.push('新标签')">+ 添加标签</button>
          </section>

          <!-- 服务优势 -->
          <section v-if="activeTab === 'features'">
            <div v-for="(feat, i) in site.features" :key="i" class="list-item">
              <div class="list-item-fields">
                <div class="field-label">图标</div>
                <EmojiPicker v-model="feat.icon" />
                <Field label="标题" v-model="feat.title" compact />
                <Field label="描述" v-model="feat.desc" type="textarea" compact />
              </div>
              <div class="list-item-actions">
                <button @click="moveUp(site.features, i)" :disabled="i === 0">↑</button>
                <button @click="moveDown(site.features, i)" :disabled="i === site.features.length - 1">↓</button>
                <button class="del" @click="site.features.splice(i, 1)">删除</button>
              </div>
            </div>
            <button class="add-btn" @click="addFeature">+ 添加卡片</button>
          </section>

          <!-- 产品体验 -->
          <section v-if="activeTab === 'product'">
            <Field label="模块标题" v-model="site.product.title" />
            <Field label="模块描述" v-model="site.product.desc" type="textarea" />
            <Field label="解锁按钮文字" v-model="site.product.unlockText" />
          </section>

          <!-- 路线图 -->
          <section v-if="activeTab === 'roadmap'">
            <Field label="模块标题" v-model="site.roadmap.title" />
            <div v-for="(phase, i) in site.roadmap.phases" :key="i" class="list-item">
              <div class="list-item-fields">
                <Field label="阶段标签" v-model="phase.version" compact />
                <Field label="标题" v-model="phase.title" compact />
                <Field label="描述" v-model="phase.desc" type="textarea" compact />
              </div>
              <div class="list-item-actions">
                <button @click="moveUp(site.roadmap.phases, i)" :disabled="i === 0">↑</button>
                <button @click="moveDown(site.roadmap.phases, i)" :disabled="i === site.roadmap.phases.length - 1">↓</button>
                <button class="del" @click="site.roadmap.phases.splice(i, 1)">删除</button>
              </div>
            </div>
            <button class="add-btn" @click="addPhase">+ 添加阶段</button>
          </section>

          <!-- Footer -->
          <section v-if="activeTab === 'footer'">
            <Field label="ICP 备案号" v-model="site.footer.icp" />
            <Field label="公安备案号" v-model="site.footer.gongAn" />
            <Field label="统一社会信用代码" v-model="site.footer.creditCode" />
            <Field label="营业执照图片 URL" v-model="site.footer.licenseImg" />
            <Field label="联系电话" v-model="site.footer.phone" />
            <Field label="邮箱" v-model="site.footer.email" />
            <Field label="地址" v-model="site.footer.address" />
            <Field label="工作时间" v-model="site.footer.workHours" />
          </section>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { site, resetSite, saveSiteConfig } from '@/config/siteStore'
import Field from './admin/Field.vue'
import EmojiPicker from './admin/EmojiPicker.vue'

const open = ref(false)
const activeTab = ref('brand')
const adminPassword = ref('')
const saveStatus = ref<'idle' | 'saving' | 'ok' | 'err'>('idle')
const saveMsg = ref('')

async function handleSave() {
  if (!adminPassword.value) { saveMsg.value = '请输入管理员密码'; saveStatus.value = 'err'; return }
  saveStatus.value = 'saving'
  const result = await saveSiteConfig(adminPassword.value)
  saveStatus.value = result.ok ? 'ok' : 'err'
  saveMsg.value = result.ok ? '已保存并推送给所有访客' : (result.msg || '保存失败')
  if (result.ok) setTimeout(() => { saveStatus.value = 'idle'; saveMsg.value = '' }, 3000)
}

const tabs = [
  { id: 'brand',    label: '品牌' },
  { id: 'nav',      label: '导航' },
  { id: 'hero',     label: '首屏' },
  { id: 'about',    label: '关于' },
  { id: 'features', label: '服务优势' },
  { id: 'product',  label: '产品体验' },
  { id: 'roadmap',  label: '路线图' },
  { id: 'footer',   label: 'Footer' },
]

function moveUp<T>(arr: T[], i: number) {
  if (i > 0) arr.splice(i - 1, 0, arr.splice(i, 1)[0])
}
function moveDown<T>(arr: T[], i: number) {
  if (i < arr.length - 1) arr.splice(i + 1, 0, arr.splice(i, 1)[0])
}

function addFeature() {
  site.features.push({ icon: '⭐', title: '新功能', desc: '功能描述' })
}
function addPhase() {
  site.roadmap.phases.push({ version: '新阶段', title: '阶段标题', desc: '阶段描述' })
}

function handleReset() {
  if (confirm('确定恢复所有内容为默认值吗？')) resetSite()
}
</script>

<style scoped>
.admin-toggle {
  position: fixed;
  bottom: 30px;
  left: 20px;
  z-index: 10000;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #1d528d;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(29, 82, 141, 0.4);
  transition: transform 0.2s, background 0.2s;
}
.admin-toggle:hover { background: #36bce5; transform: scale(1.1); }

.admin-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 10001;
}

.admin-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: #fff;
  z-index: 10002;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 30px rgba(0,0,0,0.15);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #0f172a;
  color: #fff;
  flex-shrink: 0;
}
.drawer-title { font-size: 16px; font-weight: 700; }
.reset-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.3);
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.save-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f8fafc;
}
.pwd-input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #fff;
}
.pwd-input:focus { border-color: #36bce5; }
.save-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: #1d528d;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.save-btn:hover:not(:disabled) { background: #36bce5; }
.save-btn:disabled { opacity: 0.6; cursor: default; }
.save-btn.ok { background: #16a34a; }
.save-btn.err { background: #dc2626; }
.save-msg {
  padding: 6px 16px;
  font-size: 12px;
  flex-shrink: 0;
}
.save-msg.ok { color: #16a34a; background: #f0fdf4; }
.save-msg.err { color: #dc2626; background: #fef2f2; }

.drawer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #f8fafc;
}
.nav-tab {
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}
.nav-tab.active {
  background: #1d528d;
  color: #fff;
  border-color: #1d528d;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.list-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  background: #f8fafc;
}
.list-item-fields { display: flex; flex-direction: column; gap: 6px; }
.list-item-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  justify-content: flex-end;
}
.list-item-actions button {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.list-item-actions button:hover:not(:disabled) { background: #e2e8f0; }
.list-item-actions button:disabled { opacity: 0.3; cursor: default; }
.list-item-actions button.del { color: #ef4444; border-color: #fecaca; }
.list-item-actions button.del:hover { background: #fef2f2; }

.tag-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.tag-row .field-input { flex: 1; }
.tag-row .del {
  padding: 4px 8px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.field-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}
.field-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.field-input:focus { border-color: #36bce5; }

.add-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed #36bce5;
  border-radius: 8px;
  background: rgba(54,188,229,0.05);
  color: #1d528d;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}
.add-btn:hover { background: rgba(54,188,229,0.1); }

/* 抽屉动画 */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .admin-drawer { width: 100vw; }
}
</style>
