'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppFloat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Message that will be sent to WhatsApp
  const whatsappMessage = encodeURIComponent(
    "Hola! Vengo de Instagram/TikTok. Quiero mi web en 48h 🚀"
  );

  // Your WhatsApp number (replace with your actual number)
  const phoneNumber = "34600000000"; // Format: country code + number (no spaces or +)

  const whatsappURL = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

  useEffect(() => {
    // Show button after 3 seconds for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Show tooltip after 10 seconds to encourage interaction
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true);
      // Hide tooltip after 5 seconds
      setTimeout(() => setShowTooltip(false), 5000);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(tooltipTimer);
    };
  }, []);

  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'conversion',
        event_label: 'floating_button',
      });
    }

    // Open WhatsApp
    window.open(whatsappURL, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                className="absolute bottom-full right-0 mb-3 mr-2"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg max-w-[200px] text-center relative">
                  💬 ¡Hablemos por WhatsApp!
                  <br />
                  <span className="text-xs text-gray-300">Respuesta inmediata</span>
                  {/* Arrow */}
                  <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.button
            onClick={handleClick}
            className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 4px 20px rgba(34, 197, 94, 0.4)',
                '0 8px 30px rgba(34, 197, 94, 0.6)',
                '0 4px 20px rgba(34, 197, 94, 0.4)'
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {/* Pulse Animation Background */}
            <motion.div
              className="absolute inset-0 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* WhatsApp Icon */}
            <div className="relative z-10 w-8 h-8 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-current"
              >
                <path d="M12.012 2C6.48 2 2 6.48 2 12.012c0 1.746.448 3.387 1.235 4.823L2 22l5.235-1.236A9.983 9.983 0 0012.012 22C17.532 22 22 17.532 22 12.012S17.532 2 12.012 2zm5.634 14.178c-.233.657-1.37 1.2-1.888 1.235-.519.035-.996-.04-3.163-.832-2.798-1.02-4.632-3.85-4.773-4.026-.141-.175-1.155-1.536-1.155-2.932s.728-2.083 1.011-2.366c.283-.284.618-.354.824-.354.206 0 .412 0 .59.012.188.012.441-.071.688.525.247.596.844 2.061.919 2.209.075.149.125.323.024.519-.101.195-.151.323-.302.498-.151.175-.318.391-.455.526-.151.149-.309.31-.132.608.177.296.786 1.296 1.688 2.099 1.158 1.031 2.134 1.35 2.437 1.502.302.151.478.127.653-.08.175-.206.747-.871.946-1.169.199-.298.397-.248.669-.149.273.1 1.732.817 2.029.966.298.148.497.223.571.348.074.124.074.719-.158 1.376z"/>
              </svg>
            </div>

            {/* Notification Badge */}
            <motion.div
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              1
            </motion.div>
          </motion.button>

          {/* Message Preview */}
          <motion.div
            className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          >
            <div className="bg-white text-gray-800 px-3 py-2 rounded-lg text-xs shadow-lg border max-w-[180px]">
              <strong>Mensaje:</strong>
              <br />
              &ldquo;Hola! Vengo de Instagram/TikTok...&rdquo;
            </div>
          </motion.div>

          {/* Analytics tracking */}
          <div className="hidden" data-analytics="whatsapp-float-displayed"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppFloat;