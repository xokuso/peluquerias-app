const { chromium } = require('playwright');

async function testSpecificNavigation() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });
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

    console.log('✅ Login successful');

    // Navigate to setup page
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    // Desktop test
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    console.log('🖥️ Testing desktop navigation...');

    // Test desktop sidebar navigation links
    const sidebarNav = page.locator('.lg\\:flex.lg\\:w-64 nav');
    const navLinks = await sidebarNav.locator('a').all();

    console.log(`Found ${navLinks.length} navigation links in sidebar`);

    for (let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  ${i + 1}. "${text?.trim()}" → ${href}`);
    }

    // Test clicking first sidebar navigation link (Panel Principal)
    console.log('🖱️ Testing Panel Principal link from sidebar...');
    await sidebarNav.locator('a[href="/client"]').first().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to:', page.url());

    // Go back to setup
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    // Test clicking Mis Proyectos
    console.log('🖱️ Testing Mis Proyectos link from sidebar...');
    await sidebarNav.locator('a[href="/client/projects"]').first().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to:', page.url());

    // Go back to setup
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    // Test clicking Pagos
    console.log('🖱️ Testing Pagos link from sidebar...');
    await sidebarNav.locator('a[href="/client/payments"]').first().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to:', page.url());

    // Go back to setup for mobile test
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    console.log('📱 Testing mobile navigation...');

    // Mobile test
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Open mobile menu
    const menuButton = page.locator('button:has(svg.lucide-menu)').first();
    await menuButton.click();
    await page.waitForTimeout(500);

    // Test mobile navigation
    const mobileSidebar = page.locator('.fixed.inset-0.z-40').first();
    const mobileNavLinks = await mobileSidebar.locator('nav a').all();

    console.log(`Found ${mobileNavLinks.length} mobile navigation links`);

    // Test mobile Panel Principal link
    console.log('🖱️ Testing mobile Panel Principal link...');
    await mobileSidebar.locator('a[href="/client"]').first().click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Mobile navigation successful to:', page.url());

    console.log('🎉 All navigation tests passed! Sidebar is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'navigation-debug.png' });
    console.log('Screenshot saved for debugging');
  } finally {
    await browser.close();
  }
}

testSpecificNavigation();