'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}


/**
 * Web Vitals monitoring component for tracking Core Web Vitals
 * Reports metrics to console in development and analytics in production
 */
export default function WebVitals() {
  useEffect(() => {
    const sendToAnalytics = (metric: Metric) => {
      const { name, value, rating, delta, id } = metric;

      // Format the metric data
      const webVitalsData: WebVitalsData = {
        name,
        value: Math.round(name === 'CLS' ? value * 1000 : value), // CLS is a unitless value
        rating: rating || 'needs-improvement',
        delta: Math.round(delta),
        id,
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const color = rating === 'good' ? '🟢' : rating === 'poor' ? '🔴' : '🟡';
        console.log(`${color} Web Vitals [${name}]:`, {
          value: webVitalsData.value,
          rating: webVitalsData.rating,
          delta: webVitalsData.delta,
        });
      }

      // Send to analytics in production
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: name,
          value: webVitalsData.value,
          metric_rating: webVitalsData.rating,
          metric_delta: webVitalsData.delta,
          non_interaction: true,
        });
      }

      // Send to custom analytics endpoint if needed
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'web-vitals',
            ...webVitalsData,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(() => {
          // Silently fail - we don't want to impact user experience
        });
      }
    };

    // Register Web Vitals observers
    try {
      onCLS(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
    } catch (error) {
      console.error('Error initializing Web Vitals:', error);
    }
  }, []);

  return null;
}

// Export a function to manually report custom metrics
export function reportWebVitals(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Custom Web Vital:', metric);
  }
}