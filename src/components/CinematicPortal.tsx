import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { categories, posts, type Category, type Post } from '@/data/posts'

type PortalView = 'home' | 'articles' | 'about'

const portalBackgrounds: Record<'home' | '学习' | '旅行' | '生活' | 'about', string> = {
  home: '/media/characters/hero-yuta.webp',
  学习: '/media/characters/hero-study.webp',
  旅行: '/media/characters/hero-travel.webp',
  生活: '/media/characters/hero-life.webp',
  about: '/media/characters/hero-about.webp',
}

const categoryCopy: Record<Category, { eyebrow: string; title: string; description: string }> = {
  学习: {
    eyebrow: 'LEARN / BUILD / REFLECT',
    title: '学习',
    description: '记录 AI 工具、效率方法、项目实践，以及真正改变了我学习方式的东西。',
  },
  旅行: {
    eyebrow: 'CITY / ROAD / WEATHER',
    title: '旅行',
    description: '城市、山海与偶然经过的风景。把路上的感受留下来，再慢慢理解它们。',
  },
  生活: {
    eyebrow: 'DAILY / INNER / GROWTH',
    title: '生活',
    description: '那些尚未形成答案，却值得认真保存的想法、感受与自我成长记录。',
  },
}

const navItems: Array<{ label: string; category?: Category; view?: PortalView }> = [
  { label: '首页', view: 'home' },
  ...categories.map((category) => ({ label: category, category })),
  { label: '关于', view: 'about' },
]

function portalKey(view: PortalView, activeCategory: Category | null, query: string) {
  if (view === 'home') return 'home'
  if (view === 'about') return 'about'
  if (query) return '学习'
  return activeCategory ?? '学习'
}

function latestRealPost(items: Post[]) {
  return items.find((post) => !post.sample && post.featured) ?? items.find((post) => !post.sample) ?? items[0]
}

export function CinematicPortal({ view }: { view: PortalView }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const rawCategory = params.get('cat') as Category | null
  const activeCategory = rawCategory && categories.includes(rawCategory) ? rawCategory : null
  const [searchValue, setSearchValue] = useState(query)

  useEffect(() => {
    setSearchValue(query)
  }, [query])

  useEffect(() => {
    Object.values(portalBackgrounds).forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      if (view === 'articles' && activeCategory && post.category !== activeCategory) return false
      if (!query) return true
      return [post.title, post.excerpt, post.place, post.kind, post.category, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    })
  }, [activeCategory, query, view])

  const featured = latestRealPost(visiblePosts)
  const backgroundKey = portalKey(view, activeCategory, query)
  const background = portalBackgrounds[backgroundKey]

  const goItem = (item: (typeof navItems)[number]) => {
    if (item.view === 'home') navigate('/')
    else if (item.view === 'about') navigate('/about')
    else if (item.category) navigate(`/articles?cat=${encodeURIComponent(item.category)}`)
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery = searchValue.trim()
    navigate(nextQuery ? `/articles?q=${encodeURIComponent(nextQuery)}` : '/articles')
  }

  const heading =
    view === 'home'
      ? { eyebrow: "FLORA'S FIELD NOTES", title: 'Help myself,\nhelp others.', description: '把 AI、学习、旅行和生活里真正有用的东西整理下来，也记录每一次重新认识自己的过程。' }
      : view === 'about'
        ? { eyebrow: 'ABOUT FLORA', title: '保留好奇，\n也保留自己的判断。', description: '这里不强调履历，也不假装拥有所有答案。只是诚实记录我学过、做过和想明白的事情，希望它们也能帮助到你。' }
        : query
          ? { eyebrow: 'SEARCH RESULTS', title: `关于「${query}」`, description: `共找到 ${visiblePosts.length} 篇相关内容。` }
          : activeCategory
            ? categoryCopy[activeCategory]
            : { eyebrow: 'ALL FIELD NOTES', title: '全部文章', description: '学习、旅行与生活，都收在同一个不断生长的空间里。' }

  const activeLabel =
    view === 'home' ? '首页' : view === 'about' ? '关于' : activeCategory ?? (query ? '搜索' : '文章')

  return (
    <section className="cinematic-portal" aria-labelledby="portal-title">
      <div className="portal-background" key={backgroundKey} aria-hidden="true">
        <img src={background} alt="" />
      </div>
      <div className="portal-ink" aria-hidden="true" />
      <div className="portal-grid" aria-hidden="true" />

      <header className="portal-header">
        <Link to="/" className="portal-brand" aria-label="Help Myself 首页">
          <span className="portal-brand-mark">HM</span>
          <span>Help Myself</span>
        </Link>

        <nav className="portal-navigation" aria-label="主导航">
          {navItems.map((item) => {
            const active =
              item.view === view ||
              Boolean(item.category && view === 'articles' && item.category === activeCategory)
            return (
              <button
                type="button"
                key={item.label}
                className={active ? 'active' : ''}
                aria-current={active ? 'page' : undefined}
                onClick={() => goItem(item)}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <form className="portal-search" onSubmit={submitSearch}>
          <Search aria-hidden="true" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="搜索文章"
            aria-label="搜索文章"
          />
          <button type="submit" aria-label="提交搜索">
            <ArrowUpRight aria-hidden="true" />
          </button>
        </form>
      </header>

      <main className="portal-stage" key={`${backgroundKey}-${query}`}>
        <section className="portal-copy">
          <p>{heading.eyebrow}</p>
          <h1 id="portal-title">
            {heading.title.split('\n').map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="portal-description">{heading.description}</p>
          {view === 'about' ? (
            <Link className="portal-primary-action" to="/articles">
              浏览全部内容 <ArrowUpRight aria-hidden="true" />
            </Link>
          ) : featured ? (
            <Link className="portal-primary-action" to={`/post/${featured.slug}`}>
              阅读最新内容 <ArrowUpRight aria-hidden="true" />
            </Link>
          ) : null}
        </section>

        {view === 'about' ? (
          <aside className="portal-about-card">
            <p>Help myself, help others.</p>
            <dl>
              <div><dt>持续关注</dt><dd>AI · 学习 · 个人成长</dd></div>
              <div><dt>正在实践</dt><dd>写作 · 产品 · 长期主义</dd></div>
              <div><dt>交流入口</dt><dd>QQ 群位置预留</dd></div>
            </dl>
          </aside>
        ) : (
          <section className="portal-feed" aria-label={query ? '搜索结果' : '最近更新'}>
            <div className="portal-feed-heading">
              <span>{query ? '搜索结果' : activeCategory ? `${activeCategory}更新` : '最近更新'}</span>
              <span>{String(visiblePosts.length).padStart(2, '0')} 篇</span>
            </div>
            {visiblePosts.length > 0 ? (
              <div className="portal-reading-list">
                {visiblePosts.slice(0, 3).map((post, index) => (
                  <Link to={`/post/${post.slug}`} key={post.slug}>
                    <span className="portal-post-index">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <small>{post.kind}</small>
                      <strong>{post.title}</strong>
                      <span>{post.date.replace(/-/g, '.')}</span>
                    </div>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <strong>这里还没有内容。</strong>
                <span>第一篇发布后会自动出现在这里。</span>
              </div>
            )}
          </section>
        )}
      </main>

      <div className="portal-section-indicator" aria-hidden="true">
        <span>{activeLabel}</span>
        <i />
        <span>{String(navItems.findIndex((item) => item.label === activeLabel) + 1).padStart(2, '0')}</span>
      </div>
    </section>
  )
}
