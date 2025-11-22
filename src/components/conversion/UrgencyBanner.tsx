'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UrgencyBannerProps {
  position?: 'top' | 'inline';
  autoHide?: boolean;
  autoHideDelay?: number;
}

const UrgencyBanner = ({
  position = 'inline',
  autoHide = false,
  autoHideDelay = 15000
}: UrgencyBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [spotsLeft, setSpotsLeft] = useState(3);
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    // Simulate spots decreasing over time for more urgency
    const spotsInterval = setInterval(() => {
      setSpotsLeft(prev => {
        if (prev > 1) {
          return Math.max(1, prev - Math.floor(Math.random() * 2));
        }
        return prev;
      });
    }, 30000); // Every 30 seconds

    // Auto-hide functionality
    if (autoHide) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => {
        clearTimeout(hideTimer);
        clearInterval(spotsInterval);
      };
    }

    return () => clearInterval(spotsInterval);
  }, [autoHide, autoHideDelay]);

  // Blink effect control
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 1500);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);

    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'urgency_banner_closed', {
        event_category: 'conversion',
        event_label: 'user_dismissed',
      });
    }
  };

  const urgencyMessages = [
    {
      emoji: "🔥",
      text: `ÚLTIMAS ${spotsLeft} PLAZAS DE DICIEMBRE`,
      subtext: "¡Solo quedan pocas webs disponibles!"
    },
    {
      emoji: "⚡",
      text: "OFERTA FLASH 48H",
      subtext: "Precio especial por tiempo limitado"
    },
    {
      emoji: "🚨",
      text: "ALTA DEMANDA",
      subtext: "15 peluquerías se registraron hoy"
    }
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % urgencyMessages.length);
    }, 8000);

    return () => clearInterval(messageInterval);
  }, [urgencyMessages.length]);

  const containerClasses = position === 'top'
    ? 'fixed top-0 left-0 right-0 z-50'
    : 'w-full';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={containerClasses}
          initial={{ opacity: 0, y: position === 'top' ? -100 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -100 : -20 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="relative overflow-hidden">
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-600"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            />

            {/* Content */}
            <div className="relative z-10 px-4 py-3 md:py-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex-1 flex items-center justify-center gap-3 text-white">
                  {/* Blinking Emoji */}
                  <motion.span
                    className="text-xl md:text-2xl"
                    animate={{
                      scale: isBlinking ? [1, 1.2, 1] : 1,
                      rotate: isBlinking ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {urgencyMessages[currentMessage]?.emoji || "🔥"}
                  </motion.span>

                  {/* Main Message */}
                  <div className="text-center">
                    <motion.div
                      key={currentMessage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="font-bold text-sm md:text-lg"
                    >
                      {urgencyMessages[currentMessage]?.text || "OFERTA ESPECIAL"}
                    </motion.div>

                    {/* Subtext */}
                    <motion.div
                      className="text-xs md:text-sm opacity-90 mt-1"
                      animate={{
                        opacity: [0.9, 1, 0.9]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    >
                      {urgencyMessages[currentMessage]?.subtext || "Por tiempo limitado"}
                    </motion.div>
                  </div>

                  {/* Spots Counter */}
                  <motion.div
                    className="bg-white text-red-600 px-3 py-1 rounded-full text-xs md:text-sm font-bold border-2 border-red-300"
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  >
                    {spotsLeft} left!
                  </motion.div>
                </div>

                {/* Close Button */}
                {position === 'inline' && (
                  <motion.button
                    onClick={handleClose}
                    className="ml-4 text-white hover:text-red-200 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Animated Border */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-yellow-300"
              animate={{
                width: ['0%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                  animate={{
                    x: ['-10px', '110vw'],
                    y: [
                      Math.random() * 20 + 'px',
                      Math.random() * 20 + 40 + 'px'
                    ]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "linear"
                  }}
                  style={{
                    top: Math.random() * 80 + '%',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Pulsing Effect Overlay */}
          <motion.div
            className="absolute inset-0 bg-red-400 opacity-0 pointer-events-none"
            animate={{
              opacity: [0, 0.1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Analytics tracking */}
          <div className="hidden" data-analytics="urgency-banner-displayed"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UrgencyBanner;