# xingyu-web

`xingyu-web` 是 `xingyu.pro` 门户站的源码仓库，包含：

- Vue 3 + TypeScript + Vite 前端
- Express 配置服务与静态文件托管
- Docker / Docker Compose 生产编排
- GitHub Actions 自动同步到服务器

## 部署结构

- 仓库目录：`/opt/projects/xingyu-web`
- 容器服务：`xingyu-web-site-1`
- 站点端口：容器内 `3000`
- NPM 上游：`xingyu-web:3000`
- 持久化数据：`server/data/site-config.json`

## 运行方式

- 本地开发：
  - `npm install`
  - `npm run dev`
- 服务端开发：
  - `cd server`
  - `npm install`
  - `npm start`
- 生产部署：
  - `docker compose up -d --build`

## GitOps

- 工作流文件：`.github/workflows/sync.yml`
- 触发分支：`master`
- 服务器同步逻辑：
  - 更新 `/opt/projects/xingyu-web`
  - 保留服务器本地 `.env`
  - 保留服务器本地 `server/data/site-config.json`
  - 重新执行 `docker compose up -d --build --remove-orphans`

## 安全说明

- 真实 `.env` 不提交到 Git
- `server/data/site-config.json` 不提交到 Git
- 管理员密码只保存在服务器本地 `.env`
