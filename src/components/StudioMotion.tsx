import type { RefObject } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useRouteEntrance(
  scope: RefObject<HTMLElement | null>,
  routeKey: string,
  enabled = true,
) {
  useGSAP(() => {
    if (!enabled || prefersReducedMotion()) return
    gsap.fromTo(
      scope.current,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.58, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
    )
  }, { scope, dependencies: [routeKey, enabled], revertOnUpdate: true })
}

export function useStudioMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (prefersReducedMotion()) return

    const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
    hero
      .from('[data-hero-reveal]', { y: 34, autoAlpha: 0, duration: 0.85, stagger: 0.1 })
      .from('[data-hero-canvas]', { x: 54, rotate: 2, scale: 0.94, autoAlpha: 0, duration: 1.05 }, 0.12)

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.from(element, {
        y: 38,
        autoAlpha: 0,
        duration: 0.72,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('.studio-stack-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 72, rotate: index % 2 === 0 ? -1.6 : 1.6, scale: 0.95 },
        {
          y: 0,
          rotate: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 54%', scrub: 0.7 },
        },
      )
    })

    const media = gsap.matchMedia()
    media.add('(min-width: 900px)', () => {
      const title = scope.current?.querySelector<HTMLElement>('.studio-pin-title')
      const section = scope.current?.querySelector<HTMLElement>('.studio-pin-section')
      if (!title || !section) return
      ScrollTrigger.create({
        trigger: section,
        start: 'top 110px',
        end: 'bottom bottom',
        pin: title,
        pinSpacing: false,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      })
    })

    return () => media.revert()
  }, { scope })
}

export function useStudioLayoutSync(
  scope: RefObject<HTMLElement | null>,
  layoutKey: string,
) {
  useGSAP(() => {
    if (prefersReducedMotion()) return

    let active = true
    const refresh = () => {
      if (active) ScrollTrigger.refresh()
    }
    const frame = window.requestAnimationFrame(refresh)
    const pendingImages = Array.from(scope.current?.querySelectorAll('img') ?? [])
      .filter((image) => !image.complete)

    pendingImages.forEach((image) => image.addEventListener('load', refresh, { once: true }))
    void document.fonts?.ready.then(refresh)

    return () => {
      active = false
      window.cancelAnimationFrame(frame)
      pendingImages.forEach((image) => image.removeEventListener('load', refresh))
    }
  }, { scope, dependencies: [layoutKey], revertOnUpdate: true })
}
