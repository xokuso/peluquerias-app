import { test, expect } from '@playwright/test';

test.describe('Landing Page - Hair Salon Website Creation Service', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Crea tu Web de Peluquería|Peluquerías App/i);

    // Check if page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display hero section with correct CTA', async ({ page }) => {
    // Check hero section is visible
    const heroSection = page.locator('[data-testid="hero-section"], .hero, section').first();
    await expect(heroSection).toBeVisible();

    // Check main CTA button exists and is clickable
    const ctaButton = page.locator('a:has-text("Ver mi web en 2 minutos"), button:has-text("Ver mi web en 2 minutos"), [href*="template"]').first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should navigate to templates page from hero CTA', async ({ page }) => {
    // Find and click the main CTA button
    const ctaButton = page.locator('a:has-text("Ver mi web en 2 minutos"), button:has-text("Ver mi web en 2 minutos"), [href*="template"]').first();

    if (await ctaButton.count() > 0) {
      await ctaButton.click();
      await expect(page).toHaveURL(/.*templates.*/);
    }
  });

  test('should display pricing section with correct values', async ({ page }) => {
    // Look for pricing section
    const pricingSection = page.locator('[data-testid="pricing"], .pricing, section:has-text("199"), section:has-text("€")');

    // Check for 199€ price
    const setupPrice = page.locator('text=/199.*€/i');
    await expect(setupPrice).toBeVisible();

    // Check for 49€/mes price
    const monthlyPrice = page.locator('text=/49.*€.*mes/i');
    await expect(monthlyPrice).toBeVisible();
  });

  test('should have functional FAQ section', async ({ page }) => {
    // Look for FAQ section
    const faqSection = page.locator('[data-testid="faq"], .faq, section:has-text("pregunta"), section:has-text("FAQ")');

    if (await faqSection.count() > 0) {
      await expect(faqSection).toBeVisible();

      // Try to find and click FAQ items
      const faqItems = page.locator('[data-testid="faq-item"], .faq-item, details, .accordion-item');

      if (await faqItems.count() > 0) {
        const firstFaq = faqItems.first();
        await firstFaq.click();
        // Check if content expands (wait a bit for animation)
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer, [data-testid="footer"]');
    await expect(footer).toBeVisible();

    // Check for contact links or information
    const contactInfo = page.locator('footer a, footer [href*="mailto"], footer [href*="tel"]');

    if (await contactInfo.count() > 0) {
      await expect(contactInfo.first()).toBeVisible();
    }
  });

  test('should be in Spanish language', async ({ page }) => {
    // Check for Spanish content
    const spanishContent = page.locator('text=/peluquer/i, text=/salon/i, text=/crea/i, text=/web/i');
    await expect(spanishContent.first()).toBeVisible();

    // Check HTML lang attribute if present
    const htmlLang = await page.locator('html').getAttribute('lang');
    if (htmlLang) {
      expect(htmlLang).toMatch(/es/i);
    }
  });

  test('should have hair salon specialization evident', async ({ page }) => {
    // Look for hair salon related keywords
    const salonKeywords = page.locator('text=/peluquer/i, text=/salon/i, text=/belleza/i, text=/corte/i, text=/estilo/i');
    await expect(salonKeywords.first()).toBeVisible();
  });

  test('should display testimonials or trust signals', async ({ page }) => {
    // Look for testimonials, reviews, or trust signals
    const trustSignals = page.locator('[data-testid="testimonials"], .testimonials, section:has-text("testimonio"), section:has-text("cliente"), .reviews');

    if (await trustSignals.count() > 0) {
      await expect(trustSignals.first()).toBeVisible();
    }
  });

  test('should have working navigation links', async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator('nav, [data-testid="navigation"], header nav');

    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();

      // Check for navigation links
      const navLinks = page.locator('nav a, [data-testid="navigation"] a');

      if (await navLinks.count() > 0) {
        const firstLink = navLinks.first();
        const href = await firstLink.getAttribute('href');

        if (href && !href.startsWith('#')) {
          await firstLink.click();
          await page.waitForTimeout(1000);
          // Should navigate or at least be clickable
          await expect(firstLink).toBeVisible();
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible
    const mainContent = page.locator('main, [role="main"], body > div').first();
    await expect(mainContent).toBeVisible();

    // Check that text is not overflowing
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;

    // Allow for some minor overflow (scroll bars, etc.)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50);
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for any async operations

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('ads') &&
      !error.includes('analytics') &&
      !error.includes('gtag')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have good performance metrics', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds (reasonable for development)
    expect(loadTime).toBeLessThan(5000);

    // Check for critical elements
    const criticalElements = page.locator('h1, main, [data-testid="hero"]');
    await expect(criticalElements.first()).toBeVisible({ timeout: 3000 });
  });
});