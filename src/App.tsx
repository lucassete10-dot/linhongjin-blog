import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Article } from '@/components/Article'
import { CinematicPortal } from '@/components/CinematicPortal'
import { SiteNav } from '@/components/SiteNav'

declare global {
  interface Window {
    goatcounter?: { count?: (opts: { path: string }) => void }
  }
}

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  useEffect(() => {
    window.goatcounter?.count?.({ path: pathname + search })
  }, [pathname, search])

  return null
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-[920px] flex-wrap items-end justify-between gap-4 border-t border-slate-200 px-6 py-10">
      <div>
        <p className="font-sans text-[20px] font-bold tracking-[-0.03em] text-slate-950">Help Myself</p>
        <p className="mt-2 font-sans text-[13px] text-slate-500">Help myself, help others.</p>
      </div>
      <div className="flex items-center gap-5 font-sans text-[12px] text-slate-500">
        <a href="/feed.xml" className="transition-opacity hover:opacity-60">RSS 订阅</a>
        <span>© 2026 Flora · linhongjin.top</span>
      </div>
    </footer>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isReadingPage = pathname.startsWith('/post/')

  return (
    <div className={isReadingPage ? 'min-h-svh bg-[#f7f8fa]' : 'h-svh overflow-hidden bg-[#06111f]'}>
      <ScrollToTop />
      {isReadingPage && <SiteNav />}
      <Routes>
        <Route path="/" element={<CinematicPortal view="home" />} />
        <Route path="/articles" element={<CinematicPortal view="articles" />} />
        <Route path="/about" element={<CinematicPortal view="about" />} />
        <Route path="/post/:slug" element={<Article />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isReadingPage && <Footer />}
    </div>
  )
}
