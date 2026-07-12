import type { User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'
import type { AdminIdentity, ContentItem, ContentStatus, ContentType, ManagedContent } from './types'

interface ContentRow {
  id: number
  slug: string
  type: ContentType
  title: string
  eyebrow: string
  summary: string
  category: string
  tags: string[]
  published_date: string
  read_time: string
  featured: boolean
  rating: number | null
  suitable_for: string | null
  external_url: string | null
  cover_image: string | null
  body: string[]
  status: ContentStatus
  pinned: boolean
  is_sample: boolean
  created_at: string
  updated_at: string
}

type EditableContent = Omit<ManagedContent, 'id' | 'createdAt' | 'updatedAt'>

function rowToContent(row: ContentRow): ManagedContent {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    title: row.title,
    eyebrow: row.eyebrow,
    summary: row.summary,
    category: row.category,
    tags: row.tags ?? [],
    date: row.published_date,
    readTime: row.read_time,
    featured: row.featured,
    rating: row.rating ?? undefined,
    suitableFor: row.suitable_for ?? undefined,
    externalUrl: row.external_url ?? undefined,
    coverImage: row.cover_image ?? undefined,
    body: row.body ?? [],
    status: row.status,
    pinned: row.pinned,
    isSample: row.is_sample,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function contentToRow(item: EditableContent) {
  return {
    slug: item.slug,
    type: item.type,
    title: item.title,
    eyebrow: item.eyebrow,
    summary: item.summary,
    category: item.category,
    tags: item.tags,
    published_date: item.date,
    read_time: item.readTime,
    featured: Boolean(item.featured),
    rating: item.rating ?? null,
    suitable_for: item.suitableFor ?? null,
    external_url: item.externalUrl ?? null,
    cover_image: item.coverImage ?? null,
    body: item.body,
    status: item.status,
    pinned: item.pinned,
    is_sample: item.isSample,
  }
}

function adminIdentity(user: User): AdminIdentity {
  return { id: user.id, username: user.email ?? 'Flora' }
}

async function ensureAdmin(user: User): Promise<AdminIdentity> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw new Error(error.message)
  if (!data) throw new Error('这个账号没有管理员权限。')
  return adminIdentity(user)
}

export async function fetchPublishedContent(): Promise<ManagedContent[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .eq('status', 'published')
    .order('pinned', { ascending: false })
    .order('published_date', { ascending: false })
    .order('id', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as ContentRow[]).map(rowToContent)
}

export async function fetchAdminIdentity(): Promise<AdminIdentity> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('请先登录。')
  return ensureAdmin(data.user)
}

export async function loginAdmin(email: string, password: string): Promise<AdminIdentity> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || !data.user) throw new Error('邮箱或密码不正确。')
  try {
    return await ensureAdmin(data.user)
  } catch (adminError) {
    await supabase.auth.signOut()
    throw adminError
  }
}

export async function logoutAdmin(): Promise<void> {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw new Error(error.message)
}

export async function fetchManagedContent(): Promise<ManagedContent[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as ContentRow[]).map(rowToContent)
}

export async function saveManagedContent(item: EditableContent, id?: number): Promise<ManagedContent> {
  const supabase = getSupabase()
  const operation = id
    ? supabase.from('contents').update(contentToRow(item)).eq('id', id)
    : supabase.from('contents').insert(contentToRow(item))
  const { data, error } = await operation.select('*').single()
  if (error) throw new Error(error.code === '23505' ? '这个 URL 标识已经被使用。' : error.message)
  return rowToContent(data as ContentRow)
}

export async function removeManagedContent(id: number): Promise<void> {
  const { error } = await getSupabase().from('contents').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function uploadImage(file: File): Promise<string> {
  const supabase = getSupabase()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('登录已经过期，请重新登录。')

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const objectPath = `${userData.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('content-images').upload(objectPath, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  return supabase.storage.from('content-images').getPublicUrl(objectPath).data.publicUrl
}

export function toManagedFallback(item: ContentItem, index: number): ManagedContent {
  const now = new Date().toISOString()
  return {
    ...item,
    id: -(index + 1),
    status: 'published',
    pinned: Boolean(item.featured),
    isSample: true,
    createdAt: now,
    updatedAt: now,
  }
}
