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
import { BrandMark } from './components/BrandMark'
import { useRouteEntrance, useStudioMotion } from './components/StudioMotion'
import { MarkdownContent } from './components/MarkdownContent'
import { PageMeta } from './components/PageMeta'
import type { AdminIdentity, ContentItem, ContentType, ManagedContent } from './types'

const Arrow = () => <span aria-hidden="true">↗</span>

const contentVisualLabels: Record<ContentType, string> = {
  article: 'NOTE',
  tool: 'AI',
  podcast: 'PLAY',
  project: 'BUILD',
  resource: 'FILE',
}

const studioNotes = [
  '工具只有进入真实场景，才会变成自己的方法。',
  '先留下过程，再慢慢整理出可以复用的答案。',
  '好的分享不是信息更多，而是判断更清楚。',
]

function ContentVisual({ item, index = 0, compact = false }: { item: ContentItem; index?: number; compact?: boolean }) {
  if (item.coverImage) {
    return (
      <div className={`system-cover-visual tone-${index % 4}${compact ? ' compact' : ''}`} aria-hidden="true">
        <img src={item.coverImage} alt="" loading="lazy" />
        <span>{item.category || contentVisualLabels[item.type]}</span>
      </div>
    )
  }

  return (
    <div className={`system-visual visual-${item.type} tone-${index % 4}${compact ? ' compact' : ''}`} aria-hidden="true">
      <div className="system-visual-toolbar"><i /><i /><i /><span>{contentVisualLabels[item.type]}</span></div>
      <div className="system-visual-grid">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="system-visual-chip">{item.category || contentVisualLabels[item.type]}</div>
      <strong>{contentVisualLabels[item.type]}</strong>
    </div>
  )
}

function SystemCanvas({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'system-canvas compact' : 'system-canvas'} aria-hidden="true">
      <div className="system-canvas-top"><span /><span /><span /><b>Help Myself / Workspace</b></div>
      <div className="system-canvas-body">
        <div className="system-canvas-rail"><i /><i /><i /><i /></div>
        <div className="system-canvas-main">
          <div className="system-canvas-heading"><span /><span /></div>
          <div className="system-canvas-cards"><i /><i /><i /></div>
          <div className="system-canvas-chart"><span /><span /><span /><span /><span /></div>
        </div>
      </div>
      <div className="system-float-widget widget-cyan">AI notes</div>
      <div className="system-float-widget widget-violet">Projects</div>
      <div className="system-float-widget widget-lime">Resources</div>
    </div>
  )
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
        <BrandMark />
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
    <div ref={scope} className={`${immersive ? 'app journal-shell immersive' : 'app journal-shell'}${isAdmin ? ' admin-shell' : ' studio-shell'}`}>
      {!isAdmin && <SiteHeader />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </div>
  )
}

