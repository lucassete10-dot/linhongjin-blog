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

/* 滚动进入视口时给 .reveal 元素加 is-visible（淡入上浮动效） */
function useRevealOnScroll() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    // 用滚动监听 + 位置计算实现（IntersectionObserver 在部分内嵌 webview 中不回调）
    let pending = [...document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)')]
    if (pending.length === 0) return
    // 动画结束后摘掉 reveal 类，把 transition 还给元素自己的 hover 效果
    const settle = (el: HTMLElement) => {
      window.setTimeout(() => {
        el.classList.remove('reveal', 'is-visible')
        el.style.transitionDelay = ''
      }, 1100)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pending.forEach((el) => {
        el.classList.remove('reveal')
        el.style.transitionDelay = ''
      })
      return
    }
    const check = () => {
      const viewportH = window.innerHeight
      if (!viewportH) return
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < viewportH * 0.94) {
          el.classList.add('is-visible')
          settle(el)
          return false
        }
        return true
      })
      if (pending.length === 0) detach()
    }
    const detach = () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
    // 元素很少，直接在滚动事件里计算即可；不用 rAF 节流
    //（部分内嵌 webview 不产帧，rAF 回调永远不执行）
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    check()
    const lateCheck = window.setTimeout(check, 350)
    return () => {
      window.clearTimeout(lateCheck)
      detach()
    }
  }, [pathname, search])
}

/* 与插画同风格的线描云 */
function CloudShape({ scale = 1, dy = 0 }: { scale?: number; dy?: number }) {
  return (
    <svg
      viewBox="0 0 140 56"
      style={{ width: `${140 * scale}px`, height: `${56 * scale}px`, transform: `translateY(${dy}px)`, flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M22 44 C8 44 4 30 18 26 C18 12 40 6 51 16 C58 4 82 4 89 16 C106 10 122 24 113 36 C122 44 110 48 99 46 Z"
        fill="#f5efdf"
        stroke="#b8a88f"
        strokeWidth={2.5}
        strokeLinejoin="round"
        opacity={0.95}
      />
    </svg>
  )
}

/* 无缝飘云带：半组内容 + 完全相同的另一半，整条向右平移循环 */
function CloudTrack({ top, duration, scale = 1 }: { top: string; duration: number; scale?: number }) {
  const half = (key: string) => (
    <div key={key} className="flex" style={{ width: '2800px' }}>
      <div style={{ marginLeft: '140px' }}>
        <CloudShape scale={scale} dy={0} />
      </div>
      <div style={{ marginLeft: '880px' }}>
        <CloudShape scale={scale * 0.78} dy={18} />
      </div>
      <div style={{ marginLeft: '800px' }}>
        <CloudShape scale={scale * 0.9} dy={-8} />
      </div>
    </div>
  )
  return (
    <div className="cloud-track" style={{ top }}>
      <div className="cloud-track-inner" style={{ ['--marquee-duration' as string]: `${duration}s` }}>
        {half('a')}
        {half('b')}
      </div>
    </div>
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
  useRevealOnScroll()
  return (
    <div className="min-h-svh w-full">
      <ScrollToTop />
      {pathname !== '/' && <SiteNav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/post/:slug" element={<Article />} />
      </Routes>
      {/* 页尾的泉州风景带：东西塔、老君岩、清净寺、关帝庙与洛阳桥 */}
      <div aria-hidden="true" className="reveal pointer-events-none relative mt-16 h-[480px] w-full overflow-hidden max-md:h-[260px]">
        <img
          src="/media/quanzhou-scene.jpg"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 20%' }}
        />
        {/* 飘云层：两条不同速度的无缝云带，持续向右流动 */}
        <CloudTrack top="4%" duration={110} scale={1} />
        <CloudTrack top="20%" duration={170} scale={0.68} />
        {/* 上缘融入纸色页面 */}
        <div
          className="absolute inset-x-0 top-0 h-20"
          style={{ background: 'linear-gradient(180deg, #f1ede1 0%, rgba(241,237,225,0) 100%)' }}
        />
      </div>
      <Footer />
    </div>
  )
}
