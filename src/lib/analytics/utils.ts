/**
 * Utilidades para Analytics - Detección de dispositivos, geolocalización, etc.
 */

import { nanoid } from 'nanoid';

export interface DeviceInfo {
  device: string;
  browser: string;
  os: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface UTMParams {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

/**
 * Generar ID único de sesión
 */
export function generateSessionId(): string {
  return `sess_${nanoid(16)}`;
}

/**
 * Detectar información del dispositivo desde User Agent
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Detectar tipo de dispositivo
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTablet = /tablet|ipad|kindle|playbook|silk/i.test(ua) && !isMobile;
  const isDesktop = !isMobile && !isTablet;

  // Detectar dispositivo específico
  let device = 'desktop';
  if (isMobile) {
    if (ua.includes('iphone')) device = 'iphone';
    else if (ua.includes('android')) device = 'android';
    else device = 'mobile';
  } else if (isTablet) {
    if (ua.includes('ipad')) device = 'ipad';
    else device = 'tablet';
  }

  // Detectar navegador
  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edge')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('edge')) browser = 'edge';
  else if (ua.includes('opera')) browser = 'opera';

  // Detectar sistema operativo
  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';

  return {
    device,
    browser,
    os,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Obtener geolocalización desde IP (placeholder - necesitaría servicio externo)
 */
export async function getLocationFromIP(ip: string): Promise<{ country?: string; city?: string }> {
  try {
    // En producción, usar un servicio como ipapi.co o similar
    if (process.env.NODE_ENV === 'development' || ip === '127.0.0.1' || ip === '::1') {
      return {
        country: 'Spain',
        city: 'Madrid',
      };
    }

    // Placeholder para servicio de geolocalización
    // const response = await fetch(`https://ipapi.co/${ip}/json/`);
    // const data = await response.json();
    // return {
    //   country: data.country_name,
    //   city: data.city,
    // };

    return {};
  } catch (error) {
    console.error('Error getting location:', error);
    return {};
  }
}

/**
 * Extraer parámetros UTM de la URL
 */
export function extractUTMParams(url: string): UTMParams {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    return {
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null,
      utmContent: params.get('utm_content') || null,
      utmTerm: params.get('utm_term') || null,
    };
  } catch (error) {
    console.error('Error extracting UTM params:', error);
    return {};
  }
}

/**
 * Obtener IP del cliente desde headers
 */
export function getClientIP(headers: Headers): string {
  // Intentar varios headers en orden de prioridad
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // Si hay múltiples IPs (separadas por coma), tomar la primera
      return value.split(',')[0]?.trim() || '127.0.0.1';
    }
  }

  return '127.0.0.1'; // Fallback
}

/**
 * Determinar si es un bot/crawler
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /googlebot/i,
    /bingbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i,
  ];

  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Generar hash seguro para emails/teléfonos (Facebook Pixel)
 */
export async function hashData(data: string): Promise<string> {
  if (!data) return '';

  // Limpiar y normalizar datos
  const cleanData = data.toLowerCase().trim();

  // En el navegador usamos crypto.subtle, en Node.js crypto
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(cleanData);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback para servidor (usaría crypto de Node.js)
  try {
    // Usar import dinámico para evitar error de ESLint
    const { createHash } = await import('crypto');
    return createHash('sha256').update(cleanData).digest('hex');
  } catch {
    // Fallback simple si crypto no está disponible
    return btoa(cleanData).replace(/[^a-zA-Z0-9]/g, '');
  }
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar teléfono
 */
export function isValidPhone(phone: string): boolean {
  // Patrón básico para teléfonos internacionales
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Formatear duración en segundos a formato legible
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Calcular tasa de conversión
 */
export function calculateConversionRate(conversions: number, visits: number): number {
  if (visits === 0) return 0;
  return Number(((conversions / visits) * 100).toFixed(2));
}

/**
 * Calcular bounce rate
 */
export function calculateBounceRate(bounces: number, sessions: number): number {
  if (sessions === 0) return 0;
  return Number(((bounces / sessions) * 100).toFixed(2));
}

/**
 * Obtener dimensiones de pantalla del cliente
 */
export function getScreenDimensions(): { width: number; height: number } | null {
  if (typeof window === 'undefined') return null;

  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}

/**
 * Detectar si el usuario tiene ad blocker
 */
export function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Crear un elemento que los ad blockers suelen bloquear
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-10000px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';

    document.body.appendChild(testAd);

    // Verificar después de un breve delay
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
}

/**
 * Generar event ID único para Facebook Pixel (deduplicación)
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${nanoid(8)}`;
}