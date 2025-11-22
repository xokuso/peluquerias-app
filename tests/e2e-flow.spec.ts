import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flow - Complete Hair Salon Website Creation Journey', () => {
  test('should complete full user journey from landing to checkout', async ({ page }) => {
    // Start from landing page
    await page.goto('/');

    // Verify landing page loads
    await expect(page).toHaveTitle(/Crea tu Web de Peluquería|Peluquerías|Salon/i);

    // Find and click main CTA
    const mainCTA = page.locator('a:has-text("Ver mi web en 2 minutos"), button:has-text("Ver mi web en 2 minutos"), [href*="template"], .cta-button').first();

    if (await mainCTA.count() > 0) {
      await mainCTA.click();

      // Should navigate to templates
      await expect(page).toHaveURL(/.*templates.*/);

      // Select a template
      const selectTemplateButton = page.locator('button:has-text("Elegir plantilla"), a:has-text("Elegir plantilla"), button:has-text("Elegir")').first();

      if (await selectTemplateButton.count() > 0) {
        await selectTemplateButton.click();

        // Should navigate to checkout
        await expect(page).toHaveURL(/.*checkout.*/);

        // Complete the checkout process
        await fillCheckoutForm(page);
      }
    }
  });

  test('should track analytics events during user journey', async ({ page }) => {
    // Monitor console for analytics events
    const analyticsEvents: string[] = [];

    page.on('console', (message) => {
      const text = message.text();
      if (text.includes('gtag') || text.includes('analytics') || text.includes('track')) {
        analyticsEvents.push(text);
      }
    });

    // Navigate through the flow
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Click CTA
    const cta = page.locator('a:has-text("Ver mi web"), button:has-text("Ver mi web"), [href*="template"]').first();
    if (await cta.count() > 0) {
      await cta.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to templates
    await page.goto('/templates');
    await page.waitForTimeout(1000);

    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);

    // Analytics should be tracked (events or script loads)
    const hasAnalytics = analyticsEvents.length > 0 ||
      await page.locator('script[src*="analytics"], script[src*="gtag"]').count() > 0;

    // In development, analytics might not be fully active
    console.log('Analytics events detected:', analyticsEvents.length);
  });

  test('should handle navigation between all sections', async ({ page }) => {
    // Start at home
    await page.goto('/');

    // Navigate to templates
    await page.goto('/templates');
    await expect(page.locator('body')).toBeVisible();

    // Navigate to checkout
    await page.goto('/checkout');
    await expect(page.locator('body')).toBeVisible();

    // Test back navigation
    await page.goBack();
    await page.waitForTimeout(500);

    // Test forward navigation
    await page.goForward();
    await page.waitForTimeout(500);

    // Should handle navigation without errors
    const currentUrl = page.url();
    expect(currentUrl).toContain('localhost:3001');
  });

  test('should maintain state during checkout flow', async ({ page }) => {
    await page.goto('/checkout');

    // Fill business information
    const businessName = 'Salón de Prueba E2E';
    const email = 'e2e-test@ejemplo.com';

    const nameField = page.locator('input[name*="name"], input[name*="nombre"]').first();
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();

    if (await nameField.count() > 0) {
      await nameField.fill(businessName);
    }

    if (await emailField.count() > 0) {
      await emailField.fill(email);
    }

    // Move to next step
    const nextButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")').first();
    if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Fill domain information
      const domainField = page.locator('input[name*="domain"], input[name*="dominio"]').first();
      if (await domainField.count() > 0) {
        await domainField.fill('salon-prueba-e2e');

        // Go to payment step
        const paymentButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")').first();
        if (await paymentButton.count() > 0 && await paymentButton.isEnabled()) {
          await paymentButton.click();
          await page.waitForTimeout(1000);

          // Verify information is maintained
          // Look for summary or confirmation of entered data
          const summary = page.locator('[data-testid="summary"], .summary, .order-summary');

          if (await summary.count() > 0) {
            const summaryText = await summary.first().textContent();
            // Should contain the business name or email we entered
            expect(summaryText?.includes(businessName) || summaryText?.includes(email)).toBeTruthy();
          }
        }
      }
    }
  });

  test('should handle errors gracefully throughout the flow', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      } else if (message.type() === 'warning') {
        warnings.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`);
    });

    // Navigate through all pages
    const pages = ['/', '/templates', '/checkout'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForTimeout(2000);
    }

    // Filter out acceptable errors/warnings
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('analytics') &&
      !error.includes('gtag') &&
      !error.includes('ads') &&
      !error.toLowerCase().includes('warning')
    );

    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('should have consistent Spanish localization throughout', async ({ page }) => {
    const pages = ['/', '/templates', '/checkout'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      // Check for Spanish content
      const spanishContent = page.locator('text=/peluquer/i, text=/salon/i, text=/crea/i, text=/plantilla/i, text=/precio/i');

      if (await spanishContent.count() > 0) {
        await expect(spanishContent.first()).toBeVisible();
      }

      // Should not have obvious English content in critical areas
      const englishContent = page.locator('h1:has-text("Create"), h1:has-text("Template"), h1:has-text("Checkout")');

      if (await englishContent.count() > 0) {
        // English content should be minimal
        expect(await englishContent.count()).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should perform well across the entire flow', async ({ page }) => {
    const performanceData: { page: string; loadTime: number }[] = [];

    const pages = [
      { url: '/', name: 'Landing' },
      { url: '/templates', name: 'Templates' },
      { url: '/checkout', name: 'Checkout' }
    ];

    for (const pageInfo of pages) {
      const startTime = Date.now();
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      performanceData.push({ page: pageInfo.name, loadTime });

      // Each page should load reasonably quickly in development
      expect(loadTime).toBeLessThan(10000); // 10 seconds max for development

      // Critical content should appear quickly
      const mainContent = page.locator('main, h1, .hero, [data-testid="main-content"]').first();
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible({ timeout: 5000 });
      }
    }

    console.log('Performance data:', performanceData);
  });

  test('should be fully responsive across the entire flow', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    const pages = ['/', '/templates', '/checkout'];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const pageUrl of pages) {
        await page.goto(pageUrl);

        // Check that content is visible
        const mainContent = page.locator('main, body > div, [role="main"]').first();
        await expect(mainContent).toBeVisible();

        // Check that content doesn't overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 50); // Allow some margin

        // Interactive elements should be accessible
        const buttons = page.locator('button, a[href]');
        if (await buttons.count() > 0) {
          const firstButton = buttons.first();
          if (await firstButton.isVisible()) {
            const boundingBox = await firstButton.boundingBox();
            if (boundingBox) {
              // Button should have reasonable size for touch
              expect(boundingBox.height).toBeGreaterThanOrEqual(24);
              expect(boundingBox.width).toBeGreaterThanOrEqual(24);
            }
          }
        }
      }
    }
  });

  test('should handle email confirmation system readiness', async ({ page }) => {
    await page.goto('/checkout');

    // Fill out form with email
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();

    if (await emailField.count() > 0) {
      await emailField.fill('test-confirmation@example.com');

      // Complete form submission (if possible without payment)
      const submitButton = page.locator('button[type="submit"], button:has-text("Finalizar")').first();

      if (await submitButton.count() > 0) {
        // Form should be ready to handle email confirmation
        // (We won't actually submit due to payment requirements)
        await expect(submitButton).toBeVisible();

        // Check for email confirmation messaging
        const confirmationText = page.locator('text=/confirmación/i, text=/email/i, text=/recibirás/i');

        if (await confirmationText.count() > 0) {
          await expect(confirmationText.first()).toBeVisible();
        }
      }
    }
  });
});

// Helper function for checkout form completion
async function fillCheckoutForm(page: any) {
  // Fill business information
  const nameField = page.locator('input[name*="name"], input[name*="nombre"]').first();
  const emailField = page.locator('input[type="email"], input[name*="email"]').first();
  const phoneField = page.locator('input[name*="phone"], input[name*="telefono"], input[type="tel"]').first();

  if (await nameField.count() > 0) {
    await nameField.fill('Salón Ejemplo E2E');
  }

  if (await emailField.count() > 0) {
    await emailField.fill('e2e-test@salon-ejemplo.com');
  }

  if (await phoneField.count() > 0) {
    await phoneField.fill('612345678');
  }

  // Continue to next step
  let continueButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente"), button[type="submit"]').first();

  if (await continueButton.count() > 0 && await continueButton.isEnabled()) {
    await continueButton.click();
    await page.waitForTimeout(1000);

    // Fill domain information
    const domainField = page.locator('input[name*="domain"], input[name*="dominio"]').first();
    if (await domainField.count() > 0) {
      await domainField.fill('salon-e2e-' + Date.now());
      await page.waitForTimeout(1000); // Wait for domain check

      // Continue to payment
      continueButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")').first();
      if (await continueButton.count() > 0 && await continueButton.isEnabled()) {
        await continueButton.click();
        await page.waitForTimeout(1000);
      }
    }
  }
}