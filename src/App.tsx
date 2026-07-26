import { useEffect } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Hero } from '@/components/Hero'
import { Journal } from '@/components/Journal'
import { Article } from '@/components/Article'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
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
        <NavButton label="Journal" onClick={goJournal} />
        <NavButton label="About" onClick={() => navigate('/about')} />
      </div>
      <button
        type="button"
        onClick={goJournal}
        className="cursor-pointer whitespace-nowrap rounded-full border-none bg-wandor-dark px-5 py-3.5 font-sans text-[15px] font-medium uppercase tracking-[0.04em] text-[#fafafa] transition-all hover:bg-[#333] active:scale-95 max-md:px-4 max-md:py-2.5 max-md:text-[13px]"
      >
        Plan My Trip
      </button>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-page flex-wrap items-end justify-between gap-4 border-t border-[#e0d2b2] px-20 py-10 max-md:px-6">
      <div>
        <p className="select-none font-display text-[22px] leading-none text-black">wandor</p>
        <p className="mt-2 font-sans text-[13px] text-wandor-muted">Where will you go next? · 把每一次出发，都写下来。</p>
      </div>
      <p className="font-sans text-[12px] text-wandor-muted/80">© 2026 wandor journal · 封面插画为手绘 SVG</p>
    </footer>
  )
}

function Home() {
  const navigate = useNavigate()

  const scrollJournal = () => {
    document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Hero onPlan={scrollJournal} onDiscover={scrollJournal} onAbout={() => navigate('/about')} />
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
          wandor（纸上行迹）是一本旅行随笔博客。这里不写攻略，不比价格，只记录路上真正留下来的东西：一碗面的热气、一阵把计划吹散的风、一本看不懂却舍不得放下的书。
        </p>
        <p>把每一次出发都写下来——写下来的旅行，才算真的回来了。</p>
        <h2>制作说明</h2>
        <p>
          本站的视觉语言是 Wandor 式的暖纸插画风格：奶油纸底、赭石与橄榄绿的手绘风景、打字机字标，和一张毛玻璃卡片。每篇文章的封面都是手绘 SVG——山有等高线，树有枝脉，坡上有草茬——配合位移滤镜与噪点，形成版画式的颗粒质感。首页背景是视频素材，加载失败时会自动回退到同风格的手绘底稿。
        </p>
        <p>
          技术栈：Vite + React + TypeScript + Tailwind CSS + lucide-react。字标使用 Special Elite（打字机体），正文使用 Geist 与系统中文字体，纯静态构建，托管在 GitHub Pages。
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
