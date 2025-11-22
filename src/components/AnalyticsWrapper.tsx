'use client';

import { useEffect } from 'react';
import { trackEvents } from '@/lib/analytics';

interface AnalyticsWrapperProps {
  pageName: string;
}

export default function AnalyticsWrapper({ pageName }: AnalyticsWrapperProps) {
  useEffect(() => {
    // Track page view when component mounts
    trackEvents.viewContent(pageName);
  }, [pageName]);

  // This component doesn't render anything
  return null;
}