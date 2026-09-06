# 林泓锦的个人博客

域名：<https://linhongjin.top>。React + TypeScript + Vite，部署于 GitHub Pages。

视觉参考 [Oil](https://www.oiloil.org/) 的网格、留白、大字和黄色点缀，重新设计为个人项目与写作空间。人物插图为原创 SVG，未使用参考站的图片、代码或品牌素材。

## 本地运行

```sh
npm ci
npm run dev
```

发布构建与浏览器检查：

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

本地测试默认使用 Chrome；CI 使用 Playwright Chromium。也可执行 `npm run preview` 预览发布产物。

## 内容与功能

- 首页包含项目、文章、关于和交流；项目卡片为前端交互示意，真实项目链接指向 GitHub。
- `content/*.md` 管理文章，支持 Markdown、标签、分类和视频嵌入。
- 保留原文章文件和 `/#/post/:slug` 链接。标记 `sample: true` 的旧示例只在原链接展示，并明确标记；首页、搜索、文章列表及 RSS 排除示例。
- 全站搜索支持 Ctrl/Cmd + K、Escape；文章列表筛选条件保存在 URL 中。
- `src/App.tsx` 管理个人介绍和页面，`src/components/ProjectShowcase.tsx` 管理项目，`src/index.css` 管理视觉样式。
- RSS 在构建时生成到 `/feed.xml`；分享图片和图标位于 `public/`。
- 沿用原 GoatCounter 统计配置。

## 发布

PR 执行构建与浏览器检查；合并到 `main` 后现有 GitHub Actions 自动部署 Pages。`public/CNAME` 保留 `linhongjin.top`，无需更改 DNS。使用 HashRouter 兼容静态托管和历史文章地址。

旧媒体文件保留以兼容历史内容；新版首页不再加载旧视频背景。
