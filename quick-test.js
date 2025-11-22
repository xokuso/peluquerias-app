const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    console.log('Testing checkout page...');
    await page.goto('http://localhost:3000/checkout', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait 3 seconds for any errors to appear

    if (errors.length > 0) {
      console.log('❌ Console errors detected:');
      errors.forEach(error => {
        if (error.includes('Maximum update depth exceeded')) {
          console.log('❌ CRITICAL: Infinite loop still present!');
        } else {
          console.log(`⚠️  Error: ${error.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('✅ No console errors detected!');
    }

  } catch (error) {
    console.log('❌ Page error:', error.message);
  }

  await browser.close();
}

quickTest().catch(console.error);