<template>
  <div class="app-container">
    <header class="nav-bar">
      <BrandLogo :name="site.brand.name" />
      <nav class="menu">
        <a v-for="item in site.nav" :key="item.id" :href="`#${item.id}`">
          {{ item.name }}
        </a>
      </nav>
      <a href="#contact" class="mobile-nav-btn">联系我们</a>
    </header>

    <section id="hero" class="hero-section">
      <div class="tech-grid-bg"></div>

      <div class="hero-content">
        <div class="version-badge">✨ 全新本地出行生态</div>

        <h1 class="hero-title">{{ site.hero.title }}</h1>
        <p class="hero-desc">{{ site.hero.desc }}</p>
        <div class="hero-actions">
            <button class="btn primary" @click="triggerDemoUnlock">{{ site.hero.ctaPrimary }}</button>
            <button class="btn secondary">{{ site.hero.ctaSecondary }}</button>
          </div>
      </div>

      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
    </section>

    <section id="about" class="about-section">
      <div class="section-container">
        <h2 class="section-title">{{ site.about.title }}</h2>
        <div class="divider"></div>
        <p class="about-desc">{{ site.about.desc }}</p>
        <div class="tags-wrapper">
          <span
            class="about-tag"
            v-for="tag in site.about.tags"
            :key="tag"
            >{{ tag }}</span
          >
        </div>
      </div>
    </section>

    <section id="business" class="features-section">
      <div class="section-container">
        <h2 class="section-title">平台核心引擎</h2>
        <div class="divider"></div>
        <div class="grid-container">
          <div
            class="feature-card"
            v-for="(feat, index) in site.features"
            :key="index"
          >
            <div class="feat-icon">{{ feat.icon }}</div>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>
    <section id="product" class="product-section">
      <div class="section-container">
        <h2 class="section-title">{{ site.product.title }}</h2>
        <div class="divider"></div>
        <p class="section-desc">{{ site.product.desc }}</p>

        <div class="product-showcase">
            <div class="qr-container">
              <div class="qr-box unlock-box" @click="triggerDemoUnlock">
                <div class="unlock-text">🔒 {{ site.product.unlockText }}</div>
              </div>
              <p>微信扫一扫 体验小程序</p>
            </div>
          </div>
      </div>
    </section>

    <section id="roadmap" class="roadmap-section">
      <div class="section-container">
        <h2 class="section-title">{{ site.roadmap.title }}</h2>
        <div class="divider"></div>

        <div class="timeline">
          <div
            class="timeline-item"
            v-for="(phase, index) in site.roadmap.phases"
            :key="index"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="phase-badge">{{ phase.version }}</span>
              <h3>{{ phase.title }}</h3>
              <p>{{ phase.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer id="contact" class="compliance-footer">
      <div class="footer-content">
        <BrandLogo :name="site.brand.name" class="footer-logo" />

        <div class="footer-grid">
          <div class="footer-col">
            <h4>联系我们</h4>
            <p>电话：{{ site.footer.phone }}</p>
            <p>邮箱：{{ site.footer.email }}</p>
            <p>地址：{{ site.footer.address }}</p>
            <p>工作时间：{{ site.footer.workHours }}</p>
          </div>

                    <div class="footer-col">
            <h4>法律信息</h4>
            <p>
              © {{ new Date().getFullYear() }} {{ site.brand.fullName }}
            </p>
            <p>
              <a href="javascript:void(0)" @click.prevent="showLicense = true" class="license-link">
                营业执照
              </a>
            </p>
            <p>{{ site.footer.creditCode }}</p>
            <p class="beian-links">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
                {{ site.footer.icp }}
              </a>
              <span class="separator">|</span>
              <a href="http://www.beian.gov.cn/" target="_blank" rel="noopener noreferrer" class="gongan-link">
                <img src="https://img.shabox.fun/@system/icons/gongan.png" alt="公安备案" v-if="false" />
                {{ site.footer.gongAn }}
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  </div>
  <aside class="floating-nav">
    <a
      v-for="item in site.nav"
      :key="'side-' + item.id"
      :href="`#${item.id}`"
      class="float-item"
    >
      <span class="tooltip">{{ item.name }}</span>
      <div class="dot"></div>
    </a>
  </aside>
  <div class="mobile-fab-group">
    <button
      class="fab-btn top-btn"
      :class="{ 'is-visible': showBackToTop }"
      @click="scrollToTop"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    </button>
  </div>
  <transition name="fade">
    <div
      class="lightbox-overlay"
      v-if="showLicense"
      @click="showLicense = false"
    >
      <button class="lightbox-close" @click="showLicense = false">×</button>
      <img
        :src="site.footer.licenseImg"
        alt="营业执照"
        class="lightbox-img"
        @click.stop
      />
    </div>
  </transition>
      <transition name="fade">
      <div class="lightbox-overlay" v-if="showInviteModal" @click="showInviteModal = false">
        <div class="invite-modal" @click.stop>
          <h3>内部演示通道</h3>
          <p>请输入邀测码以解锁产品 Demo</p>
          <div class="input-group" :class="{ 'has-error': inviteError }">
            <input
              type="password"
              v-model="inviteCode"
              placeholder="请输入邀请码"
              @keyup.enter="verifyInviteCode"
              @input="inviteError = false"
              autofocus
            />
            <button @click="verifyInviteCode">→</button>
          </div>
          <span class="error-msg" v-show="inviteError">邀请码不正确，请重新输入</span>
        </div>
      </div>
    </transition>

        <transition name="fade">
      <div class="lightbox-overlay" v-if="showDemoQr" @click="showDemoQr = false">
        <button class="lightbox-close" @click="showDemoQr = false">×</button>
        <div class="demo-qr-panel" @click.stop>
          <h3>微信扫码体验</h3>
          <img :src="decryptedQrUrl" alt="Demo QR" class="demo-qr-img" />
          <p>请使用授权的内部测试账号扫码</p>
        </div>
      </div>
    </transition>

  <AdminPanel />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { site, fetchSiteConfig, subscribeSiteEvents } from "@/config/siteStore";
import BrandLogo from "@/components/BrandLogo.vue";
import AdminPanel from "@/components/AdminPanel.vue";
// 滚动状态机：控制回顶按钮的挂载与卸载
const showBackToTop = ref(false);
const showLicense = ref(false);
const showInviteModal = ref(false);
const showDemoQr = ref(false);
const inviteCode = ref("");
const inviteError = ref(false);
const decryptedQrUrl = ref("");
let unsubscribeSse: (() => void) | null = null;

// 触发器：打开输入框
const triggerDemoUnlock = () => {
  inviteCode.value = "";
  inviteError.value = false;
  showInviteModal.value = true;
};
// 核心解密引擎：XOR 逆向运算
const decryptUrl = (hexStr, key) => {
  return hexStr.match(/.{2}/g).map((h, i) =>
    String.fromCharCode(parseInt(h, 16) ^ key.charCodeAt(i % key.length))
  ).join('');
};

// 核心校验引擎：简单的字符串 Hash 算法 (极客级防 F12 偷窥)
const verifyInviteCode = () => {
  if (!inviteCode.value) return;

  let h = 0;
  const str = inviteCode.value.trim();
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }

  // 与 site.js 中的 hash 值进行物理碰撞比对
  if (h === site.product.inviteHash) {
    showInviteModal.value = false;

    // 👇 校验通过！立刻用用户输入的密码作为密钥，解密出真实的图片 URL
    decryptedQrUrl.value = decryptUrl(site.product.qrCodeCipher, str);

    showDemoQr.value = true;
  } else {
    inviteError.value = true; // 验证失败，触发 UI 震动警告
  }
};

const handleScroll = () => {
  // 当 Y 轴滚动深度超过 300px 时触发 VNode 渲染
  showBackToTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  fetchSiteConfig();
  unsubscribeSse = subscribeSiteEvents();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  unsubscribeSse?.();
});
</script>

