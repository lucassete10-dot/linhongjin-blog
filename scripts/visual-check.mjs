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
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' })
  await desktop.screenshot({ path: join(outputDirectory, 'home-desktop.png') })

  const homeMetrics = await desktop.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    documentHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }))

  await desktop.goto(`${baseUrl}/#/tools`, { waitUntil: 'networkidle' })
  const toolFilterCount = await desktop.locator('.filter-row button').count()
  let toolFilterWorks = false
  if (toolFilterCount > 1) {
    const filter = desktop.locator('.filter-row button').nth(1)
    await filter.click()
    toolFilterWorks = await filter.getAttribute('aria-pressed') === 'true'
  }
  await desktop.screenshot({ path: join(outputDirectory, 'tools-filtered.png') })

  await desktop.goto(`${baseUrl}/#/articles`, { waitUntil: 'networkidle' })
  await desktop.locator('.content-card').first().click()
  await desktop.waitForLoadState('networkidle')
  const articleTitle = await desktop.locator('.article-header h1').innerText()
  const documentTitle = await desktop.title()
  const metadataWorks = documentTitle.includes(articleTitle)
  await desktop.getByRole('button', { name: /生成海报/ }).click()
  await desktop.locator('.poster-panel img').waitFor({ state: 'visible' })
  const posterSource = await desktop.locator('.poster-panel img').getAttribute('src')
  const posterWorks = Boolean(posterSource?.startsWith('data:image/png'))
  await desktop.screenshot({ path: join(outputDirectory, 'article-share-poster.png') })

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true })
  await mobile.goto(`${baseUrl}/#/articles`, { waitUntil: 'networkidle' })
  await mobile.locator('.content-card').first().click()
  await mobile.waitForLoadState('networkidle')
  await mobile.locator('.article-share').scrollIntoViewIfNeeded()
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  await mobile.screenshot({ path: join(outputDirectory, 'article-share-mobile.png') })

  console.log(JSON.stringify({
    homeMetrics,
    toolFilterCount,
    toolFilterWorks,
    metadataWorks,
    posterWorks,
    mobileOverflow,
  }, null, 2))
} finally {
  await browser.close()
}
