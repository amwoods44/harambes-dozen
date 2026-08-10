import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const outputDirectory = new URL('../artifacts/visual-qa/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const consoleMessages = [];

const requestedScenario = process.argv[2];
const scenarios = [
  { name: 'desktop-day', viewport: { width: 1440, height: 1000 }, theme: 'day' },
  { name: 'desktop-night', viewport: { width: 1440, height: 1000 }, theme: 'night' },
  { name: 'tablet-day', viewport: { width: 768, height: 1024 }, theme: 'day' },
  { name: 'tablet-night', viewport: { width: 768, height: 1024 }, theme: 'night' },
  { name: 'mobile-day', viewport: { width: 390, height: 844 }, theme: 'day' },
  { name: 'mobile-night', viewport: { width: 390, height: 844 }, theme: 'night' },
].filter((scenario) => !requestedScenario || scenario.name === requestedScenario);

if (requestedScenario && scenarios.length === 0) {
  throw new Error(`Unknown capture scenario: ${requestedScenario}`);
}

for (const scenario of scenarios) {
  const context = await browser.newContext({ viewport: scenario.viewport });
  await context.addInitScript((theme) => localStorage.setItem('hd12-theme', theme), scenario.theme);
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      consoleMessages.push(`${scenario.name} ${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => consoleMessages.push(`${scenario.name} pageerror: ${error.message}`));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.locator('h1').waitFor();
  await page.waitForTimeout(5_000);
  await page.screenshot({
    path: fileURLToPath(new URL(`${scenario.name}.png`, outputDirectory)),
    fullPage: true,
  });

  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    theme: document.documentElement.dataset.theme,
    heading: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  }));
  console.log(`${scenario.name}: ${JSON.stringify(layout)}`);
  await context.close();
}

if (consoleMessages.length) {
  console.error(consoleMessages.join('\n'));
  process.exitCode = 1;
}

await browser.close();
