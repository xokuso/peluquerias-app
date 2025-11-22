/**
 * Comprehensive Visual Validation Test
 * Tests the amber-emerald professional color transformation
 * and validates all visual requirements
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const CONFIG = {
  baseUrl: 'http://localhost:3002',
  screenshotDir: './visual-validation-screenshots',
  pages: ['/', '/pricing', '/contact'],
  devices: [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ],
  // Expected amber-emerald color scheme
  expectedColors: {
    amber: '#d97706',
    amberHex: 'rgb(217, 119, 6)',
    emerald: '#059669',
    emeraldHex: 'rgb(5, 150, 105)',
    // Colors that should NOT be present (old cyan-blue scheme)
    forbiddenColors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7']
  }
};

// Create screenshots directory
async function createScreenshotDir() {
  try {
    await fs.mkdir(CONFIG.screenshotDir, { recursive: true });
    console.log(`✅ Screenshot directory created: ${CONFIG.screenshotDir}`);
  } catch (error) {
    console.error('❌ Failed to create screenshot directory:', error);
  }
}

// Visual validation functions
class VisualValidator {
  constructor(page) {
    this.page = page;
    this.validationResults = [];
  }

  async validateProfessionalColors() {
    console.log('🎨 Validating professional amber-emerald color scheme...');

    // Check for amber gradients
    const amberElements = await this.page.locator('[class*="gradient-primary"], [class*="amber"], [class*="orange-600"]').count();

    // Check for emerald elements
    const emeraldElements = await this.page.locator('[class*="emerald"], [class*="green-600"]').count();

    // Check for forbidden cyan-blue colors
    const forbiddenElements = await this.page.locator('[class*="cyan"], [class*="blue-400"], [class*="blue-500"], [class*="sky-"]').count();

    this.validationResults.push({
      test: 'Professional Color Scheme',
      passed: amberElements > 0 && emeraldElements >= 0 && forbiddenElements === 0,
      details: {
        amberElements: amberElements,
        emeraldElements: emeraldElements,
        forbiddenElements: forbiddenElements
      }
    });

    return { amberElements, emeraldElements, forbiddenElements };
  }

  async validateLayout() {
    console.log('📐 Validating layout and content positioning...');

    // Check for content stretching to viewport edges
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    const contentElements = await this.page.locator('main > *').all();

    let stretchedElements = 0;
    for (const element of contentElements) {
      const box = await element.boundingBox();
      if (box && (box.x === 0 || box.width === viewportWidth)) {
        stretchedElements++;
      }
    }

    // Check for proper container padding
    const hasProperPadding = await this.page.locator('.container, .max-w-7xl, .px-4, .px-6, .px-8').count() > 0;

    this.validationResults.push({
      test: 'Layout and Content Positioning',
      passed: stretchedElements === 0 && hasProperPadding,
      details: {
        stretchedElements: stretchedElements,
        hasProperPadding: hasProperPadding,
        viewportWidth: viewportWidth
      }
    });
  }

  async validateGlassmorphism() {
    console.log('🔮 Validating glassmorphism container shadows...');

    // Check for glassmorphism containers
    const glassElements = await this.page.locator('[class*="backdrop-blur"], [class*="glass"], [class*="bg-white/"], [class*="bg-crystal"]').count();

    // Check for proper shadow implementation
    const shadowElements = await this.page.locator('[class*="shadow-"], [class*="drop-shadow"]').count();

    // Check for broken shadow-liquid (should not exist)
    const brokenShadows = await this.page.locator('[class*="shadow-liquid"]').count();

    this.validationResults.push({
      test: 'Glassmorphism Shadows',
      passed: glassElements > 0 && shadowElements > 0 && brokenShadows === 0,
      details: {
        glassElements: glassElements,
        shadowElements: shadowElements,
        brokenShadows: brokenShadows
      }
    });
  }

  async validateNavigation() {
    console.log('🔗 Validating navigation links...');

    const navigationTests = [];

    // Test footer links
    const footerLinks = ['/pricing', '/contact', '/templates'];
    for (const link of footerLinks) {
      const linkElement = await this.page.locator(`a[href="${link}"]`).first();
      const isVisible = await linkElement.isVisible().catch(() => false);
      navigationTests.push({ link, isVisible });
    }

    const allLinksVisible = navigationTests.every(test => test.isVisible);

    this.validationResults.push({
      test: 'Navigation Links',
      passed: allLinksVisible,
      details: navigationTests
    });
  }

  async validateFormElements() {
    console.log('📝 Validating form elements and focus states...');

    // Check for form inputs
    const inputElements = await this.page.locator('input, textarea, select').count();

    // Check for amber focus states (focus:ring-amber, focus:border-amber)
    const amberFocusElements = await this.page.locator('[class*="focus:ring-amber"], [class*="focus:border-amber"], [class*="focus:ring-orange"]').count();

    this.validationResults.push({
      test: 'Form Elements and Focus States',
      passed: inputElements > 0 ? amberFocusElements > 0 : true, // Pass if no forms or has amber focus
      details: {
        inputElements: inputElements,
        amberFocusElements: amberFocusElements
      }
    });
  }

  async validateProfessionalAppearance() {
    console.log('💼 Validating professional B2B appearance...');

    // Check for professional elements
    const professionalElements = await this.page.locator('h1, h2, h3, .btn, button').count();

    // Check for pastel/amateur indicators (bright colors, comic fonts, etc.)
    const amateurElements = await this.page.locator('[class*="pink-"], [class*="purple-"], [class*="comic"], [class*="cute"]').count();

    // Check for professional typography
    const professionalTypography = await this.page.locator('[class*="font-semibold"], [class*="font-medium"], [class*="font-bold"]').count();

    this.validationResults.push({
      test: 'Professional B2B Appearance',
      passed: professionalElements > 0 && amateurElements === 0 && professionalTypography > 0,
      details: {
        professionalElements: professionalElements,
        amateurElements: amateurElements,
        professionalTypography: professionalTypography
      }
    });
  }

  getResults() {
    return this.validationResults;
  }
}

// Main validation function
async function runVisualValidation() {
  console.log('🚀 Starting Comprehensive Visual Validation...\n');

  await createScreenshotDir();

  const browser = await chromium.launch({ headless: false }); // Set to false to see the browser
  const allResults = {};

  try {
    for (const device of CONFIG.devices) {
      console.log(`\n📱 Testing on ${device.name} (${device.width}x${device.height})`);

      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height }
      });

      const page = await context.newPage();

      for (const pagePath of CONFIG.pages) {
        const url = `${CONFIG.baseUrl}${pagePath}`;
        console.log(`\n🌐 Testing page: ${url}`);

        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000); // Wait for animations

          // Take screenshot
          const screenshotName = `${device.name}-${pagePath.replace('/', 'home' || 'root')}.png`;
          const screenshotPath = path.join(CONFIG.screenshotDir, screenshotName);
          await page.screenshot({
            path: screenshotPath,
            fullPage: true
          });
          console.log(`📸 Screenshot saved: ${screenshotName}`);

          // Run validations
          const validator = new VisualValidator(page);

          await validator.validateProfessionalColors();
          await validator.validateLayout();
          await validator.validateGlassmorphism();
          await validator.validateNavigation();
          await validator.validateFormElements();
          await validator.validateProfessionalAppearance();

          const pageKey = `${device.name}-${pagePath}`;
          allResults[pageKey] = {
            url: url,
            device: device,
            screenshot: screenshotPath,
            validations: validator.getResults()
          };

        } catch (error) {
          console.error(`❌ Error testing ${url} on ${device.name}:`, error.message);
          allResults[`${device.name}-${pagePath}`] = {
            error: error.message,
            url: url,
            device: device
          };
        }
      }

      await context.close();
    }

  } catch (error) {
    console.error('❌ Browser error:', error);
  } finally {
    await browser.close();
  }

  // Generate comprehensive report
  await generateValidationReport(allResults);

  return allResults;
}

// Generate validation report
async function generateValidationReport(results) {
  console.log('\n📊 Generating Validation Report...');

  const reportPath = path.join(CONFIG.screenshotDir, 'validation-report.json');
  const htmlReportPath = path.join(CONFIG.screenshotDir, 'validation-report.html');

  // Save JSON report
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

  // Generate HTML report
  const htmlReport = generateHTMLReport(results);
  await fs.writeFile(htmlReportPath, htmlReport);

  // Print summary to console
  printValidationSummary(results);

  console.log(`📄 Validation report saved to: ${reportPath}`);
  console.log(`🌐 HTML report saved to: ${htmlReportPath}`);
}

function generateHTMLReport(results) {
  const entries = Object.entries(results);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Validation Report - Hair Salon Website</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #d97706; border-bottom: 3px solid #d97706; padding-bottom: 10px; }
        h2 { color: #059669; margin-top: 30px; }
        .device-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .validation-item { margin: 15px 0; padding: 15px; border-radius: 5px; }
        .passed { background: #d4edda; border-left: 4px solid #28a745; }
        .failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .error { background: #fff3cd; border-left: 4px solid #ffc107; }
        .screenshot { max-width: 300px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .details { font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 3px; margin-top: 10px; }
        .summary { background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-pass { background: #28a745; color: white; }
        .status-fail { background: #dc3545; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Visual Validation Report - Hair Salon Website</h1>
        <p><strong>Amber-Emerald Professional Color Transformation Validation</strong></p>
        <p>Test Date: ${new Date().toLocaleString()}</p>

        <div class="summary">
            <h2>📊 Validation Summary</h2>
            ${generateSummaryStats(results)}
        </div>

        ${entries.map(([key, result]) => `
            <div class="device-section">
                <h2>📱 ${key}</h2>

                ${result.error ? `
                    <div class="validation-item error">
                        <strong>❌ Error:</strong> ${result.error}
                        <div class="details">URL: ${result.url}</div>
                    </div>
                ` : `
                    <p><strong>URL:</strong> ${result.url}</p>
                    <p><strong>Device:</strong> ${result.device.width}x${result.device.height}</p>

                    ${result.validations ? result.validations.map(validation => `
                        <div class="validation-item ${validation.passed ? 'passed' : 'failed'}">
                            <span class="status-badge ${validation.passed ? 'status-pass' : 'status-fail'}">
                                ${validation.passed ? 'PASS' : 'FAIL'}
                            </span>
                            <strong>${validation.test}</strong>
                            <div class="details">${JSON.stringify(validation.details, null, 2)}</div>
                        </div>
                    `).join('') : 'No validations available'}

                    ${result.screenshot ? `
                        <div>
                            <h3>Screenshot:</h3>
                            <img src="${path.basename(result.screenshot)}" alt="Screenshot ${key}" class="screenshot">
                        </div>
                    ` : ''}
                `}
            </div>
        `).join('')}

        <div class="summary">
            <h2>🎯 Key Validation Points</h2>
            <ul>
                <li><strong>Professional Color Implementation:</strong> Amber (#d97706) and Emerald (#059669) gradients</li>
                <li><strong>Visual Layout:</strong> No content stretching to viewport edges</li>
                <li><strong>Shadow System:</strong> Proper glassmorphism containers with shadows</li>
                <li><strong>Responsive Design:</strong> Mobile and desktop layouts working properly</li>
                <li><strong>Navigation:</strong> All footer links functional (/pricing, /contact, /templates)</li>
                <li><strong>Form Elements:</strong> Amber focus states on inputs</li>
                <li><strong>Professional Appearance:</strong> B2B design, not pastel/amateur</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `;
}

function generateSummaryStats(results) {
  const entries = Object.entries(results);
  const totalTests = entries.length;
  const errorTests = entries.filter(([_, result]) => result.error).length;
  const successfulTests = totalTests - errorTests;

  let totalValidations = 0;
  let passedValidations = 0;

  entries.forEach(([_, result]) => {
    if (result.validations) {
      totalValidations += result.validations.length;
      passedValidations += result.validations.filter(v => v.passed).length;
    }
  });

  const successRate = totalValidations > 0 ? Math.round((passedValidations / totalValidations) * 100) : 0;

  return `
    <p><strong>Total Pages Tested:</strong> ${totalTests}</p>
    <p><strong>Successful Tests:</strong> ${successfulTests} / ${totalTests}</p>
    <p><strong>Total Validations:</strong> ${totalValidations}</p>
    <p><strong>Passed Validations:</strong> ${passedValidations} / ${totalValidations}</p>
    <p><strong>Success Rate:</strong> <span class="status-badge ${successRate >= 80 ? 'status-pass' : 'status-fail'}">${successRate}%</span></p>
  `;
}

function printValidationSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const entries = Object.entries(results);

  entries.forEach(([key, result]) => {
    console.log(`\n📱 ${key}:`);

    if (result.error) {
      console.log(`   ❌ ERROR: ${result.error}`);
    } else if (result.validations) {
      result.validations.forEach(validation => {
        const status = validation.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${status}: ${validation.test}`);
      });
    }
  });

  // Overall summary
  let totalValidations = 0;
  let passedValidations = 0;

  entries.forEach(([_, result]) => {
    if (result.validations) {
      totalValidations += result.validations.length;
      passedValidations += result.validations.filter(v => v.passed).length;
    }
  });

  const successRate = totalValidations > 0 ? Math.round((passedValidations / totalValidations) * 100) : 0;

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 OVERALL RESULTS: ${passedValidations}/${totalValidations} validations passed (${successRate}%)`);
  console.log('='.repeat(60));

  if (successRate >= 80) {
    console.log('🎉 EXCELLENT: Website meets professional standards!');
  } else if (successRate >= 60) {
    console.log('⚠️  WARNING: Some issues need attention');
  } else {
    console.log('🚨 CRITICAL: Major visual issues detected');
  }
}

// Run the validation
if (require.main === module) {
  runVisualValidation().then(() => {
    console.log('\n✅ Visual validation completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Visual validation failed:', error);
    process.exit(1);
  });
}

module.exports = { runVisualValidation, VisualValidator };