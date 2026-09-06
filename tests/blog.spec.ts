import { test, expect } from "@playwright/test";

test("home projects are interactive and link to real repositories", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("builds");
  await page.getByRole("button", { name: "和 AI 聊聊" }).click();
  await expect(page.locator(".demo-chat-answer")).toBeVisible();
  await page.getByRole("button", { name: "拉 / PULL" }).click();
  await expect(page.locator(".exercise")).toContainText("高位下拉");
  await page.getByRole("button", { name: "试记一组" }).click();
  await expect(page.locator(".exercise strong")).toContainText("1 / 4");
  const slider = page.getByRole("slider");
  await slider.fill("70");
  await expect(page.locator(".vision-coordinate")).toContainText("224");
  await expect(page.locator(".project-copy a")).toHaveCount(3);
  await expect(page.locator(".post-row")).toHaveCount(2);
  expect(errors).toEqual([]);
});

test("search, keyboard dismissal, article navigation and archive filters", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "打开搜索" }).click();
  await page.getByRole("textbox", { name: "搜索文章" }).fill("zzzz-no-match");
  await expect(page.locator(".empty-search")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "打开搜索" })).toBeFocused();
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "搜索文章" }).fill("微信");
  await page.locator(".search-results button").first().click();
  await expect(page).toHaveURL(/post\/wechat-voice-input-with-codex/);
  await expect(page.locator(".article-prose")).toBeVisible();
  await page.goto("/#/articles");
  await page.getByRole("button", { name: "旅行", exact: true }).click();
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "查看全部文章" }).click();
  await expect(page.locator(".post-row")).toHaveCount(2);
  await page.getByRole("textbox", { name: "筛选文章" }).fill("微信");
  await page.reload();
  await expect(page.locator(".post-row")).toHaveCount(1);
});

test("legacy examples, unknown pages, RSS and branding assets", async ({
  page,
  request,
}) => {
  await page.goto("/#/post/chiangmai-cafe");
  await expect(page.locator(".sample-notice")).toBeVisible();
  await page.goto("/#/missing");
  await expect(page.locator(".not-found")).toBeVisible();
  const feed = await request.get("/feed.xml");
  expect(feed.ok()).toBeTruthy();
  const xml = await feed.text();
  expect(xml.match(/<item>/g)).toHaveLength(2);
  expect(xml).not.toContain("chiangmai-cafe");
  for (const asset of ["/favicon.svg", "/social-card.png", "/CNAME"])
    expect((await request.get(asset)).ok()).toBeTruthy();
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout fits ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const route of ["/", "/#/articles", "/#/post/help-myself-project"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
  });
}
