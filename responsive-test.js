const { chromium } = require('@playwright/test');

const viewports = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Medium', width: 375, height: 667 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
];

const pages = [
  { name: 'Landing Page', url: 'http://localhost:3000' },
  { name: 'Templates Page', url: 'http://localhost:3000/templates' },
  { name: 'Checkout Page', url: 'http://localhost:3000/checkout' },
];

async function runResponsiveTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  const results = [];

  for (const page of pages) {
    console.log(`\n🔍 Testing ${page.name}...`);

    for (const viewport of viewports) {
      console.log(`  📱 ${viewport.name} (${viewport.width}x${viewport.height})`);

      const browserPage = await context.newPage();
      await browserPage.setViewportSize({ width: viewport.width, height: viewport.height });

      try {
        // Navigate to page
        await browserPage.goto(page.url, { waitUntil: 'networkidle', timeout: 30000 });

        // Check for horizontal scrollbar
        const hasHorizontalScroll = await browserPage.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        // Check viewport meta tag
        const hasViewportMeta = await browserPage.evaluate(() => {
          const viewport = document.querySelector('meta[name="viewport"]');
          return viewport !== null;
        });

        // Check for responsive navigation
        const navigationVisible = await browserPage.evaluate(() => {
          const nav = document.querySelector('nav, .navigation, [role="navigation"]');
          return nav ? window.getComputedStyle(nav).display !== 'none' : false;
        });

        // Check button touch targets (minimum 44px)
        const buttonSizes = await browserPage.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, .button, [role="button"]'));
          return buttons.slice(0, 5).map(btn => {
            const rect = btn.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              isAccessible: rect.width >= 44 && rect.height >= 44
            };
          });
        });

        // Check for text readability
        const textReadability = await browserPage.evaluate(() => {
          const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div'));
          const fontSize = window.getComputedStyle(textElements[0] || document.body).fontSize;
          return {
            fontSize: fontSize,
            isReadable: parseFloat(fontSize) >= 16 // Minimum 16px for mobile
          };
        });

        // Check for layout overflow
        const layoutIssues = await browserPage.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          let overflowing = 0;
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth) overflowing++;
          });
          return {
            overflowingElements: overflowing,
            viewportWidth: window.innerWidth
          };
        });

        // Take a screenshot
        await browserPage.screenshot({
          path: `/Users/alex/Desktop/claudecodefy/peluquerias-app/screenshot-${page.name.replace(' ', '-')}-${viewport.name.replace(' ', '-')}.png`,
          fullPage: true
        });

        const result = {
          page: page.name,
          viewport: viewport.name,
          dimensions: `${viewport.width}x${viewport.height}`,
          issues: {
            hasHorizontalScroll,
            hasViewportMeta,
            navigationVisible,
            buttonSizes,
            textReadability,
            layoutIssues
          }
        };

        results.push(result);

        // Log immediate findings
        if (hasHorizontalScroll) console.log(`    ❌ Horizontal scroll detected`);
        if (!hasViewportMeta) console.log(`    ❌ Viewport meta tag missing`);
        if (!navigationVisible) console.log(`    ⚠️  Navigation not visible`);
        if (buttonSizes.some(btn => !btn.isAccessible)) {
          console.log(`    ❌ Small touch targets detected`);
        }
        if (!textReadability.isReadable) console.log(`    ❌ Text too small for mobile`);
        if (layoutIssues.overflowingElements > 0) {
          console.log(`    ❌ ${layoutIssues.overflowingElements} elements overflow viewport`);
        }

        console.log(`    ✅ Test completed`);

      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        results.push({
          page: page.name,
          viewport: viewport.name,
          dimensions: `${viewport.width}x${viewport.height}`,
          error: error.message
        });
      }

      await browserPage.close();

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  await browser.close();

  // Generate report
  console.log('\n📊 RESPONSIVE DESIGN VALIDATION REPORT');
  console.log('=====================================');

  const issues = results.filter(r => r.error || (r.issues && (
    r.issues.hasHorizontalScroll ||
    !r.issues.hasViewportMeta ||
    r.issues.buttonSizes?.some(btn => !btn.isAccessible) ||
    !r.issues.textReadability?.isReadable ||
    r.issues.layoutIssues?.overflowingElements > 0
  )));

  if (issues.length === 0) {
    console.log('🎉 All tests passed! No responsive design issues detected.');
  } else {
    console.log(`⚠️  Found ${issues.length} potential issues:`);
    issues.forEach(issue => {
      console.log(`\n📄 ${issue.page} - ${issue.viewport}:`);
      if (issue.error) {
        console.log(`  ❌ ${issue.error}`);
      } else if (issue.issues) {
        if (issue.issues.hasHorizontalScroll) console.log('  ❌ Horizontal scrolling detected');
        if (!issue.issues.hasViewportMeta) console.log('  ❌ Missing viewport meta tag');
        if (issue.issues.buttonSizes?.some(btn => !btn.isAccessible)) {
          console.log('  ❌ Touch targets below 44px detected');
        }
        if (!issue.issues.textReadability?.isReadable) {
          console.log(`  ❌ Text size too small: ${issue.issues.textReadability.fontSize}`);
        }
        if (issue.issues.layoutIssues?.overflowingElements > 0) {
          console.log(`  ❌ ${issue.issues.layoutIssues.overflowingElements} elements overflow viewport`);
        }
      }
    });
  }

  return results;
}

runResponsiveTests().catch(console.error);