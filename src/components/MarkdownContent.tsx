import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/* 正文渲染：样式由 index.css 的 .article-prose 承接 */
export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-wandor-prompt underline underline-offset-4">
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt ?? ''} loading="lazy" className="my-6 w-full rounded-[18px] border border-[#e5d8ba]" />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
