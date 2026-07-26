import { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Hero } from '@/components/Hero'
import { Journal } from '@/components/Journal'
import { Article } from '@/components/Article'
import { SiteNav } from '@/components/SiteNav'
import { posts } from '@/data/posts'

declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void }
  }
}

/* 只有路由路径变化才回到顶部；?cat= / ?q= 这类参数变化（分类筛选、搜索）
   不应打断阅读位置——之前点分类胶囊跳回顶部的 bug 就出在这里。 */
function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  useEffect(() => {
    // GoatCounter 感知不到 hash 路由，手动计数
    window.goatcounter?.count?.({ path: pathname + search })
  }, [pathname, search])

  return null
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

  return (
    <>
      <Hero
        onShuffle={() => {
          const pick = posts[Math.floor(Math.random() * posts.length)]
          navigate(`/post/${pick.slug}`)
        }}
        onRead={() => document.getElementById('journal')?.scrollIntoView({ behavior: 'smooth' })}
      />
      <Journal />
    </>
  )
}

function About() {
  return (
    <section className="mx-auto max-w-[720px] px-6 pb-28 pt-10">
      <p className="mb-3 font-display text-sm uppercase tracking-[0.18em] text-wandor-prompt">About</p>
      <h1 className="mb-8 font-cn text-[clamp(30px,5vw,44px)] font-bold tracking-[0.01em] text-wandor-text">
        关于这本博客
      </h1>
      <div className="article-prose font-sans text-[17px] text-wandor-text">
        <p>
          wandor（纸上行迹）是一本综合个人博客，写三类东西：<strong>学习</strong>——AI 工具的使用体感、效率方法和踩过的坑；<strong>旅行</strong>——路上的城市、食物和天气；<strong>生活</strong>——一些不成体系、但值得留下来的想法。
        </p>
        <p>把每一次出发和想明白的事都写下来——写下来的，才算真的属于自己。</p>
        <h2>制作说明</h2>
        <p>
          本站的视觉语言是 Wandor 式的暖纸手绘插画：奶油纸底、赭石与橄榄绿的风景、打字机字标，标题用霞鹜文楷。每篇文章的封面都是手绘 SVG，配合位移滤镜与噪点，形成版画式的颗粒质感。找文章可以用右上角的站内搜索，或者让首页的「随机读一篇」替你做决定。
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
      {pathname !== '/' && <SiteNav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/post/:slug" element={<Article />} />
      </Routes>
      <Footer />
    </div>
  )
}
