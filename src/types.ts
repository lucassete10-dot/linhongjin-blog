export type ContentType = 'article' | 'tool' | 'podcast' | 'project' | 'resource'

export interface ContentItem {
  slug: string
  type: ContentType
  title: string
  eyebrow: string
  summary: string
  category: string
  tags: string[]
  date: string
  readTime: string
  featured?: boolean
  rating?: number
  suitableFor?: string
  externalUrl?: string
  coverImage?: string
  body: string[]
}

export type ContentStatus = 'draft' | 'published'

export interface ManagedContent extends ContentItem {
  id: number
  status: ContentStatus
  pinned: boolean
  isSample: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminIdentity {
  id: string
  username: string
}
