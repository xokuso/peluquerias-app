/**
 * Hook de React para Analytics
 * Facilita el tracking desde components del frontend
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { generateSessionId, extractUTMParams, getScreenDimensions } from './utils';
import { EventCategory, PixelEventType } from '@prisma/client';
import funnelTracker from './funnel-tracker';

export interface AnalyticsContextType {
  sessionId: string;
  trackPageView: (path: string, title?: string) => void;
  trackEvent: (name: string, data?: any) => void;
  trackClick: (element: string, x?: number, y?: number) => void;
  trackConversion: (type: string, value?: number) => void;
  trackFacebookPixel: (eventName: PixelEventType, data?: any) => void;
  // Funnel helpers
  startMainPurchase: () => void;
  selectTemplate: (templateId: string, templateName: string) => void;
  completeTemplateSelection: (templateId: string) => void;
  startInfoForm: (formData?: any) => void;
  completeInfoForm: (formData: any) => void;
  completePayment: (paymentData: any) => void;
  completePurchase: (orderData: any) => void;
  // Contact funnel
  startContactFunnel: () => void;
  startContactForm: () => void;
  completeContactForm: (formData: any) => void;
  submitContactForm: () => void;
}

export function useAnalytics(): AnalyticsContextType {
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState<string>('');
  const initialized = useRef(false);
  const screenDimensions = useRef<{ width: number; height: number } | null>(null);

  // Función helper para enviar datos al servidor
  const sendToServer = async (type: string, data: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          type,
          data,
        }),
      });
    } catch (error) {
      console.error('Error sending analytics:', error);
    }
  };

  // Inicializar sesión
  useEffect(() => {
    if (initialized.current) return;

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Obtener dimensiones de pantalla
    screenDimensions.current = getScreenDimensions();

    // Extraer parámetros UTM de la URL actual
    const utmParams = extractUTMParams(window.location.href);

    // Inicializar sesión
    const initSession = async () => {
      const sessionData = {
        userId: session?.user?.id || null,
        referrer: document.referrer,
        ...utmParams,
      };

      await sendToServer('session_start', sessionData);

      // Track página inicial
      trackPageView(window.location.pathname, document.title);
    };

    initSession();
    initialized.current = true;

    // Cleanup al cerrar página
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/analytics/track', JSON.stringify({
        sessionId: newSessionId,
        type: 'session_end',
        data: {},
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  // Track page views automáticamente
  const trackPageView = async (path: string, title?: string) => {
    if (!sessionId) return;

    const pageViewData = {
      path,
      title: title || document.title,
      url: window.location.href,
      referrer: document.referrer,
      loadTime: performance.now(),
    };

    await sendToServer('page_view', pageViewData);
  };

  // Track eventos personalizados
  const trackEvent = async (name: string, data: any = {}) => {
    if (!sessionId) return;

    const eventData = {
      name,
      category: data.category || EventCategory.CUSTOM,
      action: data.action || 'custom',
      label: data.label,
      value: data.value,
      page: window.location.pathname,
      element: data.element,
      position: data.position,
      revenue: data.revenue,
      currency: data.currency,
      transactionId: data.transactionId,
      itemCategory: data.itemCategory,
      itemName: data.itemName,
      itemId: data.itemId,
      quantity: data.quantity,
      properties: data.properties,
    };

    await sendToServer('event', eventData);
  };

  // Track clicks para heatmap
  const trackClick = async (element: string, x?: number, y?: number) => {
    if (!sessionId) return;

    const clickData = {
      page: window.location.pathname,
      element,
      x: x || 0,
      y: y || 0,
      screenWidth: screenDimensions.current?.width,
      screenHeight: screenDimensions.current?.height,
    };

    await sendToServer('click', clickData);
  };

  // Track conversiones
  const trackConversion = async (type: string, value?: number) => {
    if (!sessionId) return;

    await sendToServer('conversion', { type, value });
  };

  // Track eventos de Facebook Pixel
  const trackFacebookPixel = async (eventName: PixelEventType, data: any = {}) => {
    if (!sessionId) return;

    const pixelData = {
      eventName,
      eventId: data.eventId,
      value: data.value,
      currency: data.currency || 'EUR',
      contentName: data.contentName,
      contentCategory: data.contentCategory,
      contentIds: data.contentIds,
      contentType: data.contentType,
      numItems: data.numItems,
      customData: data.customData,
      hashedEmail: data.hashedEmail,
      hashedPhone: data.hashedPhone,
      sourceUrl: window.location.href,
    };

    await sendToServer('facebook_pixel', pixelData);
  };

  // Helpers específicos para funnels de la aplicación

  // Funnel principal de compra
  const startMainPurchase = () => {
    funnelTracker.startMainPurchaseFunnel(sessionId, {
      source: 'homepage',
      timestamp: new Date().toISOString(),
    });

    // Facebook Pixel - PageView
    trackFacebookPixel(PixelEventType.PageView, {
      contentName: 'Homepage',
      contentCategory: 'landing',
    });
  };

  const selectTemplate = (templateId: string, templateName: string) => {
    funnelTracker.selectTemplate(sessionId, templateId, templateName);

    // Track evento custom
    trackEvent('template_selected', {
      category: EventCategory.ECOMMERCE,
      action: 'select',
      label: templateName,
      itemId: templateId,
      itemName: templateName,
      itemCategory: 'template',
    });

    // Facebook Pixel - ViewContent
    trackFacebookPixel(PixelEventType.ViewContent, {
      contentName: templateName,
      contentCategory: 'template',
      contentIds: [templateId],
      contentType: 'product',
    });
  };

  const completeTemplateSelection = (templateId: string) => {
    funnelTracker.completeTemplateSelection(sessionId, templateId);
  };

  const startInfoForm = (formData?: any) => {
    funnelTracker.startInfoForm(sessionId, formData);

    // Track evento
    trackEvent('info_form_started', {
      category: EventCategory.FORM,
      action: 'start',
    });
  };

  const completeInfoForm = (formData: any) => {
    funnelTracker.completeInfoForm(sessionId, formData);

    // Track evento
    trackEvent('info_form_completed', {
      category: EventCategory.FORM,
      action: 'complete',
      properties: {
        salonName: formData.salonName,
        hasPhone: !!formData.phone,
        hasAddress: !!formData.address,
      },
    });

    // Facebook Pixel - Lead
    trackFacebookPixel(PixelEventType.Lead, {
      contentName: 'Info Form',
      contentCategory: 'form',
      customData: {
        form_type: 'business_info',
      },
    });
  };

  const completePayment = (paymentData: any) => {
    funnelTracker.completePayment(sessionId, paymentData);

    // Track evento ecommerce
    trackEvent('payment_completed', {
      category: EventCategory.ECOMMERCE,
      action: 'purchase',
      value: paymentData.amount,
      revenue: paymentData.amount,
      currency: paymentData.currency || 'EUR',
      transactionId: paymentData.transactionId,
      itemId: paymentData.templateId,
      quantity: 1,
    });

    // Facebook Pixel - Purchase
    trackFacebookPixel(PixelEventType.Purchase, {
      value: paymentData.amount,
      currency: paymentData.currency || 'EUR',
      contentName: paymentData.templateName,
      contentCategory: 'template',
      contentIds: [paymentData.templateId],
      numItems: 1,
    });
  };

  const completePurchase = (orderData: any) => {
    funnelTracker.completeMainPurchaseFunnel(sessionId, orderData);

    // Track conversión final
    trackConversion('purchase', orderData.total);
  };

  // Funnel de contacto
  const startContactFunnel = () => {
    funnelTracker.startContactFunnel(sessionId);
    trackFacebookPixel(PixelEventType.PageView, {
      contentName: 'Contact Page',
      contentCategory: 'contact',
    });
  };

  const startContactForm = () => {
    funnelTracker.startContactForm(sessionId);
    trackEvent('contact_form_started', {
      category: EventCategory.FORM,
      action: 'start',
    });
  };

  const completeContactForm = (formData: any) => {
    funnelTracker.completeContactForm(sessionId, formData);
    trackEvent('contact_form_completed', {
      category: EventCategory.FORM,
      action: 'complete',
      properties: {
        subject: formData.subject,
        hasPhone: !!formData.phone,
      },
    });
  };

  const submitContactForm = () => {
    funnelTracker.submitContactForm(sessionId);
    trackFacebookPixel(PixelEventType.Contact, {
      contentName: 'Contact Form',
      contentCategory: 'form',
    });
  };

  return {
    sessionId,
    trackPageView,
    trackEvent,
    trackClick,
    trackConversion,
    trackFacebookPixel,
    // Funnel helpers
    startMainPurchase,
    selectTemplate,
    completeTemplateSelection,
    startInfoForm,
    completeInfoForm,
    completePayment,
    completePurchase,
    // Contact funnel
    startContactFunnel,
    startContactForm,
    completeContactForm,
    submitContactForm,
  };
}

export default useAnalytics;