const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function createUIValidationReport() {
  console.log('🚀 Iniciando validación visual de UI...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Crear directorio para screenshots
  const screenshotDir = path.join(__dirname, 'ui-validation-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = {
    timestamp: new Date().toISOString(),
    pages: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Configuraciones de viewport para testing responsive
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];

  const pagesToTest = [
    {
      url: 'http://localhost:3000/',
      name: 'Landing Page',
      expectedElements: [
        'header', 'nav', '.hero', '.features', 'footer'
      ]
    },
    {
      url: 'http://localhost:3000/auth/login',
      name: 'Login Page',
      expectedElements: [
        'form', 'input[type="email"]', 'input[type="password"]', 'button[type="submit"]'
      ]
    },
    {
      url: 'http://localhost:3000/auth/signup',
      name: 'Signup Page',
      expectedElements: [
        'form', 'input[type="email"]', 'input[type="password"]', 'button[type="submit"]'
      ]
    },
    {
      url: 'http://localhost:3000/admin',
      name: 'Admin Panel',
      expectedElements: [
        '.dashboard', '.metrics', 'nav', '.sidebar'
      ],
      requiresAuth: true
    },
    {
      url: 'http://localhost:3000/client',
      name: 'Client Panel',
      expectedElements: [
        '.client-dashboard', 'nav', '.appointment-section'
      ],
      requiresAuth: true
    },
    {
      url: 'http://localhost:3000/checkout',
      name: 'Checkout Page',
      expectedElements: [
        'form', '.payment-section', '.order-summary'
      ]
    }
  ];

  for (const pageConfig of pagesToTest) {
    console.log(`\n📋 Validando: ${pageConfig.name}`);

    const pageResult = {
      name: pageConfig.name,
      url: pageConfig.url,
      viewports: {},
      issues: [],
      status: 'passed'
    };

    for (const viewport of viewports) {
      console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      try {
        // Navegar a la página
        const response = await page.goto(pageConfig.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        if (!response || response.status() !== 200) {
          throw new Error(`HTTP ${response?.status()} - Página no accesible`);
        }

        // Esperar a que la página cargue completamente
        await page.waitForTimeout(2000);

        // Capturar screenshot
        const screenshotName = `${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}-${viewport.name}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        // Validaciones específicas
        const validation = {
          responsive: true,
          elements: {},
          accessibility: {},
          performance: {},
          errors: []
        };

        // Verificar elementos esperados
        for (const selector of pageConfig.expectedElements) {
          try {
            const element = await page.$(selector);
            validation.elements[selector] = {
              found: !!element,
              visible: element ? await element.isVisible() : false
            };

            if (!element) {
              validation.errors.push(`Elemento faltante: ${selector}`);
            } else if (!await element.isVisible()) {
              validation.errors.push(`Elemento no visible: ${selector}`);
            }
          } catch (error) {
            validation.elements[selector] = { found: false, visible: false };
            validation.errors.push(`Error validando ${selector}: ${error.message}`);
          }
        }

        // Verificar errores JavaScript
        const jsErrors = [];
        page.on('pageerror', error => {
          jsErrors.push(error.message);
        });

        // Verificar overlay o elementos superpuestos
        const overlayCheck = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const overlaps = [];

          for (let i = 0; i < elements.length; i++) {
            const rect1 = elements[i].getBoundingClientRect();
            if (rect1.width === 0 || rect1.height === 0) continue;

            for (let j = i + 1; j < elements.length; j++) {
              const rect2 = elements[j].getBoundingClientRect();
              if (rect2.width === 0 || rect2.height === 0) continue;

              // Detectar superposición problemática
              if (rect1.left < rect2.right && rect2.left < rect1.right &&
                  rect1.top < rect2.bottom && rect2.top < rect1.bottom) {
                const zIndex1 = window.getComputedStyle(elements[i]).zIndex;
                const zIndex2 = window.getComputedStyle(elements[j]).zIndex;

                if (zIndex1 !== 'auto' && zIndex2 !== 'auto' &&
                    Math.abs(parseInt(zIndex1) - parseInt(zIndex2)) > 1000) {
                  overlaps.push({
                    element1: elements[i].tagName + (elements[i].className ? '.' + elements[i].className : ''),
                    element2: elements[j].tagName + (elements[j].className ? '.' + elements[j].className : ''),
                    zIndex1,
                    zIndex2
                  });
                }
              }
            }
          }

          return overlaps.slice(0, 5); // Limitar a 5 para no saturar el reporte
        });

        if (overlayCheck.length > 0) {
          validation.errors.push(`Posibles superposiciones detectadas: ${overlayCheck.length}`);
        }

        // Verificar contraste de colores (básico)
        const contrastIssues = await page.evaluate(() => {
          const issues = [];
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');

          for (const element of textElements) {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;

            // Verificación básica de contraste
            if (color === backgroundColor ||
                (color.includes('rgb(255, 255, 255)') && backgroundColor.includes('rgb(255, 255, 255)')) ||
                (color.includes('rgb(0, 0, 0)') && backgroundColor.includes('rgb(0, 0, 0)'))) {
              issues.push({
                element: element.tagName,
                text: element.textContent?.substring(0, 50) || '',
                color,
                backgroundColor
              });
            }
          }

          return issues.slice(0, 3);
        });

        if (contrastIssues.length > 0) {
          validation.errors.push(`Posibles problemas de contraste: ${contrastIssues.length}`);
        }

        // Verificar responsive design
        if (viewport.name === 'mobile') {
          const mobileIssues = await page.evaluate(() => {
            const issues = [];

            // Verificar overflow horizontal
            if (document.body.scrollWidth > window.innerWidth) {
              issues.push('Overflow horizontal detectado');
            }

            // Verificar elementos demasiado pequeños
            const clickableElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
            for (const el of clickableElements) {
              const rect = el.getBoundingClientRect();
              if (rect.width < 44 || rect.height < 44) {
                issues.push(`Elemento clickeable muy pequeño: ${el.tagName}`);
              }
            }

            return issues;
          });

          validation.errors.push(...mobileIssues);
        }

        // Agregar errores JS si los hay
        validation.errors.push(...jsErrors);

        pageResult.viewports[viewport.name] = {
          screenshot: screenshotPath,
          validation,
          loadTime: Date.now(),
          dimensions: { width: viewport.width, height: viewport.height }
        };

        if (validation.errors.length > 0) {
          pageResult.status = 'failed';
          pageResult.issues.push(...validation.errors);
        }

        console.log(`    ✅ Screenshot capturado: ${screenshotName}`);
        console.log(`    📊 Errores encontrados: ${validation.errors.length}`);

      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        pageResult.status = 'failed';
        pageResult.issues.push(`Error en ${viewport.name}: ${error.message}`);

        pageResult.viewports[viewport.name] = {
          error: error.message,
          screenshot: null
        };
      }

      await page.close();
    }

    results.pages.push(pageResult);
    results.summary.total++;

    if (pageResult.status === 'passed') {
      results.summary.passed++;
      console.log(`✅ ${pageConfig.name}: PASSED`);
    } else {
      results.summary.failed++;
      console.log(`❌ ${pageConfig.name}: FAILED`);
    }
  }

  await browser.close();

  // Generar reporte
  const reportPath = path.join(__dirname, 'ui-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n📋 RESUMEN DE VALIDACIÓN UI:');
  console.log(`📊 Total de páginas: ${results.summary.total}`);
  console.log(`✅ Páginas exitosas: ${results.summary.passed}`);
  console.log(`❌ Páginas con problemas: ${results.summary.failed}`);
  console.log(`📁 Screenshots guardados en: ${screenshotDir}`);
  console.log(`📄 Reporte completo: ${reportPath}`);

  return results;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createUIValidationReport()
    .then(results => {
      console.log('\n🎉 Validación completada exitosamente!');
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Error en validación:', error);
      process.exit(1);
    });
}

module.exports = { createUIValidationReport };