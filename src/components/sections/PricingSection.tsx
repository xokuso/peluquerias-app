'use client'

import React, { useState, useEffect } from 'react';
import { Check, Clock, Shield, Star, AlertCircle, ArrowRight } from 'lucide-react';
import {
  LiveViewsCounter,
  RecentSalesNotification,
  LossCalculator,
  RotatingTestimonials,
  ProgressiveScarcity,
  CompetitorComparison
} from '@/components/ui/PsychologyElements';

interface PricingCardProps {
  onSelectPlan?: () => void;
}

export default function PricingSection({ onSelectPlan }: PricingCardProps) {
  const [spotsLeft] = useState(23);
  const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 14, minutes: 32 });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { days: prev.days, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const valueStackItems = [
    { item: "Diseño personalizado", value: "800€", included: true },
    { item: "Configuración técnica", value: "300€", included: true },
    { item: "SEO básico setup", value: "400€", included: true },
    { item: "Dominio + hosting año 1", value: "120€", included: true },
    { item: "Sistema de reservas", value: "500€", included: true },
    { item: "Soporte técnico 1er mes", value: "200€", included: true },
  ];

  const totalValue = valueStackItems.reduce((acc, item) => acc + parseInt(item.value.replace('€', '')), 0);

  const benefits = [
    "Reservas 24/7 automáticas",
    "Aparece primero en Google",
    "Sin más llamadas fuera de horario",
    "Galería de trabajos profesional",
    "Precio fijo, sin sorpresas",
    "Cancela cuando quieras"
  ];

  const socialProof = [
    { name: "Carmen", salon: "Bella Madrid", result: "+40% reservas en 2 meses" },
    { name: "Ana", salon: "Style Sevilla", result: "+35% clientes nuevos" },
    { name: "María", salon: "Luxury Barcelona", result: "ROI 4.2x primer año" }
  ];

  return (
    <section className="section bg-white">
      <div className="container">

        {/* Psychology Elements - Clean Professional Cards */}
        <div className="grid gap-4 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <LiveViewsCounter />
            </div>
            <div className="card">
              <ProgressiveScarcity />
            </div>
          </div>
          <div className="card">
            <RecentSalesNotification />
          </div>
          <div className="card">
            <CompetitorComparison />
          </div>
        </div>

        {/* Main Pricing Card - Clean Professional Design */}
        <div className="card-elevated bg-white">

          {/* Professional Urgency Badge */}
          <div className="absolute -top-3 -right-3 bg-red-500 text-white px-6 py-3 transform rotate-2 shadow-lg rounded-lg">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4" />
              OFERTA LANZAMIENTO
            </div>
          </div>

          {/* Scarcity Counter - Clean Design */}
          <div className="border-b border-gray-100 py-4 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-sm sm:text-base text-center sm:text-left">
                  Solo quedan {spotsLeft} plazas con este precio
                </span>
              </div>
              <div className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">

            {/* Header - Clean Professional */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Precio Transparente, Sin Sorpresas
              </h2>
              <p className="text-gray-600 text-lg">
                Lo que cuesta 1 mes de publicidad, para siempre
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

              {/* Left Column - Clean Pricing Display */}
              <div>

                {/* Main Price Container */}
                <div className="card bg-gray-50 border-2 border-gray-200 mb-8">
                  <div className="text-center space-y-6">

                    {/* Anchoring Price */}
                    <div className="text-sm text-gray-500">
                      Precio normal: <span className="line-through">799€</span>
                    </div>

                    {/* Main Price */}
                    <div className="relative">
                      <div className="text-5xl lg:text-6xl font-bold text-orange-600 mb-2">
                        199€
                      </div>
                      <div className="text-sm text-green-600 font-medium">¡Precio de oferta!</div>
                    </div>

                    {/* Savings Highlight */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="text-xl lg:text-2xl font-semibold text-green-600">
                        Ahorras 600€
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Precio único, pago una sola vez
                      </div>
                    </div>

                    {/* ROI Calculator */}
                    <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 space-y-2 text-sm">
                      <div className="font-semibold text-gray-800 mb-2">Tu ROI estimado:</div>
                      <div className="text-gray-600">1 cliente extra/mes = 60€</div>
                      <div className="text-gray-600">
                        Web genera 3-5 extra = <span className="font-semibold text-orange-600 ml-1">180-300€/mes</span>
                      </div>
                      <div className="font-bold text-orange-600">
                        ROI: 131-251€ mensuales
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional CTA Button */}
                <button
                  onClick={onSelectPlan}
                  className="btn btn-primary btn-lg w-full group"
                >
                  <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                  Ver mi peluquería online
                </button>

                {/* Risk Reversal - Clean Professional */}
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">30 días garantía total reembolso</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-orange-600" />
                    </div>
                    <span>Cancela cuando quieras, sin penalizaciones</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>Soporte prioritario incluido primer mes</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Clean Value Stack */}
              <div>

                {/* Value Stack Container */}
                <div className="card bg-gray-50 border-2 border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">
                    Todo lo que incluye:
                  </h3>

                  <div className="space-y-4">
                    {valueStackItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.item}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600 bg-white px-2 py-1 rounded border">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Value Summary */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-700">VALOR TOTAL:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {totalValue.toLocaleString()}€
                      </span>
                    </div>
                    <div className="text-center border-t border-gray-200 pt-3">
                      <div className="text-2xl font-bold text-orange-600">
                        PAGAS SOLO: 199€
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Ahorras {(totalValue - 199).toLocaleString()}€
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits List - Clean Design */}
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Proof Section - Clean Design */}
            <div className="card bg-gray-50 mt-12">
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-8">
                Peluquerías que ya confían en nosotros:
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Testimonials Grid */}
                <div className="space-y-4">
                  {socialProof.slice(0, 3).map((testimonial, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                        <div className="flex-1">
                          {/* Stars */}
                          <div className="flex justify-center lg:justify-start mb-2 gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-current text-yellow-400"
                              />
                            ))}
                          </div>
                          <div className="font-medium text-gray-800 text-sm text-center lg:text-left">{testimonial.name}</div>
                          <div className="text-sm text-gray-600 text-center lg:text-left">{testimonial.salon}</div>
                        </div>
                        <div className="text-sm font-bold text-orange-600 mt-2 lg:mt-0 text-center lg:text-right bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                          {testimonial.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rotating Testimonials */}
                <div className="flex items-center justify-center">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full min-h-[200px] flex items-center justify-center">
                    <RotatingTestimonials />
                  </div>
                </div>
              </div>
            </div>

            {/* Loss Calculator Container - Clean Design */}
            <div className="card bg-gray-50 mt-8">
              <LossCalculator />
            </div>

            {/* Final Professional CTA */}
            <div className="text-center mt-12">
              <button
                onClick={onSelectPlan}
                className="btn btn-primary btn-lg text-xl px-12 py-4 group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Empezar mi web profesional ahora
              </button>
              <div className="text-sm text-gray-500 mt-3">
                Después será 799€ • Plazas limitadas
              </div>
            </div>

            {/* Objection Handlers - Clean Professional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
              <div className="card hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
                <div className="font-semibold text-gray-800 mb-2 text-orange-600">
                  &ldquo;¿Es caro?&rdquo;
                </div>
                <div className="text-gray-600">1,63€/día vs perder clientes diariamente</div>
              </div>
              <div className="card hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
                <div className="font-semibold text-gray-800 mb-2 text-green-600">
                  &ldquo;¿Funciona realmente?&rdquo;
                </div>
                <div className="text-gray-600">30 días garantía + casos de éxito reales</div>
              </div>
              <div className="card hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
                <div className="font-semibold text-gray-800 mb-2 text-purple-600">
                  &ldquo;¿Y si no me gusta?&rdquo;
                </div>
                <div className="text-gray-600">Cancela cuando quieras, sin compromisos</div>
              </div>
              <div className="card hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
                <div className="font-semibold text-gray-800 mb-2 text-red-600">
                  &ldquo;¿Lo necesito realmente?&rdquo;
                </div>
                <div className="text-gray-600">Tu competencia YA lo tiene y gana clientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}