// Device detection utilities

import { DeviceInfo } from '../types';

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent);

  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';

  // Check screen size as fallback
  const width = window.innerWidth || document.documentElement.clientWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';

  return 'desktop';
}

export function getBrowser(): { name: string; version: string } {
  if (typeof window === 'undefined') {
    return { name: 'unknown', version: 'unknown' };
  }

  const userAgent = window.navigator.userAgent;
  let name = 'unknown';
  let version = 'unknown';

  // Chrome
  if (userAgent.indexOf('Chrome') > -1) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
  }
  // Edge
  else if (userAgent.indexOf('Edg') > -1) {
    name = 'Edge';
    version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
  }
  // Opera
  else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    name = 'Opera';
    version = userAgent.match(/(?:Opera|OPR)\/(\d+)/)?.[1] || 'unknown';
  }

  return { name, version };
}

export function getOS(): { name: string; version: string } {
  if (typeof window === 'undefined') {
    return { name: 'unknown', version: 'unknown' };
  }

  const userAgent = window.navigator.userAgent;
  let name = 'unknown';
  let version = 'unknown';

  // Windows
  if (userAgent.indexOf('Windows NT') > -1) {
    name = 'Windows';
    const match = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const ntVersion = match[1];
      version = ntVersion === '10.0' ? '10/11' :
                ntVersion === '6.3' ? '8.1' :
                ntVersion === '6.2' ? '8' :
                ntVersion === '6.1' ? '7' :
                ntVersion || 'unknown';
    }
  }
  // macOS
  else if (userAgent.indexOf('Mac OS X') > -1) {
    name = 'macOS';
    version = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'unknown';
  }
  // iOS
  else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    name = 'iOS';
    version = userAgent.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'unknown';
  }
  // Android
  else if (userAgent.indexOf('Android') > -1) {
    name = 'Android';
    version = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'unknown';
  }
  // Linux
  else if (userAgent.indexOf('Linux') > -1) {
    name = 'Linux';
  }

  return { name, version };
}

export function getDeviceInfo(): DeviceInfo {
  const browser = getBrowser();
  const os = getOS();

  return {
    type: getDeviceType(),
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    },
  };
}

export function getScreenResolution(): string {
  if (typeof window === 'undefined') return 'unknown';
  return `${window.screen.width}x${window.screen.height}`;
}

export function getViewportSize(): string {
  if (typeof window === 'undefined') return 'unknown';
  return `${window.innerWidth}x${window.innerHeight}`;
}

export function isBot(): boolean {
  if (typeof window === 'undefined') return false;

  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
    'slack', 'telegram', 'applebot', 'pinterest', 'yandex'
  ];

  const userAgent = window.navigator.userAgent.toLowerCase();
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

export function getConnectionType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const nav = window.navigator as any;
  if (!nav.connection) return 'unknown';

  return nav.connection.effectiveType || 'unknown';
}

export function isTouch(): boolean {
  if (typeof window === 'undefined') return false;

  return 'ontouchstart' in window ||
         navigator.maxTouchPoints > 0 ||
         (navigator as any).msMaxTouchPoints > 0;
}