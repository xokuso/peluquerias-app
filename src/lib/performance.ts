/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourceLoadTime?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  /**
   * Initialize all performance monitoring
   */
  private initializeMonitoring() {
    this.observePaintMetrics();
    this.observeLayoutShift();
    this.observeInputDelay();
    this.observeNavigationTiming();
    this.observeResourceTiming();
  }

  /**
   * Observe paint metrics (FCP, LCP)
   */
  private observePaintMetrics() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
        if (this.metrics.lcp) {
          this.reportMetric('LCP', this.metrics.lcp);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // Observe First Contentful Paint
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            if (this.metrics.fcp) {
              this.reportMetric('FCP', this.metrics.fcp);
            }
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    } catch (e) {
      console.error('Error setting up paint observers:', e);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeLayoutShift() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      let clsEntries: (PerformanceEntry & { value: number })[] = [];

      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            const firstSessionEntry = clsEntries[0];
            const lastSessionEntry = clsEntries[clsEntries.length - 1];

            if (
              firstSessionEntry &&
              lastSessionEntry &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000
            ) {
              clsValue += (entry as PerformanceEntry & { value: number }).value;
              clsEntries.push(entry as PerformanceEntry & { value: number });
            } else {
              clsValue = (entry as PerformanceEntry & { value: number }).value;
              clsEntries = [entry as PerformanceEntry & { value: number }];
            }
          }
        }
        this.metrics.cls = clsValue;
        if (this.metrics.cls !== undefined) {
          this.reportMetric('CLS', this.metrics.cls);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.error('Error setting up CLS observer:', e);
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeInputDelay() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.metrics.fid = (entry as PerformanceEntry & { processingStart: number }).processingStart - entry.startTime;
          if (this.metrics.fid !== undefined) {
            this.reportMetric('FID', this.metrics.fid);
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.error('Error setting up FID observer:', e);
    }
  }

  /**
   * Observe navigation timing metrics
   */
  private observeNavigationTiming() {
    if (!window.performance || !window.performance.timing) return;

    window.addEventListener('load', () => {
      const timing = window.performance.timing;

      // Time to First Byte
      this.metrics.ttfb = timing.responseStart - timing.navigationStart;
      if (this.metrics.ttfb) {
        this.reportMetric('TTFB', this.metrics.ttfb);
      }

      // Page Load Time
      this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      if (this.metrics.pageLoadTime) {
        this.reportMetric('Page Load Time', this.metrics.pageLoadTime);
      }

      // DOM Content Loaded
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      if (this.metrics.domContentLoaded) {
        this.reportMetric('DOM Content Loaded', this.metrics.domContentLoaded);
      }
    });
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const resourceMetrics = entries.map((entry) => ({
          name: entry.name,
          type: entry.entryType,
          duration: entry.duration,
          size: (entry as PerformanceEntry & { transferSize?: number }).transferSize || 0,
        }));

        // Track slow resources
        const slowResources = resourceMetrics.filter(r => r.duration > 1000);
        if (slowResources.length > 0) {
          console.warn('Slow resources detected:', slowResources);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (e) {
      console.error('Error setting up resource observer:', e);
    }
  }

  /**
   * Report metric to console and analytics
   */
  private reportMetric(name: string, value: number) {
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      const rating = this.getRating(name, value);
      const emoji = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
      console.log(`${emoji} ${name}: ${value.toFixed(2)}ms (${rating})`);
    }

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        metric_rating: this.getRating(name, value),
      });
    }
  }

  /**
   * Get rating for a metric value
   */
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'needs-improvement';

    if (value <= threshold.good) return 'good';
    if (value >= threshold.poor) return 'poor';
    return 'needs-improvement';
  }

  /**
   * Get all collected metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear all observers
   */
  public disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceMonitor = typeof window !== 'undefined' ? new PerformanceMonitor() : null;

/**
 * Measure function execution time
 */
export function measureExecutionTime<T extends (...args: never[]) => unknown>(
  fn: T,
  name: string = 'Function'
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`⏱ ${name} took ${duration.toFixed(2)}ms`);
      });
    }

    const duration = performance.now() - start;
    console.log(`⏱ ${name} took ${duration.toFixed(2)}ms`);
    return result;
  }) as T;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-lazy]');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute('data-lazy');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
  });

  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Prefetch critical resources
 */
export function prefetchCriticalResources(urls: string[]) {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = url.endsWith('.js') ? 'script' : url.endsWith('.css') ? 'style' : 'fetch';
    document.head.appendChild(link);
  });
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  (typeof window !== 'undefined' && window.requestIdleCallback) ||
  function (cb: IdleRequestCallback) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      } as IdleDeadline);
    }, 1);
  };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  (typeof window !== 'undefined' && window.cancelIdleCallback) ||
  function (id: number) {
    clearTimeout(id);
  };