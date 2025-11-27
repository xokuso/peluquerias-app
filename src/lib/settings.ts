// File system imports removed for serverless compatibility

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  domainPricing: DomainPrice[];
  templatePricing: TemplatePricing;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export interface DomainPrice {
  extension: string;
  price: number;
  discount: number;
  popular: boolean;
}

export interface TemplatePricing {
  offerPrice: number;
  originalPrice: number;
}

const defaultSettings: SystemSettings = {
  siteName: 'PeluqueríasPRO',
  siteDescription: 'Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas.',
  siteUrl: 'https://peluquerias-web.com',
  contactEmail: 'contacto@peluquerias-web.com',
  supportEmail: 'soporte@peluquerias-web.com',
  maintenanceMode: false,
  allowRegistrations: true,
  emailNotifications: true,
  smsNotifications: false,
  stripePublishableKey: '',
  stripeSecretKey: '',
  domainPricing: [
    { extension: '.es', price: 12.99, discount: 0, popular: true },
    { extension: '.com', price: 15.99, discount: 10, popular: false },
    { extension: '.org', price: 14.99, discount: 0, popular: false },
  ],
  templatePricing: {
    offerPrice: 199,
    originalPrice: 799
  },
  theme: {
    primaryColor: '#f97316',
    secondaryColor: '#7c3aed',
    accentColor: '#06b6d4'
  }
};

// File system functions removed for serverless compatibility

export async function getSettings(): Promise<SystemSettings> {
  // For production/serverless, use only defaults + environment variables
  const settings: SystemSettings = {
    ...defaultSettings,
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || defaultSettings.siteUrl,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    contactEmail: process.env.ADMIN_EMAIL || defaultSettings.contactEmail,
    supportEmail: process.env.ADMIN_EMAIL || defaultSettings.supportEmail,
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true' || false,
    siteName: process.env.NEXT_PUBLIC_APP_NAME || defaultSettings.siteName
  };

  return settings;
}

export async function saveSettings(_settings: SystemSettings): Promise<void> {
  // In production/serverless, we can't save to file system
  // This would need to save to database instead
  console.warn('Settings save attempted in serverless environment - not implemented');
  throw new Error('Settings save not available in serverless environment');
}

export async function isMaintenanceMode(): Promise<boolean> {
  return process.env.MAINTENANCE_MODE === 'true' || false;
}