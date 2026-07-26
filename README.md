# wandor · 纸上行迹

一本写在路上的旅行博客，部署在 [linhongjin.top](https://linhongjin.top)。

视觉语言来自 Wandor 式的暖纸手绘插画：奶油纸底、赭石与橄榄绿的风景、
打字机字标、毛玻璃卡片。所有文章封面都是手绘 SVG（山有等高线、树有枝脉、
坡上有草茬），配合位移滤镜与噪点，形成版画式的颗粒质感。

## 技术

- Vite + React + TypeScript + Tailwind CSS + lucide-react
- HashRouter，纯静态构建，GitHub Pages 托管
- 首页背景为视频素材，加载失败时回退到同风格的手绘 SVG 底稿

## 本地运行

```bash
npm install
npm run dev
```

## 部署

推送到 `main` 后，GitHub Actions 自动构建 `dist` 并发布到 GitHub Pages。
自定义域名由 `public/CNAME` 与 GitHub Pages 设置共同管理。

## 写文章

文章数据在 `src/data/posts.ts`：新增一个 `Post` 对象（标题、日期、摘要、
正文段落、封面图案 `motif` 与配色 `palette`），构建后自动出现在列表里。
