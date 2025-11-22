// Analytics Types and Interfaces

import type {
  EventCategory,
  PixelEventType,
  UserSession,
  PageView,
  AnalyticsEvent,
  FunnelStep
} from '@prisma/client';

// Session Types
export interface SessionData {
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  startTime: Date;
  lastActivity: Date;
  pageViewCount: number;
  isActive: boolean;
}

// Event Tracking Types
export interface TrackEventParams {
  name: string;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  page?: string;
  element?: string;
  position?: string;
  properties?: Record<string, any>;
}

// E-commerce Event Types
export interface EcommerceEvent extends TrackEventParams {
  revenue?: number;
  currency?: string;
  transactionId?: string;
  itemCategory?: string;
  itemName?: string;
  itemId?: string;
  quantity?: number;
}

// Page View Types
export interface PageViewData {
  path: string;
  title?: string;
  url: string;
  referrer?: string;
  loadTime?: number;
  timeOnPage?: number;
  scrollDepth?: number;
  exitPage?: boolean;
  bounced?: boolean;
}

// Funnel Types
export interface FunnelStepData {
  sessionId: string;
  funnelName: string;
  stepName: string;
  stepOrder: number;
  completed?: boolean;
  timeSpent?: number;
  exitPoint?: boolean;
  metadata?: Record<string, any>;
}

export type FunnelName =
  | 'checkout'
  | 'onboarding'
  | 'template_selection'
  | 'contact'
  | 'signup';

export interface FunnelConfig {
  name: FunnelName;
  steps: {
    name: string;
    order: number;
    required: boolean;
  }[];
}

// Heatmap Types
export interface HeatmapClick {
  page: string;
  elementId?: string;
  elementClass?: string;
  elementTag: string;
  xPosition: number;
  yPosition: number;
  deviceType?: string;
  screenWidth?: number;
  screenHeight?: number;
}

// Facebook Pixel Types
export interface FacebookPixelEventData {
  eventName: PixelEventType;
  eventId?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  customData?: Record<string, any>;
  hashedEmail?: string;
  hashedPhone?: string;
}

// UTM Parameters
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// Device Info
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenWidth: number;
  screenHeight: number;
  viewport: {
    width: number;
    height: number;
  };
}

// Geo Location
export interface GeoLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

// Analytics Context
export interface AnalyticsContext {
  session: SessionData;
  device: DeviceInfo;
  geo?: GeoLocation;
  user?: {
    id: string;
    email?: string;
    phone?: string;
  };
}

// Performance Metrics
export interface PerformanceMetrics {
  pageLoadTime: number;
  domReadyTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
  cumulativeLayoutShift?: number;
}

// A/B Testing Types
export interface ABTestConfig {
  testId: string;
  variantId: string;
  variantName: string;
  isControl: boolean;
  changes?: Record<string, any>;
}

export interface ABTestParticipation {
  testId: string;
  variantId: string;
  sessionId: string;
  exposedAt: Date;
  converted?: boolean;
  conversionValue?: number;
}

// Aggregated Analytics
export interface DailyMetrics {
  date: Date;
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgOrderValue: number;
  trafficSources: {
    organic: number;
    direct: number;
    referral: number;
    social: number;
    paid: number;
    email: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topPages: Array<{ path: string; views: number }>;
  topSources: Array<{ source: string; sessions: number }>;
  topCountries: Array<{ country: string; sessions: number }>;
}

// Error Tracking
export interface ErrorEvent {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
}

// Custom Event Types
export type CustomEventName =
  | 'template_preview'
  | 'template_selected'
  | 'form_started'
  | 'form_field_completed'
  | 'form_abandoned'
  | 'payment_started'
  | 'payment_completed'
  | 'payment_failed'
  | 'domain_check'
  | 'domain_selected'
  | 'cta_clicked'
  | 'video_played'
  | 'social_share'
  | 'newsletter_signup'
  | 'contact_form_submitted'
  | 'chat_opened'
  | 'faq_expanded'
  | 'testimonial_viewed'
  | 'pricing_viewed'
  | 'feature_hover'
  | 'scroll_milestone';

// Analytics Config
export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  trackingId?: string;
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  anonymizeIp: boolean;
  respectDNT: boolean;
  cookieConsent: boolean;
  sessionTimeout: number; // in minutes
  heartbeatInterval: number; // in seconds
  scrollTrackingThresholds: number[]; // percentages
  clickTrackingEnabled: boolean;
  heatmapEnabled: boolean;
  errorTrackingEnabled: boolean;
}

// Consent Management
export interface ConsentSettings {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
  timestamp: Date;
}

// Export all types
export type {
  UserSession,
  PageView,
  AnalyticsEvent,
  FunnelStep,
  EventCategory,
  PixelEventType
};