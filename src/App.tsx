import { FormEvent, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  fetchAdminIdentity,
  fetchManagedContent,
  fetchPublishedContent,
  loginAdmin,
  logoutAdmin,
  removeManagedContent,
  saveManagedContent,
  toManagedFallback,
  uploadImage,
} from './api'
import { content as fallbackContent, contentTypeLabels, navItems } from './data'
import { ArticleShare } from './components/ArticleShare'
import { useBotanicalMotion, useRouteEntrance } from './components/BotanicalMotion'
import { MarkdownContent } from './components/MarkdownContent'
import { PageMeta } from './components/PageMeta'
import type { AdminIdentity, ContentItem, ContentType, ManagedContent } from './types'

const Arrow = () => <span aria-hidden="true">↗</span>

const botanicalImages = {
  hero: '/images/botanical-hero-v1.webp',
  peony: '/images/botanical-peony-v1.webp',
  orchid: '/images/botanical-orchid-v1.webp',
  project: '/images/botanical-project-v1.webp',
  burgundy: '/images/botanical-burgundy-v1.webp',
} as const

function contentImage(item: ContentItem, index = 0) {
  if (item.coverImage) return item.coverImage
  if (item.type === 'project') return botanicalImages.project
  const rotation = [botanicalImages.peony, botanicalImages.orchid, botanicalImages.burgundy]
  return rotation[index % rotation.length]
}

const fallbackItems = fallbackContent.map(toManagedFallback)
const ContentContext = createContext<{ items: ManagedContent[]; refresh: () => Promise<void> }>({
  items: fallbackItems,
  refresh: async () => undefined,
})

function ContentProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ManagedContent[]>(fallbackItems)

  const refresh = async () => {
    try {
      setItems(await fetchPublishedContent())
    } catch {
      setItems(fallbackItems)
    }
  }

  useEffect(() => {
    let active = true
    fetchPublishedContent()
      .then((nextItems) => {
        if (active) setItems(nextItems)
      })
      .catch(() => {
        if (active) setItems(fallbackItems)
      })
    return () => {
      active = false
    }
  }, [])

  return <ContentContext.Provider value={{ items, refresh }}>{children}</ContentContext.Provider>
}

function useContent() {
  return useContext(ContentContext)
}

function withFallbackContent(items: ManagedContent[]) {
  const seen = new Set(items.map((item) => item.slug))
  return [...items, ...fallbackItems.filter((item) => !seen.has(item.slug))]
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'instant' })
      })
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { items } = useContent()
  const detailSlug = location.pathname.match(/^\/content\/([^/]+)/)?.[1]
  const detailType = detailSlug ? items.find((item) => item.slug === detailSlug)?.type : undefined
  const detailSection = detailType ? {
    article: '/articles',
    tool: '/tools',
    podcast: '/podcasts',
    project: '/projects',
    resource: '/resources',
  }[detailType] : undefined

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Help Myself 首页" onClick={() => setOpen(false)}>
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>Help Myself</span>
      </Link>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={open ? 'menu-lines is-open' : 'menu-lines'} aria-hidden="true"><i /><i /></span>
      </button>
      <nav className={open ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive || item.to === detailSection ? 'active' : undefined)}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
        <Link className="nav-search" to="/search" aria-label="搜索" onClick={() => setOpen(false)}>
          搜索
          <span>⌕</span>
        </Link>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <p className="footer-brand">Help Myself</p>
        <p>把真实使用过的经验，整理成可以帮助别人的内容。</p>
      </div>
      <div className="footer-links">
        <Link to="/projects">项目展厅</Link>
        <Link to="/about">关于 Flora</Link>
        <Link to="/admin">管理后台</Link>
      </div>
      <p className="copyright">Flora · 2026</p>
    </footer>
  )
}

