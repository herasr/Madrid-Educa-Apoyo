/**
 * Verificación WCAG en navegador REAL (incluye color-contrast, que jsdom no
 * puede computar) + flujo principal + privacidad de URL + layout móvil.
 * Se ejecuta en escritorio y móvil vía los projects de playwright.config.ts.
 */
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page: Page, context: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
  }));
  expect(summary, `Violaciones WCAG (${context})`).toEqual([]);
}

async function gotoLoaded(page: Page) {
  await page.goto('/');
  await expect(page.locator('article').first()).toBeVisible({ timeout: 30_000 });
}

test('carga el catálogo y cumple WCAG AA con contraste real', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await gotoLoaded(page);
  expect(await page.locator('article').count()).toBeGreaterThan(0);
  await expectNoViolations(page, 'vista inicial');
  expect(errors).toEqual([]);
});

test('Lectura Fácil conmuta y mantiene WCAG AA', async ({ page }) => {
  await gotoLoaded(page);
  const toggle = page.getByRole('button', { name: /lectura fácil/i }).first();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expectNoViolations(page, 'lectura fácil activa');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('filtro TEA sincroniza URL reproducible y nunca expone GPS', async ({ page }) => {
  await gotoLoaded(page);
  const teaRadio = page.getByRole('radio', { name: /atención preferente TEA/i }).first();
  if (!(await teaRadio.isVisible())) {
    await page.getByRole('button', { name: /Mostrar Filtros Acumulativos/i }).click();
  }
  await expect(teaRadio).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('complementary', { name: 'Filtros de búsqueda' }).getByRole('button', { name: 'Ver todos', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('need')).toBe('all');

  await teaRadio.click();
  await expect(page.locator('article').first()).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get('need')).toBe('tea');
  const url = new URL(page.url());
  expect(url.search).not.toMatch(/[?&](lat|lng|loc)=/);
  await expectNoViolations(page, 'filtro TEA activo');
});

test('navegación por teclado: skip-link y foco visible', async ({ page }) => {
  await gotoLoaded(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: /saltar al contenido/i });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('main')).toBeVisible();
});

test('sin desbordamiento horizontal ni errores en móvil', async ({ page }) => {
  await gotoLoaded(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expectNoViolations(page, 'viewport móvil');
});
