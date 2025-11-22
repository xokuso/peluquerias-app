'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const difference = tomorrow.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setIsCritical(hours < 6);

        return { hours, minutes, seconds };
      }

      return { hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: 'HORAS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEG', value: timeLeft.seconds }
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-2xl">⏰</span> OFERTA TERMINA EN:
        </div>
        {isCritical && (
          <motion.div
            className="text-red-500 font-semibold text-sm md:text-base"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🔥 ¡ÚLTIMAS HORAS! 🔥
          </motion.div>
        )}
      </motion.div>

      {/* Countdown Blocks */}
      <div className="flex justify-center gap-3 md:gap-6">
        {timeBlocks.map((block, index) => (
          <motion.div
            key={block.label}
            className={`flex flex-col items-center p-4 md:p-6 rounded-xl border-2 shadow-lg min-w-[80px] md:min-w-[100px] ${
              isCritical
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className={`text-3xl md:text-4xl font-bold ${
                isCritical ? 'text-red-600' : 'text-gray-900'
              }`}
              animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {String(block.value).padStart(2, '0')}
            </motion.div>
            <div className={`text-xs md:text-sm font-medium mt-1 ${
              isCritical ? 'text-red-500' : 'text-gray-500'
            }`}>
              {block.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Critical Message */}
      {isCritical && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            animate={{
              boxShadow: ['0 4px 15px rgba(239, 68, 68, 0.3)', '0 8px 25px rgba(239, 68, 68, 0.5)', '0 4px 15px rgba(239, 68, 68, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡ ¡NO DEJES PASAR ESTA OPORTUNIDAD!
          </motion.div>
        </motion.div>
      )}

      {/* Analytics tracking */}
      <div className="hidden" data-analytics="countdown-timer-viewed"></div>
    </div>
  );
};

export default CountdownTimer;