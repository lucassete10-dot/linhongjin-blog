import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const baseUrl = process.env.HELP_MYSELF_URL ?? 'http://127.0.0.1:5173'
const browserPath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDirectory = fileURLToPath(new URL('../tmp/visual-qa/', import.meta.url))

await mkdir(outputDirectory, { recursive: true })

const browser = await chromium.launch({ executablePath: browserPath, headless: true })

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const desktop = await context.newPage()
  desktop.setDefaultTimeout(15_000)
  desktop.setDefaultNavigationTimeout(20_000)
  await desktop.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await desktop.waitForTimeout(1_200)
  await desktop.screenshot({ path: join(outputDirectory, 'home-desktop.png') })

  const homeMetrics = await desktop.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    documentHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }))
  await desktop.locator('.studio-stories').scrollIntoViewIfNeeded()
  await desktop.waitForTimeout(700)
  await desktop.screenshot({ path: join(outputDirectory, 'home-stories-desktop.png') })
  await desktop.locator('.studio-project-preview').scrollIntoViewIfNeeded()
  await desktop.waitForTimeout(700)
  await desktop.screenshot({ path: join(outputDirectory, 'home-project-desktop.png') })

  const pinOverlap = await desktop.evaluate(async () => {
    const notes = document.querySelector('.studio-notes')
    const pinTitle = document.querySelector('.studio-pin-title')
    const pinSection = document.querySelector('.studio-pin-section')
    if (!notes || !pinTitle || !pinSection) return { maxOverlapPixels: -1, worstScrollY: 0 }

    const notesTop = notes.getBoundingClientRect().top + window.scrollY
    const sectionTop = pinSection.getBoundingClientRect().top + window.scrollY
    let maxOverlapPixels = 0
    let worstScrollY = notesTop

    for (let scrollY = Math.max(0, notesTop - 180); scrollY <= sectionTop + 240; scrollY += 50) {
      window.scrollTo(0, scrollY)
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const notesRect = notes.getBoundingClientRect()
      const titleRect = pinTitle.getBoundingClientRect()
      const horizontalOverlap = Math.min(notesRect.right, titleRect.right) - Math.max(notesRect.left, titleRect.left)
      const verticalOverlap = Math.min(notesRect.bottom, titleRect.bottom) - Math.max(notesRect.top, titleRect.top)
      const overlap = horizontalOverlap > 0 ? Math.max(0, verticalOverlap) : 0
      if (overlap > maxOverlapPixels) {
        maxOverlapPixels = overlap
        worstScrollY = scrollY
      }
    }

    return { maxOverlapPixels: Math.round(maxOverlapPixels), worstScrollY: Math.round(worstScrollY) }
  })
  await desktop.evaluate((scrollY) => window.scrollTo(0, scrollY), pinOverlap.worstScrollY)
  await desktop.waitForTimeout(150)
  await desktop.screenshot({ path: join(outputDirectory, 'home-scroll-transition.png') })
  if (pinOverlap.maxOverlapPixels > 0) {
    throw new Error(`首页滚动区文字发生 ${pinOverlap.maxOverlapPixels}px 重叠。`)
  }

  await desktop.goto(`${baseUrl}/#/projects`, { waitUntil: 'domcontentloaded' })
  await desktop.waitForTimeout(700)
  await desktop.screenshot({ path: join(outputDirectory, 'projects-desktop.png') })
  const projectCardCount = await desktop.locator('.studio-project-card').count()

  await desktop.goto(`${baseUrl}/#/search`, { waitUntil: 'domcontentloaded' })
  await desktop.waitForTimeout(700)
  const searchLayout = await desktop.evaluate(() => {
    const heading = document.querySelector('.search-page-heading h1')?.getBoundingClientRect()
    const searchBox = document.querySelector('.search-page > .search-box')?.getBoundingClientRect()
    const card = document.querySelector('.search-results .content-card')?.getBoundingClientRect()
    const cardTitle = document.querySelector('.search-results .content-card h3')
    const titleStyle = cardTitle ? getComputedStyle(cardTitle) : null
    const titleLines = cardTitle && titleStyle ? Math.round(cardTitle.getBoundingClientRect().height / Number.parseFloat(titleStyle.lineHeight)) : 0
    return {
      headingLeft: Math.round(heading?.left ?? -1),
      searchCenterOffset: Math.round(Math.abs(((searchBox?.left ?? 0) + (searchBox?.width ?? 0) / 2) - window.innerWidth / 2)),
      cardHeight: Math.round(card?.height ?? -1),
      cardTitleLines: titleLines,
    }
  })
  await desktop.screenshot({ path: join(outputDirectory, 'search-desktop.png'), fullPage: true })
  if (searchLayout.searchCenterOffset > 2 || searchLayout.cardHeight > 320 || searchLayout.cardTitleLines > 2) {
    throw new Error(`搜索页布局不符合紧凑规范：${JSON.stringify(searchLayout)}`)
  }

  await desktop.goto(`${baseUrl}/#/tools`, { waitUntil: 'domcontentloaded' })
  await desktop.waitForTimeout(700)
  const toolFilterCount = await desktop.locator('.filter-row button').count()
  let toolFilterWorks = false
  if (toolFilterCount > 1) {
    const filter = desktop.locator('.filter-row button').nth(1)
    await filter.click({ force: true })
    toolFilterWorks = await filter.getAttribute('aria-pressed') === 'true'
  }
  await desktop.screenshot({ path: join(outputDirectory, 'tools-filtered.png') })

  await desktop.goto(`${baseUrl}/#/content/wechat-voice-input-with-codex`, { waitUntil: 'domcontentloaded' })
  await desktop.waitForTimeout(700)
  const voiceArticlePublished = await desktop.getByRole('heading', { name: /用微信语音输入直接与 Codex 协作/ }).isVisible().catch(() => false)
  const voiceArticleCoverVisible = await desktop.locator('.article-feature-image img').evaluate((image) => {
    const element = /** @type {HTMLImageElement} */ (image)
    return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0
  }).catch(() => false)
  await desktop.screenshot({ path: join(outputDirectory, 'voice-codex-article.png') })

  const articleTitle = await desktop.locator('.article-header h1').innerText()
  const documentTitle = await desktop.title()
  const metadataWorks = documentTitle.includes(articleTitle)
  await desktop.getByRole('button', { name: /生成海报/ }).click()
  await desktop.locator('.poster-panel img').waitFor({ state: 'visible' })
  const posterSource = await desktop.locator('.poster-panel img').getAttribute('src')
  const posterWorks = Boolean(posterSource?.startsWith('data:image/png'))
  await desktop.screenshot({ path: join(outputDirectory, 'article-share-poster.png') })

  await desktop.goto(`${baseUrl}/#/admin`, { waitUntil: 'domcontentloaded' })
  await desktop.waitForTimeout(700)
  const adminLoginVisible = await desktop.locator('form.login-card').isVisible().catch(() => false)
  await desktop.screenshot({ path: join(outputDirectory, 'admin-login.png') })

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true })
  mobile.setDefaultTimeout(15_000)
  mobile.setDefaultNavigationTimeout(20_000)
  await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await mobile.waitForTimeout(900)
  const mobileHomeOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  await mobile.screenshot({ path: join(outputDirectory, 'home-mobile.png') })
  await mobile.goto(`${baseUrl}/#/search`, { waitUntil: 'domcontentloaded' })
  await mobile.waitForTimeout(700)
  const mobileSearchCardHeight = Math.round((await mobile.locator('.search-results .content-card').first().boundingBox())?.height ?? -1)
  const mobileSearchOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  await mobile.screenshot({ path: join(outputDirectory, 'search-mobile.png'), fullPage: true })
  await mobile.goto(`${baseUrl}/#/content/wechat-voice-input-with-codex`, { waitUntil: 'domcontentloaded' })
  await mobile.waitForTimeout(700)
  await mobile.locator('.article-share').scrollIntoViewIfNeeded()
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  await mobile.screenshot({ path: join(outputDirectory, 'article-share-mobile.png') })

  console.log(JSON.stringify({
    homeMetrics,
    pinOverlap,
    mobileHomeOverflow,
    projectCardCount,
    searchLayout,
    mobileSearchCardHeight,
    mobileSearchOverflow,
    toolFilterCount,
    toolFilterWorks,
    voiceArticlePublished,
    voiceArticleCoverVisible,
    metadataWorks,
    posterWorks,
    adminLoginVisible,
    mobileOverflow,
  }, null, 2))
} finally {
  await browser.close()
}
