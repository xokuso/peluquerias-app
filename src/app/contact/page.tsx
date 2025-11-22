import React from 'react';
import { Metadata } from 'next';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Contacto - Peluquerías Web',
  description: 'Ponte en contacto con nosotros a través de email o WhatsApp. Estamos aquí para ayudarte con tu peluquería.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hablemos de tu
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-liquid-400 to-accent-400 mt-2">
                Peluquería
              </span>
            </h1>
            <p className="text-lg text-crystal-300 max-w-lg mx-auto">
              Estamos aquí para ayudarte. Contáctanos por el medio que prefieras.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="space-y-6 animate-fade-in-up">
            {/* Email Contact */}
            <div className="bg-crystal-950 backdrop-blur-md rounded-3xl p-8 border border-crystal-800 hover:border-crystal-600 transition-all duration-500 group hover:scale-102 hover:shadow-glass-lg">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-liquid-500 to-liquid-600 rounded-2xl flex items-center justify-center shadow-liquid group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-liquid-300 transition-colors duration-300">
                    Email
                  </h2>
                  <p className="text-crystal-300 mb-4">
                    Escríbenos y te responderemos pronto
                  </p>
                  <a
                    href="mailto:contacto@peluqueriasweb.com"
                    className="inline-flex items-center space-x-2 bg-liquid-500 hover:bg-liquid-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-liquid"
                  >
                    <span>contacto@peluqueriasweb.com</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-crystal-950 backdrop-blur-md rounded-3xl p-8 border border-crystal-800 hover:border-crystal-600 transition-all duration-500 group hover:scale-102 hover:shadow-glass-lg">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.488"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
                    WhatsApp
                  </h2>
                  <p className="text-crystal-300 mb-4">
                    Chatea con nosotros al instante
                  </p>
                  <a
                    href="https://wa.me/34612345678?text=Hola%2C%20estoy%20interesado%20en%20una%20web%20para%20mi%20peluquería"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <span>+34 612 345 678</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Footer Message */}
          <div className="text-center mt-16 animate-fade-in-up">
            <p className="text-crystal-400 text-sm">
              Responderemos en menos de 24 horas
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}