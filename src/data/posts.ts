export type Motif = 'torii' | 'coffee' | 'wind' | 'books' | 'road' | 'lantern'
export type Palette = 'warm' | 'olive' | 'dusk'
export type Category = '学习' | '旅行' | '生活'

export interface Post {
  slug: string
  title: string
  date: string
  category: Category
  kind: string
  place: string
  stamp: string
  readTime: string
  excerpt: string
  motif: Motif
  palette: Palette
  tags: string[]
  featured: boolean
  sample: boolean
  markdown: string
}

export const categories: Category[] = ['学习', '旅行', '生活']

/* 极简 frontmatter 解析：--- 包围的 key: value 区块 + 正文 markdown。
   写文章只需要在 content/ 放一个 .md 文件，推送后自动构建上线。 */
function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { meta, body: match[2].trim() }
}

const MOTIFS: Motif[] = ['torii', 'coffee', 'wind', 'books', 'road', 'lantern']
const PALETTES: Palette[] = ['warm', 'olive', 'dusk']

const files = import.meta.glob('../../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { meta, body } = parseFrontmatter(raw)
    const motif = MOTIFS.includes(meta.motif as Motif) ? (meta.motif as Motif) : MOTIFS[slug.length % MOTIFS.length]
    const palette = PALETTES.includes(meta.palette as Palette) ? (meta.palette as Palette) : PALETTES[slug.length % PALETTES.length]
    const category: Category = meta.category === '学习' || meta.category === '生活' ? meta.category : '旅行'
    return {
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? '',
      category,
      kind: meta.kind || category,
      place: meta.place ?? '',
      stamp: meta.stamp ?? slug.toUpperCase().slice(0, 12),
      readTime: meta.readTime ?? '',
      excerpt: meta.excerpt ?? '',
      motif,
      palette,
      tags: meta.tags ? meta.tags.split(/[,，、]/).map((t) => t.trim()).filter(Boolean) : [],
      featured: meta.featured === 'true',
      sample: meta.sample === 'true',
      markdown: body,
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1))