/* ======================================================= 全局 CSSOM 洗载 (越过
Vue 虚拟 DOM 边界) ======================================================= */
<style>
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  overflow-x: hidden;
  background-color: #f8fafc; /* 统一底层背景色，防止滚动回弹漏出白底 */
  -webkit-font-smoothing: antialiased; /* 开启 macOS 字体抗锯齿物理渲染 */
}
</style>

<style scoped>
/* =======================================================
   全局 CSS 变量与重置
   ======================================================= */
:root {
  --theme-start: #36bce5;
  --theme-end: #1d528d;
  --bg-light: #f8fafc;
  --text-dark: #0f172a;
  --text-gray: #475569;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html {
  scroll-behavior: smooth;
}
.app-container {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--text-dark);
  overflow-x: hidden;
}
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
}

/* =======================================================
   导航栏 (毛玻璃特效)
   ======================================================= */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  height: 70px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(29, 82, 141, 0.1);
}
.menu a {
  margin-left: 30px;
  text-decoration: none;
  color: var(--text-gray);
  font-weight: 500;
  font-size: 15px;
  transition: color 0.3s;
}
.menu a:hover {
  color: var(--theme-start);
}

/* =======================================================
   首屏区 (Hero)
   ======================================================= */
.hero-section {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at top right,
      rgba(54, 188, 229, 0.1),
      transparent 50%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(29, 82, 141, 0.05),
      transparent 50%
    );
}
.hero-content {
  position: relative;
  z-index: 2; /* 抬升层级，防止被网格遮盖 */
  max-width: 800px;
  animation: fadeInUp 0.8s ease-out;
}
/* 2. 悬浮装饰球 (利用 transform 避开主线程重排) */
.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  z-index: 1;
  opacity: 0.5;
  animation: floatOrb 8s infinite alternate ease-in-out;
}
.orb-1 {
  width: 300px;
  height: 300px;
  background: var(--theme-start);
  top: -100px;
  left: -100px;
}
.orb-2 {
  width: 250px;
  height: 250px;
  background: var(--theme-end);
  bottom: -50px;
  right: -50px;
  animation-delay: -4s; /* 制造交错感 */
}

