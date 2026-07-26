// 构建后生成 RSS：读取 content/*.md 的 frontmatter，写入 dist/feed.xml
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = resolve(root, 'content')
const outFile = resolve(root, 'dist/feed.xml')
const SITE = 'https://linhongjin.top'

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: match[2].trim() }
}

const escape = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const posts = readdirSync(contentDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { meta } = parseFrontmatter(readFileSync(resolve(contentDir, f), 'utf8'))
    return { slug: f.replace(/\.md$/, ''), ...meta }
  })
  .filter((p) => p.title && p.date)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

const items = posts
  .map((p) => {
    const url = `${SITE}/#/post/${p.slug}`
    return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${escape(p.slug)}</guid>
      <pubDate>${new Date(p.date + 'T00:00:00+08:00').toUTCString()}</pubDate>
      ${p.category ? `<category>${escape(p.category)}</category>` : ''}
      <description>${escape(p.excerpt ?? '')}</description>
    </item>`
  })
  .join('\n')

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>wandor · 纸上行迹</title>
    <link>${SITE}</link>
    <description>学习、旅行、生活——把每一次出发，都写下来。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`

writeFileSync(outFile, feed)
console.log(`[feed] 已生成 dist/feed.xml（${posts.length} 篇）`)
