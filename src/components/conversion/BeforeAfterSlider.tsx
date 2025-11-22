'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

interface BeforeAfterData {
  id: number;
  salonName: string;
  location: string;
  beforeImage: string;
  afterImage: string;
  beforeText: string;
  afterText: string;
  improvement: string;
  timeframe: string;
  metrics: {
    reservas: string;
    visitas: string;
    conversion: string;
  };
}

const transformations: BeforeAfterData[] = [
  {
    id: 1,
    salonName: "Bella Hair Studio",
    location: "Madrid",
    beforeImage: "/api/placeholder/400/300",
    afterImage: "/api/placeholder/400/300",
    beforeText: "SIN WEB",
    afterText: "WEB PROFESIONAL",
    improvement: "+300% reservas online",
    timeframe: "en 30 días",
    metrics: {
      reservas: "+300%",
      visitas: "+1,200",
      conversion: "45%"
    }
  },
  {
    id: 2,
    salonName: "Estilo & Glamour",
    location: "Barcelona",
    beforeImage: "/api/placeholder/400/300",
    afterImage: "/api/placeholder/400/300",
    beforeText: "WEB OBSOLETA",
    afterText: "DISEÑO MODERNO",
    improvement: "+250% ventas",
    timeframe: "en 45 días",
    metrics: {
      reservas: "+250%",
      visitas: "+800",
      conversion: "38%"
    }
  },
  {
    id: 3,
    salonName: "Hair & Beauty",
    location: "Valencia",
    beforeImage: "/api/placeholder/400/300",
    afterImage: "/api/placeholder/400/300",
    beforeText: "SOLO INSTAGRAM",
    afterText: "WEB COMPLETA",
    improvement: "+400% conversión",
    timeframe: "en 60 días",
    metrics: {
      reservas: "+400%",
      visitas: "+2,000",
      conversion: "52%"
    }
  }
];

const BeforeAfterSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % transformations.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Start auto-play when component is in view
  useEffect(() => {
    if (isInView) {
      setIsPlaying(true);
    }
  }, [isInView]);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const currentTransformation = transformations[currentIndex];

  if (!currentTransformation) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          🚀 TRANSFORMACIONES REALES
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-2">
          Ve cómo estas peluquerías multiplicaron sus ventas
        </p>
        <motion.div
          className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full font-semibold"
          animate={{
            background: [
              'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)',
              'linear-gradient(90deg, #f97316 0%, #ec4899 100%)',
              'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨ Resultados en menos de 60 días
        </motion.div>
      </motion.div>

      {/* Main Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100"
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {/* Salon Info Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-bold">
                  {currentTransformation.salonName}
                </h3>
                <p className="text-pink-100">📍 {currentTransformation.location}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold">
                  {currentTransformation.improvement}
                </div>
                <div className="text-pink-100 text-sm">
                  {currentTransformation.timeframe}
                </div>
              </div>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div
            ref={containerRef}
            className="relative h-80 md:h-96 overflow-hidden cursor-ew-resize"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Before Image */}
            <div className="absolute inset-0">
              <div className="relative h-full w-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-4">❌</div>
                  <div className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
                    {currentTransformation.beforeText}
                  </div>
                  <div className="text-gray-500">
                    Sin presencia profesional online
                  </div>
                </div>
              </div>

              {/* Before Label */}
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ANTES
              </div>
            </div>

            {/* After Image */}
            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`
              }}
            >
              <div className="relative h-full w-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-4">🚀</div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {currentTransformation.afterText}
                  </div>
                  <div className="text-gray-600">
                    Web profesional y optimizada
                  </div>
                </div>
              </div>

              {/* After Label */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                DESPUÉS
              </div>
            </motion.div>

            {/* Slider Handle */}
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
              style={{ left: `${sliderPosition}%` }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(255, 255, 255, 0.8)',
                  '0 0 20px rgba(255, 255, 255, 1)',
                  '0 0 10px rgba(255, 255, 255, 0.8)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300">
                <div className="text-xs">⇔</div>
              </div>
            </motion.div>
          </div>

          {/* Metrics */}
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div
                className="bg-white p-4 rounded-lg shadow"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-green-600">
                  {currentTransformation.metrics.reservas}
                </div>
                <div className="text-sm text-gray-600">Más reservas</div>
              </motion.div>
              <motion.div
                className="bg-white p-4 rounded-lg shadow"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-blue-600">
                  {currentTransformation.metrics.visitas}
                </div>
                <div className="text-sm text-gray-600">Visitas/mes</div>
              </motion.div>
              <motion.div
                className="bg-white p-4 rounded-lg shadow"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-purple-600">
                  {currentTransformation.metrics.conversion}
                </div>
                <div className="text-sm text-gray-600">Conversión</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {/* Dots */}
        <div className="flex gap-2">
          {transformations.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-pink-500 scale-125'
                  : 'bg-gray-300 hover:bg-pink-300'
              }`}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <motion.button
          className={`ml-4 p-2 rounded-full transition-colors duration-300 ${
            isPlaying ? 'bg-pink-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}
          onClick={() => setIsPlaying(!isPlaying)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </motion.button>
      </div>

      {/* CTA */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-2xl">
          <h3 className="text-xl md:text-2xl font-bold mb-2">
            🎯 ¿Lista para tu transformación?
          </h3>
          <p className="text-pink-100 mb-4">
            Únete a las +500 peluquerías que ya multiplicaron sus ventas
          </p>
          <motion.button
            className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Analytics tracking
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'transformation_cta_click', {
                  event_category: 'conversion',
                  event_label: 'before_after_slider',
                });
              }
            }}
          >
            🚀 ¡QUIERO MI TRANSFORMACIÓN!
          </motion.button>
        </div>
      </motion.div>

      {/* Instruction */}
      <motion.div
        className="text-center mt-4 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1 }}
      >
        👆 Desliza el cursor sobre la imagen para ver el antes y después
      </motion.div>

      {/* Analytics tracking */}
      <div className="hidden" data-analytics="before-after-slider-viewed"></div>
    </div>
  );
};

export default BeforeAfterSlider;