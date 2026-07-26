import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, Search, X } from 'lucide-react'
import { photos, albumCategories } from '@/data/album'
import { categories as blogCategories, type Category } from '@/data/posts'

/* 首页相册屏：整屏无滚动，右侧箭头（或点击画面左/右缘）翻图，
   底部缩略图条横向选图；沉浸查看与自动播放。
   视觉参照「海风手记」式的暗色影集：墨蓝底、鎏金点缀、大字标题。 */

const GOLD = '#d9b45c'

export function AlbumHome() {
  const navigate = useNavigate()
  const [cat, setCat] = useState<string>('')
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(() => (cat ? photos.filter((p) => p.category === cat) : photos), [cat])
  const total = visible.length
  const current = visible[Math.min(index, total - 1)]

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return
      setIndex((prev) => (prev + delta + total) % total)
    },
    [total],
  )

  useEffect(() => {
    setIndex(0)
  }, [cat])

  // 键盘翻图 / Esc 退出沉浸
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1)
      else if (event.key === 'ArrowLeft') go(-1)
      else if (event.key === 'Escape') setImmersive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // 自动播放
  useEffect(() => {
    if (!autoPlay || total < 2) return
    const timer = window.setInterval(() => go(1), 4000)
    return () => window.clearInterval(timer)
  }, [autoPlay, total, go])

  // 当前缩略图保持可见
  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }, [index])

  const goBlogCategory = (category: Category) => navigate(`/articles?cat=${encodeURIComponent(category)}`)

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="relative flex h-svh w-full flex-col overflow-hidden bg-[#0b131d] text-[#ece7da]">
      {/* 背景装饰弧线 */}
      <svg
        className="pointer-events-none absolute -right-[12%] top-[6%] h-[110%] w-auto opacity-[0.07]"
        viewBox="0 0 800 800"
        aria-hidden="true"
      >
        {[380, 300, 220].map((r) => (
          <circle key={r} cx={400} cy={400} r={r} fill="none" stroke="#ece7da" strokeWidth={1} />
        ))}
      </svg>
      <span className="pointer-events-none absolute left-[27%] top-[42%] h-2 w-2 rounded-full" style={{ background: GOLD }} aria-hidden="true" />

      {/* 顶部导航 */}
      <header className="flex h-[84px] flex-shrink-0 items-center justify-between px-12 max-md:h-[64px] max-md:px-5">
        <div className="flex items-baseline gap-3 whitespace-nowrap">
          <span className="select-none font-display text-[22px] tracking-[0.14em] max-md:text-[18px]">wandor</span>
          <span className="opacity-40">·</span>
          <span className="font-cn text-[17px] tracking-[0.28em] max-md:hidden">纸上行迹</span>
        </div>
        <nav className="flex items-center gap-9 font-sans text-[15px] tracking-[0.08em] max-md:gap-4 max-md:text-[13px]">
          <span className="relative cursor-default pb-1" style={{ color: GOLD }}>
            首页
            <i className="absolute inset-x-1 -bottom-0.5 h-px" style={{ background: GOLD }} />
          </span>
          <button type="button" onClick={() => navigate('/articles')} className="cursor-pointer border-none bg-transparent text-inherit transition-colors hover:text-[#d9b45c]">
            文章
          </button>
          {blogCategories.map((c) => (
            <button key={c} type="button" onClick={() => goBlogCategory(c)} className="cursor-pointer border-none bg-transparent text-inherit transition-colors hover:text-[#d9b45c] max-md:hidden">
              {c}
            </button>
          ))}
          <button type="button" onClick={() => navigate('/about')} className="cursor-pointer border-none bg-transparent text-inherit transition-colors hover:text-[#d9b45c]">
            关于
          </button>
          <button type="button" onClick={() => navigate('/articles')} aria-label="搜索文章" className="cursor-pointer border-none bg-transparent text-inherit transition-colors hover:text-[#d9b45c]">
            <Search className="h-[18px] w-[18px]" />
          </button>
        </nav>
      </header>

      {/* 主体 */}
      <main className="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)] gap-10 px-12 pb-8 max-lg:grid-cols-[260px_minmax(0,1fr)] max-md:flex max-md:flex-col max-md:gap-4 max-md:px-5 max-md:pb-4">
        {/* 左栏 */}
        <aside className="flex min-h-0 flex-col pt-6 max-md:flex-shrink-0 max-md:pt-0">
          <p className="mb-5 font-display text-[12px] uppercase tracking-[0.4em] max-md:mb-2" style={{ color: GOLD }}>
            Visual Archive / 2026
          </p>
          <h1 className="font-cn text-[64px] font-bold leading-[1.16] tracking-[0.04em] max-lg:text-[46px] max-md:text-[30px] max-md:leading-tight">
            行迹
            <br className="max-md:hidden" />
            相册
          </h1>
          <p className="mt-5 max-w-[260px] font-cn text-[15px] leading-relaxed text-[#98a1ab] max-md:mt-1.5 max-md:max-w-none">
            城市、山海、灯火，与没有终点的季节。
          </p>
          <svg className="mt-6 max-md:hidden" width="96" height="18" viewBox="0 0 96 18" aria-hidden="true">
            <path d="M2 14 C30 4 66 4 94 12" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
          </svg>

          {/* 分类 */}
          <div className="mt-auto max-md:mt-3">
            <div className="max-md:no-scrollbar max-md:flex max-md:gap-2 max-md:overflow-x-auto">
              {['', ...albumCategories].map((c, i) => {
                const active = c === cat
                const count = c ? photos.filter((p) => p.category === c).length : photos.length
                return (
                  <button
                    key={c || 'all'}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`flex w-full cursor-pointer items-baseline gap-4 border-x-0 border-t-0 bg-transparent py-3.5 text-left transition-colors max-md:w-auto max-md:flex-shrink-0 max-md:gap-2 max-md:rounded-full max-md:border max-md:px-4 max-md:py-1.5 ${
                      active ? 'border-b-2' : 'border-b border-[#232e3b] hover:text-[#d9b45c]'
                    }`}
                    style={active ? { borderBottomColor: GOLD, color: GOLD } : undefined}
                  >
                    <span className="font-display text-[12px] tracking-[0.2em] opacity-70">{pad(i + 1)}</span>
                    <span className="font-cn text-[16px] tracking-[0.1em] max-md:text-[13px]">{c || '全部照片'}</span>
                    <span className="ml-auto font-display text-[13px] opacity-60 max-md:ml-1">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* 右侧：查看器 + 缩略图条 */}
        <section className="flex min-h-0 flex-col">
          <div className="relative min-h-0 flex-1">
            {current ? (
              <>
                <img
                  src={current.src}
                  alt={current.name}
                  className="h-full w-full object-cover"
                  style={{ borderRadius: '140px 160px 140px 160px / 110px 130px 120px 130px' }}
                />
                {/* 左右点击区（右边点击翻下一张） */}
                <button type="button" aria-label="上一张" onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-1/5 cursor-w-resize border-none bg-transparent" />
                <button type="button" aria-label="下一张" onClick={() => go(1)} className="absolute inset-y-0 right-0 w-1/5 cursor-e-resize border-none bg-transparent" />

                {/* 右缘箭头 */}
                <div className="absolute -right-3 top-1/2 flex -translate-y-1/2 flex-col gap-3 max-md:right-1">
                  <button type="button" aria-label="上一张" onClick={() => go(-1)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#0b131d]/60 text-[#ece7da] backdrop-blur-md transition-all hover:border-[#d9b45c] hover:text-[#d9b45c] active:scale-95">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" aria-label="下一张" onClick={() => go(1)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#0b131d]/60 text-[#ece7da] backdrop-blur-md transition-all hover:border-[#d9b45c] hover:text-[#d9b45c] active:scale-95">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* 计数 */}
                <div className="pointer-events-none absolute bottom-7 left-9 flex items-baseline gap-1 max-md:bottom-4 max-md:left-5">
                  <span className="font-display text-[44px] leading-none max-md:text-[28px]" style={{ color: GOLD }}>
                    {pad(index + 1)}
                  </span>
                  <span className="text-[15px] text-white/60">/ {total}</span>
                </div>

                {/* 操作 */}
                <div className="absolute bottom-7 right-8 flex gap-2.5 max-md:bottom-4 max-md:right-4">
                  <button type="button" onClick={() => setImmersive(true)} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-black/35 px-3.5 py-2 text-[13px] text-[#ece7da] backdrop-blur-md transition-colors hover:text-[#d9b45c]">
                    <Maximize2 className="h-3.5 w-3.5" /> 沉浸查看
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoPlay((v) => !v)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-black/35 px-3.5 py-2 text-[13px] backdrop-blur-md transition-colors hover:text-[#d9b45c]"
                    style={autoPlay ? { color: GOLD, borderColor: GOLD } : { color: '#ece7da' }}
                  >
                    {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} 自动播放
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[80px] border border-dashed border-white/20 text-center">
                <div>
                  <p className="font-cn text-[20px]">相册还空着。</p>
                  <p className="mt-2 text-[14px] text-[#98a1ab]">
                    把图片放进 src/assets/album/ 文件夹，推送后就会出现在这里。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 缩略图条 */}
          {total > 1 && (
            <div className="mt-5 flex flex-shrink-0 items-center gap-4 max-md:mt-3">
              <button type="button" aria-label="向前滚动" onClick={() => stripRef.current?.scrollBy({ left: -600, behavior: 'smooth' })} className="cursor-pointer border-none bg-transparent text-[#ece7da]/70 transition-colors hover:text-[#d9b45c] max-md:hidden">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div ref={stripRef} className="no-scrollbar flex min-w-0 flex-1 gap-4 overflow-x-auto">
                {visible.map((photo, i) => (
                  <button
                    key={photo.src}
                    type="button"
                    data-thumb={i}
                    onClick={() => setIndex(i)}
                    className={`relative h-[110px] w-[190px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-none p-0 transition-all max-md:h-[64px] max-md:w-[110px] ${
                      i === index ? 'opacity-100 ring-2' : 'opacity-50 hover:opacity-85'
                    }`}
                    style={i === index ? ({ ['--tw-ring-color' as string]: GOLD } as React.CSSProperties) : undefined}
                  >
                    <img src={photo.src} alt={photo.name} loading="lazy" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1.5 left-2.5 font-display text-[12px] text-white/85">{pad(i + 1)}</span>
                  </button>
                ))}
              </div>
              <button type="button" aria-label="向后滚动" onClick={() => stripRef.current?.scrollBy({ left: 600, behavior: 'smooth' })} className="cursor-pointer border-none bg-transparent text-[#ece7da]/70 transition-colors hover:text-[#d9b45c] max-md:hidden">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 沉浸查看 */}
      {immersive && current && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95" onClick={() => setImmersive(false)}>
          <img src={current.src} alt={current.name} className="max-h-full max-w-full object-contain" />
          <button type="button" aria-label="退出沉浸查看" onClick={() => setImmersive(false)} className="absolute right-6 top-6 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-colors hover:text-[#d9b45c]">
            <X className="h-5 w-5" />
          </button>
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[16px] text-white/70">
            {pad(index + 1)} / {total}
          </div>
        </div>
      )}
    </div>
  )
}
