# Help Myself

Flora 的 AI 学习与探索空间。面向对 AI 感兴趣的同学，分享工具体验、学习记录、播客感悟与个人项目。

品牌口号：**Help myself, help others.**

## 技术结构

- React + Vite：网站与可视化后台
- GitHub Pages：静态网站托管与自定义域名
- Supabase Auth：Flora 管理员邮箱密码登录
- Supabase Postgres：文章和工具等内容
- Supabase Storage：封面图片
- Row Level Security：公开访客只读，Flora 管理员可写

## 文档

- [产品需求文档](docs/PRODUCT_SPEC.md)
- [页面与交互蓝图](docs/UX_BLUEPRINT.md)
- [后台内容模型](docs/CMS_CONTENT_MODEL.md)
- [后台使用说明](docs/ADMIN_GUIDE.md)
- [Supabase 初始化](supabase/README.md)
- [Flora 品牌主视觉](assets/brand/flora-hero-v1.png)

## 本地配置

复制 `.env.example` 为 `.env.local`，填写 Supabase 项目的 Project URL 和 Publishable/anon key：

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`service_role` 密钥绝不能放进前端或任何 `VITE_` 变量。

## 本地运行

```bash
npm install
npm run dev
```

## 检查

```bash
npm run build
npm run qa:visual
```

## 部署

推送到 `main` 后，GitHub Actions 会构建 `dist` 并部署至 GitHub Pages。Actions 需要以下仓库 secrets：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

自定义域名由 `public/CNAME` 和 GitHub Pages 设置共同管理，当前为 `linhongjin.top`。
