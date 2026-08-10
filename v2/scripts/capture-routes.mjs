import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://127.0.0.1:5173/';
const outputDirectory = new URL('../artifacts/route-qa/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });

const routes = [
  ['home', '#/'],
  ['league', '#/league'],
  ['franchises', '#/franchises'],
  ['trades', '#/trades'],
  ['draft', '#/draft'],
  ['league-office', '#/league-office'],
  ['clubhouse', '#/clubhouse'],
];
const viewports = [
  ['desktop', { width: 1440, height: 1000 }],
  ['mobile', { width: 390, height: 844 }],
];
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const [viewportName, viewport] of viewports) {
  for (const [routeName, hash] of routes) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => {
      localStorage.setItem('hd12-theme', 'day');
      localStorage.setItem('__e2e_bypass__', '1');
    });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) {
        failures.push(`${viewportName}/${routeName} ${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => failures.push(`${viewportName}/${routeName}: ${error.message}`));
    await page.goto(`${baseUrl}${hash}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.locator('h1').waitFor();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: fileURLToPath(new URL(`${viewportName}-${routeName}.png`, outputDirectory)),
      fullPage: true,
    });
    const layout = await page.evaluate(() => ({
      heading: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    if (layout.documentWidth > layout.viewportWidth) {
      failures.push(`${viewportName}/${routeName}: horizontal overflow ${layout.documentWidth}px`);
    }
    console.log(`${viewportName}/${routeName}: ${JSON.stringify(layout)}`);
    await context.close();
  }
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
