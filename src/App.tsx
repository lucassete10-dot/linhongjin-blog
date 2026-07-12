import { FormEvent, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
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
import type { AdminIdentity, ContentItem, ContentType, ManagedContent } from './types'

const Arrow = () => <span aria-hidden="true">↗</span>

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
    void refresh()
  }, [])

  return <ContentContext.Provider value={{ items, refresh }}>{children}</ContentContext.Provider>
}

function useContent() {
  return useContext(ContentContext)
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

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Help Myself 首页">
        <span className="brand-star">✦</span>
        <span>Help Myself</span>
      </Link>
      <button
        className="menu-button"
        type="button"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? '×' : '☰'}</span>
      </button>
      <nav className={open ? 'site-nav is-open' : 'site-nav'} aria-label="主导航">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
        <Link className="nav-search" to="/search" aria-label="搜索">
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
        <p className="footer-brand">Help Myself <span>✦</span></p>
        <p>Help myself, help others.</p>
      </div>
      <div className="footer-links">
        <Link to="/about">关于 Flora</Link>
        <Link to="/resources">资源库</Link>
        <Link to="/admin">管理后台</Link>
      </div>
      <p className="copyright">© 2026 Flora</p>
    </footer>
  )
}

function Layout({ children, immersive = false }: { children: React.ReactNode; immersive?: boolean }) {
  return (
    <div className={immersive ? 'app immersive' : 'app'}>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function SearchBox({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = value.trim()
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <form className={compact ? 'search-box compact' : 'search-box'} onSubmit={submit}>
      <span aria-hidden="true">⌕</span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="搜索文章、AI 工具、播客和项目……"
        aria-label="搜索站内内容"
      />
      <button type="submit">搜索</button>
    </form>
  )
}

function ContentCard({ item, large = false }: { item: ContentItem; large?: boolean }) {
  return (
    <Link to={`/content/${item.slug}`} className={large ? 'content-card large' : 'content-card'}>
      <div className="card-topline">
        <span>{item.eyebrow}</span>
        <span className="card-arrow"><Arrow /></span>
      </div>
      <div>
        <p className="card-category">{item.category}</p>
        <h3>{item.title}</h3>
        <p className="card-summary">{item.summary}</p>
      </div>
      <div className="card-meta">
        <span>{item.date}</span>
        <span>{item.readTime}</span>
      </div>
    </Link>
  )
}

function MiniEmpty({ label }: { label: string }) {
  return <div className="mini-empty"><span>✦</span><p>{label}</p></div>
}

function HomePage() {
  const { items } = useContent()
  const portalPanel = useRef<HTMLDivElement>(null)
  const [portalVisible, setPortalVisible] = useState(false)
  const articles = items.filter((item) => item.type === 'article').slice(0, 2)
  const tools = items.filter((item) => item.type === 'tool').slice(0, 2)
  const podcast = items.find((item) => item.type === 'podcast')
  const project = items.find((item) => item.type === 'project')

  useEffect(() => {
    const panel = portalPanel.current
    if (!panel) return
    if (!('IntersectionObserver' in window)) {
      setPortalVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPortalVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05 },
    )
    observer.observe(panel)
    return () => observer.disconnect()
  }, [])

  return (
    <Layout immersive>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="hero-kicker"><span>✦</span> Flora's AI learning space</p>
          <h1 id="hero-title">Help myself,<br />help others.</h1>
          <p className="hero-note">和 Flora 一起探索 AI、学习与生活里的小小可能。</p>
        </div>
        <button
          className="scroll-cue"
          type="button"
          onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span>向下探索</span>
          <i aria-hidden="true">↓</i>
        </button>
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
      </section>

      <section className="portal" id="explore">
        <div className="portal-glow" />
        <div ref={portalPanel} className={portalVisible ? 'portal-panel is-visible' : 'portal-panel'}>
          <div className="section-heading intro-heading">
            <div>
              <p className="eyebrow">Explore the space</p>
              <h2>从一个好问题开始</h2>
            </div>
            <p>这里没有唯一正确的学习路线，只有 Flora 真正使用过、思考过，也愿意分享给你的内容。</p>
          </div>
          <SearchBox />

          <div className="home-block">
            <div className="block-heading">
              <div>
                <p className="eyebrow">Latest writing</p>
                <h2>最新文章</h2>
              </div>
              <Link to="/articles">查看全部 <Arrow /></Link>
            </div>
            <div className="card-grid two-col">
              {articles.map((item, index) => <ContentCard key={item.slug} item={item} large={index === 0} />)}
            </div>
          </div>

          <div className="home-block tools-block">
            <div className="block-heading">
              <div>
                <p className="eyebrow">AI field notes</p>
                <h2>AI 工具导航</h2>
              </div>
              <Link to="/tools">查看全部 <Arrow /></Link>
            </div>
            <div className="tool-categories" aria-label="AI 工具分类">
              {['使用体感', 'AI 对话', '自我提升', '学习', '效率办公'].map((label, index) => (
                <Link to="/tools" key={label}>
                  <span>0{index + 1}</span>
                  {label}
                </Link>
              ))}
            </div>
            <div className="card-grid two-col">
              {tools.map((item) => <ContentCard key={item.slug} item={item} />)}
            </div>
          </div>

          <div className="resource-banner">
            <div>
              <p className="eyebrow">Resource library</p>
              <h2>把真正有用的东西，慢慢整理在一起。</h2>
              <p>资源库正在准备中。以后这里会放 Flora 亲自筛选和说明过的学习资源。</p>
            </div>
            <Link className="circle-link" to="/resources" aria-label="前往资源库"><Arrow /></Link>
          </div>

          <div className="home-split">
            <div>
              <div className="block-heading compact-heading">
                <div>
                  <p className="eyebrow">Listening notes</p>
                  <h2>播客感悟</h2>
                </div>
              </div>
              {podcast ? <ContentCard item={podcast} /> : <MiniEmpty label="暂无播客感悟" />}
            </div>
            <div>
              <div className="block-heading compact-heading">
                <div>
                  <p className="eyebrow">Building in public</p>
                  <h2>项目作品</h2>
                </div>
              </div>
              {project ? <ContentCard item={project} /> : <MiniEmpty label="暂无项目" />}
            </div>
          </div>

          <div className="meet-flora">
            <div className="flora-avatar" aria-hidden="true" />
            <div>
              <p className="eyebrow">Meet Flora</p>
              <h2>你好，我是 Flora。</h2>
              <p>一个正在学习如何使用 AI，也愿意把过程分享出来的普通创作者。</p>
            </div>
            <Link to="/about">认识我 <Arrow /></Link>
          </div>

          <div className="qq-placeholder">
            <span className="qq-icon">Q</span>
            <div>
              <p className="eyebrow">Community</p>
              <h2>QQ 群正在筹备中</h2>
              <p>等这里准备好，我们可以一起聊 AI、学习和正在做的项目。</p>
            </div>
            <span className="status-pill">Coming soon</span>
          </div>
        </div>
      </section>
    </Layout>
  )
}

const collectionConfig: Record<string, { title: string; eyebrow: string; description: string; type?: ContentType }> = {
  articles: { title: '文章', eyebrow: 'Writing', description: '记录 AI、效率学习与生活中值得留下来的思考。', type: 'article' },
  tools: { title: 'AI 工具', eyebrow: 'AI field notes', description: '不是工具堆砌，而是 Flora 的真实使用体感、教程和判断。', type: 'tool' },
  podcasts: { title: '播客感悟', eyebrow: 'Listening notes', description: '从听见一句话开始，慢慢长出自己的想法。', type: 'podcast' },
  projects: { title: '项目作品', eyebrow: 'Building in public', description: '展示结果，也诚实记录制作过程里遇到的问题。', type: 'project' },
}

function CollectionPage({ page }: { page: keyof typeof collectionConfig }) {
  const { items: allItems } = useContent()
  const config = collectionConfig[page]
  const items = allItems.filter((item) => item.type === config.type)

  return (
    <Layout>
      <section className="page-hero">
        <p className="eyebrow">{config.eyebrow}</p>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </section>
      <section className="page-content">
        {page === 'tools' && (
          <div className="filter-row">
            {['全部', '使用体感', 'AI 对话', '自我提升', '学习', '效率办公'].map((label) => (
              <button key={label} className={label === '全部' ? 'active' : ''}>{label}</button>
            ))}
          </div>
        )}
        <div className="collection-grid">
          {items.map((item) => <ContentCard key={item.slug} item={item} />)}
        </div>
      </section>
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
          <div className="empty-stars">✦　·　✧</div>
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
        <div className="about-image" role="img" aria-label="Flora 与黑猫站在雪山上" />
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
        </header>
        <div className="article-body">
          {item.body.map((paragraph, index) => (
            <p key={`${item.slug}-${index}`}>{paragraph}</p>
          ))}
          <div className="article-tags">
            {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
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
    value.trim() ? next.set('q', value.trim()) : next.delete('q')
    setParams(next)
  }

  const setType = (nextType: ContentType | null) => {
    const next = new URLSearchParams(params)
    nextType ? next.set('type', nextType) : next.delete('type')
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
          {results.map((item) => <ContentCard key={item.slug} item={item} />)}
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
    setError('')
    setNotice('')
  }

  const beginEdit = (item: ManagedContent) => {
    setEditingId(item.id)
    setDraft(editableContent(item))
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
                  <label className="wide"><span>正文（段落之间空一行）</span><textarea className="body-editor" rows={14} value={draft.body.join('\n\n')} onChange={(event) => setDraft({ ...draft, body: event.target.value.split(/\n{2,}/) })} /></label>
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
        <h1>这片雪地还没有足迹。</h1>
        <p>你访问的页面不存在，或者已经被 Flora 移走了。</p>
        <Link className="primary-button" to="/">回到首页</Link>
      </section>
    </Layout>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<CollectionPage page="articles" />} />
        <Route path="/tools" element={<CollectionPage page="tools" />} />
        <Route path="/podcasts" element={<CollectionPage page="podcasts" />} />
        <Route path="/projects" element={<CollectionPage page="projects" />} />
        <Route path="/resources" element={<ResourcePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/content/:slug" element={<DetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ContentProvider>
  )
}
