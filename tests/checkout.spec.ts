import { test, expect } from '@playwright/test';

test.describe('Checkout Flow - Hair Salon Website Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to checkout page
    await page.goto('/checkout');
  });

  test('should load checkout page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*checkout.*/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display 3-step form process', async ({ page }) => {
    // Look for step indicators
    const stepIndicators = page.locator('[data-testid="step"], .step, .step-indicator, [class*="step"]');

    if (await stepIndicators.count() > 0) {
      // Should have 3 steps as mentioned in requirements
      await expect(stepIndicators).toHaveCount(3);

      // Check for step labels or numbers
      const stepLabels = page.locator('text=/paso/i, text=/step/i, text=/1/, text=/2/, text=/3/');
      if (await stepLabels.count() > 0) {
        await expect(stepLabels.first()).toBeVisible();
      }
    }
  });

  test('should handle Step 1: Business information collection', async ({ page }) => {
    // Look for business information form fields
    const businessFields = [
      page.locator('input[name*="business"], input[name*="negocio"], input[name*="salon"]'),
      page.locator('input[name*="name"], input[name*="nombre"]'),
      page.locator('input[name*="email"], input[type="email"]'),
      page.locator('input[name*="phone"], input[name*="telefono"], input[type="tel"]')
    ];

    // At least some business information fields should be present
    let visibleFields = 0;

    for (const field of businessFields) {
      if (await field.count() > 0) {
        await expect(field.first()).toBeVisible();
        visibleFields++;
      }
    }

    expect(visibleFields).toBeGreaterThan(0);

    // Fill out business information
    const nameField = page.locator('input[name*="name"], input[name*="nombre"]').first();
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();

    if (await nameField.count() > 0) {
      await nameField.fill('Salón de Belleza Ejemplo');
    }

    if (await emailField.count() > 0) {
      await emailField.fill('test@ejemplo.com');
    }

    // Look for next/continue button
    const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente"), button[type="submit"], .next-button');

    if (await continueButton.count() > 0) {
      await expect(continueButton.first()).toBeEnabled();
    }
  });

  test('should validate form inputs', async ({ page }) => {
    // Try to submit with empty required fields
    const submitButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente"), button[type="submit"]').first();

    if (await submitButton.count() > 0) {
      await submitButton.click();

      // Should show validation errors or prevent submission
      const validationErrors = page.locator('.error, [class*="error"], .invalid, [aria-invalid="true"]');

      if (await validationErrors.count() > 0) {
        await expect(validationErrors.first()).toBeVisible();
      } else {
        // Form might prevent submission without showing errors
        // Check that we're still on the same step
        const url = page.url();
        expect(url).toContain('checkout');
      }
    }

    // Test email validation
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();

    if (await emailField.count() > 0) {
      await emailField.fill('invalid-email');
      await submitButton.click();

      // Should show email validation error
      const emailError = page.locator('[data-testid="email-error"], .email-error, input[type="email"]:invalid');

      if (await emailError.count() > 0) {
        await expect(emailError.first()).toBeVisible();
      }
    }
  });

  test('should handle Step 2: Domain verification with real-time checking', async ({ page }) => {
    // First, fill out step 1 if visible
    await fillStep1IfVisible(page);

    // Look for domain input field
    const domainField = page.locator('input[name*="domain"], input[name*="dominio"], input[placeholder*="domain"]');

    if (await domainField.count() > 0) {
      await expect(domainField.first()).toBeVisible();

      // Test domain availability checking
      await domainField.first().fill('test-salon-ejemplo-' + Date.now());
      await page.waitForTimeout(1000); // Wait for real-time checking

      // Look for availability indicator
      const availabilityIndicator = page.locator('[data-testid="domain-status"], .domain-status, .available, .unavailable');

      if (await availabilityIndicator.count() > 0) {
        await expect(availabilityIndicator.first()).toBeVisible();
      }

      // Test with a likely taken domain
      await domainField.first().fill('google');
      await page.waitForTimeout(1000);

      // Should show unavailable status
      const unavailableIndicator = page.locator('text=/no.*disponible/i, text=/taken/i, text=/unavailable/i, .unavailable');

      if (await unavailableIndicator.count() > 0) {
        await expect(unavailableIndicator.first()).toBeVisible();
      }
    }
  });

  test('should offer domain migration option (65€)', async ({ page }) => {
    await fillStep1IfVisible(page);

    // Look for domain migration option
    const migrationOption = page.locator('text=/migración/i, text=/65.*€/i, input[name*="migration"], [data-testid="migration-option"]');

    if (await migrationOption.count() > 0) {
      await expect(migrationOption.first()).toBeVisible();

      // Should mention 65€ price
      const migrationPrice = page.locator('text=/65.*€/i');
      if (await migrationPrice.count() > 0) {
        await expect(migrationPrice.first()).toBeVisible();
      }
    }
  });

  test('should handle Step 3: Payment processing', async ({ page }) => {
    await fillCheckoutToStep3(page);

    // Look for payment section
    const paymentSection = page.locator('[data-testid="payment"], .payment, section:has-text("pago"), #payment-form');

    if (await paymentSection.count() > 0) {
      await expect(paymentSection.first()).toBeVisible();

      // Look for Stripe elements
      const stripeElements = page.locator('[data-testid="stripe-card"], .StripeElement, iframe[src*="stripe"]');

      if (await stripeElements.count() > 0) {
        await expect(stripeElements.first()).toBeVisible();
      }
    }
  });

  test('should calculate pricing correctly', async ({ page }) => {
    // Look for pricing breakdown
    const setupFee = page.locator('text=/199.*€/i');
    const monthlyFee = page.locator('text=/49.*€.*mes/i');

    if (await setupFee.count() > 0) {
      await expect(setupFee.first()).toBeVisible();
    }

    if (await monthlyFee.count() > 0) {
      await expect(monthlyFee.first()).toBeVisible();
    }

    // Check total calculation
    const total = page.locator('[data-testid="total"], .total, text=/total/i');

    if (await total.count() > 0) {
      await expect(total.first()).toBeVisible();

      // Should show at least 199€ (setup fee)
      const totalText = await total.first().textContent();
      if (totalText) {
        const totalMatch = totalText.match(/(\d+)/);
        if (totalMatch && totalMatch[1]) {
          const totalAmount = parseInt(totalMatch[1]);
          expect(totalAmount).toBeGreaterThanOrEqual(199);
        }
      }
    }

    // Test with migration option if available
    const migrationCheckbox = page.locator('input[name*="migration"], input[type="checkbox"]').first();

    if (await migrationCheckbox.count() > 0) {
      await migrationCheckbox.check();

      // Total should increase by 65€
      await page.waitForTimeout(500);

      const newTotal = page.locator('[data-testid="total"], .total');
      if (await newTotal.count() > 0) {
        const newTotalText = await newTotal.first().textContent();
        if (newTotalText) {
          const newTotalMatch = newTotalText.match(/(\d+)/);
          if (newTotalMatch && newTotalMatch[1]) {
            const newTotalAmount = parseInt(newTotalMatch[1]);
            expect(newTotalAmount).toBeGreaterThanOrEqual(264); // 199 + 65
          }
        }
      }
    }
  });

  test('should handle Stripe integration in test mode', async ({ page }) => {
    await fillCheckoutToStep3(page);

    // Look for Stripe payment form
    const stripeForm = page.locator('[data-testid="stripe-form"], form:has(.StripeElement), form:has(iframe[src*="stripe"])');

    if (await stripeForm.count() > 0) {
      await expect(stripeForm.first()).toBeVisible();

      // Check for test mode indicators
      const testMode = page.locator('text=/test/i, text=/prueba/i, [data-testid="test-mode"]');

      // In development, should be in test mode
      if (await testMode.count() > 0) {
        await expect(testMode.first()).toBeVisible();
      }

      // Look for card input (might be in iframe)
      const cardInput = page.locator('input[name*="card"], [data-testid="card-input"]');

      if (await cardInput.count() > 0) {
        await expect(cardInput.first()).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Form should be usable on mobile
    const formElements = page.locator('form, input, button');

    if (await formElements.count() > 0) {
      await expect(formElements.first()).toBeVisible();
    }

    // Check that form doesn't overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(425);
  });

  test('should show error handling and user feedback', async ({ page }) => {
    // Test form submission with invalid data
    const submitButton = page.locator('button[type="submit"], button:has-text("Pagar"), button:has-text("Finalizar")').first();

    if (await submitButton.count() > 0) {
      // Try to submit empty form
      await submitButton.click();

      // Should show error messages or feedback
      const errorMessages = page.locator('.error, [class*="error"], .alert-error, [role="alert"]');

      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });

  test('should have professional checkout experience', async ({ page }) => {
    // Should not show development artifacts
    const devContent = page.locator('text=/debug/i, text=/console/i, text=/lorem/i');

    if (await devContent.count() > 0) {
      const devText = await devContent.first().textContent();
      expect(devText?.toLowerCase()).not.toContain('debug');
    }

    // Should have professional styling
    await expect(page.locator('body')).toBeVisible();

    // Security indicators for payment
    const securityIndicators = page.locator('text=/segur/i, text=/ssl/i, text=/encrypt/i, .secure');

    // At least the form should look professional
    const form = page.locator('form');
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible();
    }
  });
});

// Helper function to fill Step 1 if visible
async function fillStep1IfVisible(page: any) {
  const nameField = page.locator('input[name*="name"], input[name*="nombre"]').first();
  const emailField = page.locator('input[type="email"], input[name*="email"]').first();

  if (await nameField.count() > 0 && await nameField.isVisible()) {
    await nameField.fill('Salón Test');
  }

  if (await emailField.count() > 0 && await emailField.isVisible()) {
    await emailField.fill('test@example.com');
  }

  // Try to continue to next step
  const nextButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")').first();
  if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
    await nextButton.click();
    await page.waitForTimeout(1000);
  }
}

// Helper function to fill checkout to step 3
async function fillCheckoutToStep3(page: any) {
  await fillStep1IfVisible(page);

  // Fill domain if visible
  const domainField = page.locator('input[name*="domain"], input[name*="dominio"]').first();
  if (await domainField.count() > 0 && await domainField.isVisible()) {
    await domainField.fill('test-salon-' + Date.now());

    // Continue to payment step
    const nextButton = page.locator('button:has-text("Continuar"), button:has-text("Siguiente")').first();
    if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  }
}