import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function bilibiliEmbedUrl(href?: string): string | null {
  if (!href) return null
  try {
    const url = new URL(href)
    const hostname = url.hostname.replace(/^www\./, '')
    if (hostname !== 'bilibili.com' && !hostname.endsWith('.bilibili.com')) return null

    const videoId = url.pathname.match(/\/video\/(BV[a-zA-Z0-9]+|av\d+)/i)?.[1]
    if (!videoId) return null

    const parameters = new URLSearchParams({
      isOutside: 'true',
      autoplay: '0',
      danmaku: '0',
      poster: '1',
      p: url.searchParams.get('p') || '1',
    })

    if (videoId.toLowerCase().startsWith('av')) {
      parameters.set('aid', videoId.slice(2))
    } else {
      parameters.set('bvid', videoId)
    }

    return `https://player.bilibili.com/player.html?${parameters}`
  } catch {
    return null
  }
}

export function MarkdownContent({ markdown, className = '' }: { markdown: string; className?: string }) {
  return (
    <div className={`markdown-body ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...properties }) => {
            const embedUrl = bilibiliEmbedUrl(href)
            if (embedUrl) {
              return (
                <span className="video-embed bilibili-embed">
                  <iframe
                    src={embedUrl}
                    title={`Bilibili 视频：${String(children)}`}
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                  <a className="video-source-link" href={href} target="_blank" rel="noreferrer">在 B站打开 ↗</a>
                </span>
              )
            }
            return <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noreferrer' : undefined} {...properties}>{children}</a>
          },
          img: ({ src, alt, ...properties }) => <img src={src} alt={alt ?? ''} loading="lazy" {...properties} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
