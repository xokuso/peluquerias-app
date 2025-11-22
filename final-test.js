const { chromium } = require('playwright');

async function finalTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3001/login');
    await page.fill('[name="email"]', 'cliente@peluquerias.com');
    await page.fill('[name="password"]', 'cliente123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:3001/client/setup');
    await page.waitForTimeout(2000);

    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);
    console.log('✅ Desktop layout ready');
    await page.screenshot({ path: 'setup-final-desktop.png', fullPage: true });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('✅ Mobile layout ready');
    await page.screenshot({ path: 'setup-final-mobile.png', fullPage: true });

    console.log('✅ Screenshots taken successfully');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

finalTest();