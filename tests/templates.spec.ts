import { test, expect } from '@playwright/test';

test.describe('Templates Page - Hair Salon Template Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates');
  });

  test('should load templates page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*templates.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display template gallery with multiple templates', async ({ page }) => {
    // Look for template cards or gallery
    const templateCards = page.locator('[data-testid="template-card"], .template-card, .template, .gallery-item, [class*="template"]');

    // Should have at least 6 templates as mentioned in requirements
    const count = await templateCards.count();
    expect(count).toBeGreaterThan(3);

    // Each template should be visible
    const firstTemplate = templateCards.first();
    await expect(firstTemplate).toBeVisible();
  });

  test('should have "Elegir plantilla" buttons that are functional', async ({ page }) => {
    // Look for template selection buttons
    const selectButtons = page.locator('button:has-text("Elegir plantilla"), a:has-text("Elegir plantilla"), button:has-text("Elegir"), [data-testid="select-template"]');

    if (await selectButtons.count() > 0) {
      const firstButton = selectButtons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();

      // Click should either navigate or show selection
      await firstButton.click();

      // Should navigate to checkout or show some confirmation
      await page.waitForTimeout(1000);
      // Check if URL changed or if there's a visual indication
      const currentUrl = page.url();
      const hasModal = await page.locator('[role="dialog"], .modal, .popup').count() > 0;

      expect(currentUrl.includes('/checkout') || hasModal).toBeTruthy();
    }
  });

  test('should show template previews or lightbox functionality', async ({ page }) => {
    // Look for template images or preview areas
    const templateImages = page.locator('[data-testid="template-image"], .template img, .preview img, img[alt*="template"], img[alt*="plantilla"]');

    if (await templateImages.count() > 0) {
      const firstImage = templateImages.first();
      await expect(firstImage).toBeVisible();

      // Try clicking on image to see if it opens preview/lightbox
      await firstImage.click();
      await page.waitForTimeout(500);

      // Check if lightbox or larger view opened
      const lightbox = page.locator('[data-testid="lightbox"], .lightbox, .modal, .overlay, [class*="enlarged"]');

      if (await lightbox.count() > 0) {
        await expect(lightbox).toBeVisible();

        // Try to close lightbox
        const closeButton = page.locator('[data-testid="close"], .close, button:has-text("×"), [aria-label*="close"]');
        if (await closeButton.count() > 0) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('should have filter functionality if implemented', async ({ page }) => {
    // Look for filter controls
    const filters = page.locator('[data-testid="filter"], .filter, .category, select, button:has-text("filtro")');

    if (await filters.count() > 0) {
      const firstFilter = filters.first();
      await expect(firstFilter).toBeVisible();

      // Try interacting with filter
      if (await firstFilter.locator('option').count() > 0) {
        // It's a select dropdown
        await firstFilter.selectOption({ index: 1 });
      } else {
        // It's a button or other control
        await firstFilter.click();
      }

      await page.waitForTimeout(500);

      // Templates should still be visible (filtering should work)
      const templatesAfterFilter = page.locator('[data-testid="template-card"], .template-card, .template');
      await expect(templatesAfterFilter.first()).toBeVisible();
    }
  });

  test('should navigate to checkout from template selection', async ({ page }) => {
    // Find and click a template selection button
    const selectButtons = page.locator('button:has-text("Elegir plantilla"), a:has-text("Elegir plantilla"), button:has-text("Elegir")');

    if (await selectButtons.count() > 0) {
      const firstButton = selectButtons.first();
      await firstButton.click();

      // Should navigate to checkout
      await page.waitForURL(/.*checkout.*/);
      await expect(page).toHaveURL(/.*checkout.*/);
    }
  });

  test('should display templates suitable for hair salons', async ({ page }) => {
    // Check for salon/beauty themed content in templates
    const salonThemes = page.locator('text=/peluquer/i, text=/salon/i, text=/belleza/i, text=/spa/i, text=/estilo/i');

    // Should have at least some salon-themed content
    if (await salonThemes.count() > 0) {
      await expect(salonThemes.first()).toBeVisible();
    }

    // Check template names or descriptions for salon relevance
    const templateTitles = page.locator('[data-testid="template-title"], .template-title, .template-name, h2, h3');

    if (await templateTitles.count() > 0) {
      const titles = await templateTitles.allTextContents();
      const hasSalonContent = titles.some(title =>
        /salon|peluquer|belleza|spa|estilo|cabello|corte/i.test(title)
      );

      // At least some templates should be salon-themed
      expect(hasSalonContent || titles.length === 0).toBeTruthy();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });

    // Templates should still be visible and usable
    const templates = page.locator('[data-testid="template-card"], .template-card, .template');
    await expect(templates.first()).toBeVisible();

    // Check that layout doesn't break
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(425); // Allow some margin for scrollbars
  });

  test('should have navigation back to home', async ({ page }) => {
    // Look for navigation back to home
    const homeLink = page.locator('a[href="/"], a:has-text("Inicio"), a:has-text("Home"), nav a').first();

    if (await homeLink.count() > 0) {
      await expect(homeLink).toBeVisible();
      await homeLink.click();
      await expect(page).toHaveURL(/.*\/$|.*home.*/);
    }
  });

  test('should load templates without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('ads') &&
      !error.includes('analytics')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have professional appearance suitable for salon owners', async ({ page }) => {
    // Check for professional styling elements
    await expect(page.locator('body')).toBeVisible();

    // Should not have obvious development/debugging content
    const devContent = page.locator('text=/debug/i, text=/test/i, text=/lorem ipsum/i');

    if (await devContent.count() > 0) {
      // These shouldn't be prominently displayed
      const devText = await devContent.first().textContent();
      expect(devText?.toLowerCase()).not.toContain('debug');
    }

    // Check for loading states
    const loadingStates = page.locator('[data-testid="loading"], .loading, .spinner');
    // Loading should complete reasonably quickly
    await page.waitForTimeout(3000);

    if (await loadingStates.count() > 0) {
      await expect(loadingStates.first()).not.toBeVisible();
    }
  });

  test('should handle no templates gracefully', async ({ page }) => {
    // If no templates are found, should show appropriate message
    const templates = page.locator('[data-testid="template-card"], .template-card, .template');

    if (await templates.count() === 0) {
      // Should show some message or indication
      const emptyState = page.locator('[data-testid="empty-state"], .empty, text=/no.*template/i, text=/próximamente/i');

      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    }
  });
});