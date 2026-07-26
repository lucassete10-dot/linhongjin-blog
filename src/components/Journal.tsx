import { Link, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { posts } from '@/data/posts'
import { PostCover } from './Scene'

export function Journal() {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()

  const visible = query
    ? posts.filter((post) =>
        [post.title, post.excerpt, post.place, post.category, ...post.tags]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : posts

  return (
    <section id="journal" className="mx-auto max-w-page px-20 pb-28 pt-8 max-md:px-6">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-display text-sm uppercase tracking-[0.18em] text-wandor-prompt">Field Notes</p>
          <h2 className="font-sans text-[34px] font-medium tracking-[-0.02em] text-wandor-text max-md:text-[28px]">
            {query ? `搜索「${query}」` : '最近的笔记'}
          </h2>
        </div>
        {query ? (
          <button
            type="button"
            onClick={() => setParams({})}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-wandor-prompt/40 bg-transparent px-4 py-2 font-sans text-sm font-medium text-wandor-prompt transition-opacity hover:opacity-60"
          >
            <X className="h-4 w-4" /> 清除搜索 · 共 {visible.length} 篇
          </button>
        ) : (
          <span className="font-sans text-sm text-wandor-muted">{posts.length} 篇，还在继续写</span>
        )}
      </header>

      {visible.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-wandor-prompt/40 bg-white/40 px-8 py-16 text-center">
          <p className="font-sans text-lg font-medium text-wandor-text">还没有写到这个地方。</p>
          <p className="mt-2 font-sans text-sm text-wandor-muted">换个词试试。或者，这正好是下一篇的选题。</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {visible.map((post) => (
            <Link
              key={post.slug}
              to={`/post/${post.slug}`}
              className="group overflow-hidden rounded-[28px] border border-[#e5d8ba] bg-[#fffdf6] shadow-[0_2px_10px_rgba(144,88,49,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(144,88,49,0.14)]"
            >
              <div className="aspect-[10/7] overflow-hidden">
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
                  <PostCover motif={post.motif} palette={post.palette} />
                </div>
              </div>
              <div className="p-6">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-wandor-prompt">
                    {post.category}
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
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
