'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  DollarSign,
  Shield,
  Bell,
  Palette,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';

// Types
interface SystemSettings {
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

interface DomainPrice {
  extension: string;
  price: number;
  discount: number;
  popular: boolean;
}

interface TemplatePricing {
  offerPrice: number;
  originalPrice: number;
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Settings state
  const [settings, setSettings] = useState<SystemSettings>({
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
  });

  // Load settings from API
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Check authentication and load settings
  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    setLoading(false);
    loadSettings();
  }, [session, status, router]);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'payments', name: 'Pagos', icon: DollarSign },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
  ];

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
        // Update settings with the response to handle any server-side changes
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar la configuración' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error de conexión al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const addDomainPrice = () => {
    setSettings(prev => ({
      ...prev,
      domainPricing: [
        ...prev.domainPricing,
        { extension: '', price: 0, discount: 0, popular: false }
      ]
    }));
  };

  const removeDomainPrice = (index: number) => {
    setSettings(prev => ({
      ...prev,
      domainPricing: prev.domainPricing.filter((_, i) => i !== index)
    }));
  };

  const updateDomainPrice = (index: number, field: keyof DomainPrice, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      domainPricing: prev.domainPricing.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600">
          Administra todas las configuraciones de la plataforma
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Sitio
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Sitio
                    </label>
                    <input
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del Sitio
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Soporte
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuraciones del Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Modo Mantenimiento</label>
                      <p className="text-sm text-gray-500">Activar para mostrar página de mantenimiento</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Permitir Registros</label>
                      <p className="text-sm text-gray-500">Permitir que nuevos usuarios se registren</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowRegistrations}
                        onChange={(e) => setSettings(prev => ({ ...prev, allowRegistrations: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Stripe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Publishable Key
                    </label>
                    <input
                      type="text"
                      value={settings.stripePublishableKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                      placeholder="pk_test_..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={settings.stripeSecretKey}
                        onChange={(e) => setSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                        placeholder="sk_test_..."
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showSecrets ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Precios de Plantillas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio de Oferta
                      <span className="text-green-600 text-xs block">Precio actual promocional</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="number"
                        value={settings.templatePricing.offerPrice}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          templatePricing: { ...prev.templatePricing, offerPrice: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Original
                      <span className="text-gray-500 text-xs block">Precio normal tachado</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="number"
                        value={settings.templatePricing.originalPrice}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          templatePricing: { ...prev.templatePricing, originalPrice: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
                    <HelpCircle className="w-4 h-4" />
                    Ahorro calculado
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    Los clientes ahorran <strong>€{settings.templatePricing.originalPrice - settings.templatePricing.offerPrice}</strong> con el precio de oferta actual
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Precios de Dominios</h3>
                  <button
                    onClick={addDomainPrice}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Dominio
                  </button>
                </div>

                <div className="space-y-4">
                  {settings.domainPricing.map((domain, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        value={domain.extension}
                        onChange={(e) => updateDomainPrice(index, 'extension', e.target.value)}
                        placeholder=".com"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          value={domain.price}
                          onChange={(e) => updateDomainPrice(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-24 pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="number"
                        value={domain.discount}
                        onChange={(e) => updateDomainPrice(index, 'discount', parseFloat(e.target.value) || 0)}
                        placeholder="% Descuento"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={domain.popular}
                          onChange={(e) => updateDomainPrice(index, 'popular', e.target.checked)}
                          className="mr-2"
                        />
                        Popular
                      </label>
                      <button
                        onClick={() => removeDomainPrice(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab === 'notifications' && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Notificaciones</h3>
              <p className="text-gray-600">Esta sección estará disponible próximamente</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Seguridad</h3>
              <p className="text-gray-600">Esta sección estará disponible próximamente</p>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Apariencia</h3>
              <p className="text-gray-600">Esta sección estará disponible próximamente</p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}