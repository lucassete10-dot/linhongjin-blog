// 一次性迁移：从旧 Help Myself 的 Supabase 导出全部已发布文章，
// 转成本站的 Markdown 格式写入 content-import/（不进 content/，
// 即导出结果不会自动上线——由博主审核清单后再移入 content/）。
// 在 GitHub Actions 里运行（Actions 服务器可访问 supabase.co）。

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// 支持 --out <目录>：部署流程用它把导出结果放进 dist/export 随站发布
const outArg = process.argv.indexOf('--out')
const outDir = resolve(root, outArg > -1 ? process.argv[outArg + 1] : 'content-import')

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('[export] 缺少 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const query = '/rest/v1/contents?status=eq.published&select=*&order=published_date.desc'
const response = await fetch(url + query, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
  signal: AbortSignal.timeout(30000),
})
if (!response.ok) {
  console.error(`[export] 拉取失败 HTTP ${response.status}`)
  process.exit(1)
}
const rows = await response.json()

// 旧内容类型 → 新博客的分类与展示标签
const typeMap = {
  article: { category: '学习', kind: '学习记录', motif: 'books', palette: 'olive' },
  tool: { category: '学习', kind: 'AI 工具', motif: 'coffee', palette: 'olive' },
  podcast: { category: '生活', kind: '播客感悟', motif: 'wind', palette: 'dusk' },
  project: { category: '学习', kind: '项目复盘', motif: 'road', palette: 'warm' },
  resource: { category: '学习', kind: '资源整理', motif: 'books', palette: 'warm' },
}

mkdirSync(outDir, { recursive: true })
const lines = []
for (const row of rows) {
  const map = typeMap[row.type] ?? typeMap.article
  const meta = [
    '---',
    `title: ${row.title}`,
    `date: ${row.published_date}`,
    `category: ${map.category}`,
    `kind: ${row.category || map.kind}`,
    `stamp: ${(row.slug || 'note').toUpperCase().replace(/-/g, ' ').slice(0, 16)}`,
    `readTime: ${row.read_time || ''}`,
    `excerpt: ${(row.summary || '').replace(/\r?\n/g, ' ')}`,
    `motif: ${map.motif}`,
    `palette: ${map.palette}`,
    `tags: ${(row.tags ?? []).join(', ')}`,
    'sample: false',
    '---',
    '',
  ].join('\n')
  const body = row.markdown || (row.body ?? []).join('\n\n')
  writeFileSync(resolve(outDir, `${row.slug}.md`), meta + body + '\n')
  lines.push(`- ${row.published_date} · [${row.type}] ${row.title}`)
}

writeFileSync(resolve(outDir, '_清单.md'), `# Supabase 导出清单（${rows.length} 篇）\n\n${lines.join('\n')}\n`)
writeFileSync(
  resolve(outDir, 'index.json'),
  JSON.stringify(
    rows.map((r) => ({ slug: r.slug, type: r.type, title: r.title, date: r.published_date, category: r.category })),
    null,
    2,
  ) + '\n',
)
console.log(`[export] 已导出 ${rows.length} 篇到 ${outDir}`)
console.log(lines.join('\n'))
