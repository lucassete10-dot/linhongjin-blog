import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const baseUrl = process.env.HELP_MYSELF_URL ?? 'http://127.0.0.1:5173'
const browserPath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const username = process.env.ADMIN_USERNAME
const password = process.env.ADMIN_PASSWORD
const outputDirectory = fileURLToPath(new URL('../tmp/visual-qa/', import.meta.url))
const coverImage = fileURLToPath(new URL('../assets/brand/flora-hero-v1.png', import.meta.url))

if (!username || !password) throw new Error('qa:admin 需要 ADMIN_USERNAME 和 ADMIN_PASSWORD 环境变量。')

await mkdir(outputDirectory, { recursive: true })
const browser = await chromium.launch({ executablePath: browserPath, headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto(`${baseUrl}/#/admin`, { waitUntil: 'networkidle' })
  await page.getByLabel('管理员邮箱').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: '登录', exact: true }).click()
  await page.getByText(`你好，${username}`).waitFor()
  await page.screenshot({ path: join(outputDirectory, 'admin-dashboard.png') })

  await page.getByRole('button', { name: /新建内容/ }).last().click()
  await page.getByLabel('标题').fill('UI e2e article')
  await page.getByLabel('URL 标识').fill('ui-e2e-article')
  await page.getByLabel('摘要').fill('ui-e2e searchable content')
  await page.getByLabel('正文（Markdown）').fill('This item validates the Markdown content editor.')
  await page.locator('.upload-row input[type="file"]').setInputFiles(coverImage)
  await page.getByText('图片上传成功，保存内容后生效。').waitFor()
  await page.getByLabel('状态').selectOption('published')
  await page.getByRole('button', { name: '保存并发布' }).click()
  await page.getByText('内容已保存并发布。').waitFor()

  await page.goto(`${baseUrl}/#/search?q=ui-e2e`, { waitUntil: 'networkidle' })
  await page.getByText('UI e2e article').waitFor()

  await page.goto(`${baseUrl}/#/admin`, { waitUntil: 'networkidle' })
  const row = page.locator('.content-row').filter({ hasText: 'UI e2e article' })
  await row.getByRole('button', { name: '编辑' }).click()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '删除' }).click()
  await page.getByText('全部内容').waitFor()
  if (await page.getByText('UI e2e article').count()) throw new Error('测试内容删除失败。')

  console.log(JSON.stringify({ login: true, upload: true, publish: true, publicSearch: true, delete: true }, null, 2))
} finally {
  await browser.close()
}
