import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ContentItem } from '../types'

interface ArticleShareProps {
  item: ContentItem
}

function copyWithFallback(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
  return Promise.resolve()
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = []
  let line = ''

  for (const character of text) {
    const nextLine = line + character
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line)
      line = character
      if (lines.length === maxLines) break
    } else {
      line = nextLine
    }
  }

  if (lines.length < maxLines && line) lines.push(line)
  if (lines.join('').length < text.length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[，。；、！？,.!?\s]+$/, '')}…`
  }
  return lines
}

async function createPoster(item: ContentItem, url: string) {
  const width = 1080
  const height = 1440
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器无法生成海报。')

  context.fillStyle = '#f3f5f4'
  context.fillRect(0, 0, width, height)
  context.strokeStyle = '#d8dcda'
  context.lineWidth = 1
  for (let x = 72; x < width; x += 96) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }
  for (let y = 72; y < height; y += 96) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }

  const modules = [
    { x: 72, y: 72, width: 250, height: 118, color: '#36d7e5' },
    { x: 846, y: 118, width: 162, height: 162, color: '#8577f7' },
    { x: 72, y: 1204, width: 178, height: 164, color: '#ff6293' },
    { x: 824, y: 1260, width: 184, height: 108, color: '#7ee63f' },
  ]
  modules.forEach((module) => {
    context.fillStyle = module.color
    context.beginPath()
    context.roundRect(module.x, module.y, module.width, module.height, 26)
    context.fill()
  })

  context.shadowColor = 'rgba(8, 11, 11, 0.12)'
  context.shadowBlur = 48
  context.shadowOffsetY = 18
  context.fillStyle = '#ffffff'
  context.beginPath()
  context.roundRect(72, 250, 936, 940, 42)
  context.fill()
  context.shadowColor = 'transparent'

  context.fillStyle = '#080b0b'
  context.fillRect(112, 304, 62, 62)
  context.fillStyle = '#36d7e5'
  context.fillRect(133, 325, 20, 20)
  context.fillStyle = '#ffffff'
  context.font = '720 21px "Geist", sans-serif'
  context.textAlign = 'center'
  context.fillText('HM', 143, 346)

  context.textAlign = 'left'
  context.fillStyle = '#080b0b'
  context.font = '720 32px "Geist", "Noto Sans SC", sans-serif'
  context.fillText('Help Myself', 198, 333)
  context.fillStyle = '#586160'
  context.font = '500 22px "Geist", "Noto Sans SC", sans-serif'
  context.fillText('Help myself, help others.', 198, 365)

  context.fillStyle = '#080b0b'
  context.font = '650 23px "Geist", "Noto Sans SC", sans-serif'
  context.fillText(item.category || 'Flora 的学习记录', 112, 458)

  context.fillStyle = '#080b0b'
  context.font = '720 66px "Geist", "Noto Sans SC", sans-serif'
  const titleLines = wrapText(context, item.title, 820, 3)
  titleLines.forEach((line, index) => context.fillText(line, 112, 555 + index * 84))

  context.fillStyle = '#586160'
  context.font = '430 28px "Geist", "Noto Sans SC", sans-serif'
  const summaryLines = wrapText(context, item.summary, 820, 3)
  const summaryTop = 598 + titleLines.length * 84
  summaryLines.forEach((line, index) => context.fillText(line, 112, summaryTop + index * 46))

  const { toDataURL } = await import('qrcode')
  const qrCode = await loadImage(await toDataURL(url, {
    width: 210,
    margin: 1,
    color: { dark: '#080b0b', light: '#ffffff' },
  }))
  context.fillStyle = '#ffffff'
  context.beginPath()
  context.roundRect(112, 902, 238, 238, 24)
  context.fill()
  context.strokeStyle = '#d8dcda'
  context.stroke()
  context.drawImage(qrCode, 126, 916, 210, 210)

  context.fillStyle = '#080b0b'
  context.font = '650 27px "Geist", "Noto Sans SC", sans-serif'
  context.fillText('扫码阅读全文', 390, 980)
  context.fillStyle = '#586160'
  context.font = '430 22px "Geist", "Noto Sans SC", sans-serif'
  context.fillText(`${item.date}  ·  ${item.readTime}`, 390, 1028)
  context.fillText('linhongjin.top', 390, 1074)

  return canvas.toDataURL('image/png')
}

export function ArticleShare({ item }: ArticleShareProps) {
  const [notice, setNotice] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [creatingPoster, setCreatingPoster] = useState(false)

  useEffect(() => () => {
    if (posterUrl.startsWith('blob:')) URL.revokeObjectURL(posterUrl)
  }, [posterUrl])

  useEffect(() => {
    if (!posterUrl) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPosterUrl('')
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [posterUrl])

  const pageUrl = window.location.href

  const copyLink = async () => {
    try {
      await copyWithFallback(pageUrl)
      setNotice('链接已复制，可以粘贴到朋友圈、小红书或聊天中。')
    } catch {
      setNotice('复制失败，请从浏览器地址栏复制链接。')
    }
  }

  const shareArticle = async () => {
    if (!navigator.share) {
      await copyLink()
      return
    }

    try {
      await navigator.share({ title: item.title, text: item.summary, url: pageUrl })
      setNotice('已打开系统分享面板。')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      await copyLink()
    }
  }

  const makePoster = async () => {
    setCreatingPoster(true)
    setNotice('')
    try {
      await document.fonts.ready
      setPosterUrl(await createPoster(item, pageUrl))
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '海报生成失败，请稍后再试。')
    } finally {
      setCreatingPoster(false)
    }
  }

  const posterDialog = posterUrl ? createPortal(
    (
        <div className="poster-dialog" role="dialog" aria-modal="true" aria-labelledby="poster-dialog-title">
          <button className="poster-backdrop" type="button" onClick={() => setPosterUrl('')} aria-label="关闭分享海报" />
          <div className="poster-panel">
            <div className="poster-heading">
              <div><p className="share-eyebrow">Share poster</p><h2 id="poster-dialog-title">文章分享海报</h2></div>
              <button type="button" className="poster-close" onClick={() => setPosterUrl('')} aria-label="关闭" autoFocus>×</button>
            </div>
            <img src={posterUrl} alt={`《${item.title}》分享海报`} />
            <p>手机端可以长按图片保存，再分享到朋友圈或其他平台。</p>
            <a className="poster-download" href={posterUrl} download={`${item.slug}-poster.png`}>保存海报</a>
          </div>
        </div>
    ),
    document.body,
  ) : null

  return (
    <>
      <section className="article-share" aria-labelledby="article-share-title">
        <div>
          <p className="share-eyebrow">Share this note</p>
          <h2 id="article-share-title">把这篇记录分享给需要的人</h2>
        </div>
        <div className="share-actions">
          <button type="button" onClick={() => void copyLink()}><span aria-hidden="true">⧉</span>复制链接</button>
          <button type="button" onClick={() => void shareArticle()}><span aria-hidden="true">↗</span>分享文章</button>
          <button type="button" onClick={() => void makePoster()} disabled={creatingPoster}>
            <span aria-hidden="true">▣</span>{creatingPoster ? '生成中…' : '生成海报'}
          </button>
        </div>
        {notice && <p className="share-notice" role="status">{notice}</p>}
      </section>
      {posterDialog}
    </>
  )
}
