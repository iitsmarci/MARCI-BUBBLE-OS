# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Marci Bubble Dashboard >> renders navigable news articles with valid external links
- Location: tests\dashboard.spec.ts:78:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - link "Marci Bubble dashboard" [ref=e5] [cursor=pointer]:
      - /url: "#dashboard"
      - text: MARCI BUBBLE
    - generic [ref=e7]:
      - generic [ref=e8]: TUESDAY
      - generic [ref=e9]: •8 SEPTEMBER 2026
    - navigation "Azioni dashboard" [ref=e10]:
      - button "Stato connessione dati dashboard" [ref=e11] [cursor=pointer]: DATA / LIVE
      - 'button "Cambia tema, attuale: dark" [ref=e13] [cursor=pointer]':
        - generic [ref=e14]: "Theme: Dark"
      - button "Apri impostazioni" [ref=e15] [cursor=pointer]
  - navigation "Navigazione viste dashboard" [ref=e17]:
    - 'button "Vista: Overview" [pressed] [ref=e18] [cursor=pointer]':
      - generic [ref=e24]: Overview
    - 'button "Vista: Editorial" [ref=e25] [cursor=pointer]':
      - generic [ref=e28]: Editorial
    - 'button "Vista: Finance" [ref=e29] [cursor=pointer]':
      - generic [ref=e33]: Finance
    - 'button "Vista: Mobility" [ref=e34] [cursor=pointer]':
      - generic [ref=e38]: Mobility
    - 'button "Vista: Focus & Notes" [ref=e39] [cursor=pointer]':
      - generic [ref=e42]: Focus & Notes
  - generic [ref=e43]:
    - paragraph [ref=e44]: PERSONAL INFORMATION INSTRUMENT
    - heading [level=1] [ref=e45]:
      - text: Good afternoon,
      - emphasis [ref=e46]: Marci.
    - generic [ref=e47]: 08.09.2026 · Catania, Italy
  - generic [ref=e48]:
    - region "Weather" [ref=e49]:
      - generic [ref=e51]:
        - heading "Weather" [level=2] [ref=e52]
        - generic [ref=e53]: OPEN-METEO
      - generic [ref=e56]:
        - paragraph [ref=e57]: CATANIA
        - paragraph [ref=e58]: 28°
        - paragraph [ref=e59]: Sereno · percepiti 29°
      - generic [ref=e66]:
        - generic [ref=e67]:
          - text: HIGH
          - generic [ref=e68]: 31°
        - generic [ref=e69]:
          - text: LOW
          - generic [ref=e70]: 23°
        - generic [ref=e71]: 47%
        - generic [ref=e76]: 12 km/h
      - generic [ref=e82]: Open-Meteo · Live weather for catania
    - region "Local time" [ref=e83]:
      - generic [ref=e85]:
        - heading "Local time" [level=2] [ref=e86]
        - generic [ref=e87]: Europe/Rome
      - time [ref=e88]: 15:11:16
      - paragraph [ref=e89]: Tuesday, 8 September
      - generic [ref=e91]: Catania, Italy · Real time
    - region "Personal" [ref=e92]:
      - generic [ref=e94]:
        - heading "Personal" [level=2] [ref=e95]
        - generic [ref=e96]: LOCAL
      - paragraph [ref=e98]: OGGI IN AGENDA
      - generic [ref=e99]:
        - article [ref=e100]:
          - time [ref=e101]: 09:30
          - generic [ref=e102]:
            - heading "Pianificazione & Focus Strategico" [level=3] [ref=e103]
            - paragraph [ref=e104]: Today · Agenda Locale
        - article [ref=e106]:
          - time [ref=e107]: 14:30
          - generic [ref=e108]:
            - heading "Revisione Progetti & Dashboard Release" [level=3] [ref=e109]
            - paragraph [ref=e110]: Today · Agenda Locale
        - article [ref=e111]:
          - time [ref=e112]: 18:00
          - generic [ref=e113]:
            - heading "Riepilogo & Organizzazione Attività" [level=3] [ref=e114]
            - paragraph [ref=e115]: In 02h 48m · Agenda Locale
      - generic [ref=e116]: Agenda locale · 3 impegni del giorno
    - region "Now Playing" [ref=e117]:
      - generic [ref=e119]:
        - heading "Now Playing" [level=2] [ref=e120]
        - generic [ref=e121]: IDLE
      - generic [ref=e128]:
        - generic [ref=e129]: SILENZIO
        - generic [ref=e131]: Nessun brano in riproduzione
        - generic [ref=e132]: Nessuna sessione audio attiva
        - generic [ref=e133]: Caricamento in corso...
  - generic [ref=e134]:
    - generic [ref=e135]: MARCI BUBBLE
    - generic [ref=e137]: Designed to be quiet when nothing happens.
    - generic [ref=e138]: V1 · LIVE FEEDS
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
  65  |     await expect(travelAction).toHaveText(/Plan a trip/i)
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
> 83  |     expect(count).toBeGreaterThanOrEqual(1)
      |                   ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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