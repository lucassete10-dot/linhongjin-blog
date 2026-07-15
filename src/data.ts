import type { ContentItem, ContentType } from './types'

export const contentTypeLabels: Record<ContentType, string> = {
  article: '文章',
  tool: 'AI 工具',
  podcast: '播客感悟',
  project: '项目',
  resource: '资源',
}

// 正式内容统一由后台与 Supabase 管理；网络异常时不再回退到测试案例。
export const content: ContentItem[] = []

export const navItems = [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: 'AI 工具', to: '/tools' },
  { label: '播客感悟', to: '/podcasts' },
  { label: '项目', to: '/projects' },
  { label: '资源库', to: '/resources' },
  { label: '关于 Flora', to: '/about' },
]
