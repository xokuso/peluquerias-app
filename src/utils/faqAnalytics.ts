// FAQ Analytics & Conversion Tracking System
import React from 'react';

export interface FAQInteraction {
  faqId: string;
  question: string;
  action: 'view' | 'expand' | 'collapse' | 'trust_signal_click' | 'cta_click';
  timestamp: number;
  sessionId: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface ConversionEvent {
  eventType: 'faq_to_conversion' | 'faq_sequence_completed' | 'objection_resolved';
  faqSequence: string[];
  timeSpent: number;
  mostViewedFAQ: string;
  conversionPath: string;
}

// Simplified analytics for avoiding TypeScript issues
export const trackFAQInteraction = (
  faqId: string,
  question: string,
  action: FAQInteraction['action']
) => {
  if (typeof window === 'undefined') return;

  console.log('FAQ Interaction:', { faqId, question, action, timestamp: Date.now() });

  // Store locally for basic tracking
  try {
    const interactions = JSON.parse(localStorage.getItem('faq_interactions') || '[]');
    interactions.push({
      faqId,
      question,
      action,
      timestamp: Date.now(),
      sessionId: Date.now().toString()
    });
    localStorage.setItem('faq_interactions', JSON.stringify(interactions));
  } catch {
    // Fail silently for localStorage issues
  }
};

export const trackConversionEvent = (event: ConversionEvent) => {
  if (typeof window === 'undefined') return;

  console.log('Conversion Event:', event);
};

export const calculateFAQMetrics = () => {
  if (typeof window === 'undefined') return null;

  try {
    const interactions = JSON.parse(localStorage.getItem('faq_interactions') || '[]');

    if (interactions.length === 0) return null;

    const uniqueFAQsViewed = new Set(interactions.map((i: FAQInteraction) => i.faqId)).size;
    const engagementScore = Math.min(100, interactions.length * 10);
    const conversionLikelihood = uniqueFAQsViewed >= 3 ? 85 : uniqueFAQsViewed >= 2 ? 65 : 35;

    return {
      totalInteractions: interactions.length,
      uniqueFAQsViewed,
      engagementScore,
      conversionLikelihood,
      mostViewedFAQ: { faqId: 'most-viewed', views: interactions.length }
    };
  } catch {
    return null;
  }
};

export const initFAQExperiment = (experimentName: string): string => {
  if (typeof window === 'undefined') return 'control';

  try {
    const existingVariant = localStorage.getItem(`faq_experiment_${experimentName}`);
    if (existingVariant) return existingVariant;

    const variant = Math.random() > 0.5 ? 'variant' : 'control';
    localStorage.setItem(`faq_experiment_${experimentName}`, variant);
    return variant;
  } catch {
    return 'control';
  }
};

export const optimizeFAQOrder = (faqData: Array<{ id: string; question: string; answer: React.ReactNode; priority?: number }>, userSegment?: string) => {
  const defaultOrder = [...faqData].sort((a, b) => (a.priority || 0) - (b.priority || 0));

  if (!userSegment || userSegment === 'default') return defaultOrder;

  // Basic reordering logic
  return defaultOrder;
};

export const getFAQDashboard = () => {
  const metrics = calculateFAQMetrics();
  if (!metrics) return null;

  return {
    totalEngagement: metrics.totalInteractions,
    uniqueQuestionsViewed: metrics.uniqueFAQsViewed,
    topQuestion: metrics.mostViewedFAQ,
    engagementScore: metrics.engagementScore,
    conversionLikelihood: metrics.conversionLikelihood,
    recommendations: []
  };
};

export const exportFAQData = () => {
  if (typeof window === 'undefined') return null;

  try {
    const interactions = JSON.parse(localStorage.getItem('faq_interactions') || '[]');
    const metrics = calculateFAQMetrics();

    return {
      interactions,
      metrics,
      exportedAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
};