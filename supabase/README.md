# Supabase 初始化

1. 在 Supabase 创建一个新项目。
2. 打开 SQL Editor，完整运行 `migrations/202607120001_initial.sql`。
3. 在 Authentication → Users 中创建 Flora 的邮箱密码用户。
4. 复制该用户 UUID，在 SQL Editor 运行：

```sql
insert into public.admin_users (user_id)
values ('把用户 UUID 放在这里');
```

5. 从项目设置复制 Project URL 和 Publishable/anon key，写入本地 `.env.local`：

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

不要将 `service_role` 密钥放入前端、GitHub Actions或任何以 `VITE_` 开头的变量。

6. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中创建同名 secrets：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