@keyframes floatOrb {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(30px, 50px) scale(1.1);
  }
}

/* =======================================================
   首屏大标题 (绝对防御级渐变渲染)
   ======================================================= */
.hero-title {
  font-size: clamp(36px, 5vw, 64px);
  margin-bottom: 24px;
  font-weight: 900;
  line-height: 1.2;
  /* 1. 纯色兜底：防止任何渐变或透明属性失效 */
  color: #1d528d !important;
  /* 2. 注入渐变色 */
  background: linear-gradient(135deg, #1d528d, #36bce5);
  /* 3. 裁剪背景至文字形状，并开启透明文字透出背景 */
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}
.hero-desc {
  font-size: clamp(16px, 2vw, 20px);
  color: var(--text-gray);
  line-height: 1.8;
  margin-bottom: 40px;
}

/* 按钮引擎 */
.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  padding: 14px 36px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn.primary {
  background-color: #33b8e4 !important; /* 兜底纯色，防止渐变渲染失败 */
  background-image: linear-gradient(135deg, #33b8e4, #0661b1) !important;
  color: #ffffff !important; /* 强制白字 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 增加文字阴影，提高对比度 */
  box-shadow: 0 4px 15px rgba(6, 97, 177, 0.3);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 97, 177, 0.4);
}
.btn.secondary {
  background: transparent;
  color: var(--theme-end);
  border: 2px solid var(--theme-start);
}
.btn.secondary:hover {
  background: rgba(54, 188, 229, 0.05);
  transform: translateY(-3px);
}

/* =======================================================
   通用板块标题
   ======================================================= */
.section-title {
  font-size: 36px;
  color: var(--theme-end);
  text-align: center;
  margin-bottom: 15px;
}
.divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--theme-start), var(--theme-end));
  margin: 0 auto 40px;
  border-radius: 2px;
}

/* =======================================================
   关于我们 (About)
   ======================================================= */
.about-section {
  padding: 100px 0;
  background: #fff;
  text-align: center;
}
.about-desc {
  max-width: 800px;
  margin: 0 auto 30px;
  font-size: 18px;
  color: var(--text-gray);
  line-height: 1.8;
}
.tags-wrapper {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}
.about-tag {
  padding: 6px 16px;
  background: var(--bg-light);
  color: var(--theme-end);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(54, 188, 229, 0.2);
}

/* =======================================================
   核心业务 (Features)
   ======================================================= */
.features-section {
  padding: 100px 0;
  background: var(--bg-light);
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}
.feature-card {
  padding: 40px 30px;
  background: #fff;
  border-radius: 16px;
  text-align: center;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
  border: 1px solid rgba(54, 188, 229, 0.15);
  box-shadow: 0 8px 20px rgba(29, 82, 141, 0.06);
}
.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(29, 82, 141, 0.1);
}
.feat-icon {
  font-size: 48px;
  margin-bottom: 20px;
}
.feature-card h3 {
  font-size: 22px;
  color: var(--theme-end);
  margin-bottom: 15px;
}
.feature-card p {
  font-size: 15px;
  color: var(--text-gray);
  line-height: 1.7;
}
.version-badge {
  display: inline-block;
  padding: 6px 16px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-end);
  background: rgba(54, 188, 229, 0.1);
  border: 1px solid rgba(54, 188, 229, 0.3);
  border-radius: 30px;
  box-shadow: 0 0 15px rgba(54, 188, 229, 0.2);
  animation: pulseGlow 2s infinite alternate;
}
@keyframes pulseGlow {
  from {
    box-shadow: 0 0 10px rgba(54, 188, 229, 0.1);
  }
  to {
    box-shadow: 0 0 20px rgba(54, 188, 229, 0.4);
  }
}
/* 隐藏 PC 端的移动按钮 */
.mobile-nav-btn {
  display: none;
}
/* =======================================================
   通用描述与产品区
   ======================================================= */
