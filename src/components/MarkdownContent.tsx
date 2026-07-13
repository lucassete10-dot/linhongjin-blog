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

function youtubeStartSeconds(value: string | null): string | null {
  if (!value) return null
  if (/^\d+$/.test(value)) return value
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i)
  if (!match) return null
  const seconds = Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
  return seconds > 0 ? String(seconds) : null
}

function youtubeEmbedUrl(href?: string): string | null {
  if (!href) return null
  try {
    const url = new URL(href)
    const hostname = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
    let videoId: string | null = null

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? null
    } else if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v')
      if (!videoId) videoId = url.pathname.match(/^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]+)/)?.[1] ?? null
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) return null

    const parameters = new URLSearchParams({ rel: '0' })
    const start = youtubeStartSeconds(url.searchParams.get('start') || url.searchParams.get('t'))
    if (start) parameters.set('start', start)
    return `https://www.youtube-nocookie.com/embed/${videoId}?${parameters}`
  } catch {
    return null
  }
}

function videoEmbed(href?: string) {
  const bilibili = bilibiliEmbedUrl(href)
  if (bilibili) return { src: bilibili, platform: 'Bilibili', className: 'bilibili-embed', sourceLabel: '在 B站打开' }
  const youtube = youtubeEmbedUrl(href)
  if (youtube) return { src: youtube, platform: 'YouTube', className: 'youtube-embed', sourceLabel: '在 YouTube 打开' }
  return null
}

export function MarkdownContent({ markdown, className = '' }: { markdown: string; className?: string }) {
  return (
    <div className={`markdown-body ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...properties }) => {
            const embed = videoEmbed(href)
            if (embed) {
              return (
                <span className={`video-embed ${embed.className}`}>
                  <iframe
                    src={embed.src}
                    title={`${embed.platform} 视频：${String(children)}`}
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                  <a className="video-source-link" href={href} target="_blank" rel="noreferrer">{embed.sourceLabel} ↗</a>
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
