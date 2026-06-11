export interface Brand {
  name: string;
  fullName: string;
  slogan: string;
  colors: [string, string];
}

export interface NavItem {
  id: string;
  name: string;
}

export interface Hero {
  title: string;
  desc: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface About {
  title: string;
  desc: string;
  tags: string[];
}

export interface Feature {
  title: string;
  desc: string;
  icon: string;
}

export interface Product {
  title: string;
  desc: string;
  unlockText: string;
  inviteHash: number;
  qrCodeCipher: string;
  mockups: string[];
}

export interface RoadmapPhase {
  version: string;
  title: string;
  desc: string;
}

export interface Roadmap {
  title: string;
  phases: RoadmapPhase[];
}

export interface Footer {
  icp: string;
  gongAn: string;
  creditCode: string;
  licenseImg: string;
  phone: string;
  email: string;
  address: string;
  workHours: string;
}

export interface SiteData {
  brand: Brand;
  nav: NavItem[];
  hero: Hero;
  about: About;
  features: Feature[];
  product: Product;
  roadmap: Roadmap;
  footer: Footer;
}

// 引号里的内容想咋改咋改,别漏引号就行

export const siteData: Readonly<SiteData> = Object.freeze({
  brand: {
    name: "行遇",
    fullName: "行遇（武汉）网络科技有限公司",
    slogan: "让每一次出行都有温度",
    colors: ["#36bce5", "#1d528d"],
  },

  nav: [
    { id: "hero", name: "首页" },
    { id: "about", name: "关于我们" },
    { id: "business", name: "服务优势" },
    { id: "contact", name: "联系我们" },
  ],

  hero: {
    title: "专业的本地向导服务团队",
    desc: "深入城市肌理，体验纯粹的本地文化。行遇为您提供经过严格甄选的专业向导与定制化伴游服务，让旅途省心、安心、暖心。",
    ctaPrimary: "下载 App (内测中)",
    ctaSecondary: "预约向导",
  },

  about: {
    title: "关于行遇",
    desc: "行遇网络科技有限公司致力于提供高品质的本地化出行服务。我们拥有专业的全职与签约向导团队，通过标准化的服务流程与智能化的调度系统，为每位旅客提供专属的深度游体验方案。",
    tags: ["严选向导", "专属定制", "安全保障", "标准服务"],
  },

  features: [
    {
      title: "专属向导分配",
      desc: "根据您的出行需求与偏好，智能匹配最懂本地玩法的专业向导，提供一对一的高品质服务。",
      icon: "🎯",
    },
    {
      title: "个性化行程定制",
      desc: "告别千篇一律的打卡式旅游。向导将为您量身定制专属路线，深度体验地道风土人情。",
      icon: "🗺️",
    },
    {
      title: "全流程服务保障",
      desc: "提供完善的服务标准与售后支持。行程费用清晰透明，服务结束后结算，彻底保障您的权益。",
      icon: "🛡️",
    },
    {
      title: "实时响应与支持",
      desc: "7x24小时专属客服团队随时待命，为您的每一次出行保驾护航，解决旅途中的所有突发问题。",
      icon: "🎧",
    },
  ],

  product: {
    title: "终端产品体验",
    desc: "微信小程序端 Demo 已上线，提供完整的用户端发单与向导端接单状态机流转演示。",
    unlockText: "点击解锁 Demo",
    inviteHash: Number(import.meta.env.VITE_INVITE_HASH) || -969154679,
    qrCodeCipher: import.meta.env.VITE_QR_CIPHER || "4e151f471e565f",
    mockups: [
      "https://img.shabox.fun/@system/defaults/mockup1.png",
      "https://img.shabox.fun/@system/defaults/mockup2.png",
    ],
  },

  roadmap: {
    title: "业务与技术演进路线",
    phases: [
      {
        version: "第一阶段：标准化服务构建",
        title: "打造高品质本地向导标杆",
        desc: "建立严格的向导准入与培训体系，推出标准化的高品质伴游服务，跑通全链路的安全保障与服务闭环。",
      },
      {
        version: "第二阶段：数智化体验升级",
        title: "算法驱动的精准服务分发",
        desc: "引入 AI 智能匹配引擎，结合用户偏好与 LBS 数据，实现向导与旅客的毫秒级精准匹配，全面提升双端体验。",
      },
      {
        version: "第三阶段：全场景生态深化",
        title: "构建本地化出行数字引擎",
        desc: "开放更多城市服务节点，拓展沉浸式旅行社区生态。持续深化信息安全与数据合规体系建设，打造行业级信任中枢。",
      },
    ],
  },

  footer: {
    icp: "鄂ICP备2026025932号-1",
    gongAn: "鄂公网安备42018502009010号",
    creditCode: "统一社会信用代码：91420100MAKBNJMC9W",
    licenseImg: "https://img.shabox.fun/posts/210901di-yi/00.webp",
    phone: "",
    email: "hi@xingyu.pro",
    address:
      "湖北省武汉东湖新技术开发区光谷大道特1号国际企业中心三期1栋4层03号J866",
    workHours: "周一至周日 09:00 - 18:00",
  },
});