.section-desc {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px;
  color: var(--text-gray);
  font-size: 16px;
  line-height: 1.6;
}
.product-section {
  padding: 80px 0;
  background: #fff;
  text-align: center;
}
.product-showcase {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}
.qr-box {
  padding: 15px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(29, 82, 141, 0.1);
  margin-bottom: 15px;
  border: 1px solid rgba(54, 188, 229, 0.2);
}

/* =======================================================
   时间轴路线图 (Timeline)
   ======================================================= */
.roadmap-section {
  padding: 80px 0;
  background: var(--bg-light);
}
.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
}
.timeline::before {
  content: "";
  position: absolute;
  top: 0;
  left: 24px;
  height: 100%;
  width: 2px;
  background: linear-gradient(to bottom, var(--theme-start), var(--theme-end));
}
.timeline-item {
  position: relative;
  padding-left: 60px;
  margin-bottom: 40px;
}
.timeline-item:last-child {
  margin-bottom: 0;
}
.timeline-dot {
  position: absolute;
  left: 16px;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid var(--theme-start);
  box-shadow: 0 0 10px rgba(54, 188, 229, 0.4);
}
.timeline-content {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}
.timeline-content:hover {
  transform: translateX(5px);
}
.phase-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(54, 188, 229, 0.1);
  color: var(--theme-end);
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 10px;
}
.timeline-content h3 {
  color: var(--text-dark);
  margin-bottom: 10px;
  font-size: 18px;
}
.timeline-content p {
  color: var(--text-gray);
  font-size: 14px;
  line-height: 1.6;
}

/* =======================================================
   底部合规 (Footer)
   ======================================================= */
.compliance-footer {
  background: #0f172a;
  padding: 60px 5% 30px;
  color: #94a3b8;
  border-top: 4px solid var(--theme-end);
}
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}
.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}
.footer-col h4 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
}
.footer-col p {
  margin-bottom: 10px;
  font-size: 14px;
}
.footer-col a {
  color: var(--theme-start);
  text-decoration: none;
  transition: color 0.3s;
}
.footer-col a:hover {
  color: #fff;
  text-decoration: underline;
}
.beian-links {
  display: flex;
  align-items: center;
  /* 核心修复：PC 端强制左对齐，与上方文本保持绝对垂直基准线 */
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 5px;
}
.separator {
  color: #475569;
}
.gongan-link {
  display: flex;
  align-items: center;
  gap: 4px;
}
.gongan-link img {
  width: 16px;
  height: 16px;
}

/* =======================================================
   侧边悬浮导航 (Floating Anchor Nav)
   ======================================================= */
