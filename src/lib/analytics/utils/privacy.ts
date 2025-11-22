// Privacy utilities for GDPR compliance

import crypto from 'crypto';

/**
 * Hash sensitive data using SHA256
 */
export function hashData(data: string): string {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Hash email address for Facebook Pixel
 */
export function hashEmail(email: string): string {
  if (!email) return '';
  // Remove spaces and convert to lowercase as required by Facebook
  const normalized = email.toLowerCase().replace(/\s/g, '');
  return hashData(normalized);
}

/**
 * Hash phone number for Facebook Pixel
 */
export function hashPhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-numeric characters
  const normalized = phone.replace(/\D/g, '');
  return hashData(normalized);
}

/**
 * Anonymize IP address (remove last octet for IPv4, last 64 bits for IPv6)
 */
export function anonymizeIP(ip: string): string {
  if (!ip) return '';

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }

  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    // Zero out the last 4 groups (64 bits)
    for (let i = Math.max(0, parts.length - 4); i < parts.length; i++) {
      parts[i] = '0';
    }
    return parts.join(':');
  }

  return ip;
}

/**
 * Check if Do Not Track is enabled
 */
export function isDNTEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const nav = window.navigator as any;
  const win = window as any;
  return nav.doNotTrack === '1' ||
         nav.doNotTrack === 'yes' ||
         nav.msDoNotTrack === '1' ||
         win.doNotTrack === '1';
}

/**
 * Get consent status from localStorage
 */
export function getConsentStatus(): {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      analytics: false,
      marketing: false,
      functional: false,
      necessary: true,
    };
  }

  try {
    const stored = localStorage.getItem('cookie_consent');
    if (stored) {
      const consent = JSON.parse(stored);
      return {
        analytics: consent.analytics ?? false,
        marketing: consent.marketing ?? false,
        functional: consent.functional ?? false,
        necessary: true, // Always true
      };
    }
  } catch (e) {
    console.error('Error reading consent status:', e);
  }

  return {
    analytics: false,
    marketing: false,
    functional: false,
    necessary: true,
  };
}

/**
 * Set consent status in localStorage
 */
export function setConsentStatus(consent: {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      ...consent,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(data));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: data }));
  } catch (e) {
    console.error('Error saving consent status:', e);
  }
}

/**
 * Check if analytics should be tracked based on consent
 */
export function canTrack(): boolean {
  const consent = getConsentStatus();
  const dntEnabled = isDNTEnabled();

  // Respect DNT if enabled
  if (dntEnabled) return false;

  // Check consent
  return consent.analytics;
}

/**
 * Check if marketing pixels can be loaded
 */
export function canLoadMarketingPixels(): boolean {
  const consent = getConsentStatus();
  const dntEnabled = isDNTEnabled();

  // Respect DNT if enabled
  if (dntEnabled) return false;

  // Check consent
  return consent.marketing;
}

/**
 * Generate a random anonymous user ID
 */
export function generateAnonymousId(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for older browsers
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Remove PII from URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);

    // Remove sensitive query parameters
    const sensitiveParams = [
      'email', 'name', 'phone', 'address', 'ssn', 'dob',
      'password', 'token', 'key', 'secret', 'api_key'
    ];

    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (!data) return data;

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'email',
    'phone', 'ssn', 'creditCard', 'cvv'
  ];

  if (typeof data === 'object') {
    const masked = { ...data };

    Object.keys(masked).forEach(key => {
      const lowerKey = key.toLowerCase();

      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskSensitiveData(masked[key]);
      }
    });

    return masked;
  }

  return data;
}