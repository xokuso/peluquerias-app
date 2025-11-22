const { chromium } = require('playwright');

async function validateAllRoutes() {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  const routes = [
    '/',
    '/templates',
    '/checkout',
    '/dashboard',
    '/auth/login'
  ];

  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];

  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      try {
        console.log(`Testing ${route} at ${viewport.name} (${viewport.width}x${viewport.height})`);

        // Navigate to route
        await page.goto(`http://localhost:3000${route}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Check for console errors
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        // Wait for any animations/loading
        await page.waitForTimeout(2000);

        // Take screenshot
        const screenshotPath = `/tmp/screenshot-${route.replace(/\//g, '_')}-${viewport.name}.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        console.log(`✅ ${route} (${viewport.name}): Screenshot saved to ${screenshotPath}`);

        if (errors.length > 0) {
          console.log(`❌ Console errors on ${route} (${viewport.name}):`, errors);
        }

        // Check if page loaded successfully (no 404/error pages)
        const title = await page.title();
        const bodyText = await page.textContent('body');

        if (bodyText.includes('404') || bodyText.includes('Not Found')) {
          console.log(`❌ ${route} (${viewport.name}): Page not found`);
        } else {
          console.log(`✅ ${route} (${viewport.name}): Page loaded successfully - Title: ${title}`);
        }

      } catch (error) {
        console.log(`❌ ${route} (${viewport.name}): Error - ${error.message}`);
      }

      await page.close();
    }
  }

  await browser.close();
  console.log('\n🎯 Visual validation complete! Check screenshots in /tmp/');
}

validateAllRoutes().catch(console.error);