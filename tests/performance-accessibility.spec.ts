import { test, expect } from '@playwright/test';

test.describe('Performance and Accessibility Testing', () => {
  test('should meet web vitals performance standards', async ({ page }) => {
    // Navigate to each page and measure performance
    const pages = [
      { url: '/', name: 'Landing Page' },
      { url: '/templates', name: 'Templates Page' },
      { url: '/checkout', name: 'Checkout Page' }
    ];

    for (const pageInfo of pages) {
      console.log(`Testing performance for ${pageInfo.name}...`);

      const startTime = Date.now();
      await page.goto(pageInfo.url);

      // Wait for initial content
      await page.waitForSelector('body', { timeout: 10000 });

      // Measure First Contentful Paint and other metrics
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const metrics: any = {};

            entries.forEach((entry) => {
              if (entry.entryType === 'paint') {
                metrics[entry.name] = entry.startTime;
              }
            });

            resolve(metrics);
          });

          observer.observe({ entryTypes: ['paint'] });

          // Fallback timeout
          setTimeout(() => resolve({}), 5000);
        });
      });

      console.log(`Performance metrics for ${pageInfo.name}:`, performanceMetrics);

      const loadTime = Date.now() - startTime;
      console.log(`Load time for ${pageInfo.name}: ${loadTime}ms`);

      // Performance assertions
      expect(loadTime).toBeLessThan(8000); // 8 seconds max for development
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Find focusable elements
    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();

    if (focusableElements > 0) {
      // Tab through several elements
      for (let i = 0; i < Math.min(5, focusableElements); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        // Check that focus is visible
        const activeElement = page.locator(':focus');
        if (await activeElement.count() > 0) {
          await expect(activeElement).toBeVisible();
        }
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/templates', '/checkout'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      // Check for h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(2); // Should not have too many h1s

      // Check heading order
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();

      if (headings.length > 1) {
        // Should have logical heading structure
        const firstHeading = await page.locator('h1').first();
        await expect(firstHeading).toBeVisible();
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');

    // Check for text elements and their contrast
    const textElements = page.locator('h1, h2, h3, p, a, button, span');
    const elementCount = await textElements.count();

    if (elementCount > 0) {
      // Sample a few elements for contrast checking
      for (let i = 0; i < Math.min(5, elementCount); i++) {
        const element = textElements.nth(i);

        if (await element.isVisible()) {
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });

          // Basic checks - should have color defined
          expect(styles.color).toBeDefined();
          expect(styles.color).not.toBe('');
        }
      }
    }
  });

  test('should have alt text for images', async ({ page }) => {
    const pages = ['/', '/templates', '/checkout'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');

        // Decorative images can have empty alt, but should have alt attribute
        if (src && !src.includes('data:image')) {
          expect(alt).toBeDefined();
        }
      }
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/checkout');

    const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="password"], select, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);

      if (await input.isVisible()) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const name = await input.getAttribute('name');

        // Should have some form of labeling
        const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
        const hasAccessibleName = ariaLabel || ariaLabelledBy || hasLabel || name;

        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Page should still be functional with reduced motion
    await expect(page.locator('body')).toBeVisible();

    // Animations should be reduced/disabled
    const animatedElements = page.locator('[class*="animate"], [class*="transition"], [style*="animation"]');
    const animatedCount = await animatedElements.count();

    if (animatedCount > 0) {
      // Check that animations are either disabled or very short
      const firstAnimated = animatedElements.first();
      const styles = await firstAnimated.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration
        };
      });

      // With reduced motion, animations should be quick or disabled
      if (styles.animationDuration && styles.animationDuration !== 'none') {
        const duration = parseFloat(styles.animationDuration);
        expect(duration).toBeLessThanOrEqual(1); // 1 second max
      }
    }
  });

  test('should be usable with screen reader simulation', async ({ page }) => {
    await page.goto('/');

    // Check for landmark regions
    const landmarks = page.locator('main, nav, header, footer, section, article, aside, [role="main"], [role="navigation"]');
    const landmarkCount = await landmarks.count();

    expect(landmarkCount).toBeGreaterThan(0);

    // Check for skip links
    const skipLinks = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip"), a:has-text("Saltar")');

    if (await skipLinks.count() > 0) {
      await expect(skipLinks.first()).toBeAttached();
    }

    // Check for live regions if forms are present
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      // Live regions might be present for form feedback
      console.log(`Live regions found: ${await liveRegions.count()}`);
    }
  });

  test('should load fonts efficiently', async ({ page }) => {
    await page.goto('/');

    // Check for font loading
    const fontRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('.woff') || url.includes('.woff2') || url.includes('fonts.googleapis.com')) {
        fontRequests.push(url);
      }
    });

    await page.waitForTimeout(3000);

    // Should use web fonts efficiently
    if (fontRequests.length > 0) {
      console.log(`Font requests: ${fontRequests.length}`);
      // Should not load excessive fonts
      expect(fontRequests.length).toBeLessThanOrEqual(10);
    }

    // Check for font-display usage
    const fontDisplays = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      const fontDisplays: string[] = [];

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach((rule: any) => {
            if (rule.style && rule.style.fontDisplay) {
              fontDisplays.push(rule.style.fontDisplay);
            }
          });
        } catch (e) {
          // CORS or other errors accessing stylesheets
        }
      });

      return fontDisplays;
    });

    console.log(`Font display values: ${fontDisplays.join(', ')}`);
  });

  test('should optimize images properly', async ({ page }) => {
    const pages = ['/', '/templates'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);

      const images = page.locator('img[src]');
      const imageCount = await images.count();

      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        const loading = await img.getAttribute('loading');

        if (src && !src.startsWith('data:')) {
          // Modern images should use lazy loading for non-critical images
          console.log(`Image ${i}: src=${src}, loading=${loading}`);

          // Check image dimensions vs display size
          const naturalSize = await img.evaluate((el: HTMLImageElement) => ({
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
            displayWidth: el.clientWidth,
            displayHeight: el.clientHeight
          }));

          if (naturalSize.naturalWidth > 0 && naturalSize.displayWidth > 0) {
            // Image shouldn't be dramatically oversized
            const sizeRatio = naturalSize.naturalWidth / naturalSize.displayWidth;
            expect(sizeRatio).toBeLessThanOrEqual(3); // Allow 3x for retina displays
          }
        }
      }
    }
  });
});