import { promises as fs } from 'fs';
import path from 'path';

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

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

export async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function getSettings(): Promise<SystemSettings> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    // Merge with defaults to ensure all fields exist
    return { ...defaultSettings, ...settings };
  } catch {
    // File doesn't exist or is corrupted, return defaults
    return defaultSettings;
  }
}

export async function saveSettings(settings: SystemSettings): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error('Failed to save settings');
  }
}

export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const settings = await getSettings();
    return settings.maintenanceMode;
  } catch {
    return false;
  }
}