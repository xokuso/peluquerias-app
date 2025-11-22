/**
 * Facebook Pixel Integration - Sistema completo para tracking de Facebook
 * Incluye todos los eventos estándar y personalizados para ecommerce
 */

'use client';

import { PixelEventType } from '@prisma/client';
import { hashData, generateEventId } from './utils';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

interface FacebookPixelConfig {
  pixelId: string;
  accessToken?: string | undefined;
  testEventCode?: string | undefined; // Para testing en development
  enabled: boolean;
}

interface StandardEventData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    item_price?: number;
  }>;
  num_items?: number;
  search_string?: string;
  status?: string;
  user_data?: any; // Allow user_data for Facebook Pixel events
  eventID?: string;
}

interface CustomEventData {
  [key: string]: any;
}

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  externalId?: string;
}

class FacebookPixel {
  private config: FacebookPixelConfig;
  private initialized = false;
  private eventQueue: Array<() => void> = [];

  constructor(config: FacebookPixelConfig) {
    this.config = config;

    if (typeof window !== 'undefined' && config.enabled) {
      this.initialize();
    }
  }

  private async initialize() {
    if (this.initialized || typeof window === 'undefined') return;

    // Cargar script de Facebook Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `;
    document.head.appendChild(script);

    // Esperar a que se cargue
    await new Promise(resolve => setTimeout(resolve, 100));

    // Inicializar pixel
    window.fbq('init', this.config.pixelId, {
      external_id: this.generateExternalId(),
    });

    // Si hay código de test, configurarlo
    if (this.config.testEventCode) {
      window.fbq('init', this.config.pixelId, {}, {
        testEventCode: this.config.testEventCode,
      });
    }

    this.initialized = true;

    // Ejecutar eventos en cola
    this.eventQueue.forEach(event => event());
    this.eventQueue = [];

    console.log('✅ Facebook Pixel initialized:', this.config.pixelId);
  }

