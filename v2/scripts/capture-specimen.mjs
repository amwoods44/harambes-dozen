import { createHash } from 'node:crypto';
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const baseUrl = process.argv.find((argument) => argument.startsWith('http')) ?? 'http://127.0.0.1:5177/';
const recordBaseline = process.argv.includes('--record-approved-baseline');
const requestedCase = process.argv.find((argument) => argument.startsWith('--case='))?.split('=')[1];
const approvalId = process.env.HD12_APPROVAL_ID?.trim();

if (recordBaseline && !approvalId) {
  throw new Error('Recording a baseline requires HD12_APPROVAL_ID from Aaron\'s explicit approval record.');
}

const outputRoot = path.resolve('artifacts/specimen-review');
const currentRoot = path.join(outputRoot, 'current');
const baselineRoot = path.join(outputRoot, 'approved-baseline');
await mkdir(currentRoot, { recursive: true });
if (recordBaseline) await mkdir(baselineRoot, { recursive: true });

const allCases = [
  { id: 'desktop-light', theme: 'day', viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 },
  { id: 'desktop-dark', theme: 'night', viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 },
  { id: 'mobile-light', theme: 'day', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 },
  { id: 'mobile-dark', theme: 'night', viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 },
];
const cases = requestedCase ? allCases.filter((capture) => capture.id === requestedCase) : allCases;
if (!cases.length) throw new Error(`Unknown capture case: ${requestedCase}`);

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const exists = async (file) => access(file).then(() => true).catch(() => false);
const browser = await chromium.launch();
const manifest = {
  fixtureId: 'g1-real-league-member-2026-08-10',
  route: '#/review/specimen',
  session: 'member:393634863552425984',
  reducedMotion: true,
  captures: [],
};

try {
  for (const capture of cases) {
    console.log(`capturing ${capture.id}…`);
    const context = await browser.newContext({
      viewport: capture.viewport,
      deviceScaleFactor: capture.deviceScaleFactor,
      colorScheme: capture.theme === 'night' ? 'dark' : 'light',
      reducedMotion: 'reduce',
    });
    await context.addInitScript((theme) => {
      localStorage.setItem('hd12-theme', theme);
      localStorage.setItem('__e2e_bypass__', '1');
    }, capture.theme);

    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    const reviewUrl = new URL(baseUrl);
    reviewUrl.searchParams.set('as', '393634863552425984');
    reviewUrl.hash = '/review/specimen';
    await page.goto(reviewUrl.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.getByRole('heading', { name: /the twelve, in one visual language/i }).waitFor();
    await page.getByText('Patrick Mahomes', { exact: true }).first().waitFor({ timeout: 20_000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const pendingImages = Array.from(document.images)
        .filter((image) => !image.complete)
        .map((image) => new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        }));
      await Promise.race([
        Promise.all(pendingImages),
        new Promise((resolve) => window.setTimeout(resolve, 4_000)),
      ]);
      document.documentElement.dataset.captureFixture = 'g1-real-league-member-2026-08-10';
    });
    await page.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
    });

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      fullHeight: document.documentElement.scrollHeight,
    }));
    if (dimensions.scrollWidth > dimensions.viewportWidth + 1) {
      throw new Error(`${capture.id} has horizontal overflow: ${dimensions.scrollWidth}px > ${dimensions.viewportWidth}px`);
    }

    const acceptance = await page.evaluate(() => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const describe = (element) =>
        (element.getAttribute('aria-label') || element.textContent || element.tagName)
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 80);
      const undersizedTargets = Array.from(
        document.querySelectorAll('a, button, input, select, textarea, [role="button"]'),
      )
        .filter(isVisible)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { name: describe(element), width: Math.round(rect.width), height: Math.round(rect.height) };
        })
        .filter((target) => target.width < 44 || target.height < 44);
      const undersizedProse = Array.from(document.querySelectorAll('p, li'))
        .filter(isVisible)
        .map((element) => ({
          text: describe(element),
          size: Number.parseFloat(window.getComputedStyle(element).fontSize),
        }))
        .filter((item) => item.text.length > 40 && item.size < 16);
      const brokenImages = Array.from(document.images)
        .filter((image) => isVisible(image) && (!image.complete || image.naturalWidth === 0))
        .map((image) => image.alt || image.currentSrc);

      return {
        headingCount: document.querySelectorAll('h1').length,
        landmarks: {
          main: document.querySelectorAll('main').length,
          navigation: document.querySelectorAll('nav').length,
          footer: document.querySelectorAll('footer').length,
        },
        undersizedTargets,
        undersizedProse,
        brokenImages,
      };
    });
    if (acceptance.headingCount !== 1 || acceptance.landmarks.main !== 1) {
      throw new Error(`${capture.id} has invalid document hierarchy: ${JSON.stringify(acceptance)}`);
    }
    if (capture.viewport.width <= 390 && acceptance.undersizedTargets.length) {
      throw new Error(`${capture.id} has touch targets below 44px: ${JSON.stringify(acceptance.undersizedTargets)}`);
    }
    if (capture.viewport.width <= 390 && acceptance.undersizedProse.length) {
      throw new Error(`${capture.id} has running copy below 16px: ${JSON.stringify(acceptance.undersizedProse)}`);
    }
    if (acceptance.brokenImages.length) {
      throw new Error(`${capture.id} has broken visible images: ${JSON.stringify(acceptance.brokenImages)}`);
    }
    if (consoleErrors.length) {
      throw new Error(`${capture.id} produced console errors: ${JSON.stringify(consoleErrors)}`);
    }

    const outputFile = path.join(currentRoot, `${capture.id}.png`);
    await page.screenshot({ path: outputFile, fullPage: true, animations: 'disabled' });
    const current = await readFile(outputFile);
    const baselineFile = path.join(baselineRoot, `${capture.id}.png`);
    let comparison = 'baseline-missing';
    if (await exists(baselineFile)) {
      const baseline = await readFile(baselineFile);
      comparison = sha256(current) === sha256(baseline) ? 'exact-match' : 'changed-review-required';
    }
    if (recordBaseline) {
      await cp(outputFile, baselineFile);
      comparison = `recorded:${approvalId}`;
    }

    manifest.captures.push({
      ...capture,
      path: path.relative(outputRoot, outputFile),
      sha256: sha256(current),
      comparison,
      dimensions,
      acceptance,
      consoleErrors,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

manifest.approvalId = recordBaseline ? approvalId : null;
await writeFile(
  path.join(outputRoot, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

for (const capture of manifest.captures) {
  console.log(`${capture.id}: ${capture.comparison} · ${capture.dimensions.fullHeight}px · ${capture.consoleErrors.length} console errors`);
}
