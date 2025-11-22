/**
 * Enhanced Input Validation and Sanitization
 * Prevents injection attacks and ensures data integrity
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Custom sanitization functions
export const sanitizers = {
  // Remove all HTML and dangerous characters
  text: (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
      .trim()
      .replace(/[<>\"']/g, '');
  },

  // Sanitize while preserving some formatting
  richText: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  },

  // Email sanitization
  email: (input: string): string => {
    const sanitized = input.toLowerCase().trim();
    // Additional email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    return sanitized;
  },

  // Phone number sanitization
  phone: (input: string): string => {
    // Remove all non-digit characters except + for international
    return input.replace(/[^\d+]/g, '').slice(0, 15);
  },

  // Domain name sanitization
  domain: (input: string): string => {
    const sanitized = input.toLowerCase().trim();
    // Only allow valid domain characters
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!domainRegex.test(sanitized)) {
      throw new Error('Invalid domain format');
    }
    return sanitized;
  },

  // URL sanitization
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  },

  // SQL injection prevention
  sqlSafe: (input: string): string => {
    // Remove or escape SQL meta-characters
    return input
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/script/gi, '');
  },

  // NoSQL injection prevention
  mongoSafe: (input: unknown): unknown => {
    if (typeof input === 'string') {
      return input.replace(/[$]/g, '');
    }
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      const cleaned: Record<string, unknown> = {};
      for (const key in input as Record<string, unknown>) {
        if (!key.startsWith('$')) {
          cleaned[key] = sanitizers.mongoSafe((input as Record<string, unknown>)[key]);
        }
      }
      return cleaned;
    }
    return input;
  }
};

// Enhanced validation schemas
export const validationSchemas = {
  // Strict email validation
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .transform(sanitizers.email),

  // Phone validation with international support
  phone: z.string()
    .min(10, 'Phone number too short')
    .max(15, 'Phone number too long')
    .transform(sanitizers.phone),

  // Domain validation
  domain: z.string()
    .min(1, 'Domain required')
    .max(63, 'Domain too long')
    .transform(sanitizers.domain),

  // Safe text input
  safeText: z.string()
    .min(1, 'Field required')
    .max(1000, 'Text too long')
    .transform(sanitizers.text),

  // Amount validation for payments
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999, 'Amount too large')
    .refine(val => Number.isFinite(val), 'Invalid amount')
    .refine(val => Math.round(val * 100) / 100 === val, 'Too many decimal places'),

  // Spanish CIF/NIF validation
  cifNif: z.string()
    .regex(/^[A-Z]\d{7}[A-Z0-9]$|^\d{8}[A-Z]$/, 'Invalid CIF/NIF format')
    .optional(),

  // Postal code validation (Spanish)
  postalCode: z.string()
    .regex(/^\d{5}$/, 'Invalid postal code format')
    .transform(sanitizers.text),

  // Credit card validation (basic)
  creditCard: z.object({
    number: z.string()
      .regex(/^\d{13,19}$/, 'Invalid card number')
      .refine(luhnCheck, 'Invalid card number'),
    exp: z.string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date'),
    cvv: z.string()
      .regex(/^\d{3,4}$/, 'Invalid CVV')
  })
};

// Luhn algorithm for credit card validation
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.split('').reverse().map(Number);
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    const currentDigit = digits[i];
    if (currentDigit === undefined) continue;

    let digit = currentDigit;
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

// Request body validation wrapper
export async function validateRequestBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const data = await schema.parseAsync(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// XSS prevention for dynamic content
export function preventXSS(content: unknown): unknown {
  if (typeof content === 'string') {
    return sanitizers.text(content);
  }
  if (Array.isArray(content)) {
    return content.map(preventXSS);
  }
  if (typeof content === 'object' && content !== null) {
    const cleaned: Record<string, unknown> = {};
    for (const key in content as Record<string, unknown>) {
      cleaned[key] = preventXSS((content as Record<string, unknown>)[key]);
    }
    return cleaned;
  }
  return content;
}

// File upload validation
export const fileValidation = {
  // Allowed MIME types for images
  allowedImageTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ],

  // Max file size (5MB)
  maxFileSize: 5 * 1024 * 1024,

  // Validate file upload
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.allowedImageTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    if (file.size > this.maxFileSize) {
      return { valid: false, error: 'File too large (max 5MB)' };
    }
    return { valid: true };
  }
};

// Headers validation
export function validateHeaders(headers: Headers): boolean {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url'
  ];

  for (const header of suspiciousHeaders) {
    if (headers.has(header)) {
      console.warn(`Suspicious header detected: ${header}`);
      return false;
    }
  }

  return true;
}

// IP address validation
export function validateIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  return ipv6Regex.test(ip);
}

// Export all validators in a named object
export const validationUtils = {
  sanitizers,
  schemas: validationSchemas,
  validateRequestBody,
  preventXSS,
  fileValidation,
  validateHeaders,
  validateIP
};

// Keep default export for backward compatibility
export default validationUtils;