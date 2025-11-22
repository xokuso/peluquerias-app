const { chromium } = require('playwright');

async function testSidebarNavigation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Testing sidebar navigation from setup page...');

    // Go to the setup page directly (assuming user is logged in)
    await page.goto('http://localhost:3001/client/setup');

    // Wait for page to load
    await page.waitForTimeout(2000);

    console.log('Setup page loaded. Checking for sidebar elements...');

    // Check if sidebar is visible on desktop
    const desktopSidebar = await page.locator('.lg\\:fixed.lg\\:inset-y-0').isVisible();
    console.log('Desktop sidebar visible:', desktopSidebar);

    // Check if sidebar navigation links are present and clickable
    const navLinks = await page.locator('[href="/client"]').count();
    console.log('Navigation links found:', navLinks);

    // Try to click on "Panel Principal" link
    try {
      const panelPrincipalLink = page.locator('text=Panel Principal');
      if (await panelPrincipalLink.isVisible()) {
        console.log('Panel Principal link is visible and clickable');
        await panelPrincipalLink.click();
        await page.waitForTimeout(1000);
        console.log('Successfully navigated to:', page.url());
      } else {
        console.log('Panel Principal link not visible');
      }
    } catch (error) {
      console.log('Error clicking Panel Principal link:', error.message);
    }

    // Go back to setup page
    await page.goto('http://localhost:3001/client/setup');
    await page.waitForTimeout(1000);

    // Test mobile sidebar
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.waitForTimeout(1000);

    console.log('Testing mobile sidebar...');

    // Check if mobile menu button exists
    const menuButton = page.locator('button:has(svg.lucide-menu)');
    if (await menuButton.isVisible()) {
      console.log('Mobile menu button found and visible');
      await menuButton.click();
      await page.waitForTimeout(500);

      // Check if mobile sidebar appears
      const mobileSidebar = await page.locator('.fixed.inset-0.z-40').isVisible();
      console.log('Mobile sidebar opened:', mobileSidebar);

      // Try to click a navigation link in mobile sidebar
      const mobilePanelLink = page.locator('.fixed .flex-col a[href="/client"]');
      if (await mobilePanelLink.isVisible()) {
        console.log('Mobile Panel Principal link is visible');
        await mobilePanelLink.click();
        await page.waitForTimeout(1000);
        console.log('Successfully navigated from mobile to:', page.url());
      }
    } else {
      console.log('Mobile menu button not found');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSidebarNavigation();