import { useEffect, useRef } from 'react'
import { Shuffle } from 'lucide-react'
import { HeroScene } from './Scene'
import { SiteNav } from './SiteNav'

/* 英雄区：视觉沿用 Wandor 落地页（背景视频、白色渐变遮罩、打字机字标），
   标题用霞鹜文楷；站内搜索在右上角导航里。 */

const VIDEO_SRC = '/media/wandor-bg.mp4'

interface HeroProps {
  onShuffle: () => void
  onRead: () => void
}

export function Hero({ onShuffle, onRead }: HeroProps) {
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
      {/* 视频未就绪时的同风格底稿（视频加载后被完全盖住） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[52vh] max-h-[500px]">
        <HeroScene />
      </div>

      {/* 背景视频（已本地化到 public/media，随站发布） */}
      <video ref={videoRef} src={VIDEO_SRC} autoPlay muted loop playsInline className="absolute inset-0 z-0 h-full w-full object-cover" />

      {/* 顶部白色渐变遮罩：让导航与标题在视频上保持清晰 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[687px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
      />

      {/* 底部渐隐：让视频插画自然融进下方页面，上下背景不再割裂 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24"
        style={{ background: 'linear-gradient(180deg, rgba(241,237,225,0) 0%, #f1ede1 94%)' }}
      />

      <div className="relative z-[2]">
        <SiteNav />

        <div className="mx-auto flex max-w-[1360px] flex-col items-center px-6 pb-24 pt-20 text-center max-md:pt-12">
          <h1 className="mb-6 max-w-[820px] font-cn text-[clamp(44px,6.4vw,76px)] font-bold leading-[1.14] tracking-[0.01em] text-wandor-text">
            下一站，去哪儿？
          </h1>
          <p className="mb-11 max-w-[560px] font-cn text-[22px] font-normal leading-relaxed text-wandor-muted max-md:text-[18px]">
            学习、旅行，和一些生活。
            <br />
            把每一次出发和想明白的事，都写下来。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onRead}
              className="cursor-pointer rounded-full border-none bg-black px-8 py-4 font-sans text-base font-medium uppercase tracking-[0.02em] text-[#fafafa] shadow-[0_0_4px_0_rgba(0,0,0,0.12)] transition-all hover:bg-[#333] active:scale-95"
            >
              开始阅读
            </button>
            <button
              type="button"
              onClick={onShuffle}
              className="flex cursor-pointer items-center gap-2.5 rounded-full border border-wandor-text/60 bg-white/40 px-7 py-4 font-sans text-base font-medium text-wandor-text backdrop-blur-[10px] transition-all hover:border-wandor-text hover:bg-white/70 active:scale-95"
            >
              <Shuffle className="h-[17px] w-[17px]" aria-hidden="true" />
              随机读一篇
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
