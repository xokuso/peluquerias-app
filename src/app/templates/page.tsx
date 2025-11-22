'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  CheckCircle,
  Clock,
  Users,
  Sparkles,
  Search,
  Palette,
  Globe,
  Headphones,
  ArrowRight
} from 'lucide-react';


interface Step {
  number: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ComponentType<any>;
  duration: string;
  color: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Elige tu información de negocio",
    description: "Completa un formulario simple con la información de tu peluquería y selecciona tu diseño favorito.",
    details: [
      "Nombre y datos de tu peluquería",
      "Servicios que ofreces",
      "Horarios de atención",
      "Fotos de tu salón y equipo",
      "Colores y estilo preferido"
    ],
    icon: Users,
    duration: "5 minutos",
    color: "from-orange-500 to-orange-600"
  },
  {
    number: 2,
    title: "Nosotros creamos tu web en 48h",
    description: "Nuestro equipo de diseñadores y desarrolladores crean tu web profesional siguiendo las mejores prácticas.",
    details: [
      "Diseño personalizado y responsive",
      "Sistema de reservas online integrado",
      "Optimización SEO y velocidad",
      "Integración con redes sociales",
      "Galería de trabajos profesional"
    ],
    icon: Palette,
    duration: "48 horas",
    color: "from-orange-500 to-orange-600"
  },
  {
    number: 3,
    title: "Revisas y solicitas cambios",
    description: "Te enviamos un enlace para que veas tu web y puedas solicitar los cambios que necesites.",
    details: [
      "Vista previa completa de tu web",
      "Proceso de revisión simple",
      "Hasta 3 rondas de cambios incluidas",
      "Feedback directo con nuestro equipo",
      "Aprobación final antes del lanzamiento"
    ],
    icon: Search,
    duration: "24 horas",
    color: "from-green-500 to-green-600"
  },
  {
    number: 4,
    title: "Tu web está lista y funcionando",
    description: "Configuramos todo lo necesario y tu web queda online, lista para recibir clientes y reservas.",
    details: [
      "Dominio configurado y activo",
      "Web 100% funcional y optimizada",
      "Panel de administración configurado",
      "Tutorial de uso incluido",
      "Soporte técnico continuo"
    ],
    icon: Globe,
    duration: "Inmediato",
    color: "from-purple-500 to-purple-600"
  }
];

const bonusStep = {
  number: 5,
  title: "Soporte continuo (Opcional)",
  description: "Mantenimiento, actualizaciones y soporte técnico para que tu web siempre funcione perfectamente.",
  details: [
    "Hosting y mantenimiento incluido",
    "Actualizaciones de seguridad",
    "Soporte técnico 24/7",
    "Copias de seguridad automáticas",
    "Nuevas funcionalidades disponibles"
  ],
  icon: Headphones,
  duration: "Siempre",
  color: "from-indigo-500 to-indigo-600"
};

export default function HowItWorksPage() {
  const router = useRouter();

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cómo crear una web profesional para tu peluquería",
    "description": "Proceso paso a paso para crear una página web profesional para peluquerías en 48 horas",
    "totalTime": "PT72H",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "EUR",
      "value": "199"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Información del negocio"
      },
      {
        "@type": "HowToSupply",
        "name": "Fotos de la peluquería"
      }
    ],
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.description,
      "url": `https://peluquerias-web.com/templates#paso-${step.number}`
    })),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://peluquerias-web.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "¿Cómo funciona?",
          "item": "https://peluquerias-web.com/templates"
        }
      ]
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                href="/"
                className="text-gray-500 hover:text-orange-600 transition-colors"
              >
                Inicio
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 font-medium">¿Cómo funciona?</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              >
                ¿Cómo funciona
                <span className="block mt-2">
                  <span className="text-orange-600">nuestro proceso</span>?
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed"
              >
                Un proceso simple y transparente para tener tu web de peluquería
                <span className="font-semibold text-orange-600"> funcionando en solo 4 pasos</span>
              </motion.p>

              {/* Quick Stats */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12"
              >
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-sm border border-gray-200">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-900">72h máximo</span>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-sm border border-gray-200">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-900">0% técnico</span>
                </div>
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-full shadow-sm border border-gray-200">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">100% personalizada</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Steps */}
            <div className="space-y-16">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                  id={`paso-${step.number}`}
                >
                  {/* Timeline Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-20 w-0.5 h-32 bg-gradient-to-b from-orange-300 to-gray-200 hidden lg:block" />
                  )}

                  <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Content */}
                    <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            {step.title}
                          </h2>
                          <div className="flex items-center gap-2 text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{step.duration}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="space-y-3">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual */}
                    <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <div className="relative">
                        <div className={`w-full aspect-square bg-gradient-to-br ${step.color} rounded-3xl relative overflow-hidden shadow-xl`}>
                          {/* Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-8">
                              <step.icon className="w-16 h-16 text-white" />
                            </div>
                          </div>

                          {/* Decorative elements */}
                          <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full" />
                          <div className="absolute bottom-8 left-8 w-6 h-6 bg-white/30 rounded-full" />
                          <div className="absolute top-1/3 left-4 w-4 h-4 bg-white/25 rounded-full" />
                        </div>

                        {/* Floating Duration Badge */}
                        <div className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-orange-100">
                          <span className="text-sm font-semibold text-gray-900">{step.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bonus Step - Support */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-20 relative"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 lg:p-12 border border-indigo-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${bonusStep.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {bonusStep.title}
                    </h3>
                    <p className="text-indigo-600 font-medium">Opcional - 49€/mes</p>
                  </div>
                </div>

                <p className="text-lg text-gray-600 mb-6">
                  {bonusStep.description}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {bonusStep.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-orange-600 to-orange-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                ¿Listo para empezar?
              </h2>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                Únete a las más de 50 peluquerías que ya confían en nosotros.
                Tu web estará lista en máximo 72 horas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/checkout')}
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Empezar mi web ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>

                <button
                  onClick={() => router.push('/plantillas')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-200"
                >
                  Ver plantillas disponibles
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-orange-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Sin permanencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Garantía 30 días</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Soporte incluido</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}