import { useEffect } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Hero } from '@/components/Hero'
import { Journal } from '@/components/Journal'
import { Article } from '@/components/Article'
import { posts, categories, type Category } from '@/data/posts'

declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void }
  }
}

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    // GoatCounter 是 hash 路由感知不到的，手动计一次数
    window.goatcounter?.count?.({ path: pathname + search })
  }, [pathname, search])
  return null
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer border-none bg-transparent font-sans text-[15px] font-medium uppercase tracking-[0.04em] text-wandor-text transition-opacity hover:opacity-55"
    >
      {label}
    </button>
  )
}

function Nav() {
  const navigate = useNavigate()

  const goCategory = (category: Category) => {
    navigate(`/?cat=${encodeURIComponent(category)}`)
    window.setTimeout(() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' }), 90)
  }

  const goJournal = () => {
    navigate('/')
    window.setTimeout(() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' }), 90)
  }

  return (
    <nav className="relative z-10 mx-auto flex max-w-page items-center justify-between px-20 pb-4 pt-6 max-md:px-6 max-md:pt-5">
      <Link to="/" className="select-none whitespace-nowrap font-display text-[40px] leading-none text-black max-md:text-[26px]">
        wandor
      </Link>
      <div className="absolute left-1/2 flex -translate-x-1/2 gap-8 max-md:hidden">
        {categories.map((category) => (
          <NavButton key={category} label={category} onClick={() => goCategory(category)} />
        ))}
        <NavButton label="关于" onClick={() => navigate('/about')} />
      </div>
      <button
        type="button"
        onClick={goJournal}
        className="cursor-pointer whitespace-nowrap rounded-full border-none bg-wandor-dark px-5 py-3.5 font-sans text-[15px] font-medium uppercase tracking-[0.04em] text-[#fafafa] transition-all hover:bg-[#333] active:scale-95 max-md:px-4 max-md:py-2.5 max-md:text-[13px]"
      >
        开始阅读
      </button>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-page flex-wrap items-end justify-between gap-4 border-t border-[#e0d2b2] px-20 py-10 max-md:px-6">
      <div>
        <p className="select-none font-display text-[22px] leading-none text-black">wandor</p>
        <p className="mt-2 font-sans text-[13px] text-wandor-muted">学习、旅行、生活 · 把每一次出发，都写下来。</p>
      </div>
      <div className="flex items-center gap-5 font-sans text-[12px] text-wandor-muted/80">
        <a href="/feed.xml" className="transition-opacity hover:opacity-60">
          RSS 订阅
        </a>
        <span>© 2026 wandor · linhongjin.top</span>
      </div>
    </footer>
  )
}

function Home() {
  const navigate = useNavigate()

  const scrollJournal = () => {
    window.setTimeout(() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' }), 90)
  }

  return (
    <>
      <Hero
        onSearch={(query) => {
          navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
          scrollJournal()
        }}
        onCategory={(category) => {
          navigate(`/?cat=${encodeURIComponent(category)}`)
          scrollJournal()
        }}
        onShuffle={() => {
          const pick = posts[Math.floor(Math.random() * posts.length)]
          navigate(`/post/${pick.slug}`)
        }}
        onRead={scrollJournal}
        onAbout={() => navigate('/about')}
      />
      <Journal />
    </>
  )
}

function About() {
  return (
    <section className="mx-auto max-w-[720px] px-6 pb-28 pt-10">
      <p className="mb-3 font-display text-sm uppercase tracking-[0.18em] text-wandor-prompt">About</p>
      <h1 className="mb-8 font-sans text-[clamp(30px,5vw,44px)] font-semibold tracking-[-0.02em] text-wandor-text">
        关于这本博客
      </h1>
      <div className="article-prose font-sans text-[17px] text-wandor-text">
        <p>
          wandor（纸上行迹）是一本综合个人博客，写三类东西：<strong>学习</strong>——AI 工具的使用体感、效率方法和踩过的坑；<strong>旅行</strong>——路上的城市、食物和天气；<strong>生活</strong>——一些不成体系、但值得留下来的想法。
        </p>
        <p>把每一次出发和想明白的事都写下来——写下来的，才算真的属于自己。</p>
        <h2>制作说明</h2>
        <p>
          本站的视觉语言是 Wandor 式的暖纸手绘插画：奶油纸底、赭石与橄榄绿的风景、打字机字标，和一张毛玻璃卡片——那张卡片不是装饰，它是真的站内搜索，左下角的小按钮会替你随机抽一篇。每篇文章的封面都是手绘 SVG，配合位移滤镜与噪点，形成版画式的颗粒质感。
        </p>
        <p>
          技术栈：Vite + React + TypeScript + Tailwind CSS。文章用 Markdown 写作，推送后自动构建上线；纯静态、无后端，托管在 GitHub Pages。可以用 <a href="/feed.xml">RSS</a> 订阅更新。
        </p>
      </div>
    </section>
  )
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-svh w-full">
      <ScrollToTop />
      {pathname !== '/' && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/post/:slug" element={<Article />} />
      </Routes>
      <Footer />
    </div>
  )
}
