import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { posts, type Block } from '@/data/posts'
import { PostCover } from './Scene'

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={index}>{block.text}</h2>
    case 'quote':
      return <blockquote key={index}>{block.text}</blockquote>
    case 'list':
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    default:
      return <p key={index}>{block.text}</p>
  }
}

export function Article() {
  const { slug } = useParams()
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return <Navigate to="/" replace />

  const post = posts[index]
  const next = posts[(index + 1) % posts.length]

  return (
    <article className="mx-auto max-w-[760px] px-6 pb-28 pt-8">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-wandor-muted transition-opacity hover:opacity-60"
      >
        <ArrowLeft className="h-4 w-4" /> 全部笔记
      </Link>

      <header className="relative mb-9">
        {/* 护照戳记 */}
        <div
          aria-hidden="true"
          className="absolute -top-2 right-0 rotate-6 rounded-lg border-2 border-wandor-rust px-3 py-1.5 font-display text-[13px] uppercase tracking-[0.14em] text-wandor-rust opacity-80 max-md:hidden"
        >
          {post.stamp}
        </div>
        <p className="mb-3 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-wandor-prompt">
          {post.category} · {post.place}
        </p>
        <h1 className="mb-5 max-w-[620px] font-sans text-[clamp(30px,5vw,44px)] font-semibold leading-[1.25] tracking-[-0.02em] text-wandor-text">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 font-sans text-[13px] text-wandor-muted">
          <span>{post.date}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readTime}</span>
          <span aria-hidden="true">·</span>
          <span>{post.tags.map((tag) => `#${tag}`).join(' ')}</span>
        </div>
      </header>

      <div className="mb-12 overflow-hidden rounded-[28px] border border-[#e5d8ba] shadow-[0_2px_12px_rgba(144,88,49,0.08)]">
        <div className="aspect-[2/1]">
          <PostCover motif={post.motif} palette={post.palette} />
        </div>
      </div>

      <div className="article-prose font-sans text-[17px] text-wandor-text">{post.content.map(renderBlock)}</div>

      {/* 文末 */}
      <div aria-hidden="true" className="my-14 text-center font-sans text-lg text-wandor-rust">
        ✳
      </div>

      <Link
        to={`/post/${next.slug}`}
        className="group flex items-center justify-between rounded-[24px] border border-[#e5d8ba] bg-[#fffdf6] px-7 py-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(144,88,49,0.12)]"
      >
        <div>
          <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-wandor-muted">下一篇</p>
          <p className="font-sans text-[18px] font-semibold tracking-[-0.01em] text-wandor-text">{next.title}</p>
        </div>
        <ArrowRight className="h-5 w-5 flex-shrink-0 text-wandor-prompt transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  )
}
