const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshots() {
  const browser = await chromium.launch();

  // Desktop viewport (1920x1080)
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1920, height: 1080 });
  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.screenshot({
    path: '/tmp/desktop_1920x1080.png',
    fullPage: true
  });

  // Mobile viewport (375x667)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });
  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.screenshot({
    path: '/tmp/mobile_375x667.png',
    fullPage: true
  });

  await browser.close();
  console.log('Screenshots taken successfully');
}

takeScreenshots().catch(console.error);