import { Link, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { posts, categories, type Category } from '@/data/posts'
import { PostCover } from './Scene'

export function Journal() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const cat = params.get('cat') as Category | null
  const activeCat = cat && categories.includes(cat) ? cat : null

  const visible = posts.filter((post) => {
    if (activeCat && post.category !== activeCat) return false
    if (!query) return true
    return [post.title, post.excerpt, post.place, post.kind, post.category, ...post.tags]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  })

  const setCat = (next: Category | null) => {
    const p = new URLSearchParams(params)
    if (next) p.set('cat', next)
    else p.delete('cat')
    setParams(p)
  }

  return (
    <section id="journal" className="mx-auto max-w-page px-20 pb-28 pt-8 max-md:px-6">
      <header className="reveal mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm uppercase tracking-[0.18em] text-wandor-prompt">Field Notes</p>
          <h2 className="font-cn text-[36px] font-bold tracking-[0.01em] text-wandor-text max-md:text-[28px]">
            {query ? `搜索「${query}」` : activeCat ? `${activeCat}的笔记` : '最近的文章'}
          </h2>
        </div>
        {query ? (
          <button
            type="button"
            onClick={() => setParams(activeCat ? { cat: activeCat } : {})}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-wandor-prompt/40 bg-transparent px-4 py-2 font-sans text-sm font-medium text-wandor-prompt transition-opacity hover:opacity-60"
          >
            <X className="h-4 w-4" /> 清除搜索 · 共 {visible.length} 篇
          </button>
        ) : (
          <span className="font-sans text-sm text-wandor-muted">{visible.length} 篇，还在继续写</span>
        )}
      </header>

      {/* 分类筛选胶囊 */}
      <div className="reveal mb-10 flex flex-wrap gap-2.5" role="tablist" aria-label="按分类筛选">
        {[null, ...categories].map((c) => {
          const active = c === activeCat
          return (
            <button
              key={c ?? 'all'}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCat(c as Category | null)}
              className={
                active
                  ? 'cursor-pointer rounded-full border border-wandor-dark bg-wandor-dark px-5 py-2 font-sans text-[14px] font-medium text-[#fafafa]'
                  : 'cursor-pointer rounded-full border border-[#d8c9a6] bg-white/50 px-5 py-2 font-sans text-[14px] font-medium text-wandor-text transition-all hover:border-wandor-dark'
              }
            >
              {c ?? '全部'}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-wandor-prompt/40 bg-white/40 px-8 py-16 text-center">
          <p className="font-sans text-lg font-medium text-wandor-text">
            {activeCat ? `「${activeCat}」分类还没有文章。` : '还没有写到这个地方。'}
          </p>
          <p className="mt-2 font-sans text-sm text-wandor-muted">
            {activeCat ? '很快会有的——写好的第一篇会自动出现在这里。' : '换个词试试。或者，这正好是下一篇的选题。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {visible.map((post, index) => (
            <Link
              key={post.slug}
              to={`/post/${post.slug}`}
              style={{ transitionDelay: `${(index % 3) * 90}ms` }}
              className="reveal group overflow-hidden rounded-[28px] border border-[#e5d8ba] bg-[#fffdf6] shadow-[0_2px_10px_rgba(144,88,49,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(144,88,49,0.14)]"
            >
              <div className="aspect-[10/7] overflow-hidden">
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
                  <PostCover motif={post.motif} palette={post.palette} />
                </div>
              </div>
              <div className="p-6">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-wandor-prompt">
                    {post.kind}
                    {post.sample && (
                      <i className="rounded-full border border-wandor-prompt/40 px-1.5 py-px font-sans text-[10px] font-medium not-italic normal-case tracking-normal text-wandor-prompt/80">
                        示例
                      </i>
                    )}
                  </span>
                  <span className="font-display text-[11px] uppercase tracking-[0.08em] text-wandor-muted/80">
                    {post.stamp}
                  </span>
                </div>
                <h3 className="mb-2 font-sans text-[20px] font-semibold leading-snug tracking-[-0.01em] text-wandor-text">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-2 font-sans text-[14px] leading-relaxed text-wandor-muted">{post.excerpt}</p>
                <div className="flex items-center gap-3 font-sans text-[12px] text-wandor-muted/90">
                  <span>{post.date}</span>
                  {post.readTime && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