  private generateExternalId(): string {
    // Generar ID único para el usuario basado en datos disponibles
    const sessionData = [
      navigator.userAgent,
      window.location.hostname,
      Date.now().toString(),
    ].join('|');

    return btoa(sessionData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  private async executeOrQueue(callback: () => void) {
    if (!this.config.enabled) return;

    if (this.initialized && window.fbq) {
      callback();
    } else {
      this.eventQueue.push(callback);
    }
  }

  /**
   * Track página vista - evento base
   */
  async trackPageView() {
    await this.executeOrQueue(() => {
      window.fbq('track', 'PageView');
    });
  }

  /**
   * Track evento estándar de Facebook
   */
  async trackStandardEvent(
    eventName: PixelEventType,
    data: StandardEventData = {},
    userData?: UserData
  ) {
    const eventId = generateEventId();

    await this.executeOrQueue(() => {
      const eventData = {
        ...data,
        eventID: eventId, // Para deduplicación
      };

      if (userData) {
        // Hash datos sensibles
        const hashedUserData: any = {};
        if (userData.email) hashedUserData.em = hashData(userData.email);
        if (userData.phone) hashedUserData.ph = hashData(userData.phone);
        if (userData.firstName) hashedUserData.fn = hashData(userData.firstName);
        if (userData.lastName) hashedUserData.ln = hashData(userData.lastName);

        (eventData as any).user_data = hashedUserData;
      }

      window.fbq('track', eventName, eventData);
    });

    return eventId;
  }

  /**
   * Track evento personalizado
   */
  async trackCustomEvent(eventName: string, data: CustomEventData = {}) {
    const eventId = generateEventId();

    await this.executeOrQueue(() => {
      window.fbq('trackCustom', eventName, {
        ...data,
        eventID: eventId,
      });
    });

    return eventId;
  }

  /**
   * Eventos específicos del ecommerce de peluquerías
   */

  // Usuario vio el landing
  async trackLandingView(templateCategory?: string) {
    return await this.trackStandardEvent(PixelEventType.PageView, {
      content_name: 'Landing Page',
      content_category: 'homepage',
      content_type: templateCategory || 'website_templates',
    });
  }

  // Usuario vio una plantilla específica
  async trackTemplateView(templateId: string, templateName: string, price: number) {
    return await this.trackStandardEvent(PixelEventType.ViewContent, {
      content_ids: [templateId],
      content_name: templateName,
      content_category: 'template',
      content_type: 'product',
      value: price,
      currency: 'EUR',
    });
  }

  // Usuario seleccionó una plantilla
  async trackTemplateSelection(templateId: string, templateName: string, price: number) {
    return await this.trackCustomEvent('TemplateSelected', {
      content_ids: [templateId],
      content_name: templateName,
      content_category: 'template',
      value: price,
      currency: 'EUR',
    });
  }

  // Usuario empezó el proceso de checkout
  async trackCheckoutStart(templateId: string, templateName: string, price: number) {
    return await this.trackStandardEvent(PixelEventType.InitiateCheckout, {
      content_ids: [templateId],
      content_name: templateName,
      content_category: 'template',
      value: price,
      currency: 'EUR',
      num_items: 1,
      contents: [{
        id: templateId,
        quantity: 1,
        item_price: price,
      }],
    });
  }

  // Usuario completó información de contacto
  async trackInfoFormCompleted(formData: any, templateData?: any) {
    return await this.trackStandardEvent(PixelEventType.Lead, {
      content_name: 'Business Info Form',
      content_category: 'form',
      value: templateData?.price,
      currency: 'EUR',
    }, {
      email: formData.email,
      phone: formData.phone,
      firstName: formData.name?.split(' ')[0],
      lastName: formData.name?.split(' ').slice(1).join(' '),
      city: formData.city,
    });
  }

  // Usuario agregó información de pago
  async trackPaymentInfoAdded(templateId: string, amount: number) {
    return await this.trackStandardEvent(PixelEventType.AddPaymentInfo, {
      content_ids: [templateId],
      value: amount,
      currency: 'EUR',
    });
  }

  // Compra completada
  async trackPurchase(orderData: {
    orderId: string;
    templateId: string;
    templateName: string;
    amount: number;
    email: string;
    phone?: string;
    domain: string;
  }) {
    return await this.trackStandardEvent(PixelEventType.Purchase, {
      content_ids: [orderData.templateId],
      content_name: orderData.templateName,
      content_category: 'template',
      content_type: 'product',
      value: orderData.amount,
      currency: 'EUR',
      num_items: 1,
      contents: [{
        id: orderData.templateId,
        quantity: 1,
        item_price: orderData.amount,
      }],
    }, orderData.phone ? {
      email: orderData.email,
      phone: orderData.phone,
      externalId: orderData.orderId,
    } : {
      email: orderData.email,
      externalId: orderData.orderId,
    });
  }

  // Usuario se registró
  async trackRegistration(userData: any) {
    return await this.trackStandardEvent(PixelEventType.CompleteRegistration, {
      content_name: 'Account Registration',
      content_category: 'account',
    }, {
      email: userData.email,
      firstName: userData.name?.split(' ')[0],
      lastName: userData.name?.split(' ').slice(1).join(' '),
    });
  }

  // Usuario se puso en contacto
  async trackContact(contactData: any) {
    return await this.trackStandardEvent(PixelEventType.Contact, {
      content_name: 'Contact Form',
      content_category: 'support',
    }, {
      email: contactData.email,
      phone: contactData.phone,
      firstName: contactData.name?.split(' ')[0],
      lastName: contactData.name?.split(' ').slice(1).join(' '),
    });
  }

  // Usuario buscó plantillas
  async trackSearch(searchTerm: string, _resultCount: number) {
    return await this.trackStandardEvent(PixelEventType.Search, {
      content_category: 'template',
      search_string: searchTerm,
      content_type: 'product',
    });
  }

  // Usuario abandonó el carrito
  async trackAbandonedCart(templateData: any, step: string) {
    return await this.trackCustomEvent('AbandonedCheckout', {
      content_ids: [templateData.id],
      content_name: templateData.name,
      value: templateData.price,
      currency: 'EUR',
      abandoned_step: step,
      abandoned_at: new Date().toISOString(),
    });
  }

  /**
   * Métodos de configuración y utilidad
   */

  // Configurar datos de usuario globalmente
  async setUserData(userData: UserData) {
    await this.executeOrQueue(() => {
      const hashedData: any = {};
      if (userData.email) hashedData.em = hashData(userData.email);
      if (userData.phone) hashedData.ph = hashData(userData.phone);
      if (userData.firstName) hashedData.fn = hashData(userData.firstName);
      if (userData.lastName) hashedData.ln = hashData(userData.lastName);

      window.fbq('setUserData', hashedData);
    });
  }

  // Habilitar/deshabilitar tracking automático
  setTrackingEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  // Obtener configuración actual
  getConfig() {
    return { ...this.config };
  }

  // Verificar si está inicializado
  isInitialized() {
    return this.initialized;
  }

  // Limpiar datos de usuario
  async clearUserData() {
    await this.executeOrQueue(() => {
      window.fbq('clearUserData');
    });
  }
}

// Configuración por defecto (se puede sobreescribir desde variables de entorno)
const defaultConfig: FacebookPixelConfig = {
  pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN || undefined,
  testEventCode: process.env.NODE_ENV === 'development'
    ? process.env.FACEBOOK_TEST_EVENT_CODE || undefined
    : undefined,
  enabled: process.env.NODE_ENV === 'production' || !!process.env.FACEBOOK_PIXEL_ENABLED,
};

// Instancia global del pixel
export const facebookPixel = new FacebookPixel(defaultConfig);

export default facebookPixel;