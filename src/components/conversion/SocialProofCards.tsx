'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  image: string;
  quote: string;
  result: string;
  rating: number;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ana García",
    location: "Madrid",
    image: "/api/placeholder/60/60",
    quote: "En 2 meses he triplicado mis reservas. La web es increíble y mis clientas la aman.",
    result: "+300% reservas",
    rating: 5,
    verified: true
  },
  {
    id: 2,
    name: "Carla Martínez",
    location: "Barcelona",
    image: "/api/placeholder/60/60",
    quote: "La mejor inversión para mi salón. Profesional, rápido y con resultados inmediatos.",
    result: "+250% ventas online",
    rating: 5,
    verified: true
  },
  {
    id: 3,
    name: "Marina López",
    location: "Valencia",
    image: "/api/placeholder/60/60",
    quote: "Profesional y rápido, 100% recomendado. Mi agenda ahora está siempre llena.",
    result: "+400% conversión",
    rating: 5,
    verified: true
  }
];

const SocialProofCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Scroll to current testimonial
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 320; // width of each card + gap
      scrollRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const handleCardClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);

    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      const testimonial = testimonials[index];
      if (testimonial) {
        window.gtag('event', 'testimonial_click', {
          event_category: 'social_proof',
          event_label: testimonial.name,
        });
      }
    }

    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          ✨ LO QUE DICEN NUESTRAS CLIENTAS
        </h3>
        <p className="text-gray-600 text-lg">
          +500 peluquerías ya tienen su web. Únete al éxito.
        </p>
      </motion.div>

      {/* Cards Container */}
      <div className="relative">
        {/* Horizontal Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-4 md:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={`min-w-[300px] max-w-[300px] bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 ${
                index === currentIndex
                  ? 'border-pink-400 shadow-pink-200 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
              onClick={() => handleCardClick(index)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-3 border-pink-200"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <motion.span
                          className="text-blue-500 text-sm"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          ✅
                        </motion.span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 leading-relaxed mb-4 text-sm">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Result Badge */}
                <motion.div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-2 rounded-full text-sm font-semibold text-center"
                  animate={{
                    background: ['linear-gradient(90deg, #ec4899 0%, #a855f7 100%)',
                              'linear-gradient(90deg, #f97316 0%, #ec4899 100%)',
                              'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🚀 {testimonial.result}
                </motion.div>
              </div>

              {/* Story-like Footer */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 rounded-b-2xl">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>👥 Cliente verificada</span>
                  <span>📅 Hace 2 semanas</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-pink-500 scale-125'
                  : 'bg-gray-300 hover:bg-pink-300'
              }`}
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="flex justify-center gap-6 mt-8 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-green-500">✅</span>
            <span>+500 clientes satisfechas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🔒</span>
            <span>Testimonios verificados</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">⭐</span>
            <span>4.9/5 valoración media</span>
          </div>
        </motion.div>
      </div>

      {/* Analytics tracking */}
      <div className="hidden" data-analytics="social-proof-cards-viewed"></div>
    </div>
  );
};

export default SocialProofCards;