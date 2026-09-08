# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Marci Bubble Dashboard >> expands and collapses travel destination details
- Location: tests\dashboard.spec.ts:61:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.travel-action')
Expected pattern: /Plan a trip/i
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('.travel-action')

```

```yaml
- main:
  - link "Marci Bubble dashboard":
    - /url: "#dashboard"
    - text: MARCI BUBBLE
  - text: TUESDAY •8 SEPTEMBER 2026
  - navigation "Azioni dashboard":
    - button "Stato connessione dati dashboard": DATA / LIVE
    - 'button "Cambia tema, attuale: dark"': "Theme: Dark"
    - button "Apri impostazioni"
  - navigation "Navigazione viste dashboard":
    - 'button "Vista: Overview" [pressed]': Overview
    - 'button "Vista: Editorial"': Editorial
    - 'button "Vista: Finance"': Finance
    - 'button "Vista: Mobility"': Mobility
    - 'button "Vista: Focus & Notes"': Focus & Notes
  - paragraph: PERSONAL INFORMATION INSTRUMENT
  - heading "Good afternoon, Marci." [level=1]:
    - text: Good afternoon,
    - emphasis: Marci.
  - text: 08.09.2026 · Catania, Italy
  - region "Weather":
    - heading "Weather" [level=2]
    - text: OPEN-METEO
    - paragraph: CATANIA
    - paragraph: 28°
    - paragraph: Sereno · percepiti 29°
    - text: HIGH 31° LOW 23° 47% 12 km/h Open-Meteo · Live weather for catania
  - region "Local time":
    - heading "Local time" [level=2]
    - text: Europe/Rome
    - time: 15:11:11
    - paragraph: Tuesday, 8 September
    - text: Catania, Italy · Real time
  - region "Personal":
    - heading "Personal" [level=2]
    - text: LOCAL
    - paragraph: OGGI IN AGENDA
    - article:
      - time: 09:30
      - heading "Pianificazione & Focus Strategico" [level=3]
      - paragraph: Today · Agenda Locale
    - article:
      - time: 14:30
      - heading "Revisione Progetti & Dashboard Release" [level=3]
      - paragraph: Today · Agenda Locale
    - article:
      - time: 18:00
      - heading "Riepilogo & Organizzazione Attività" [level=3]
      - paragraph: In 02h 48m · Agenda Locale
    - text: Agenda locale · 3 impegni del giorno
  - region "Now Playing":
    - heading "Now Playing" [level=2]
    - text: IDLE
    - img "Copertina di DIO LO SA"
    - text: ULTIMO ASCOLTO UNA VITA FA (feat. Shiva) Geolier DIO LO SA Ascoltato 10m fa · Last.fm
  - text: MARCI BUBBLE Designed to be quiet when nothing happens. V1 · LIVE FEEDS
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('Marci Bubble Dashboard', () => {
  4   |   test('renders the dashboard with all 6 instrument bubbles and zero console errors', async ({ page }) => {
  5   |     const consoleErrors: string[] = []
  6   |     page.on('console', (msg) => {
  7   |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  8   |     })
  9   |     page.on('pageerror', (err) => consoleErrors.push(err.message))
  10  | 
  11  |     await page.goto('/')
  12  |     await page.waitForTimeout(1000)
  13  | 
  14  |     // Check header
  15  |     await expect(page.locator('.wordmark')).toHaveText(/MARCI/i)
  16  |     await expect(page.locator('.topbar-center')).toBeVisible()
  17  | 
  18  |     // Check all 6 bubbles
  19  |     const titles = (await page.locator('.bubble h2').allTextContents()).map((t) => t.toUpperCase())
  20  |     expect(titles).toContain('WEATHER')
  21  |     expect(titles).toContain('LOCAL TIME')
  22  |     expect(titles).toContain('MARKETS')
  23  |     expect(titles).toContain('NEWS')
  24  |     expect(titles).toContain('PERSONAL')
  25  |     expect(titles).toContain('TRAVEL')
  26  | 
  27  |     // Expect no critical console errors
  28  |     expect(consoleErrors).toHaveLength(0)
  29  |   })
  30  | 
  31  |   test('toggles theme between dark and light mode', async ({ page }) => {
  32  |     await page.goto('/')
  33  |     const html = page.locator('html')
  34  | 
  35  |     // Default dark
  36  |     await expect(html).toHaveAttribute('data-theme', 'dark')
  37  | 
  38  |     // Click theme button
  39  |     await page.click('.theme-button')
  40  |     await expect(html).toHaveAttribute('data-theme', 'light')
  41  | 
  42  |     // Click again to toggle back
  43  |     await page.click('.theme-button')
  44  |     await expect(html).toHaveAttribute('data-theme', 'dark')
  45  |   })
  46  | 
  47  |   test('opens and closes settings drawer', async ({ page }) => {
  48  |     await page.goto('/')
  49  | 
  50  |     // Click settings slider button
  51  |     await page.click('.icon-button')
  52  |     const drawer = page.locator('.drawer-panel')
  53  |     await expect(drawer).toBeVisible()
  54  |     await expect(drawer).toContainText('INSTRUMENT SETTINGS')
  55  | 
  56  |     // Close via close button
  57  |     await page.click('.drawer-close')
  58  |     await expect(page.locator('.drawer-panel')).toHaveCount(0)
  59  |   })
  60  | 
  61  |   test('expands and collapses travel destination details', async ({ page }) => {
  62  |     await page.goto('/')
  63  | 
  64  |     const travelAction = page.locator('.travel-action')
> 65  |     await expect(travelAction).toHaveText(/Plan a trip/i)
      |                                ^ Error: expect(locator).toHaveText(expected) failed
  66  | 
  67  |     // Click to expand
  68  |     await travelAction.click()
  69  |     await expect(page.locator('.travel-details-panel')).toBeVisible()
  70  |     await expect(travelAction).toHaveText(/Hide details/i)
  71  | 
  72  |     // Click to collapse
  73  |     await travelAction.click()
  74  |     await expect(page.locator('.travel-details-panel')).toHaveCount(0)
  75  |     await expect(travelAction).toHaveText(/Plan a trip/i)
  76  |   })
  77  | 
  78  |   test('renders navigable news articles with valid external links', async ({ page }) => {
  79  |     await page.goto('/')
  80  | 
  81  |     const newsLinks = page.locator('.news-row')
  82  |     const count = await newsLinks.count()
  83  |     expect(count).toBeGreaterThanOrEqual(1)
  84  | 
  85  |     const firstHref = await newsLinks.first().getAttribute('href')
  86  |     expect(firstHref).toMatch(/^https?:\/\//)
  87  |   })
  88  | 
  89  |   test('switches city preset in settings and updates dashboard instruments', async ({ page }) => {
  90  |     await page.goto('/')
  91  | 
  92  |     // Open settings drawer
  93  |     await page.click('.icon-button')
  94  |     const drawer = page.locator('.drawer-panel')
  95  |     await expect(drawer).toBeVisible()
  96  | 
  97  |     // Select Roma preset
  98  |     const romaButton = page.locator('.preset-item', { hasText: 'ROMA' })
  99  |     await romaButton.click()
  100 | 
  101 |     // Close settings drawer
  102 |     await page.click('.drawer-close')
  103 | 
  104 |     // Verify hero date displays Rome
  105 |     await expect(page.locator('.intro span')).toContainText('Rome')
  106 | 
  107 |     // Verify weather place displays ROMA
  108 |     await expect(page.locator('.weather-place')).toHaveText('ROMA')
  109 | 
  110 |     // Verify clock bubble displays Rome
  111 |     await expect(page.locator('.clock-bubble small')).toContainText('Rome')
  112 |   })
  113 | })
  114 | 
```