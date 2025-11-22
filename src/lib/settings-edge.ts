/**
 * Edge Runtime Compatible Settings
 * This file provides settings functionality that works with Next.js Edge Runtime
 * without using Node.js modules like 'fs' and 'path'
 */

export interface EdgeSystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

// Default settings that work in Edge Runtime
const defaultEdgeSettings: EdgeSystemSettings = {
  siteName: 'PeluqueríasPRO',
  siteDescription: 'Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas.',
  siteUrl: 'https://peluquerias-web.com',
  contactEmail: 'contacto@peluquerias-web.com',
  supportEmail: 'soporte@peluquerias-web.com',
  maintenanceMode: false,
  allowRegistrations: true,
  theme: {
    primaryColor: '#f97316',
    secondaryColor: '#7c3aed',
    accentColor: '#06b6d4'
  }
};

/**
 * Get maintenance mode status from environment variables
 * This function works in Edge Runtime as it only uses process.env
 */
export function isMaintenanceMode(): boolean {
  try {
    // Check environment variable first
    const envMaintenanceMode = process.env.MAINTENANCE_MODE;

    if (envMaintenanceMode !== undefined) {
      return envMaintenanceMode === 'true' || envMaintenanceMode === '1';
    }

    // Fallback to default
    return defaultEdgeSettings.maintenanceMode;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false;
  }
}

/**
 * Get basic edge-compatible settings
 * This function works in Edge Runtime
 */
export function getEdgeSettings(): EdgeSystemSettings {
  try {
    return {
      ...defaultEdgeSettings,
      // Override with environment variables if available
      siteName: process.env.SITE_NAME || defaultEdgeSettings.siteName,
      siteDescription: process.env.SITE_DESCRIPTION || defaultEdgeSettings.siteDescription,
      siteUrl: process.env.SITE_URL || defaultEdgeSettings.siteUrl,
      contactEmail: process.env.CONTACT_EMAIL || defaultEdgeSettings.contactEmail,
      supportEmail: process.env.SUPPORT_EMAIL || defaultEdgeSettings.supportEmail,
      maintenanceMode: isMaintenanceMode(),
      allowRegistrations: process.env.ALLOW_REGISTRATIONS !== 'false',
    };
  } catch (error) {
    console.error('Error getting edge settings:', error);
    return defaultEdgeSettings;
  }
}

/**
 * Check if registrations are allowed
 * This function works in Edge Runtime
 */
export function areRegistrationsAllowed(): boolean {
  try {
    const envRegistrations = process.env.ALLOW_REGISTRATIONS;

    if (envRegistrations !== undefined) {
      return envRegistrations !== 'false' && envRegistrations !== '0';
    }

    return defaultEdgeSettings.allowRegistrations;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return true;
  }
}