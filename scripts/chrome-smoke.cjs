const { chromium } = require('C:/Users/pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({ headless: true, channel: 'chrome' });
 const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
 page.setDefaultTimeout(60000);
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 120000 });
 await page.getByRole('heading', { level: 1, name: /L’allure/ }).waitFor();
 fs.mkdirSync('test-results', { recursive: true });
 await page.screenshot({ path: 'test-results/header-desktop.png', animations: 'disabled' });
 await page.getByRole('button', { name: 'Explorer les collections' }).click();
 await page.getByRole('dialog').waitFor({ state: 'visible' });
 if (await page.evaluate(() => document.body.style.overflow) !== 'hidden') throw Error('Scroll arrière-plan non bloqué');
 await page.screenshot({ path: 'test-results/menu-desktop.png', animations: 'disabled' });
 await page.keyboard.press('Escape');
 await page.getByRole('dialog').waitFor({ state: 'detached' });
 if (await page.evaluate(() => document.body.style.overflow) === 'hidden') throw Error('Scroll non restauré');
 if (await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) !== 'Explorer les collections') throw Error('Focus non restauré');
 await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
 await page.getByRole('textbox', { name: 'Rechercher dans la boutique' }).fill('Atelier');
 if (await page.locator('.quick-results>a').count() !== 1) throw Error('Recherche incorrecte');
 await page.locator('.quick-results>a').click();
 await page.getByRole('heading', { level: 1, name: 'Le sac Atelier' }).waitFor();
 if (await page.locator('dialog[open]').count()) throw Error('Dialogue encore ouvert après navigation');
 await page.goto('http://127.0.0.1:5173/');
 await page.locator('.site-footer').scrollIntoViewIfNeeded();
 await page.locator('.site-footer').screenshot({ path: 'test-results/footer-desktop.png', animations: 'disabled' });
 for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Débordement à '+width);
 }
 await page.setViewportSize({ width: 390, height: 844 });
 await page.evaluate(() => window.scrollTo(0, 0));
 await page.screenshot({ path: 'test-results/header-mobile.png', animations: 'disabled' });
 await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
 await page.getByRole('dialog').waitFor({ state: 'visible' });
 for (let i = 0; i < 20; i++) {
  await page.keyboard.press('Tab');
  if (!await page.evaluate(() => document.activeElement?.closest('dialog') !== null)) throw Error('Focus sorti du menu');
 }
 await page.getByRole('button', { name: 'Fermer le menu' }).focus();
 await page.screenshot({ path: 'test-results/menu-mobile.png', animations: 'disabled' });
 await page.getByRole('navigation', { name: 'Collections', exact: true }).getByRole('link', { name: /Femme/ }).click();
 await page.getByRole('heading', { level: 1, name: 'La sélection femme.' }).waitFor();
 await page.locator('.site-footer').screenshot({ path: 'test-results/footer-mobile.png', animations: 'disabled' });
 await page.getByRole('button', { name: 'Retour en haut' }).click();
 await page.waitForFunction(() => window.scrollY < 5);
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
 if (await page.locator('dialog').evaluate(e => getComputedStyle(e).animationName) !== 'none') throw Error('Mouvement réduit non respecté');
 await page.keyboard.press('Escape');
 if (errors.length) throw Error(errors.join('\n'));
 console.log('PASS : menu desktop/mobile, focus piégé et restauré, Échap, recherche, liens, retour en haut, 8 largeurs sans débordement, mouvement réduit, zéro erreur JS.');
 await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