function ContentCard({ item, large = false, index = 0 }: { item: ContentItem; large?: boolean; index?: number }) {
  return (
    <Link to={`/content/${item.slug}`} className={large ? 'content-card large' : 'content-card'}>
      <div className="content-card-media">
        <ContentVisual item={item} index={index} />
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
  const [noteIndex, setNoteIndex] = useState(0)
  useStudioMotion(scope)
  const catalog = withFallbackContent(items)
  const stories = catalog.filter((item) => item.type !== 'project' && item.type !== 'resource').slice(0, 5)
  const projects = catalog.filter((item) => item.type === 'project')
  const featuredProject = projects[0]

  return (
    <Layout>
      <div ref={scope} className="studio-home">
        <section className="studio-hero" aria-labelledby="hero-title">
          <div className="studio-hero-copy">
            <p data-hero-reveal className="studio-kicker">Help Myself / Flora 的个人博客</p>
            <h1 data-hero-reveal id="hero-title">
              记录学习，<span className="inline-system-preview" aria-hidden="true"><i /><i /><i /></span><br />
              <em>分享有用内容。</em>
            </h1>
            <p data-hero-reveal className="studio-intro">围绕 AI 工具、学习方法、播客思考和真实项目，建立一个清楚、可搜索、能持续更新的知识空间。</p>
            <div data-hero-reveal className="studio-actions">
              <Link className="studio-button primary" to="/articles">浏览最新文章</Link>
              <Link className="studio-button secondary" to="/projects">查看项目</Link>
            </div>
          </div>
          <div className="studio-hero-visual" data-hero-canvas><SystemCanvas /></div>
        </section>

        <div className="studio-topic-strip" aria-label="网站内容范围">
          <span>AI 工具与体感</span><span>学习方法</span><span>播客思考</span><span>项目复盘</span><span>资源整理</span>
        </div>

        <section className="studio-section studio-stories" aria-labelledby="stories-title">
          <div className="studio-section-heading" data-reveal>
            <div>
              <p>最近更新</p>
              <h2 id="stories-title">把正在学习的事，<br />整理成可以再次使用的内容。</h2>
            </div>
            <Link to="/articles">查看全部内容 <Arrow /></Link>
          </div>
          <div className="studio-bento">
            {stories.map((item, index) => (
              <Link
                data-reveal
                key={item.slug}
                to={`/content/${item.slug}`}
                className={`studio-story-card story-${index + 1}`}
              >
                <ContentVisual item={item} index={index} />
                <div className="studio-card-copy">
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                  <span>{item.date.replaceAll('-', '.')} · {item.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="studio-notes" aria-labelledby="studio-notes-title" data-reveal>
          <div>
            <p>最近在想</p>
            <h2 id="studio-notes-title">“{studioNotes[noteIndex]}”</h2>
          </div>
          <div className="studio-note-controls">
            <span>{String(noteIndex + 1).padStart(2, '0')} / {String(studioNotes.length).padStart(2, '0')}</span>
            <button type="button" aria-label="上一条" onClick={() => setNoteIndex((noteIndex - 1 + studioNotes.length) % studioNotes.length)}>←</button>
            <button type="button" aria-label="下一条" onClick={() => setNoteIndex((noteIndex + 1) % studioNotes.length)}>→</button>
          </div>
        </section>

        <section className="studio-pin-section">
          <div className="studio-pin-title">
            <p>内容原则</p>
            <h2>不追求信息更多，<br />只追求判断更清楚。</h2>
          </div>
          <div className="studio-principle-stack">
            <article className="studio-stack-card tone-cyan"><span>从真实问题开始</span><h3>只记录真正遇见、使用和思考过的事情。</h3><p>内容来自实际学习过程，不复制工具说明书。</p></article>
            <article className="studio-stack-card tone-violet"><span>保留个人判断</span><h3>不仅告诉你有什么，也说明适合谁和为什么。</h3><p>推荐指数、使用体感和限制都会被保留下来。</p></article>
            <article className="studio-stack-card tone-lime"><span>把过程做成作品</span><h3>每个项目都沉淀目标、方法、结果与复盘。</h3><p>项目展厅不是终点陈列，而是完整的制作档案。</p></article>
          </div>
        </section>

        <section className="studio-section studio-project-preview" aria-labelledby="project-preview-title">
          <div className="studio-section-heading" data-reveal>
            <div>
              <p>项目档案</p>
              <h2 id="project-preview-title">不仅展示结果，<br />也保存它怎样完成。</h2>
            </div>
            <Link to="/projects">查看全部项目 <Arrow /></Link>
          </div>
          <Link className="studio-project-feature" to={featuredProject ? `/content/${featuredProject.slug}` : '/projects'} data-reveal>
            <div className="studio-project-browser"><SystemCanvas compact /></div>
            <div className="studio-project-copy">
              <p>{featuredProject?.category || 'Flora 的项目档案'}</p>
              <h3>{featuredProject?.title || '第一个项目正在整理中'}</h3>
              <span>{featuredProject?.summary || '以后从后台发布的项目，会自动出现在这里。'}</span>
            </div>
          </Link>
        </section>

        <section className="studio-closing" data-reveal>
          <p>Help myself, help others.</p>
          <h2>从一个具体问题开始，<br />找到你现在需要的内容。</h2>
          <div className="studio-actions">
            <Link className="studio-button primary" to="/search">搜索站内内容</Link>
            <Link className="studio-button secondary" to="/about">认识 Flora</Link>
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
  useStudioMotion(scope)
  const projects = withFallbackContent(items).filter((item) => item.type === 'project')

  return (
    <Layout>
      <div ref={scope} className="project-showcase">
        <section className="project-showcase-hero">
          <div>
            <p data-hero-reveal>Flora 的项目档案</p>
            <h1 data-hero-reveal>把想法，<br /><em>做成真正能用的东西。</em></h1>
            <span data-hero-reveal>这里保存产品、网站与实验项目的目标、过程、结果和复盘。</span>
          </div>
          <div className="project-showcase-canvas" data-hero-canvas><SystemCanvas /></div>
        </section>

        <section className="studio-section project-archive" aria-labelledby="project-archive-title">
          <div className="studio-section-heading" data-reveal>
            <div>
              <p>项目展厅</p>
              <h2 id="project-archive-title">每一次动手，<br />都留下完整的制作档案。</h2>
            </div>
            <Link to="/about">了解我的创作方式 <Arrow /></Link>
          </div>

          {projects.length > 0 ? (
            <div className="studio-project-accordion">
              {projects.map((project, index) => (
                <Link
                  key={project.slug}
                  to={`/content/${project.slug}`}
                  className={`studio-project-card tone-${index % 4}`}
                >
                  <ContentVisual item={project} index={index} compact />
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
              <ContentVisual item={{ ...fallbackContent[0], type: 'project', category: '项目档案' }} />
              <div><h2>第一个项目正在整理。</h2><p>在后台把内容类型选择为“项目作品”并发布，它就会自动进入这个展厅。</p></div>
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
        <div className="about-image" role="img" aria-label="Help Myself 知识工作台示意图"><SystemCanvas compact /></div>
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
            <ContentVisual item={item} />
          </div>
        )}
        {item.type !== 'project' && item.coverImage && (
          <figure className="article-feature-image">
            <img src={item.coverImage} alt={`${item.title}封面`} />
          </figure>
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
    return <Layout><section className="admin-page"><div className="login-card"><BrandMark /><p>正在检查登录状态……</p></div></section></Layout>
  }

  if (!admin) {
    return (
      <Layout>
        <section className="admin-page">
          <form className="login-card" onSubmit={submitLogin}>
            <BrandMark />
            <p className="eyebrow">仅限 Flora</p>
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
            <Link className="brand" to="/"><BrandMark /><span>Help Myself</span></Link>
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
                  <div><p className="eyebrow">内容工作台</p><h1>你好，{admin.username}</h1></div>
                  <button className="primary-button" onClick={beginCreate}>新建内容</button>
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
                          placeholder={'# 一级标题\n\n正文支持 **粗体**、列表、引用、代码和表格。\n\n粘贴 B站或 YouTube 视频链接，即可在文章中直接播放。'}
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
        <h1>这个页面，还没有被整理进系统。</h1>
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
