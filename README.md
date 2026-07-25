# xingyu-portal

`xingyu.pro` 官网落地页(行遇),前后端一体的门户站。

- 前端:Vue 3 + TypeScript + Vite
- 后端:Node + Express(`server/`)—— 托管前端构建产物 + 站点配置读写 API + SSE 实时推送
- 生产:Docker Compose,GitHub Actions self-hosted runner 部署到 aurora

> 命名与打包规矩见工作区 `.core/ai-context/04_命名与打包规范.md`,部署机制见 `05_部署规范.md`;本文件只讲本项目局部。

## 部署结构(现状)

| 项 | 值 |
|---|---|
| 标准名 / 仓库 | `xingyu-portal`(`aurora-vault/xingyu-portal`) |
| 镜像 | `xingyu/portal:latest` |
| 容器 / service | `xingyu-portal` / `portal` |
| 容器内端口 | `3000` |
| 服务器落地目录 | `/opt/projects/xingyu-portal` |
| NPM 反代 | `xingyu.pro` → `xingyu-portal:3000` |
| 持久化 | `server/data/site-config.json`(在线编辑产生的运行时内容) |

## 运行方式

本地开发(前端):

```bash
npm install
npm run dev
```

本地开发(后端,单独起 Express):

```bash
cd server
npm install
npm start          # Express on :3000,生产模式下同时托管 dist/
```

前端 dev 时,`/api` 经 Vite proxy 转发到 `http://localhost:3000`(见 `vite.config.ts`)。

生产部署(由 CI 执行,本地一般不手跑):

```bash
docker compose up -d --build
```

## 部署机制(self-hosted runner)

- 工作流:`.github/workflows/deploy.yml`
- 触发:`push` 到 `main`,或手动 `workflow_dispatch`;仅 `pxMan79` 触发
- runner:`aurora`(跑在服务器本地),步骤:
  1. `cd /opt/projects/xingyu-portal`
  2. `git fetch --all --prune` + `git reset --hard origin/main`
  3. `docker compose up -d --build --remove-orphans`
  4. `docker ps --filter name=xingyu-portal` 核验

> 详细部署红线与流程见工作区 `05_部署规范.md`。

## 站点配置与在线编辑

- 内容默认值:`src/config/site.ts`(`brand` / `nav` / `hero` / `about` / `features` / `product` / `roadmap` / `footer`)
- 运行时覆盖:`server/data/site-config.json`——页面加载时 `GET /api/site-config` 拉取并覆盖默认值
- 在线编辑:页面内置 `AdminPanel` 组件,凭 `ADMIN_PASSWORD` 登录后可改全站文案,保存写入 `site-config.json`,并经 `GET /api/site-config/events`(SSE)实时推送到所有在线访客浏览器

## 安全说明

- 真实 `.env`(`ADMIN_PASSWORD`)不提交,只保留 `.env.example`
- `server/data/site-config.json` 不提交(运行时数据)
- 管理员密码只保存在服务器本地 `.env`
