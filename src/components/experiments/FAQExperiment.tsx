'use client'

import React, { useEffect, useState } from 'react';
import { initFAQExperiment, trackConversionEvent, optimizeFAQOrder } from '@/utils/faqAnalytics';

interface FAQExperimentProps {
  children: React.ReactNode;
  experimentName: string;
  userSegment?: 'price_sensitive' | 'tech_anxious' | 'skeptical' | 'default';
  faqData?: Array<{ id: string; question: string; answer: React.ReactNode; priority?: number }>;
  onVariantChange?: (variant: string) => void;
}

const FAQExperiment = ({
  children,
  experimentName,
  userSegment = 'default',
  faqData = [],
  onVariantChange
}: FAQExperimentProps) => {
  const [variant, setVariant] = useState<string>('control');
  const [optimizedOrder, setOptimizedOrder] = useState<Array<{ id: string; question: string; answer: React.ReactNode; priority?: number }>>([]);

  useEffect(() => {
    // Initialize experiment and get variant
    const assignedVariant = initFAQExperiment(experimentName);
    setVariant(assignedVariant);

    // Optimize FAQ order based on variant and user segment
    if (faqData.length > 0) {
      let orderedFAQs = [...faqData];

      if (assignedVariant === 'variant') {
        // Apply optimization based on user segment
        orderedFAQs = optimizeFAQOrder(faqData, userSegment);

        // Additional variant-specific optimizations
        switch (userSegment) {
          case 'price_sensitive':
            // Move pricing transparency question to position 1
            orderedFAQs = reorderFAQ(orderedFAQs, 'price-includes-all', 1);
            break;

          case 'tech_anxious':
            // Move technical simplicity question to position 1
            orderedFAQs = reorderFAQ(orderedFAQs, 'no-tech-skills', 1);
            break;

          case 'skeptical':
            // Move legitimacy question higher
            orderedFAQs = reorderFAQ(orderedFAQs, 'not-scam', 2);
            break;

          default:
            // Default optimization: results-first approach
            orderedFAQs = reorderFAQ(orderedFAQs, 'really-works', 0);
        }
      }

      setOptimizedOrder(orderedFAQs);
    }

    // Notify parent component about variant
    if (onVariantChange) {
      onVariantChange(assignedVariant);
    }

    // Track experiment participation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'experiment_participate', {
        experiment_name: experimentName,
        variant: assignedVariant,
        user_segment: userSegment
      });
    }
  }, [experimentName, userSegment, faqData, onVariantChange]);

  // Helper function to reorder FAQ array
  const reorderFAQ = (faqs: Array<{ id: string; question: string; answer: React.ReactNode; priority?: number }>, faqId: string, newPosition: number) => {
    const faqIndex = faqs.findIndex(faq => faq.id === faqId);
    if (faqIndex === -1) return faqs;

    const reorderedFAQs = [...faqs];
    const [movedFAQ] = reorderedFAQs.splice(faqIndex, 1);
    if (movedFAQ) {
      reorderedFAQs.splice(newPosition, 0, movedFAQ);
    }

    return reorderedFAQs;
  };

  // Enhanced child props with experiment data
  const enhancedProps = {
    variant,
    userSegment,
    optimizedOrder: optimizedOrder.length > 0 ? optimizedOrder : faqData,
    trackConversion: (eventType: string, data?: { mostViewedFAQ?: string }) => {
      trackConversionEvent({
        eventType: eventType as 'faq_to_conversion' | 'faq_sequence_completed' | 'objection_resolved',
        faqSequence: optimizedOrder.map(faq => faq.id),
        timeSpent: Date.now(),
        mostViewedFAQ: data?.mostViewedFAQ || '',
        conversionPath: `${experimentName}_${variant}_${userSegment}`
      });
    }
  };

  // Clone children with enhanced props
  return (
    <div className={`faq-experiment faq-experiment--${variant} faq-segment--${userSegment}`}>
      {React.cloneElement(children as React.ReactElement, enhancedProps)}

      {/* Debug panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-3 bg-black bg-opacity-75 text-white text-xs rounded-lg z-50">
          <div>Experiment: {experimentName}</div>
          <div>Variant: {variant}</div>
          <div>Segment: {userSegment}</div>
          <div>FAQs: {optimizedOrder.length}</div>
        </div>
      )}
    </div>
  );
};

// Advanced A/B Testing Configurations
export const FAQ_EXPERIMENTS = {
  // Question Order Optimization
  QUESTION_ORDER: {
    name: 'faq_question_order_v1',
    variants: ['control', 'results_first', 'trust_first', 'price_first'],
    description: 'Test different FAQ ordering strategies'
  },

  // Answer Length Optimization
  ANSWER_LENGTH: {
    name: 'faq_answer_length_v1',
    variants: ['control', 'concise', 'detailed', 'bullet_points'],
    description: 'Test different answer formatting approaches'
  },

  // Trust Signal Placement
  TRUST_SIGNALS: {
    name: 'faq_trust_signals_v1',
    variants: ['control', 'top_placement', 'inline', 'bottom_emphasis'],
    description: 'Test trust signal placement strategies'
  },

  // Default Open FAQ
  DEFAULT_OPEN: {
    name: 'faq_default_open_v1',
    variants: ['control', 'results_open', 'price_open', 'none_open'],
    description: 'Test which FAQ should be open by default'
  }
};

// User Segmentation Logic
export const detectUserSegment = (
  userBehavior?: {
    timeOnPricing?: number;
    scrolledToFAQ?: boolean;
    clickedPriceDetails?: boolean;
    hesitationTime?: number;
  }
): 'price_sensitive' | 'tech_anxious' | 'skeptical' | 'default' => {

  if (!userBehavior) return 'default';

  const {
    timeOnPricing = 0,
    clickedPriceDetails = false,
    hesitationTime = 0
  } = userBehavior;

  // Price sensitive: spent lots of time on pricing section
  if (timeOnPricing > 30000 || clickedPriceDetails) {
    return 'price_sensitive';
  }

  // Tech anxious: high hesitation time suggests uncertainty
  if (hesitationTime > 60000) {
    return 'tech_anxious';
  }

  // Skeptical: reached FAQ without much engagement
  if (hesitationTime < 10000 && timeOnPricing < 5000) {
    return 'skeptical';
  }

  return 'default';
};

// Multi-variate Testing Component
export const FAQMultiVariateTest = ({
  children,
  experiments = [],
  ...props
}: {
  children: React.ReactNode;
  experiments: string[];
  faqData?: Array<{ id: string; question: string; answer: React.ReactNode; priority?: number }>;
  userSegment?: 'price_sensitive' | 'tech_anxious' | 'skeptical' | 'default';
  onVariantChange?: (variant: string) => void;
}) => {
  const [activeExperiments, setActiveExperiments] = useState<Record<string, string>>({});

  useEffect(() => {
    const experimentResults: Record<string, string> = {};

    experiments.forEach(experimentName => {
      experimentResults[experimentName] = initFAQExperiment(experimentName);
    });

    setActiveExperiments(experimentResults);
  }, [experiments]);

  const enhancedProps = {
    ...props,
    activeExperiments,
    isMultiVariate: true
  };

  return React.cloneElement(children as React.ReactElement, enhancedProps);
};

export default FAQExperiment;