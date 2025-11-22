import React from 'react';
import { Metadata } from 'next';
import Footer from '@/components/sections/Footer';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Oferta Especial - Sitio Web para Peluquerías por 199€',
  description: 'Aprovecha nuestra oferta de lanzamiento: sitio web profesional para peluquerías por solo 199€ (antes 799€). Incluye sistema de reservas, diseño responsive y 6 meses de soporte.',
};

export default function PricingPage() {
  const plan = {
    name: 'Sitio Web Profesional para Peluquerías',
    originalPrice: '€799',
    currentPrice: '€199',
    savings: '€600',
    description: 'Solución completa para hacer crecer tu peluquería online',
    features: [
      'Diseño profesional y responsive',
      'Sistema de reservas online',
      'Integración con redes sociales',
      'Optimización SEO',
      'Gestión de clientes',
      'Integración de pagos',
      'Panel de administración',
      'Análisis y métricas',
      'Soporte técnico 6 meses',
      'Dominio personalizado incluido'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-slate-900">

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full text-sm uppercase tracking-wide">
                Oferta Especial - Tiempo Limitado
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Sitio Web para tu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600 ml-4">
                Peluquería
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
              Solución profesional completa que incluye diseño moderno, sistema de reservas y todo lo necesario para hacer crecer tu negocio online.
            </p>
            <div className="text-2xl font-bold text-amber-400">
              ¡Ahorra 600€ con nuestra oferta de lanzamiento!
            </div>
          </div>

          {/* Pricing Card */}
          <div className="max-w-2xl mx-auto">
            <div className="relative p-10 rounded-3xl backdrop-blur-md border bg-white/10 border-amber-400/50 shadow-2xl shadow-amber-400/20 transition-all duration-300 hover:transform hover:scale-105">
              {/* Badge de oferta especial */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <span className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-charcoal font-bold rounded-full text-lg shadow-lg">
                  Oferta de Lanzamiento
                </span>
              </div>

              <div className="text-center mb-10 pt-4">
                <h3 className="text-3xl font-bold text-white mb-6">{plan.name}</h3>

                {/* Precios con tachado */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-2xl text-gray-400 line-through">{plan.originalPrice}</span>
                    <span className="text-6xl font-bold text-amber-500">{plan.currentPrice}</span>
                  </div>
                  <div className="text-xl text-green-400 font-semibold">
                    ¡Ahorras {plan.savings}!
                  </div>
                </div>

                <p className="text-xl text-gray-300">{plan.description}</p>
              </div>

              {/* Lista de características en dos columnas */}
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start text-gray-300">
                    <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Formulario de Checkout */}
              <div className="text-center">
                <div className="mb-6 p-4 bg-amber-600/10 border border-amber-400/30 rounded-xl">
                  <p className="text-amber-400 font-semibold text-lg mb-2">
                    ¡Completa tus datos y paga de forma segura!
                  </p>
                  <p className="text-gray-300 text-sm">
                    Después del pago recibirás acceso inmediato y tu sitio web estará listo en 48 horas
                  </p>
                </div>
                <CheckoutForm className="mt-8" />
              </div>
            </div>
          </div>

          {/* Información adicional de la oferta */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-white/5 border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">¿Por qué esta oferta especial?</h3>
                <p className="text-gray-300 text-lg">
                  Estamos lanzando nuestro servicio especializado en peluquerías y queremos construir nuestro portafolio con clientes satisfechos.
                  Por eso ofrecemos nuestro servicio premium a precio de introducción.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-amber-500 mb-2">75%</div>
                  <div className="text-white font-semibold mb-1">Descuento</div>
                  <div className="text-gray-400 text-sm">Precio normal 799€</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-500 mb-2">6</div>
                  <div className="text-white font-semibold mb-1">Meses Soporte</div>
                  <div className="text-gray-400 text-sm">Incluido sin coste</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-500 mb-2">48h</div>
                  <div className="text-white font-semibold mb-1">Entrega</div>
                  <div className="text-gray-400 text-sm">Sitio web listo</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-amber-600/10 to-emerald-600/10 border border-amber-400/30 rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">¿Tienes alguna duda?</h3>
              <p className="text-gray-300 mb-6">
                Nuestro equipo está aquí para ayudarte a dar el siguiente paso.
                Contáctanos para resolver cualquier pregunta sobre tu sitio web.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-charcoal font-semibold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300">
                  Contactar por WhatsApp
                </button>
                <button className="px-8 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                  Ver Ejemplos de Trabajos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}