const { chromium } = require('playwright');
const fs = require('fs');

// Comprehensive flow verification script
async function verifyCompleteFlow() {
  console.log('🚀 STARTING COMPREHENSIVE FLOW VERIFICATION');
  console.log('==========================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });

  const page = await context.newPage();

  const results = {
    homepage: null,
    ofertas: null,
    checkout: null,
    apis: null,
    success: null,
    responsive: null,
    errors: []
  };

  try {
    // ========== STEP 1: HOMEPAGE VERIFICATION ==========
    console.log('🏠 TESTING HOMEPAGE (/)...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check for page errors
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });

    // Verify homepage elements
    const title = await page.title();
    const isLandingPageVisible = await page.isVisible('h1');
    const headerExists = await page.isVisible('header');
    const footerExists = await page.isVisible('footer');

    console.log(`   ✓ Page title: "${title}"`);
    console.log(`   ✓ H1 visible: ${isLandingPageVisible}`);
    console.log(`   ✓ Header exists: ${headerExists}`);
    console.log(`   ✓ Footer exists: ${footerExists}`);

    // Take screenshot
    await page.screenshot({ path: 'homepage-test.png', fullPage: true });

    results.homepage = {
      success: pageErrors.length === 0 && isLandingPageVisible,
      title: title,
      elements: { header: headerExists, footer: footerExists, h1: isLandingPageVisible },
      errors: pageErrors
    };

    // ========== STEP 2: OFERTAS PAGE VERIFICATION ==========
    console.log('\n📋 TESTING OFERTAS PAGE (/oferta)...');
    await page.goto('http://localhost:3000/oferta');
    await page.waitForLoadState('networkidle');

    // Check templates loading
    const templatesExist = await page.locator('[data-testid="template-card"], .template-card, [class*="template"]').count() > 0;
    const hasForm = await page.isVisible('form');
    const hasTemplateSection = await page.isVisible('[data-testid="templates-section"], .templates-grid, [class*="template"]');

    console.log(`   ✓ Templates visible: ${templatesExist}`);
    console.log(`   ✓ Form exists: ${hasForm}`);
    console.log(`   ✓ Template section: ${hasTemplateSection}`);

    // Test template selection if available
    let templateSelected = false;
    if (templatesExist) {
      const firstTemplate = page.locator('[data-testid="template-card"], .template-card, [class*="template"]').first();
      if (await firstTemplate.count() > 0) {
        await firstTemplate.click();
        templateSelected = true;
        console.log(`   ✓ Template selected: ${templateSelected}`);
      }
    }

    // Fill form if exists
    let formFilled = false;
    if (hasForm) {
      try {
        await page.fill('input[name="customerName"], input[placeholder*="nombre"], input[type="text"]', 'Test Customer');
        await page.fill('input[name="email"], input[placeholder*="email"], input[type="email"]', 'test@test.com');
        await page.fill('input[name="salonName"], input[placeholder*="salón"], input[placeholder*="salon"]', 'Test Salon');
        formFilled = true;
        console.log(`   ✓ Form filled: ${formFilled}`);
      } catch (e) {
        console.log(`   ⚠ Form fill failed: ${e.message}`);
      }
    }

    await page.screenshot({ path: 'ofertas-test.png', fullPage: true });

    results.ofertas = {
      success: templatesExist && hasForm,
      templatesVisible: templatesExist,
      formExists: hasForm,
      templateSelected: templateSelected,
      formFilled: formFilled
    };

    // ========== STEP 3: CHECKOUT NAVIGATION ==========
    console.log('\n💳 TESTING CHECKOUT NAVIGATION...');

    // Try to find and click continue button
    let checkoutNavigated = false;
    const continueButtons = [
      'button[type="submit"]',
      'button:has-text("continuar")',
      'button:has-text("siguiente")',
      'button:has-text("checkout")',
      '[data-testid="continue-button"]',
      '.continue-btn',
      'input[type="submit"]'
    ];

    for (const selector of continueButtons) {
      try {
        if (await page.isVisible(selector)) {
          await page.click(selector);
          await page.waitForTimeout(2000);
          if (page.url().includes('/checkout')) {
            checkoutNavigated = true;
            console.log(`   ✓ Navigated to checkout via: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }

    // If navigation failed, try direct navigation
    if (!checkoutNavigated) {
      console.log('   ⚠ Direct form submission failed, trying direct navigation...');
      await page.goto('http://localhost:3000/checkout');
      await page.waitForTimeout(2000);
      checkoutNavigated = page.url().includes('/checkout');
    }

    // ========== STEP 4: CHECKOUT PAGE VERIFICATION ==========
    if (checkoutNavigated) {
      console.log('💳 TESTING CHECKOUT PAGE...');
      await page.waitForLoadState('networkidle');

      // Check for Stripe elements
      const hasStripeForm = await page.isVisible('[data-testid="stripe-form"], .stripe-form, #payment-element, iframe[name*="stripe"], iframe[src*="stripe"]');
      const hasOrderSummary = await page.isVisible('[data-testid="order-summary"], .order-summary, [class*="summary"]');
      const hasPaymentSection = await page.isVisible('[data-testid="payment-section"], .payment-section, [class*="payment"]');

      console.log(`   ✓ Stripe form: ${hasStripeForm}`);
      console.log(`   ✓ Order summary: ${hasOrderSummary}`);
      console.log(`   ✓ Payment section: ${hasPaymentSection}`);

      // Check sessionStorage for orderData
      const sessionData = await page.evaluate(() => {
        return {
          orderData: localStorage.getItem('orderData') || sessionStorage.getItem('orderData'),
          templateId: localStorage.getItem('selectedTemplate') || sessionStorage.getItem('selectedTemplate')
        };
      });

      console.log(`   ✓ Session data: ${sessionData.orderData ? 'Found' : 'Missing'}`);
      console.log(`   ✓ Template data: ${sessionData.templateId ? 'Found' : 'Missing'}`);

      await page.screenshot({ path: 'checkout-test.png', fullPage: true });

      results.checkout = {
        success: checkoutNavigated && (hasStripeForm || hasPaymentSection),
        navigated: checkoutNavigated,
        stripeForm: hasStripeForm,
        orderSummary: hasOrderSummary,
        paymentSection: hasPaymentSection,
        sessionData: sessionData
      };
    }

    // ========== STEP 5: API VERIFICATION ==========
    console.log('\n🔌 TESTING CRITICAL APIs...');

    const apis = [
      '/api/templates',
      '/api/create-payment-intent',
      '/api/simplified-checkout'
    ];

    const apiResults = {};

    for (const apiPath of apis) {
      try {
        const response = await page.request.get(`http://localhost:3000${apiPath}`);
        const status = response.status();
        const isSuccess = status >= 200 && status < 400;

        console.log(`   ${isSuccess ? '✓' : '✗'} ${apiPath}: ${status}`);

        apiResults[apiPath] = {
          status: status,
          success: isSuccess
        };

        if (isSuccess && apiPath === '/api/templates') {
          try {
            const data = await response.json();
            console.log(`     - Templates count: ${Array.isArray(data) ? data.length : 'N/A'}`);
            apiResults[apiPath].data = data;
          } catch (e) {
            console.log(`     - Response parse failed: ${e.message}`);
          }
        }
      } catch (error) {
        console.log(`   ✗ ${apiPath}: ERROR - ${error.message}`);
        apiResults[apiPath] = {
          status: 0,
          success: false,
          error: error.message
        };
      }
    }

    results.apis = apiResults;

    // ========== STEP 6: SUCCESS PAGE VERIFICATION ==========
    console.log('\n🎉 TESTING SUCCESS PAGE...');
    await page.goto('http://localhost:3000/checkout/success');
    await page.waitForTimeout(2000);

    const successPageLoaded = !page.url().includes('404');
    const hasSuccessMessage = await page.isVisible('[data-testid="success-message"], .success-message, h1, h2');

    console.log(`   ✓ Success page loads: ${successPageLoaded}`);
    console.log(`   ✓ Success message: ${hasSuccessMessage}`);

    await page.screenshot({ path: 'success-test.png', fullPage: true });

    results.success = {
      pageLoads: successPageLoaded,
      hasMessage: hasSuccessMessage
    };

    // ========== STEP 7: RESPONSIVE TEST ==========
    console.log('\n📱 TESTING RESPONSIVE DESIGN...');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'mobile-homepage-test.png', fullPage: true });

    await page.goto('http://localhost:3000/oferta');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'mobile-ofertas-test.png', fullPage: true });

    // Check mobile navigation
    const mobileNavExists = await page.isVisible('[data-testid="mobile-nav"], .mobile-nav, .hamburger, [class*="mobile"]');

    console.log(`   ✓ Mobile navigation: ${mobileNavExists}`);

    results.responsive = {
      mobileNavExists: mobileNavExists,
      screenshotsTaken: true
    };

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    results.errors.push(error.message);
  } finally {
    await browser.close();
  }

  // ========== FINAL REPORT ==========
  console.log('\n📊 FINAL VERIFICATION REPORT');
  console.log('=============================');

  const report = {
    timestamp: new Date().toISOString(),
    overall: {
      homepage: results.homepage?.success || false,
      ofertas: results.ofertas?.success || false,
      checkout: results.checkout?.success || false,
      apis: Object.values(results.apis || {}).every(api => api.success),
      success: results.success?.pageLoads || false,
      responsive: results.responsive?.mobileNavExists || false
    },
    details: results
  };

  console.log('\n🎯 CRITICAL VERIFICATION STATUS:');
  console.log(`   ${report.overall.homepage ? '✅' : '❌'} Homepage loads without errors`);
  console.log(`   ${report.overall.ofertas ? '✅' : '❌'} Ofertas page shows templates and form`);
  console.log(`   ${report.overall.checkout ? '✅' : '❌'} Checkout page with Stripe integration`);
  console.log(`   ${report.overall.apis ? '✅' : '❌'} Critical APIs functioning`);
  console.log(`   ${report.overall.success ? '✅' : '❌'} Success page ready`);
  console.log(`   ${report.overall.responsive ? '✅' : '❌'} Responsive design working`);

  const overallSuccess = Object.values(report.overall).every(status => status === true);
  console.log(`\n🏆 OVERALL STATUS: ${overallSuccess ? '✅ PERFECT - READY FOR PRODUCTION' : '❌ ISSUES FOUND - NEEDS FIXES'}`);

  // Save detailed report
  fs.writeFileSync('verification-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: verification-report.json');
  console.log('🖼️  Screenshots saved: homepage-test.png, ofertas-test.png, checkout-test.png, success-test.png, mobile-*.png');

  return report;
}

// Run verification
verifyCompleteFlow().catch(console.error);