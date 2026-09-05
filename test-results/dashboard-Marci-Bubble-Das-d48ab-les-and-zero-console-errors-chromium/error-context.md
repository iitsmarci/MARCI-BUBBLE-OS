# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Marci Bubble Dashboard >> renders the dashboard with all 6 instrument bubbles and zero console errors
- Location: tests\dashboard.spec.ts:4:3

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 3
Received array:  ["Failed to load resource: the server responded with a status of 502 (Bad Gateway)", "Failed to load resource: the server responded with a status of 502 (Bad Gateway)", "Failed to load resource: the server responded with a status of 502 (Bad Gateway)"]
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - link "Marci Bubble dashboard" [ref=e5] [cursor=pointer]:
      - /url: "#dashboard"
      - text: MARCI BUBBLE
    - generic [ref=e7]:
      - generic [ref=e8]: SATURDAY
      - generic [ref=e9]: •5 SEPTEMBER 2026
    - navigation "Azioni dashboard" [ref=e10]:
      - button "Stato connessione dati dashboard" [ref=e11] [cursor=pointer]: DATA / LIVE
      - 'button "Cambia tema, attuale: dark" [ref=e13] [cursor=pointer]':
        - generic [ref=e14]: "Theme: Dark"
      - button "Apri impostazioni" [ref=e15] [cursor=pointer]
  - generic "Ticker dati finanziari e meteo live" [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]:
          - text: BTC € 104,231
          - emphasis [ref=e21]: +2.31%
        - generic [ref=e22]:
          - text: SPX 6,481.4
          - emphasis [ref=e23]: +0.42%
        - generic [ref=e24]:
          - text: EUR/USD 1.1700
          - emphasis [ref=e25]: −0.08%
        - generic [ref=e26]:
          - text: CATANIA 28°C
          - emphasis [ref=e27]: CLEAR SKY
      - generic [ref=e28]:
        - generic [ref=e29]:
          - text: BTC € 104,231
          - emphasis [ref=e30]: +2.31%
        - generic [ref=e31]:
          - text: SPX 6,481.4
          - emphasis [ref=e32]: +0.42%
        - generic [ref=e33]:
          - text: EUR/USD 1.1700
          - emphasis [ref=e34]: −0.08%
        - generic [ref=e35]:
          - text: CATANIA 28°C
          - emphasis [ref=e36]: CLEAR SKY
  - generic [ref=e37]:
    - paragraph [ref=e38]: PERSONAL INFORMATION INSTRUMENT
    - heading [level=1] [ref=e39]:
      - text: Good evening,
      - emphasis [ref=e40]: Marci.
    - generic [ref=e41]: 05.09.2026 · Catania, Italy
  - generic [ref=e42]:
    - region "Weather" [ref=e43]:
      - generic [ref=e45]:
        - heading "Weather" [level=2] [ref=e46]
        - generic [ref=e47]: OPEN-METEO
      - generic [ref=e50]:
        - paragraph [ref=e51]: CATANIA
        - paragraph [ref=e52]: 28°
        - paragraph [ref=e53]: Clear sky · feels like 29°
      - generic [ref=e60]:
        - generic [ref=e61]:
          - text: HIGH
          - generic [ref=e62]: 31°
        - generic [ref=e63]:
          - text: LOW
          - generic [ref=e64]: 23°
        - generic [ref=e65]: 47%
        - generic [ref=e70]: 12 km/h
      - generic [ref=e76]: Open-Meteo · Live weather for catania
    - region "Local time" [ref=e77]:
      - generic [ref=e79]:
        - heading "Local time" [level=2] [ref=e80]
        - generic [ref=e81]: Europe/Rome
      - time [ref=e82]: 03:24:13
      - paragraph [ref=e83]: Saturday, 5 September
      - generic [ref=e85]: Catania, Italy · Real time
    - region "Markets" [ref=e86]:
      - generic [ref=e87]:
        - generic [ref=e88]:
          - heading "Markets" [level=2] [ref=e89]
          - generic [ref=e90]: LIVE
        - button "Altre opzioni mercati" [ref=e92] [cursor=pointer]
      - generic [ref=e97]:
        - article [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100]: BTC
            - generic [ref=e101]: Bitcoin
          - img "Trend in crescita" [ref=e102]
          - generic [ref=e104]:
            - generic [ref=e105]: € 104,231
            - generic [ref=e106]: +2.31%
        - article [ref=e110]:
          - generic [ref=e111]:
            - generic [ref=e112]: SPX
            - generic [ref=e113]: S&P 500
          - img "Trend in crescita" [ref=e114]
          - generic [ref=e116]:
            - generic [ref=e117]: 6,481.4
            - generic [ref=e118]: +0.42%
        - article [ref=e122]:
          - generic [ref=e123]:
            - generic [ref=e124]: EUR/USD
            - generic [ref=e125]: Euro / Dollar
          - img "Trend in calo" [ref=e126]
          - generic [ref=e128]:
            - generic [ref=e129]: "1.1700"
            - generic [ref=e130]: −0.08%
      - generic [ref=e134]: Live markets · Crypto, indices & forex updated
    - region "News" [ref=e135]:
      - generic [ref=e137]:
        - heading "News" [level=2] [ref=e138]
        - generic [ref=e139]: ANSA RSS
      - generic [ref=e141]:
        - 'link "WORLD: Feed notizie connesso e pronto per aggiornamenti in tempo reale." [ref=e142] [cursor=pointer]':
          - /url: https://www.ansa.it/sito/notizie/mondo/
          - generic [ref=e143]: WORLD
          - generic [ref=e144]:
            - heading "Feed notizie connesso e pronto per aggiornamenti in tempo reale." [level=3] [ref=e145]
            - paragraph [ref=e146]: ANSA News · LIVE
        - 'link "TECH: Flusso dati separato per la massima affidabilità e velocità di caricamento." [ref=e150] [cursor=pointer]':
          - /url: https://www.ansa.it/sito/notizie/tecnologia/
          - generic [ref=e151]: TECH
          - generic [ref=e152]:
            - heading "Flusso dati separato per la massima affidabilità e velocità di caricamento." [level=3] [ref=e153]
            - paragraph [ref=e154]: Tech Feed · LIVE
        - 'link "ITALY: Monitoraggio continuo delle principali testate nazionali." [ref=e158] [cursor=pointer]':
          - /url: https://www.ansa.it/sito/notizie/cronaca/
          - generic [ref=e159]: ITALY
          - generic [ref=e160]:
            - heading "Monitoraggio continuo delle principali testate nazionali." [level=3] [ref=e161]
            - paragraph [ref=e162]: ANSA Top · LIVE
      - generic [ref=e166]: Live feed · Verified editorial sources
    - region "Personal" [ref=e167]:
      - generic [ref=e169]:
        - heading "Personal" [level=2] [ref=e170]
        - generic [ref=e171]: OFFLINE
      - generic [ref=e172]:
        - paragraph [ref=e173]: AGENDA
        - generic [ref=e174]:
          - heading "Calendar Bridge Offline" [level=3] [ref=e175]
          - paragraph [ref=e176]: Could not connect to the local calendar service. Ensure the local server is running.
      - generic [ref=e177]: Calendar service unavailable
    - region "Travel" [ref=e178]:
      - generic [ref=e180]:
        - heading "Travel" [level=2] [ref=e181]
        - generic [ref=e182]: FUTURE TRIP
      - generic [ref=e183]:
        - generic [ref=e184]: CTA
        - generic [ref=e188]: LIS
      - heading "Lisbon, Portugal" [level=3] [ref=e189]
      - paragraph [ref=e190]: Destination module ready for flights, timezone, weather and currency.
      - button "Pianifica viaggio per Lisbona" [ref=e191] [cursor=pointer]: Plan a trip
  - generic [ref=e195]:
    - generic [ref=e196]: MARCI BUBBLE
    - generic [ref=e198]: Designed to be quiet when nothing happens.
    - generic [ref=e199]: V1 · LIVE FEEDS
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
> 28  |     expect(consoleErrors).toHaveLength(0)
      |                           ^ Error: expect(received).toHaveLength(expected)
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