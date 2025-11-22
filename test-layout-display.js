const { chromium } = require('playwright');

async function testSetupPageDisplay() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Logging in and testing setup page display...');

    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    await page.fill('[name="email"]', 'cliente@peluquerias.com');
    await page.fill('[name="password"]', 'cliente123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to setup page
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    console.log('🖥️ Testing desktop layout (1280px)...');

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    // Check if content is properly positioned (not overlapping sidebar)
    const sidebar = page.locator('.lg\\:fixed.lg\\:inset-y-0');
    const mainContent = page.locator('.lg\\:pl-64');
    const setupContent = page.locator('.max-w-6xl.mx-auto');

    const sidebarBounds = await sidebar.boundingBox();
    const mainBounds = await mainContent.boundingBox();
    const setupBounds = await setupContent.boundingBox();

    console.log('Sidebar bounds:', sidebarBounds);
    console.log('Main content bounds:', mainBounds);
    console.log('Setup content bounds:', setupBounds);

    // Check if sidebar is not overlapping content
    const contentStartsAfterSidebar = mainBounds && sidebarBounds && mainBounds.x >= sidebarBounds.width;
    console.log('Content positioned after sidebar:', contentStartsAfterSidebar);

    // Check if setup page header and content are visible
    const setupHeader = page.locator('h1:has-text("Configuración de tu web")');
    const isHeaderVisible = await setupHeader.isVisible();
    console.log('Setup page header visible:', isHeaderVisible);

    // Check if navigation breadcrumbs/buttons are visible
    const panelButton = page.locator('text=Ir al panel principal');
    const isPanelButtonVisible = await panelButton.isVisible();
    console.log('Panel principal button visible:', isPanelButtonVisible);

    // Check step indicators
    const stepIndicators = page.locator('[role="button"]:has(svg)').first();
    const areStepsVisible = await stepIndicators.isVisible();
    console.log('Step indicators visible:', areStepsVisible);

    console.log('📱 Testing tablet layout (768px)...');

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    const tabletMainBounds = await mainContent.boundingBox();
    console.log('Tablet main content bounds:', tabletMainBounds);

    console.log('📱 Testing mobile layout (375px)...');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // On mobile, sidebar should be hidden and content should use full width
    const mobileSidebarVisible = await sidebar.isVisible();
    console.log('Mobile sidebar hidden (should be false):', mobileSidebarVisible);

    const mobileMainBounds = await mainContent.boundingBox();
    console.log('Mobile main content bounds:', mobileMainBounds);

    // Check if mobile menu button is visible
    const menuButton = page.locator('button:has(svg.lucide-menu)');
    const isMenuButtonVisible = await menuButton.isVisible();
    console.log('Mobile menu button visible:', isMenuButtonVisible);

    // Take screenshots for visual verification
    await page.screenshot({ path: 'setup-page-mobile.png', fullPage: true });
    console.log('Mobile screenshot saved');

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'setup-page-desktop.png', fullPage: true });
    console.log('Desktop screenshot saved');

    console.log('✅ Layout display test completed!');

  } catch (error) {
    console.error('❌ Display test failed:', error.message);
    await page.screenshot({ path: 'layout-error.png' });
  } finally {
    await browser.close();
  }
}

testSetupPageDisplay();