function Layout({ children, immersive = false }: { children: React.ReactNode; immersive?: boolean }) {
  const location = useLocation()
  const scope = useRef<HTMLDivElement>(null)
  const isAdmin = location.pathname.startsWith('/admin')
  useRouteEntrance(scope, location.pathname, !isAdmin)

  return (
    <div ref={scope} className={`${immersive ? 'app journal-shell immersive' : 'app journal-shell'}${isAdmin ? '' : ' botanical-shell'}`}>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function ContentCard({ item, large = false, index = 0 }: { item: ContentItem; large?: boolean; index?: number }) {
  return (
    <Link to={`/content/${item.slug}`} className={large ? 'content-card large' : 'content-card'}>
      <div className="content-card-media">
        <img src={contentImage(item, index)} alt="" loading="lazy" />
        <span className="card-arrow"><Arrow /></span>
      </div>
      <div className="content-card-copy">
        <p className="card-category">{item.category}</p>
        <h3>{item.title}</h3>
        <p className="card-summary">{item.summary}</p>
        <div className="card-meta">
          <span>{item.date}</span>
          <span>{item.readTime}</span>
        </div>
      </div>
    </Link>
  )
}

function HomePage() {
  const { items } = useContent()
  const scope = useRef<HTMLDivElement>(null)
  useBotanicalMotion(scope)
  const catalog = withFallbackContent(items)
  const stories = catalog.filter((item) => item.type !== 'project' && item.type !== 'resource').slice(0, 5)
  const projects = catalog.filter((item) => item.type === 'project')
  const featuredProject = projects[0]

  return (
    <Layout>
      <div ref={scope} className="botanical-home">
        <section className="botanical-hero" aria-labelledby="hero-title">
          <img data-hero-image className="botanical-hero-image" src={botanicalImages.hero} alt="深色背景中的兰花、火鹤花与野花组合" />
          <div className="botanical-hero-shade" />
          <div className="botanical-hero-copy">
            <p data-hero-reveal className="botanical-kicker">Flora 的学习与创作花园</p>
            <h1 data-hero-reveal id="hero-title">
              <span>Help myself,</span>
              <em>help others.</em>
            </h1>
            <p data-hero-reveal className="botanical-intro">把 AI 学习、真实体验与项目过程种成一座可以慢慢探索的花园。</p>
            <div data-hero-reveal className="botanical-actions">
              <Link className="botanical-button primary" to="/articles">开始阅读</Link>
              <Link className="botanical-button secondary" to="/projects">进入项目展厅</Link>
            </div>
          </div>
          <div className="botanical-scroll-cue" aria-hidden="true"><span />继续探索</div>
        </section>

        <div className="botanical-marquee" aria-label="网站内容范围">
          <div>
            {[...Array(2)].flatMap(() => ['AI 学习', '真实使用体感', '播客感悟', '效率方法', '项目复盘']).map((label, index) => (
              <span key={`${label}-${index}`}>{label}<i /></span>
            ))}
          </div>
        </div>

        <section className="botanical-section botanical-stories" aria-labelledby="stories-title">
          <div className="botanical-section-heading" data-reveal>
            <div>
              <p>最近的记录</p>
              <h2 id="stories-title">从真实问题里，<br />长出自己的答案。</h2>
            </div>
            <Link to="/articles">查看全部内容 <Arrow /></Link>
          </div>
          <div className="botanical-bento">
            {stories.map((item, index) => (
              <Link
                data-reveal
                data-image-reveal
                key={item.slug}
                to={`/content/${item.slug}`}
                className={`botanical-story-card story-${index + 1}`}
              >
                <img src={contentImage(item, index)} alt="" loading={index < 2 ? 'eager' : 'lazy'} />
                <div className="botanical-card-shade" />
                <div className="botanical-card-copy">
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                  <span>{item.date.replaceAll('-', '.')} · {item.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="botanical-manifesto" data-image-reveal>
          <div className="botanical-manifesto-image"><img src={botanicalImages.burgundy} alt="酒红色大丽花与绿色叶材组成的花艺静物" loading="lazy" /></div>
          <div className="botanical-manifesto-copy" data-reveal>
            <p>我的内容原则</p>
            <h2>不是把答案端给你，<br />而是把探索过程留给你。</h2>
            <div className="botanical-principles">
              <article><h3>从真实问题开始</h3><p>只记录我真正遇见、使用和思考过的事情。</p></article>
              <article><h3>保留个人判断</h3><p>工具不只列功能，也会留下适合谁和为什么推荐。</p></article>
              <article><h3>把过程做成作品</h3><p>每个项目都会沉淀目标、方法、结果与复盘。</p></article>
            </div>
          </div>
        </section>

        <section className="botanical-section botanical-project-preview" aria-labelledby="project-preview-title">
          <div className="botanical-section-heading" data-reveal>
            <div>
              <p>正在生长的作品</p>
              <h2 id="project-preview-title">项目不只展示结果，<br />也保存它怎样发生。</h2>
            </div>
            <Link to="/projects">查看项目展厅 <Arrow /></Link>
          </div>
          <Link className="botanical-project-feature" to={featuredProject ? `/content/${featuredProject.slug}` : '/projects'} data-reveal data-image-reveal>
            <img src={featuredProject ? contentImage(featuredProject) : botanicalImages.project} alt="白色兰花与深色花材构成的项目主题静物" loading="lazy" />
            <div className="botanical-card-shade" />
            <div>
              <p>{featuredProject?.category || 'Flora 的项目档案'}</p>
              <h3>{featuredProject?.title || '第一个项目正在整理中'}</h3>
              <span>{featuredProject?.summary || '以后从后台发布的项目，会自动出现在这里。'}</span>
            </div>
          </Link>
        </section>

        <section className="botanical-closing" data-reveal>
          <p>继续走进这座花园</p>
          <h2>下一篇记录，<br />也许正好能帮到你。</h2>
          <div className="botanical-actions">
            <Link className="botanical-button primary" to="/search">搜索你需要的内容</Link>
            <Link className="botanical-button secondary" to="/about">认识 Flora</Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}

const collectionConfig: Record<string, { title: string; eyebrow: string; description: string; type?: ContentType }> = {
  articles: { title: '文章', eyebrow: 'Writing', description: '记录 AI、效率学习与生活中值得留下来的思考。', type: 'article' },
  tools: { title: 'AI 工具', eyebrow: 'AI field notes', description: '不是工具堆砌，而是 Flora 的真实使用体感、教程和判断。', type: 'tool' },
  podcasts: { title: '播客感悟', eyebrow: 'Listening notes', description: '从听见一句话开始，慢慢长出自己的想法。', type: 'podcast' },
  projects: { title: '项目作品', eyebrow: 'Building in public', description: '展示结果，也诚实记录制作过程里遇到的问题。', type: 'project' },
}

const toolFilters = ['全部', '使用体感', 'AI 对话', '自我提升', '学习', '效率办公'] as const
type ToolFilter = (typeof toolFilters)[number]

function toolMatchesFilter(item: ManagedContent, filter: ToolFilter) {
  if (filter === '全部') return true
  const text = [item.title, item.eyebrow, item.summary, item.category, ...item.tags].join(' ').toLowerCase()
  const keywords: Record<Exclude<ToolFilter, '全部'>, string[]> = {
    使用体感: ['使用体感', '体验', '评测'],
    'AI 对话': ['ai 对话', '对话工具', '聊天'],
    自我提升: ['自我提升', '复盘', '成长'],
    学习: ['学习', '知识', '阅读'],
    效率办公: ['效率', '办公', '工作流'],
  }
  return keywords[filter].some((keyword) => text.includes(keyword))
}

function CollectionPage({ page }: { page: keyof typeof collectionConfig }) {
  const { items: allItems } = useContent()
  const [toolFilter, setToolFilter] = useState<ToolFilter>('全部')
  const config = collectionConfig[page]
  const items = allItems.filter((item) => item.type === config.type)
  const availableToolFilters = toolFilters.filter((filter) => (
    filter === '全部' || items.some((item) => toolMatchesFilter(item, filter))
  ))
  const activeToolFilter = availableToolFilters.includes(toolFilter) ? toolFilter : '全部'
  const visibleItems = page === 'tools'
    ? items.filter((item) => toolMatchesFilter(item, activeToolFilter))
    : items

  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">{config.eyebrow}</p>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </section>
      <section className="page-content">
        {page === 'tools' && availableToolFilters.length > 1 && (
          <div className="filter-row" aria-label="筛选 AI 工具">
            {availableToolFilters.map((label) => (
              <button
                key={label}
                type="button"
                className={label === activeToolFilter ? 'active' : ''}
                aria-pressed={label === activeToolFilter}
                onClick={() => setToolFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="collection-grid">
          {visibleItems.map((item, index) => <ContentCard key={item.slug} item={item} index={index} />)}
        </div>
        {page === 'tools' && visibleItems.length === 0 && (
          <div className="no-results"><span>✦</span><h2>这个分类还在积累中</h2><p>可以先看看其他分类，Flora 会在真实使用后继续补充。</p></div>
        )}
      </section>
    </Layout>
  )
}

function ProjectPage() {
  const { items } = useContent()
  const scope = useRef<HTMLDivElement>(null)
  useBotanicalMotion(scope)
  const projects = withFallbackContent(items).filter((item) => item.type === 'project')

  return (
    <Layout>
      <div ref={scope} className="project-showcase">
        <section className="project-showcase-hero">
          <img data-hero-image src={botanicalImages.project} alt="白色兰花、黑色郁金香与尤加利叶构成的花艺静物" />
          <div className="project-showcase-shade" />
          <div>
            <p data-hero-reveal>Flora 的项目档案</p>
            <h1 data-hero-reveal>Ideas become<br /><em>something real.</em></h1>
            <span data-hero-reveal>这里保存产品、网站与实验项目的目标、过程、结果和复盘。</span>
          </div>
        </section>

        <section className="botanical-section project-archive" aria-labelledby="project-archive-title">
          <div className="botanical-section-heading" data-reveal>
            <div>
              <p>项目展厅</p>
              <h2 id="project-archive-title">每一次动手，<br />都是一次能力的生长。</h2>
            </div>
            <Link to="/about">了解我的创作方式 <Arrow /></Link>
          </div>

          {projects.length > 0 ? (
            <div className="botanical-project-accordion">
              {projects.map((project, index) => (
                <Link
                  key={project.slug}
                  to={`/content/${project.slug}`}
                  className="botanical-project-card"
                  style={{ backgroundImage: `url(${contentImage(project, index)})` }}
                >
                  <div className="botanical-card-shade" />
                  <div>
                    <p>{project.category}</p>
                    <h3>{project.title}</h3>
                    <span>{project.summary}</span>
                    <small>{project.date.replaceAll('-', '.')}</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="project-empty" data-reveal>
              <img src={botanicalImages.orchid} alt="深色背景中的紫色兰花" />
              <div><h2>第一个项目正在发芽。</h2><p>在后台把内容类型选择为“项目作品”并发布，它就会自动进入这个展厅。</p></div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}

function ResourcePage() {
  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">Resource library</p>
        <h1>资源库</h1>
        <p>只整理真正有用、来源清楚，也值得反复打开的内容。</p>
      </section>
      <section className="page-content">
        <div className="empty-state">
          <div className="empty-stars">✦ · ✧</div>
          <span>正在整理中</span>
          <h2>第一个资源包，还在路上。</h2>
          <p>这里暂时不会放置虚假的下载按钮。等 Flora 找到值得分享的内容，再认真补充说明和来源。</p>
          <Link to="/articles">先看看最新文章 <Arrow /></Link>
        </div>
      </section>
    </Layout>
  )
}

function AboutPage() {
  return (
    <Layout>
      <section className="about-hero">
        <div className="about-image" role="img" aria-label="酒红色花材与绿色叶片组成的暗色花艺静物" />
        <div className="about-copy">
          <p className="eyebrow">About Flora</p>
          <h1>Help myself,<br />help others.</h1>
          <p>你好，我是 Flora。这里不强调履历，也不假装知道所有答案。我只是把自己真正学过、用过和思考过的内容整理下来，希望它们也能在某个时刻帮助到你。</p>
          <div className="about-tags">
            <span>AI 探索</span>
            <span>效率学习</span>
            <span>播客感悟</span>
            <span>项目记录</span>
          </div>
        </div>
      </section>
    </Layout>
  )
}

function DetailPage() {
  const { slug } = useParams()
  const { items } = useContent()
  const item = items.find((entry) => entry.slug === slug)

  if (!item) return <NotFoundPage />

  return (
    <Layout>
      <article className="article-page">
        {item.type === 'project' && (
          <div className="project-detail-cover">
            <img src={contentImage(item)} alt="" />
            <div className="botanical-card-shade" />
          </div>
        )}
        <header className="article-header">
          <Link to={`/${item.type === 'article' ? 'articles' : item.type === 'tool' ? 'tools' : item.type === 'podcast' ? 'podcasts' : 'projects'}`} className="back-link">← 返回{contentTypeLabels[item.type]}</Link>
          <p className="eyebrow">{item.eyebrow}</p>
          <h1>{item.title}</h1>
          <p className="article-lead">{item.summary}</p>
          <div className="article-meta">
            <span>{item.date}</span>
            <span>{item.readTime}</span>
            <span>{item.category}</span>
          </div>
          {item.rating && (
            <div className="tool-rating">
              <span>Flora 推荐</span>
              <strong>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</strong>
              <p>适合：{item.suitableFor}</p>
            </div>
          )}
          {item.type === 'project' && item.externalUrl && (
            <a className="project-external-link" href={item.externalUrl} target="_blank" rel="noreferrer">访问项目 <Arrow /></a>
          )}
        </header>
        <div className="article-body">
          <MarkdownContent markdown={item.markdown ?? item.body.join('\n\n')} />
          <div className="article-tags">
            {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
          <ArticleShare item={item} />
        </div>
      </article>
    </Layout>
  )
}

function SearchPage() {
  const { items } = useContent()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const type = params.get('type') as ContentType | null
  const [value, setValue] = useState(query)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesType = !type || item.type === type
      const haystack = [item.title, item.summary, item.category, ...item.tags].join(' ').toLowerCase()
      return matchesType && (!normalized || haystack.includes(normalized))
    })
  }, [items, query, type])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = new URLSearchParams(params)
    if (value.trim()) next.set('q', value.trim())
    else next.delete('q')
    setParams(next)
  }

  const setType = (nextType: ContentType | null) => {
    const next = new URLSearchParams(params)
    if (nextType) next.set('type', nextType)
    else next.delete('type')
    setParams(next)
  }

  return (
    <Layout>
      <section className="search-page">
        <p className="eyebrow">Search the space</p>
        <h1>找到你正在寻找的内容</h1>
        <form className="search-box" onSubmit={submit}>
          <span aria-hidden="true">⌕</span>
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="输入关键词……" autoFocus />
          <button type="submit">搜索</button>
        </form>
        <div className="filter-row search-filters">
          <button className={!type ? 'active' : ''} onClick={() => setType(null)}>全部</button>
          {(Object.entries(contentTypeLabels) as [ContentType, string][]).filter(([key]) => key !== 'resource').map(([key, label]) => (
            <button key={key} className={type === key ? 'active' : ''} onClick={() => setType(key)}>{label}</button>
          ))}
        </div>
        <p className="result-count">{query ? `“${query}” 找到 ${results.length} 条内容` : `当前共有 ${results.length} 条示例内容`}</p>
        <div className="collection-grid">
          {results.map((item, index) => <ContentCard key={item.slug} item={item} index={index} />)}
        </div>
        {results.length === 0 && <div className="no-results"><span>✦</span><h2>暂时没有找到</h2><p>换一个更简单的关键词试试，或者浏览全部 AI 工具。</p></div>}
      </section>
    </Layout>
  )
}

type EditableContent = Omit<ManagedContent, 'id' | 'createdAt' | 'updatedAt'>

function blankContent(): EditableContent {
  return {
    slug: `new-content-${Date.now()}`,
    type: 'article',
    title: '',
    eyebrow: '',
    summary: '',
    category: '',
    tags: [],
    date: new Date().toISOString().slice(0, 10),
    readTime: '5 分钟',
    featured: false,
    markdown: '',
    body: [],
    status: 'draft',
    pinned: false,
    isSample: false,
  }
}

function editableContent(item: ManagedContent): EditableContent {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...editable } = item
  return editable
}

function AdminPage() {
  const { refresh } = useContent()
  const [checkingSession, setCheckingSession] = useState(true)
  const [admin, setAdmin] = useState<AdminIdentity | null>(null)
  const [items, setItems] = useState<ManagedContent[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<EditableContent | null>(null)
  const [previewMarkdown, setPreviewMarkdown] = useState(false)

  const loadItems = async () => setItems(await fetchManagedContent())

  useEffect(() => {
    fetchAdminIdentity()
      .then(async (identity) => {
        setAdmin(identity)
        await loadItems()
      })
      .catch(() => undefined)
      .finally(() => setCheckingSession(false))
  }, [])

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const identity = await loginAdmin(username, password)
      setAdmin(identity)
      setPassword('')
      await loadItems()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败。')
    } finally {
      setSaving(false)
    }
  }

  const beginCreate = () => {
    setEditingId(null)
    setDraft(blankContent())
    setPreviewMarkdown(false)
    setError('')
    setNotice('')
  }

  const beginEdit = (item: ManagedContent) => {
    setEditingId(item.id)
    setDraft(editableContent(item))
    setPreviewMarkdown(false)
    setError('')
    setNotice('')
  }

  const saveDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const saved = await saveManagedContent(draft, editingId ?? undefined)
      await loadItems()
      await refresh()
      setEditingId(saved.id)
      setDraft(editableContent(saved))
      setNotice(saved.status === 'published' ? '内容已保存并发布。' : '草稿已保存。')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存失败。')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async () => {
    if (editingId === null || !window.confirm('确定删除这篇内容吗？此操作无法撤销。')) return
    setSaving(true)
    try {
      await removeManagedContent(editingId)
      await loadItems()
      await refresh()
      setDraft(null)
      setEditingId(null)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '删除失败。')
    } finally {
      setSaving(false)
    }
  }

  const uploadCover = async (file?: File) => {
    if (!draft || !file) return
    setSaving(true)
    setError('')
    try {
      const url = await uploadImage(file)
      setDraft({ ...draft, coverImage: url })
      setNotice('图片上传成功，保存内容后生效。')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '上传失败。')
    } finally {
      setSaving(false)
    }
  }

  const exit = async () => {
    try { await logoutAdmin() } finally {
      setAdmin(null)
      setItems([])
      setDraft(null)
    }
  }

  if (checkingSession) {
    return <Layout><section className="admin-page"><div className="login-card"><span className="login-star">✦</span><p>正在检查登录状态……</p></div></section></Layout>
  }

  if (!admin) {
    return (
      <Layout>
        <section className="admin-page">
          <form className="login-card" onSubmit={submitLogin}>
            <span className="login-star">✦</span>
            <p className="eyebrow">Flora only</p>
            <h1>管理后台</h1>
            <p>使用 Supabase 中创建的管理员邮箱和密码登录。</p>
            <label className="login-field"><span>管理员邮箱</span><input type="email" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
            <label className="login-field"><span>密码</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={saving}>{saving ? '登录中……' : '登录'}</button>
            <Link to="/">返回网站</Link>
          </form>
        </section>
      </Layout>
    )
  }

  const publishedCount = items.filter((item) => item.status === 'published').length
  const draftCount = items.filter((item) => item.status === 'draft').length
  const pinnedCount = items.filter((item) => item.pinned).length

  return (
    <Layout>
      <section className="admin-page">
        <div className="dashboard">
          <aside>
            <Link className="brand" to="/"><span className="brand-star">✦</span> Help Myself</Link>
            <nav>
              <button className={!draft ? 'active' : ''} onClick={() => setDraft(null)}>内容管理</button>
              <button onClick={beginCreate}>新建内容</button>
              <Link to="/" target="_blank">预览网站 ↗</Link>
            </nav>
            <button className="exit-demo" onClick={exit}>退出登录</button>
          </aside>
          <div className="dashboard-main">
            {!draft ? (
              <>
                <header>
                  <div><p className="eyebrow">Dashboard</p><h1>你好，{admin.username}</h1></div>
                  <button className="primary-button" onClick={beginCreate}>＋ 新建内容</button>
                </header>
                <div className="stats-grid">
                  {[['草稿', draftCount], ['已发布', publishedCount], ['置顶内容', pinnedCount]].map(([label, value]) => (
                    <div key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
                <div className="recent-panel">
                  <div className="panel-title"><h2>全部内容</h2><span>{items.length} 条</span></div>
                  {items.map((item) => (
                    <div className="content-row" key={item.id}>
                      <span className={`type-dot ${item.type}`} />
                      <div><strong>{item.title}</strong><span>{contentTypeLabels[item.type]} · {item.date}</span></div>
                      <span className={`draft-status ${item.status}`}>{item.status === 'published' ? '已发布' : '草稿'}</span>
                      <button onClick={() => beginEdit(item)}>编辑</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <form className="editor-panel" onSubmit={saveDraft}>
                <header>
                  <div><p className="eyebrow">Content editor</p><h1>{editingId ? '编辑内容' : '新建内容'}</h1></div>
                  <button type="button" className="editor-close" onClick={() => setDraft(null)}>×</button>
                </header>
                <div className="editor-grid">
                  <label><span>内容类型</span><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as ContentType })}>{(Object.entries(contentTypeLabels) as [ContentType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>发布日期</span><input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label>
                  {draft.type === 'project' && <p className="wide editor-type-hint">发布后会自动进入公开的“项目展厅”，封面图将作为项目主视觉。</p>}
                  <label className="wide"><span>标题</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label>
                  <label><span>URL 标识</span><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required /></label>
                  <label><span>分类</span><input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>
                  <label className="wide"><span>卡片眉题</span><input value={draft.eyebrow} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} placeholder="例如：学习记录 · AI 入门" /></label>
                  <label className="wide"><span>摘要</span><textarea rows={3} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
                  <label><span>标签（用逗号分隔）</span><input value={draft.tags.join(', ')} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })} /></label>
                  <label><span>阅读时间</span><input value={draft.readTime} onChange={(event) => setDraft({ ...draft, readTime: event.target.value })} /></label>
                  {draft.type === 'tool' && <><label><span>推荐指数（1–5）</span><input type="number" min="1" max="5" value={draft.rating ?? ''} onChange={(event) => setDraft({ ...draft, rating: event.target.value ? Number(event.target.value) : undefined })} /></label><label><span>适合谁</span><input value={draft.suitableFor ?? ''} onChange={(event) => setDraft({ ...draft, suitableFor: event.target.value })} /></label></>}
                  <label className="wide"><span>外部链接</span><input type="url" value={draft.externalUrl ?? ''} onChange={(event) => setDraft({ ...draft, externalUrl: event.target.value })} placeholder="https://" /></label>
                  <label className="wide"><span>封面图</span><div className="upload-row"><input value={draft.coverImage ?? ''} onChange={(event) => setDraft({ ...draft, coverImage: event.target.value })} placeholder="上传后自动填写" /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => void uploadCover(event.target.files?.[0])} /></div></label>
                  <div className="wide markdown-editor-field">
                    <div className="editor-label-row">
                      <span>正文（Markdown）</span>
                      <div className="editor-mode-switch">
                        <button type="button" className={!previewMarkdown ? 'active' : ''} onClick={() => setPreviewMarkdown(false)}>编辑</button>
                        <button type="button" className={previewMarkdown ? 'active' : ''} onClick={() => setPreviewMarkdown(true)}>预览</button>
                      </div>
                    </div>
                    {previewMarkdown ? (
                      <div className="editor-markdown-preview">
                        <MarkdownContent markdown={draft.markdown ?? draft.body.join('\n\n')} />
                      </div>
                    ) : (
                      <>
                        <textarea
                          aria-label="正文（Markdown）"
                          className="body-editor"
                          rows={18}
                          value={draft.markdown ?? draft.body.join('\n\n')}
                          onChange={(event) => setDraft({
                            ...draft,
                            markdown: event.target.value,
                            body: event.target.value.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
                          })}
                          placeholder={'# 一级标题\n\n正文支持 **粗体**、列表、引用、代码和表格。\n\nhttps://www.bilibili.com/video/BV...'}
                        />
                        <details className="markdown-help">
                          <summary>Markdown 写作提示</summary>
                          <div>
                            <code># 标题</code>
                            <code>**粗体**</code>
                            <code>- 列表</code>
                            <code>&gt; 引用</code>
                            <code>![图片说明](图片链接)</code>
                            <code>[链接文字](https://example.com)</code>
                          </div>
                          <p>将完整的 B站或 YouTube 视频地址单独放一行，预览和文章页会自动显示播放器。</p>
                        </details>
                      </>
                    )}
                  </div>
                </div>
                <div className="editor-options">
                  <label><input type="checkbox" checked={draft.pinned} onChange={(event) => setDraft({ ...draft, pinned: event.target.checked })} />置顶</label>
                  <label><input type="checkbox" checked={draft.isSample} onChange={(event) => setDraft({ ...draft, isSample: event.target.checked })} />标记为示例内容</label>
                  <label><span>状态</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as 'draft' | 'published' })}><option value="draft">草稿</option><option value="published">发布</option></select></label>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                {notice && <p className="form-notice">{notice}</p>}
                <div className="editor-actions">
                  {editingId && <button type="button" className="danger-button" onClick={deleteItem} disabled={saving}>删除</button>}
                  <button type="button" className="secondary-button" onClick={() => setDraft(null)}>取消</button>
                  <button type="submit" className="primary-button" disabled={saving}>{saving ? '保存中……' : draft.status === 'published' ? '保存并发布' : '保存草稿'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}

function NotFoundPage() {
  return (
    <Layout>
      <section className="not-found">
        <span>404</span>
        <h1>这座花园里，还没有这条小径。</h1>
        <p>你访问的页面不存在，或者已经被 Flora 移走了。</p>
        <Link className="primary-button" to="/">回到首页</Link>
      </section>
    </Layout>
  )
}

function AppContent() {
  const { items } = useContent()

  return (
    <>
      <PageMeta items={items} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<CollectionPage page="articles" />} />
        <Route path="/tools" element={<CollectionPage page="tools" />} />
        <Route path="/podcasts" element={<CollectionPage page="podcasts" />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/resources" element={<ResourcePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/content/:slug" element={<DetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <AppContent />
    </ContentProvider>
  )
}
