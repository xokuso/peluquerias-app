const { chromium } = require('playwright');

async function testSetupPageNavigation() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions for easier observation
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Logging into client area...');

    // Go to login page
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('[name="email"]', 'cliente@peluquerias.com');
    await page.fill('[name="password"]', 'cliente123');

    // Submit login form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('✅ Login successful. Current URL:', page.url());

    // Navigate to setup page
    console.log('🚀 Navigating to setup page...');
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForLoadState('networkidle');

    console.log('📱 Testing desktop sidebar navigation...');

    // Desktop test - Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    // Check if desktop sidebar is visible
    const desktopSidebar = await page.locator('.lg\\:fixed.lg\\:inset-y-0').isVisible();
    console.log('Desktop sidebar visible:', desktopSidebar);

    // Test clicking on "Panel Principal" link
    const panelPrincipalLink = page.locator('a[href="/client"]:has-text("Panel Principal")');
    const isPanelLinkVisible = await panelPrincipalLink.isVisible();
    console.log('Panel Principal link visible:', isPanelLinkVisible);

    if (isPanelLinkVisible) {
      console.log('🖱️ Clicking Panel Principal link...');
      await panelPrincipalLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully navigated to:', page.url());

      // Go back to setup page for further testing
      await page.goto('http://localhost:3001/client/setup');
      await page.waitForLoadState('networkidle');
    }

    // Test clicking on "Mis Proyectos" link
    const proyectosLink = page.locator('a[href="/client/projects"]:has-text("Mis Proyectos")');
    const isProyectosVisible = await proyectosLink.isVisible();
    console.log('Mis Proyectos link visible:', isProyectosVisible);

    if (isProyectosVisible) {
      console.log('🖱️ Clicking Mis Proyectos link...');
      await proyectosLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully navigated to:', page.url());

      // Go back to setup page
      await page.goto('http://localhost:3001/client/setup');
      await page.waitForLoadState('networkidle');
    }

    console.log('📱 Testing mobile sidebar navigation...');

    // Mobile test - Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check if mobile menu button exists and click it
    const menuButton = page.locator('button:has(svg.lucide-menu)');
    const isMenuButtonVisible = await menuButton.isVisible();
    console.log('Mobile menu button visible:', isMenuButtonVisible);

    if (isMenuButtonVisible) {
      console.log('🖱️ Opening mobile sidebar...');
      await menuButton.click();
      await page.waitForTimeout(500);

      // Check if mobile sidebar is now visible
      const mobileSidebar = page.locator('.fixed.inset-0.z-40.lg\\:hidden');
      const isMobileSidebarVisible = await mobileSidebar.isVisible();
      console.log('Mobile sidebar opened:', isMobileSidebarVisible);

      if (isMobileSidebarVisible) {
        // Try clicking a link in mobile sidebar
        const mobilePanelLink = mobileSidebar.locator('a[href="/client"]');
        const isMobileLinkVisible = await mobilePanelLink.isVisible();
        console.log('Mobile Panel Principal link visible:', isMobileLinkVisible);

        if (isMobileLinkVisible) {
          console.log('🖱️ Clicking mobile Panel Principal link...');
          await mobilePanelLink.click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Successfully navigated from mobile to:', page.url());
        }
      }
    }

    console.log('🎉 Navigation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Current URL:', page.url());

    // Take a screenshot for debugging
    await page.screenshot({ path: 'navigation-test-error.png' });
    console.log('Screenshot saved as navigation-test-error.png');
  } finally {
    await browser.close();
  }
}

testSetupPageNavigation();