'use client';

import React from 'react';
import Link from 'next/link';
import { XCircleIcon, ArrowPathIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal-light to-slate-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header de cancelación */}
          <div className="text-center mb-12">
            <div className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <XCircleIcon className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pago Cancelado
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              No te preocupes, tu información está segura y no se ha procesado ningún cargo
            </p>
            <div className="inline-block px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-red-400 font-semibold">
              No se realizó ningún cobro
            </div>
          </div>

          {/* ¿Qué pasó? */}
          <div className="bg-white/5 border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">¿Qué pasó?</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                El proceso de pago fue cancelado o interrumpido. Esto puede ocurrir por varias razones:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                <li>Decidiste no completar la compra en este momento</li>
                <li>Hubo un problema técnico temporal</li>
                <li>Tu navegador cerró la ventana de pago</li>
                <li>Timeout de la sesión por inactividad</li>
              </ul>
              <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg mt-6">
                <p className="text-blue-400">
                  <strong>Tranquilo:</strong> Tus datos personales están protegidos y no se han guardado en nuestros servidores hasta completar el pago.
                </p>
              </div>
            </div>
          </div>

          {/* Qué puedes hacer ahora */}
          <div className="bg-white/5 border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">¿Qué puedes hacer ahora?</h2>

            <div className="space-y-6">
              {/* Opción 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-charcoal font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <ArrowPathIcon className="h-5 w-5 inline mr-2" />
                    Intentar de nuevo
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Puedes volver a la página de precios y completar el proceso de pago.
                    Tu oferta especial de 199€ sigue disponible.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-charcoal font-semibold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300"
                  >
                    Volver a intentar
                  </Link>
                </div>
              </div>

              {/* Opción 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-charcoal font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <PhoneIcon className="h-5 w-5 inline mr-2" />
                    Contactar por teléfono
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Si prefieres hablar con una persona, puedes llamarnos y completaremos tu pedido por teléfono.
                    También podemos resolver cualquier duda que tengas.
                  </p>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      📞 +34 600 000 000
                    </p>
                    <p className="text-gray-400 text-sm">
                      Lunes a Viernes: 9:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Opción 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-charcoal font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    <EnvelopeIcon className="h-5 w-5 inline mr-2" />
                    Solicitar información
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Envíanos un email con tus dudas y te responderemos con información personalizada
                    y opciones de pago alternativas.
                  </p>
                  <a
                    href="mailto:info@peluqueriaspro.com"
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    info@peluqueriaspro.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recordatorio de la oferta */}
          <div className="bg-gradient-to-r from-amber-600/10 to-emerald-600/10 border border-amber-400/30 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              🎯 Tu oferta sigue disponible
            </h2>
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-amber-400">199€</p>
                <p className="text-gray-400 line-through text-xl">799€</p>
                <p className="text-green-400 font-semibold">¡Ahorras 600€!</p>
              </div>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Esta oferta especial de lanzamiento sigue activa. Incluye sitio web profesional,
                sistema de reservas, diseño responsive, optimización SEO y 6 meses de soporte técnico.
              </p>
            </div>
          </div>

          {/* FAQs comunes */}
          <div className="bg-white/5 border border-white/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Preguntas frecuentes</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  ¿Por qué se canceló mi pago?
                </h3>
                <p className="text-gray-300">
                  Los pagos pueden cancelarse por timeout de sesión, problemas de conexión,
                  o si decides no completar la compra. No hay ningún problema con ello.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  ¿Mis datos están seguros?
                </h3>
                <p className="text-gray-300">
                  Sí, absolutamente. Utilizamos Stripe para procesar pagos, que cumple con los
                  más altos estándares de seguridad. Tus datos no se guardan hasta completar el pago.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  ¿Puedo cambiar de método de pago?
                </h3>
                <p className="text-gray-300">
                  Sí, aceptamos tarjetas de crédito/débito, PayPal y transferencia bancaria.
                  Contacta con nosotros para opciones alternativas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  ¿La oferta tiene fecha de caducidad?
                </h3>
                <p className="text-gray-300">
                  Esta oferta de lanzamiento es por tiempo limitado. Te recomendamos aprovecharla
                  cuanto antes para asegurar el precio especial de 199€.
                </p>
              </div>
            </div>
          </div>

          {/* Acciones finales */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-charcoal font-semibold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300 inline-block"
              >
                Completar mi pedido
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 inline-block"
              >
                Contactar soporte
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-transparent text-gray-300 border border-gray-400/20 font-semibold rounded-xl hover:bg-gray-400/10 transition-all duration-300 inline-block"
              >
                Volver al inicio
              </Link>
            </div>

            <p className="text-gray-400 text-sm">
              Si necesitas ayuda inmediata, llámanos al +34 600 000 000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}