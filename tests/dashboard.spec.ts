import { test, expect } from '@playwright/test'

test.describe('Marci Bubble Dashboard', () => {
  test('renders the dashboard with all 6 instrument bubbles and zero console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => consoleErrors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(1000)

    // Check header
    await expect(page.locator('.wordmark')).toHaveText(/MARCI/i)
    await expect(page.locator('.topbar-center')).toBeVisible()

    // Check all 6 bubbles
    const titles = (await page.locator('.bubble h2').allTextContents()).map((t) => t.toUpperCase())
    expect(titles).toContain('WEATHER')
    expect(titles).toContain('LOCAL TIME')
    expect(titles).toContain('MARKETS')
    expect(titles).toContain('NEWS')
    expect(titles).toContain('PERSONAL')
    expect(titles).toContain('TRAVEL')

    // Expect no critical console errors
    expect(consoleErrors).toHaveLength(0)
  })

  test('toggles theme between dark and light mode', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')

    // Default dark
    await expect(html).toHaveAttribute('data-theme', 'dark')

    // Click theme button
    await page.click('.theme-button')
    await expect(html).toHaveAttribute('data-theme', 'light')

    // Click again to toggle back
    await page.click('.theme-button')
    await expect(html).toHaveAttribute('data-theme', 'dark')
  })

  test('opens and closes settings drawer', async ({ page }) => {
    await page.goto('/')

    // Click settings slider button
    await page.click('.icon-button')
    const drawer = page.locator('.drawer-panel')
    await expect(drawer).toBeVisible()
    await expect(drawer).toContainText('INSTRUMENT SETTINGS')

    // Close via close button
    await page.click('.drawer-close')
    await expect(page.locator('.drawer-panel')).toHaveCount(0)
  })

  test('expands and collapses travel destination details', async ({ page }) => {
    await page.goto('/')

    const travelAction = page.locator('.travel-action')
    await expect(travelAction).toHaveText(/Plan a trip/i)

    // Click to expand
    await travelAction.click()
    await expect(page.locator('.travel-details-panel')).toBeVisible()
    await expect(travelAction).toHaveText(/Hide details/i)

    // Click to collapse
    await travelAction.click()
    await expect(page.locator('.travel-details-panel')).toHaveCount(0)
    await expect(travelAction).toHaveText(/Plan a trip/i)
  })

  test('renders navigable news articles with valid external links', async ({ page }) => {
    await page.goto('/')

    const newsLinks = page.locator('.news-row')
    const count = await newsLinks.count()
    expect(count).toBeGreaterThanOrEqual(1)

    const firstHref = await newsLinks.first().getAttribute('href')
    expect(firstHref).toMatch(/^https?:\/\//)
  })

  test('switches city preset in settings and updates dashboard instruments', async ({ page }) => {
    await page.goto('/')

    // Open settings drawer
    await page.click('.icon-button')
    const drawer = page.locator('.drawer-panel')
    await expect(drawer).toBeVisible()

    // Select Roma preset
    const romaButton = page.locator('.preset-item', { hasText: 'ROMA' })
    await romaButton.click()

    // Close settings drawer
    await page.click('.drawer-close')

    // Verify hero date displays Rome
    await expect(page.locator('.intro span')).toContainText('Rome')

    // Verify weather place displays ROMA
    await expect(page.locator('.weather-place')).toHaveText('ROMA')

    // Verify clock bubble displays Rome
    await expect(page.locator('.clock-bubble small')).toContainText('Rome')
  })
})
