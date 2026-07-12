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
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' })
  await desktop.screenshot({ path: join(outputDirectory, 'home-desktop.png') })
  await desktop.locator('.scroll-cue').click()
  await desktop.waitForTimeout(1100)
  await desktop.screenshot({ path: join(outputDirectory, 'home-content.png') })

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true })
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' })
  await mobile.screenshot({ path: join(outputDirectory, 'home-mobile.png') })

  const menuVisible = await mobile.locator('.menu-button').isVisible()
  const horizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

  console.log(JSON.stringify({ menuVisible, horizontalOverflow }, null, 2))
} finally {
  await browser.close()
}
