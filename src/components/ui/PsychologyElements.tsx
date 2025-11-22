'use client'

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Eye, Users, Star, ChevronDown, ChevronUp } from 'lucide-react';

// Contador de visitas en tiempo real simulado
export function LiveViewsCounter() {
  const [views, setViews] = useState(247);

  useEffect(() => {
    const interval = setInterval(() => {
      setViews(prev => prev + Math.floor(Math.random() * 3));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
      <Eye className="w-4 h-4 text-blue-600" />
      <span className="text-blue-800">
        <span className="font-semibold">{views}</span> peluqueras viendo esta oferta ahora
      </span>
    </div>
  );
}

// Banner de últimas ventas
export function RecentSalesNotification() {
  const [currentSale, setCurrentSale] = useState(0);

  const recentSales = [
    { name: "Ana M.", location: "Madrid", time: "hace 3 min" },
    { name: "Carmen L.", location: "Barcelona", time: "hace 7 min" },
    { name: "María S.", location: "Valencia", time: "hace 12 min" },
    { name: "Laura P.", location: "Sevilla", time: "hace 18 min" },
    { name: "Elena R.", location: "Málaga", time: "hace 25 min" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSale(prev => (prev + 1) % recentSales.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [recentSales.length]);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <div className="text-sm text-green-800">
        <span className="font-semibold">{recentSales[currentSale]?.name}</span> de{' '}
        <span className="font-semibold">{recentSales[currentSale]?.location}</span> acaba de contratar su web{' '}
        <span className="text-green-600">{recentSales[currentSale]?.time}</span>
      </div>
    </div>
  );
}

// Calculadora de pérdidas sin web
export function LossCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [clientsLost, setClientsLost] = useState(5);
  const [avgTicket, setAvgTicket] = useState(60);

  const monthlyLoss = clientsLost * avgTicket * 4;
  const yearlyLoss = monthlyLoss * 12;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-red-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <div>
            <div className="font-semibold text-red-900">
              Calcula cuánto dinero pierdes sin web profesional
            </div>
            <div className="text-sm text-red-700">
              {!isOpen ? 'Haz clic para calcularlo' : `Pierdes ${monthlyLoss}€ al mes`}
            </div>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-red-600" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-red-200 bg-white">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clientes potenciales que pierdes por semana:
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={clientsLost}
                onChange={(e) => setClientsLost(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">{clientsLost || 5} clientes</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket promedio por cliente:
              </label>
              <input
                type="range"
                min="30"
                max="150"
                value={avgTicket}
                onChange={(e) => setAvgTicket(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">{avgTicket || 60}€</div>
            </div>

            <div className="bg-red-100 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-red-900">
                  Pierdes {(monthlyLoss || 0).toLocaleString()}€ al mes
                </div>
                <div className="text-2xl font-bold text-red-700 mt-1">
                  {yearlyLoss.toLocaleString()}€ al año
                </div>
                <div className="text-sm text-red-600 mt-2">
                  Una web de 49€/mes te puede ahorrar toda esta pérdida
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Testimonial rotativo con fotos
export function RotatingTestimonials() {
  const [current, setCurrent] = useState(0);

  const testimonials = [
    {
      name: "Carmen Rodríguez",
      salon: "Bella Vista Madrid",
      text: "En 2 meses pasé de 20 a 35 clientes por semana. La inversión se pagó sola.",
      rating: 5,
      image: "👩🏻‍💼"
    },
    {
      name: "Ana López",
      salon: "Style Barcelona",
      text: "Dejé de perder clientes que me llamaban fuera de horario. Todo automatizado.",
      rating: 5,
      image: "👩🏽‍💼"
    },
    {
      name: "María González",
      salon: "Luxury Sevilla",
      text: "Aparezco primera en Google. Los clientes me encuentran fácilmente ahora.",
      rating: 5,
      image: "👩🏻‍🦰"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
      <div className="text-center">
        <div className="text-4xl mb-2">{testimonials[current]?.image}</div>
        <div className="flex justify-center mb-2">
          {[...Array(testimonials[current]?.rating || 5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
          ))}
        </div>
        <blockquote className="text-gray-700 italic mb-2">
          &ldquo;{testimonials[current]?.text}&rdquo;
        </blockquote>
        <div className="font-semibold text-gray-900">{testimonials[current]?.name}</div>
        <div className="text-sm text-gray-600">{testimonials[current]?.salon}</div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-3 space-x-1">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === current ? 'bg-yellow-500' : 'bg-yellow-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Elementos de escasez progresiva
export function ProgressiveScarcity() {
  const [phase, setPhase] = useState(0);

  const scarcityMessages = [
    { spots: 23, urgency: "normal", color: "blue" },
    { spots: 15, urgency: "medium", color: "orange" },
    { spots: 8, urgency: "high", color: "red" }
  ];

  useEffect(() => {
    const phases = [0, 1, 2];
    let currentPhase = 0;

    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setPhase(phases[currentPhase] || 0);
    }, 30000); // Cambia cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const current = scarcityMessages[phase] || scarcityMessages[0];
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 border-blue-300 text-blue-800",
    orange: "bg-orange-100 border-orange-300 text-orange-800",
    red: "bg-red-100 border-red-300 text-red-800"
  };

  return (
    <div className={`rounded-lg p-3 border-2 ${colorClasses[current?.color || 'blue']} animate-pulse`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">
          Solo quedan {current?.spots} plazas con precio especial
        </span>
      </div>
    </div>
  );
}

// Comparación competencia
export function CompetitorComparison() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 animate-slide-up">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-purple-600" />
        <div>
          <div className="font-semibold text-purple-900 text-sm">
            El 73% de tus competidoras ya tiene web profesional
          </div>
          <div className="text-xs text-purple-700 mt-1">
            ¿Vas a seguir perdiendo clientes que se van con ellas?
          </div>
        </div>
      </div>
    </div>
  );
}