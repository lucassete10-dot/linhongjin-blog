import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { ManagedContent } from '../types'

const SITE_NAME = 'Help Myself'
const DEFAULT_TITLE = 'Help Myself — Flora 的 AI 学习与探索空间'
const DEFAULT_DESCRIPTION = 'Flora 的 AI 学习与探索空间。Help myself, help others.'
const DEFAULT_IMAGE = '/images/flora-winter-clean-v2.webp'

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/articles': { title: '文章 — Help Myself', description: '记录 AI、效率学习与生活中值得留下来的思考。' },
  '/tools': { title: 'AI 工具 — Help Myself', description: 'Flora 对 AI 工具的真实使用体感、教程和判断。' },
  '/podcasts': { title: '播客感悟 — Help Myself', description: '从播客中听见新的视角，慢慢长出自己的想法。' },
  '/projects': { title: '项目作品 — Help Myself', description: '查看 Flora 的个人项目和真实制作过程。' },
  '/resources': { title: '资源库 — Help Myself', description: 'Flora 整理的实用学习资源与工具。' },
  '/about': { title: '关于 Flora — Help Myself', description: '认识 Help Myself 背后的个人创作者 Flora。' },
  '/search': { title: '搜索 — Help Myself', description: '搜索 Help Myself 中的文章、AI 工具、播客和项目。' },
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = value
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

export function PageMeta({ items }: { items: ManagedContent[] }) {
  const location = useLocation()

  useEffect(() => {
    const detailSlug = location.pathname.match(/^\/content\/([^/]+)/)?.[1]
    const item = detailSlug ? items.find((entry) => entry.slug === detailSlug) : undefined
    const fallback = routeMeta[location.pathname] ?? {
      title: `页面未找到 — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
    }
    const title = item ? `${item.title} — ${SITE_NAME}` : fallback.title
    const description = item?.summary || fallback.description
    const image = new URL(item?.coverImage || DEFAULT_IMAGE, window.location.origin).href
    const pageUrl = window.location.href

    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', item ? 'article' : 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:image"]', 'property', 'og:image', image)
    setMeta('meta[property="og:url"]', 'property', 'og:url', pageUrl)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)
    setLink('canonical', pageUrl)

    const scriptId = 'page-structured-data'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.text = JSON.stringify(item ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.title,
      description: item.summary,
      image,
      datePublished: item.date,
      author: { '@type': 'Person', name: 'Flora' },
      publisher: { '@type': 'Person', name: 'Flora' },
      mainEntityOfPage: pageUrl,
    } : {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: window.location.origin,
      description,
      author: { '@type': 'Person', name: 'Flora' },
    })
  }, [items, location.pathname, location.search])

  return null
}
