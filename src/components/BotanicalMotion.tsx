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
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
    )
  }, { scope, dependencies: [routeKey, enabled], revertOnUpdate: true })
}

export function useBotanicalMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    if (prefersReducedMotion()) return

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTimeline
      .from('[data-hero-reveal]', { y: 46, autoAlpha: 0, duration: 1.05, stagger: 0.12 })
      .from('[data-hero-image]', { scale: 1.12, autoAlpha: 0, duration: 1.5 }, 0)

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.from(element, {
        y: 54,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 84%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-image-reveal]').forEach((element) => {
      const image = element.querySelector('img')
      if (!image) return
      gsap.fromTo(
        image,
        { scale: 1.16 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        },
      )
    })

    gsap.utils.toArray<HTMLElement>('.botanical-project-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 70, scale: 0.96, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            end: 'top 42%',
            scrub: 0.6,
          },
          delay: index * 0.04,
        },
      )
    })
  }, { scope })
}
