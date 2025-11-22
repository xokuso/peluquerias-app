// Storage utilities for analytics data

import { generateAnonymousId } from './privacy';

const STORAGE_KEYS = {
  SESSION_ID: 'analytics_session_id',
  USER_ID: 'analytics_user_id',
  ANONYMOUS_ID: 'analytics_anonymous_id',
  UTM_PARAMS: 'analytics_utm_params',
  REFERRER: 'analytics_referrer',
  FIRST_VISIT: 'analytics_first_visit',
  LAST_ACTIVITY: 'analytics_last_activity',
  PAGE_VIEWS: 'analytics_page_views',
  AB_TESTS: 'analytics_ab_tests',
} as const;

/**
 * Safe localStorage wrapper with fallback
 */
class SafeStorage {
  private isAvailable: boolean;
  private memory: Map<string, string> = new Map();

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      try {
        return localStorage.getItem(key);
      } catch {
        // Fallback to memory
      }
    }
    return this.memory.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memory.set(key, value);
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Continue with memory removal
      }
    }
    this.memory.delete(key);
  }

  clear(): void {
    if (this.isAvailable) {
      try {
        // Only clear analytics keys
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      } catch {
        // Continue with memory clear
      }
    }
    this.memory.clear();
  }
}

const storage = typeof window !== 'undefined' ? new SafeStorage() : null;

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  if (!storage) return generateAnonymousId();

  let sessionId = storage.getItem(STORAGE_KEYS.SESSION_ID);

  if (!sessionId) {
    sessionId = generateAnonymousId();
    storage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }

  // Check if session has expired (30 minutes of inactivity)
  const lastActivity = storage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  if (lastActivity) {
    const diff = Date.now() - parseInt(lastActivity, 10);
    if (diff > 30 * 60 * 1000) {
      // Session expired, create new one
      sessionId = generateAnonymousId();
      storage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      storage.removeItem(STORAGE_KEYS.PAGE_VIEWS);
    }
  }

  // Update last activity
  storage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());

  return sessionId;
}

/**
 * Get or create anonymous user ID (persists across sessions)
 */
export function getAnonymousId(): string {
  if (!storage) return generateAnonymousId();

  let anonymousId = storage.getItem(STORAGE_KEYS.ANONYMOUS_ID);

  if (!anonymousId) {
    anonymousId = generateAnonymousId();
    storage.setItem(STORAGE_KEYS.ANONYMOUS_ID, anonymousId);
  }

  return anonymousId;
}

/**
 * Set authenticated user ID
 */
export function setUserId(userId: string | null): void {
  if (!storage) return;

  if (userId) {
    storage.setItem(STORAGE_KEYS.USER_ID, userId);
  } else {
    storage.removeItem(STORAGE_KEYS.USER_ID);
  }
}

/**
 * Get authenticated user ID
 */
export function getUserId(): string | null {
  if (!storage) return null;
  return storage.getItem(STORAGE_KEYS.USER_ID);
}

/**
 * Store UTM parameters
 */
export function storeUTMParams(params: Record<string, string>): void {
  if (!storage) return;

  const existing = getUTMParams();
  const merged = { ...existing, ...params };

  storage.setItem(STORAGE_KEYS.UTM_PARAMS, JSON.stringify(merged));
}

/**
 * Get stored UTM parameters
 */
export function getUTMParams(): Record<string, string> {
  if (!storage) return {};

  try {
    const stored = storage.getItem(STORAGE_KEYS.UTM_PARAMS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Store referrer
 */
export function storeReferrer(referrer: string): void {
  if (!storage || !referrer) return;
  storage.setItem(STORAGE_KEYS.REFERRER, referrer);
}

/**
 * Get stored referrer
 */
export function getReferrer(): string | null {
  if (!storage) return null;
  return storage.getItem(STORAGE_KEYS.REFERRER);
}

/**
 * Check if first visit
 */
export function isFirstVisit(): boolean {
  if (!storage) return true;

  const firstVisit = storage.getItem(STORAGE_KEYS.FIRST_VISIT);
  if (!firstVisit) {
    storage.setItem(STORAGE_KEYS.FIRST_VISIT, Date.now().toString());
    return true;
  }

  return false;
}

/**
 * Increment page view counter
 */
export function incrementPageViews(): number {
  if (!storage) return 1;

  const current = parseInt(storage.getItem(STORAGE_KEYS.PAGE_VIEWS) || '0', 10);
  const newCount = current + 1;
  storage.setItem(STORAGE_KEYS.PAGE_VIEWS, newCount.toString());

  return newCount;
}

/**
 * Get page view count for current session
 */
export function getPageViewCount(): number {
  if (!storage) return 0;
  return parseInt(storage.getItem(STORAGE_KEYS.PAGE_VIEWS) || '0', 10);
}

/**
 * Store A/B test participation
 */
export function storeABTestParticipation(testId: string, variantId: string): void {
  if (!storage) return;

  try {
    const stored = storage.getItem(STORAGE_KEYS.AB_TESTS) || '{}';
    const tests = JSON.parse(stored);
    tests[testId] = variantId;
    storage.setItem(STORAGE_KEYS.AB_TESTS, JSON.stringify(tests));
  } catch {
    // Ignore errors
  }
}

/**
 * Get A/B test participation
 */
export function getABTestParticipation(testId: string): string | null {
  if (!storage) return null;

  try {
    const stored = storage.getItem(STORAGE_KEYS.AB_TESTS) || '{}';
    const tests = JSON.parse(stored);
    return tests[testId] || null;
  } catch {
    return null;
  }
}

/**
 * Clear all analytics storage
 */
export function clearAnalyticsStorage(): void {
  if (!storage) return;
  storage.clear();
}