.floating-nav {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.float-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-decoration: none;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(54, 188, 229, 0.3);
  border: 2px solid var(--theme-end);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.float-item:hover .dot {
  background-color: var(--theme-start);
  transform: scale(1.5);
  box-shadow: 0 0 10px rgba(54, 188, 229, 0.6);
}

.tooltip {
  position: absolute;
  right: 25px;
  background: rgba(15, 23, 42, 0.8);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transform: translateX(10px);
  pointer-events: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

.float-item:hover .tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* =======================================================
   产品区解锁框 (Unlock Box)
   ======================================================= */
.unlock-box {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.unlock-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(29, 82, 141, 0.15);
  border-color: var(--theme-start);
}
.unlock-text {
  width: 150px; height: 150px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  color: var(--theme-end); font-weight: bold; font-size: 15px;
  transition: all 0.3s;
}
.unlock-box:hover .unlock-text {
  background: rgba(54, 188, 229, 0.1);
}

/* =======================================================
   邀请码交互面板 (Invite Modal)
   ======================================================= */
.invite-modal {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.invite-modal h3 { color: var(--theme-end); margin-bottom: 10px; font-size: 22px; }
.invite-modal p { color: var(--text-gray); margin-bottom: 25px; font-size: 14px; }

.input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  padding: 5px 5px 5px 20px;
  transition: all 0.3s;
}
.input-group:focus-within {
  border-color: var(--theme-start);
  box-shadow: 0 0 0 3px rgba(54, 188, 229, 0.1);
}
.input-group.has-error {
  border-color: #ef4444;
  animation: shake 0.4s ease-in-out;
}
.input-group input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 16px; color: var(--text-dark);
}
.input-group button {
  width: 40px; height: 40px; border-radius: 50%; border: none;
  background: linear-gradient(135deg, var(--theme-start), var(--theme-end));
  color: #fff; font-size: 18px; cursor: pointer; transition: transform 0.2s;
}
.input-group button:active { transform: scale(0.9); }
.error-msg { display: block; color: #ef4444; font-size: 12px; margin-top: 10px; }

/* =======================================================
   真实 Demo 渲染面板
   ======================================================= */
.demo-qr-panel {
  background: #fff; padding: 30px; border-radius: 16px; text-align: center;
  animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.demo-qr-panel h3 { color: var(--theme-end); margin-bottom: 20px; }
.demo-qr-img { width: 220px; height: 220px; border-radius: 8px; margin-bottom: 15px; }
.demo-qr-panel p { color: var(--text-gray); font-size: 13px; }

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}


/* 科技感网格背景 */
.tech-grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(54, 188, 229, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(54, 188, 229, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 0;
  mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
  -webkit-mask-image: radial-gradient(
    circle at center,
    black 40%,
    transparent 80%
  );
}
.mobile-fab-group {
  display: none;
}

/* =======================================================
   营业执照灯箱 (Lightbox)
   ======================================================= */
.license-link {
  color: var(--theme-start);
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
}
.license-link:hover {
  color: #fff;
  text-decoration: underline;
}

.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85); /* 深色护眼遮罩 */
  backdrop-filter: blur(8px); /* GPU 毛玻璃加速 */
  z-index: 99999; /* 绝对最高层级 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out; /* 提示用户点击空白处可缩小/关闭 */
}

.lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  cursor: default; /* 图片本体不可点击关闭 */
}

.lightbox-close {
  position: absolute;
  top: 30px;
  right: 40px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 40px;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.3s;
}
.lightbox-close:hover {
  transform: scale(1.2) rotate(90deg);
}

/* =======================================================
   移动端响应式降级 (Mobile Degradation) - 必须放在文件最末尾
   ======================================================= */
@media (max-width: 768px) {
  /* 导航栏物理平衡 */
  .menu {
    display: none;
  }
  /* 1. 移动端导航栏按钮 (绝对防御级渲染) */
  .mobile-nav-btn {
    display: block;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: bold;
    text-decoration: none;
    /* 物理阻断：强制纯白文字，并用 !important 斩断一切外部污染 */
    color: #ffffff !important;
    /* 物理阻断：强制注入纯色背景兜底，防止渐变失效 */
    background-color: #36bce5 !important;
    background-image: linear-gradient(135deg, #36bce5, #1d528d) !important;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(29, 82, 141, 0.2);
  }

  /* 首屏紧凑化与光影浓度提升 */
  .hero-section {
    padding: 40px 20px;
  }
  .hero-title {
    font-size: 32px;
    margin-bottom: 16px;
  }
  .hero-desc {
    font-size: 15px;
    margin-bottom: 30px;
    text-align: justify;
  } /* 两端对齐，消除锯齿边 */

  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  .btn {
    width: 100%;
    margin: 0;
  }
  /* 强制在手机端放大背景光球，填补空间空白 */
  .floating-orb {
    opacity: 0.6;
    filter: blur(30px);
  }
  .orb-1 {
    width: 220px;
    height: 220px;
    top: -50px;
    left: -50px;
  }
  .orb-2 {
    width: 180px;
    height: 180px;
    bottom: 0;
    right: -20px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .floating-nav {
    display: none;
  }
  /* =======================================================
     移动端 FAB 矩阵 (Floating Action Button)
     ======================================================= */
  /* 2. 移动端悬浮回顶引擎 */
  .mobile-fab-group {
    /* 👇 必须显式声明为 flex，才能覆盖外部的 display: none */
    display: flex;
    flex-direction: column;
    gap: 15px;

    position: fixed;
    right: 20px;
    bottom: 30px;
    z-index: 1000;
  }

  .top-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 强制硬编码深色底与白字 */
    background-color: #0f172a !important;
    color: #ffffff !important;
    box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3);

    opacity: 0;
    transform: translateY(20px) scale(0.8);
    pointer-events: none;
    transition:
      transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      opacity 0.3s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .top-btn.is-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .top-btn:active {
    transform: scale(0.9);
  }

  .beian-links {
    flex-direction: column;
    justify-content: center; /* 手机端恢复居中 */
    gap: 5px;
  }
  .separator {
    display: none;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
