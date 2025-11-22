// Analytics and tracking configuration
import Cookies from 'js-cookie';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Google Analytics
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
  }
};

export const event = (
  action: string,
  { event_category, event_label, value }: {
    event_category?: string;
    event_label?: string;
    value?: number;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category,
      event_label,
      value,
    });
  }
};

// Facebook Pixel Events
export const fbEvent = (eventName: string, data?: unknown) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

// Specific tracking events for the business
export const trackEvents = {
  // Landing page events
  viewContent: (contentType: string) => {
    event('view_content', {
      event_category: 'engagement',
      event_label: contentType,
    });
    fbEvent('ViewContent', { content_type: contentType });
  },

  // Template selection
  selectTemplate: (templateName: string) => {
    event('select_template', {
      event_category: 'template',
      event_label: templateName,
    });
    fbEvent('ViewContent', {
      content_type: 'template',
      content_name: templateName
    });
  },

  // Checkout events
  beginCheckout: (value: number) => {
    event('begin_checkout', {
      event_category: 'ecommerce',
      value,
    });
    fbEvent('InitiateCheckout', {
      value,
      currency: 'EUR',
      content_type: 'product'
    });
  },

  addPaymentInfo: () => {
    event('add_payment_info', {
      event_category: 'ecommerce',
    });
    fbEvent('AddPaymentInfo');
  },

  // Purchase completion
  purchase: (transactionId: string, value: number, items: unknown[]) => {
    event('purchase', {
      event_category: 'ecommerce',
      value,
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value,
        currency: 'EUR',
        items,
      });
    }

    fbEvent('Purchase', {
      value,
      currency: 'EUR',
      transaction_id: transactionId,
    });
  },

  // Lead generation
  generateLead: (leadType: string) => {
    event('generate_lead', {
      event_category: 'lead',
      event_label: leadType,
    });
    fbEvent('Lead', { content_name: leadType });
  },

  // CTA interactions
  ctaClick: (ctaName: string, location: string) => {
    event('cta_click', {
      event_category: 'engagement',
      event_label: `${ctaName}_${location}`,
    });
    fbEvent('ClickButton', {
      button_name: ctaName,
      page_location: location
    });
  },

  // Domain check
  checkDomain: (domain: string, available: boolean) => {
    event('domain_check', {
      event_category: 'domain',
      event_label: available ? 'available' : 'unavailable',
    });
    fbEvent('Search', {
      search_string: domain,
      content_category: 'domain'
    });
  },
};

// Cookie consent management
export const hasAnalyticsConsent = () => {
  return Cookies.get('analytics_consent') === 'true';
};

export const setAnalyticsConsent = (consent: boolean) => {
  Cookies.set('analytics_consent', consent.toString(), {
    expires: 365, // 1 year
    sameSite: 'strict',
  });

  // Update Google Analytics consent
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: consent ? 'granted' : 'denied',
    });
  }
};

// Initialize analytics with consent
export const initAnalytics = () => {
  const hasConsent = hasAnalyticsConsent();

  if (typeof window !== 'undefined' && window.gtag && hasConsent) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
};