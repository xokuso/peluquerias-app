'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, ChevronDown } from 'lucide-react';

// FAQ Data específica del negocio
const faqData = [
  {
    id: 'really-works',
    question: '¿Realmente funciona para generar más clientes?',
    answer: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          <strong className="font-semibold text-neutral-800">Sí, nuestras peluquerías clientes han visto un aumento promedio del 35% en reservas
          en los primeros 90 días.</strong> La web te posiciona en Google cuando buscan &apos;peluquería cerca de mí&apos;
          y facilita que reserven 24/7.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800">
            <strong className="font-semibold">Casos reales:</strong>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Carmen (Madrid): +40% reservas en 2 meses</li>
              <li>Ana (Sevilla): +35% clientes nuevos</li>
              <li>María (Barcelona): ROI 4.2x primer año</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'no-tech-skills',
    question: '¿Qué pasa si no sé nada de tecnología?',
    answer: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          <strong className="font-semibold text-neutral-800">Perfecto, está diseñado para ti.</strong> Nosotros hacemos todo: configuración,
          diseño, contenido inicial. Tú solo necesitas enviarnos fotos de tu trabajo y los datos básicos.
          <strong className="font-semibold text-neutral-800"> En 24-48h tienes tu web lista.</strong>
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <strong className="font-semibold">Proceso súper simple:</strong>
            <ol className="list-decimal list-inside mt-3 space-y-1">
              <li>Nos envías fotos de tu peluquería y trabajos</li>
              <li>Completamos un formulario de 5 minutos contigo</li>
              <li>En 48h máximo tienes tu web funcionando</li>
              <li>Te damos acceso y mini-tutorial</li>
            </ol>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'can-cancel',
    question: '¿Puedo cancelar cuando quiera?',
    answer: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          <strong className="font-semibold text-neutral-800">Absolutamente. No hay permanencia ni penalizaciones.</strong> Cancelas cuando
          quieras con 30 días de aviso. Eso sí, una vez que veas los resultados, no querrás cancelar.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm text-amber-800">
            <strong className="font-semibold">Garantías incluidas:</strong>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>✓ Sin permanencia - cancela cuando quieras</li>
              <li>✓ 30 días garantía total reembolso</li>
              <li>✓ Sin penalizaciones ni letra pequeña</li>
              <li>✓ Soporte prioritario primer mes gratis</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'price-includes-all',
    question: '¿El precio incluye TODO lo necesario?',
    answer: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          <strong className="font-semibold text-neutral-800">Sí, sin sorpresas.</strong> 199€ incluye: diseño personalizado, dominio primer año,
          hosting configurado, SSL, galería de fotos, sistema de contacto. Los 49€/mes incluyen hosting,
          actualizaciones, soporte y mantenimiento.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800">
            <strong className="font-semibold">Desglose completo del precio:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <strong className="font-medium">Setup inicial (199€):</strong>
                <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                  <li>Diseño personalizado (800€)</li>
                  <li>Configuración técnica (300€)</li>
                  <li>SEO básico setup (400€)</li>
                  <li>Dominio + SSL (120€)</li>
                </ul>
              </div>
              <div>
                <strong className="font-medium">Mensual (49€/mes):</strong>
                <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                  <li>Hosting premium</li>
                  <li>Actualizaciones automáticas</li>
                  <li>Soporte técnico</li>
                  <li>Backup diario</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'not-scam',
    question: '¿Cómo sé que no es una estafa?',
    answer: (
      <div className="space-y-4">
        <p className="text-base leading-relaxed">
          <strong className="font-semibold text-neutral-800">Porque puedes ver ejemplos reales de peluquerías que ya están funcionando.</strong> Además,
          tienes 30 días de garantía total. Si no estás satisfecha, te devolvemos el dinero completo.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-800">
            <strong className="font-semibold">Pruebas de confianza:</strong>
            <div className="mt-3 space-y-2">
              <div>• <strong className="font-medium">Ejemplos reales:</strong> Puedes visitar webs de clientes actuales</div>
              <div>• <strong className="font-medium">Garantía 30 días:</strong> Reembolso completo sin preguntas</div>
              <div>• <strong className="font-medium">Transparencia total:</strong> Precios claros, sin letra pequeña</div>
              <div>• <strong className="font-medium">Soporte directo:</strong> Hablas directamente con nosotros</div>
              <div>• <strong className="font-medium">Referencias verificables:</strong> Testimonios con nombres reales</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

interface FAQSectionProps {
  onContactClick?: () => void;
}

// FAQ Item Component - Clean Professional Design
const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle
}: {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="card">
      <button
        onClick={onToggle}
        className="w-full text-left p-0 bg-transparent border-0 focus:outline-none focus-ring"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex-1 pr-2">
            {question}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-shrink-0 p-2 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-neutral-600" />
          </motion.div>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="pt-4 border-t border-neutral-200 mt-4">
          <div className="text-neutral-600 space-y-3">
            {answer}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const FAQSection = ({ onContactClick }: FAQSectionProps) => {
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  return (
    <section className="section bg-neutral-100">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-800 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Resolvemos todas tus dudas sobre nuestro servicio de webs para peluquerías. Si no encuentras tu respuesta, contáctanos directamente.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }}
              >
                <FAQItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQId === faq.id}
                  onToggle={() => toggleFAQ(faq.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card-elevated text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                ¿Más dudas?
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Estamos aquí para ayudarte. Contacta directamente con nuestro equipo especializado en peluquerías y resolvemos cualquier pregunta específica.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button
                onClick={onContactClick}
                className="btn-primary btn-lg gap-2"
              >
                <Phone className="w-5 h-5" />
                Llamar ahora
              </Button>
              <Button
                onClick={onContactClick}
                className="btn-secondary btn-lg gap-2"
              >
                <Mail className="w-5 h-5" />
                Escribir email
              </Button>
            </div>

            <div className="text-sm text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-lg p-3">
              Respuesta garantizada en menos de 2 horas
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;