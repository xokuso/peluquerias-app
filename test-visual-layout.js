const { chromium } = require('playwright');

async function testVisualLayout() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Logging in...');

    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    await page.fill('[name="email"]', 'cliente@peluquerias.com');
    await page.fill('[name="password"]', 'cliente123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('✅ Navigating to setup page...');
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    // Desktop view
    console.log('📸 Taking desktop screenshot...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(2000);

    // Check basic elements
    const headerExists = await page.locator('h1:has-text("Configuración de tu web")').isVisible();
    const sidebarExists = await page.locator('nav a[href="/client"]').isVisible();
    const contentExists = await page.locator('text=Panel Principal').isVisible();

    console.log('✅ Setup header visible:', headerExists);
    console.log('✅ Sidebar navigation visible:', sidebarExists);
    console.log('✅ Content properly displayed:', contentExists);

    await page.screenshot({ path: 'setup-desktop-layout.png', fullPage: true });
    console.log('📷 Desktop screenshot saved');

    // Tablet view
    console.log('📸 Taking tablet screenshot...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'setup-tablet-layout.png', fullPage: true });
    console.log('📷 Tablet screenshot saved');

    // Mobile view
    console.log('📸 Taking mobile screenshot...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'setup-mobile-layout.png', fullPage: true });
    console.log('📷 Mobile screenshot saved');

    console.log('🎉 Visual layout test completed! Check the screenshots for verification.');

  } catch (error) {
    console.error('❌ Visual test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testVisualLayout();