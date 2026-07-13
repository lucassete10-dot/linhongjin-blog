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

function drawCoverImage(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const renderedWidth = image.naturalWidth * scale
  const renderedHeight = image.naturalHeight * scale
  context.drawImage(image, (width - renderedWidth) / 2, (height - renderedHeight) / 2, renderedWidth, renderedHeight)
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

  const backgroundSource = item.coverImage || `${window.location.origin}/images/flora-winter-clean-v2.webp`
  let background: HTMLImageElement
  try {
    background = await loadImage(backgroundSource)
  } catch {
    background = await loadImage(`${window.location.origin}/images/flora-winter-clean-v2.webp`)
  }

  drawCoverImage(context, background, width, height)

  const wash = context.createLinearGradient(0, 0, 0, height)
  wash.addColorStop(0, 'rgba(238, 248, 255, 0.2)')
  wash.addColorStop(0.38, 'rgba(244, 249, 250, 0.72)')
  wash.addColorStop(1, 'rgba(255, 250, 240, 0.98)')
  context.fillStyle = wash
  context.fillRect(0, 0, width, height)

  context.fillStyle = 'rgba(255, 255, 255, 0.82)'
  context.beginPath()
  context.roundRect(72, 470, 936, 880, 42)
  context.fill()

  context.fillStyle = '#d9a93b'
  context.beginPath()
  context.arc(128, 552, 31, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#ffffff'
  context.font = '600 28px serif'
  context.textAlign = 'center'
  context.fillText('✦', 128, 563)

  context.textAlign = 'left'
  context.fillStyle = '#183b57'
  context.font = '600 32px "Noto Serif SC", "Songti SC", serif'
  context.fillText('Help Myself', 180, 563)
  context.fillStyle = '#6b7f8d'
  context.font = '500 23px "Noto Serif SC", "Songti SC", serif'
  context.fillText('Help myself, help others.', 180, 602)

  context.fillStyle = '#c76049'
  context.font = '600 24px "Noto Serif SC", "Songti SC", serif'
  context.fillText(item.category || 'Flora 的学习记录', 112, 686)

  context.fillStyle = '#183b57'
  context.font = '600 64px "Noto Serif SC", "Songti SC", serif'
  const titleLines = wrapText(context, item.title, 820, 3)
  titleLines.forEach((line, index) => context.fillText(line, 112, 780 + index * 86))

  context.fillStyle = '#526b77'
  context.font = '400 28px "Noto Serif SC", "Songti SC", serif'
  const summaryLines = wrapText(context, item.summary, 820, 3)
  const summaryTop = 820 + titleLines.length * 86
  summaryLines.forEach((line, index) => context.fillText(line, 112, summaryTop + index * 46))

  const { toDataURL } = await import('qrcode')
  const qrCode = await loadImage(await toDataURL(url, {
    width: 210,
    margin: 1,
    color: { dark: '#183b57', light: '#fffaf0' },
  }))
  context.fillStyle = '#fffaf0'
  context.beginPath()
  context.roundRect(112, 1080, 238, 238, 24)
  context.fill()
  context.drawImage(qrCode, 126, 1094, 210, 210)

  context.fillStyle = '#183b57'
  context.font = '600 27px "Noto Serif SC", "Songti SC", serif'
  context.fillText('扫码阅读全文', 390, 1160)
  context.fillStyle = '#6b7f8d'
  context.font = '400 22px "Noto Serif SC", "Songti SC", serif'
  context.fillText(`${item.date}  ·  ${item.readTime}`, 390, 1206)
  context.fillText('linhongjin.top', 390, 1255)

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
