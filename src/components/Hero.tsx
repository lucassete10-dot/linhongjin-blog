import { useEffect, useRef } from 'react'
import { Upload } from 'lucide-react'
import { HeroScene } from './Scene'

/* 英雄区：严格复刻 Wandor 落地页规格 —— 背景视频、白色渐变遮罩、
   打字机字标导航、居中标题与毛玻璃行程卡。 */

const VIDEO_SRC =
  'https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4'

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

interface HeroProps {
  onPlan: () => void
  onDiscover: () => void
  onAbout: () => void
}

export function Hero({ onPlan, onDiscover, onAbout }: HeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // autoplay 兜底：挂载时视频往往还没数据，play() 会被打断；
  // 等 canplay 再试一次，若仍被策略拦截则在首次交互时补一次。
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    const tryPlay = () => {
      video.play().catch(() => {
        /* 拦截时保留首帧作为静态背景 */
      })
    }
    tryPlay()
    video.addEventListener('canplay', tryPlay)
    const onFirstPointer = () => {
      tryPlay()
      window.removeEventListener('pointerdown', onFirstPointer)
    }
    window.addEventListener('pointerdown', onFirstPointer)
    return () => {
      video.removeEventListener('canplay', tryPlay)
      window.removeEventListener('pointerdown', onFirstPointer)
    }
  }, [])

  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      {/* 视频未就绪时的同风格底稿（视频加载后被完全盖住，不改变背景） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[52vh] max-h-[500px]">
        <HeroScene />
      </div>

      {/* 背景视频（原素材，勿换） */}
      <video ref={videoRef} src={VIDEO_SRC} autoPlay muted loop playsInline className="absolute inset-0 z-0 h-full w-full object-cover" />

      {/* 顶部白色渐变遮罩：让导航与标题在视频上保持清晰 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[687px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
      />

      <div className="relative z-[2] mx-auto max-w-[1360px]">
        <nav className="relative flex items-center justify-between px-20 pb-4 pt-6 max-md:px-6 max-md:pt-5">
          <span className="select-none font-display text-[40px] leading-none text-black max-md:text-[32px]">wandor</span>
          <div className="absolute left-1/2 flex -translate-x-1/2 gap-8 max-md:hidden">
            <NavButton label="Discover" onClick={onDiscover} />
            <NavButton label="Pricing" onClick={onAbout} />
            <NavButton label="FAQs" onClick={onAbout} />
          </div>
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onAbout}
              className="cursor-pointer border-none bg-transparent font-sans text-[15px] font-semibold uppercase tracking-[0.04em] text-[#292929] transition-opacity hover:opacity-55 max-md:hidden"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onPlan}
              className="cursor-pointer whitespace-nowrap rounded-full border-none bg-wandor-dark px-5 py-3.5 font-sans text-[15px] font-medium uppercase tracking-[0.04em] text-[#fafafa] transition-all hover:bg-[#333] active:scale-95"
            >
              Plan My Trip
            </button>
          </div>
        </nav>

        <div className="flex flex-col items-center px-6 pb-24 pt-16 text-center">
          <h1 className="mb-5 max-w-[820px] font-sans text-[clamp(40px,6vw,68px)] font-medium leading-[1.05] tracking-[-0.04em] text-wandor-text">
            Where will you go next?
          </h1>
          <p className="mb-10 max-w-[500px] font-sans text-xl font-medium leading-relaxed text-wandor-muted">
            Tell our AI where you&rsquo;re going and what you love.
            <br />
            We&rsquo;ll create a personalized itinerary for you.
          </p>

          {/* 液态玻璃行程卡 */}
          <div className="relative min-h-[208px] w-[701px] overflow-hidden rounded-[44px] border-[3px] border-white bg-white/[0.06] shadow-[0_0_4px_0_rgba(0,0,0,0.15)] backdrop-blur-[20px] max-md:w-[calc(100vw-48px)]">
            <p className="absolute left-[29px] top-[57px] w-[609px] -translate-y-1/2 break-words text-left font-sans text-xl font-medium leading-relaxed text-wandor-prompt max-md:w-[calc(100%-58px)] max-md:text-[17px]">
              I&rsquo;m planning a 7-day trip to Japan in October. I love food, hidden caf&eacute;s, scenic hikes, and
              want to avoid crowds....
            </p>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" />
            <button
              type="button"
              aria-label="Upload inspiration"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-[21px] top-[137px] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-transparent backdrop-blur-[14px] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Upload className="h-[18px] w-[18px] flex-shrink-0 text-wandor-text" />
            </button>
            <button
              type="button"
              onClick={onPlan}
              className="absolute bottom-[21px] right-[21px] flex h-14 w-[156px] cursor-pointer items-center justify-center rounded-[44px] border-none bg-black font-sans text-base font-medium uppercase tracking-[0.02em] text-[#fafafa] shadow-[0_0_2px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#333] active:scale-95"
            >
              Plan My Trip
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
