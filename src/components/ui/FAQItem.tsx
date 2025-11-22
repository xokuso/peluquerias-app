'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { liquidEasing } from '@/lib/animations';

// Crystal colors for glassmorphism effects
const crystalColors = {
  azure: {
    bg: 'from-amber-500/10 to-emerald-500/5',
    border: 'border-blue-400/30',
    shadow: 'shadow-amber-500/10',
    icon: 'text-amber-500',
    accent: 'from-amber-600 to-emerald-600'
  },
  cyan: {
    bg: 'from-emerald-500/10 to-teal-500/5',
    border: 'border-emerald-400/30',
    shadow: 'shadow-cyan-500/10',
    icon: 'text-cyan-500',
    accent: 'from-emerald-600 to-teal-600'
  },
  violet: {
    bg: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-400/30',
    shadow: 'shadow-violet-500/10',
    icon: 'text-violet-500',
    accent: 'from-violet-600 to-purple-600'
  },
  pink: {
    bg: 'from-pink-500/10 to-rose-500/5',
    border: 'border-pink-400/30',
    shadow: 'shadow-pink-500/10',
    icon: 'text-pink-500',
    accent: 'from-pink-600 to-rose-600'
  }
};

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  crystalColor?: keyof typeof crystalColors;
  className?: string;
}

const FAQItem = ({ question, answer, isOpen, onToggle, crystalColor = 'azure', className }: FAQItemProps) => {
  const colors = crystalColors[crystalColor];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        background: [
          `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 50%, rgba(255,255,255,0.08) 100%)`,
          `linear-gradient(225deg, rgba(255,255,255,0.12) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}12 50%, rgba(255,255,255,0.1) 100%)`,
          `linear-gradient(315deg, rgba(255,255,255,0.18) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}08 50%, rgba(255,255,255,0.12) 100%)`,
          `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 50%, rgba(255,255,255,0.08) 100%)`
        ]
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        rotateX: 2,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      }}
      className={cn(
        `backdrop-blur-2xl border ${colors.border} rounded-2xl shadow-xl ${colors.shadow} transition-all duration-700 relative overflow-hidden`,
        className
      )}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 50%, rgba(255,255,255,0.08) 100%)`,
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      transition={{
        opacity: { duration: 0.8, ease: liquidEasing },
        scale: { type: "spring", stiffness: 150, damping: 20 },
        y: { duration: 0.8, ease: liquidEasing },
        background: { duration: 8, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Liquid Crystal Shimmer Overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-30"
        animate={{
          background: [
            `radial-gradient(circle at 30% 30%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}15 0%, transparent 70%)`,
            `radial-gradient(circle at 70% 70%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}12 0%, transparent 70%)`,
            `radial-gradient(circle at 50% 10%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}18 0%, transparent 70%)`,
            `radial-gradient(circle at 30% 30%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}15 0%, transparent 70%)`
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Question Header - Enhanced Liquid Crystal */}
      <motion.button
        onClick={onToggle}
        whileHover={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          scale: 1.01,
          transition: { duration: 0.3, ease: liquidEasing }
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        className={`w-full text-left p-6 lg:p-8 focus:outline-none focus:ring-2 focus:ring-${crystalColor === 'azure' ? 'blue' : crystalColor}-500/50 focus:ring-inset rounded-2xl transition-all duration-500 backdrop-blur-sm relative z-10`}
        aria-expanded={isOpen}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-br from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent pr-4 leading-relaxed">
              {question}
            </h3>
          </div>

          {/* Enhanced Liquid Crystal Rotating Icon */}
          <motion.div
            initial={false}
            animate={{
              rotate: isOpen ? 180 : 0,
              scale: isOpen ? 1.3 : 1,
              rotateY: isOpen ? 360 : 0
            }}
            transition={{
              duration: 0.6,
              ease: liquidEasing,
              scale: { type: "spring", stiffness: 200, damping: 15 },
              rotateY: { duration: 0.8, ease: liquidEasing }
            }}
            className="flex-shrink-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              animate={{
                background: isOpen ?
                  `linear-gradient(135deg, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}25 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 100%)` :
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: isOpen ?
                  `0 8px 25px ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}20` :
                  '0 4px 15px rgba(0,0,0,0.1)'
              }}
              transition={{
                background: { duration: 0.5, ease: liquidEasing },
                boxShadow: { duration: 0.5, ease: liquidEasing }
              }}
              className="p-3 rounded-xl backdrop-blur-lg border border-white/20 relative overflow-hidden"
              whileHover={{
                scale: 1.1,
                background: `linear-gradient(135deg, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}30 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}15 100%)`,
                transition: { duration: 0.3, ease: liquidEasing }
              }}
            >
              <ChevronDown
                className={cn(
                  "w-6 h-6 transition-all duration-500 filter drop-shadow-lg relative z-10",
                  isOpen ? colors.icon : "text-slate-400"
                )}
              />

              {/* Ripple Effect */}
              {isOpen && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}30 0%, transparent 70%)`
                  }}
                  animate={{
                    scale: [0, 2, 0],
                    opacity: [0.5, 0.2, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.button>

      {/* Enhanced Liquid Crystal Answer Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
              scale: 0.95,
              rotateX: -10
            }}
            animate={{
              height: "auto",
              opacity: 1,
              scale: 1,
              rotateX: 0,
              transition: {
                height: {
                  duration: 0.6,
                  ease: liquidEasing
                },
                opacity: {
                  duration: 0.4,
                  delay: 0.2,
                  ease: "easeOut"
                },
                scale: {
                  duration: 0.5,
                  delay: 0.1,
                  type: "spring",
                  stiffness: 150,
                  damping: 20
                },
                rotateX: {
                  duration: 0.6,
                  delay: 0.1,
                  ease: liquidEasing
                }
              }
            }}
            exit={{
              height: 0,
              opacity: 0,
              scale: 0.95,
              rotateX: 10,
              transition: {
                opacity: {
                  duration: 0.2,
                  ease: "easeIn"
                },
                scale: {
                  duration: 0.3,
                  ease: "easeIn"
                },
                rotateX: {
                  duration: 0.3,
                  ease: "easeIn"
                },
                height: {
                  duration: 0.4,
                  delay: 0.1,
                  ease: liquidEasing
                }
              }
            }}
            className="overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="px-6 lg:px-8 pb-6 lg:pb-8">
              {/* Crystal separator */}
              <div className={`border-t ${colors.border} pt-6`}>

                {/* Enhanced Liquid Crystal Trust Badge */}
                <motion.div
                  initial={{ x: -30, opacity: 0, scale: 0.8 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: 0.3,
                      duration: 0.6,
                      ease: liquidEasing,
                      scale: { type: "spring", stiffness: 200, damping: 20 }
                    }
                  }}
                  className="flex items-center gap-3 mb-6"
                >
                  <motion.div
                    className={`p-2 rounded-lg backdrop-blur-lg relative overflow-hidden`}
                    style={{
                      background: `linear-gradient(135deg, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}15 0%, rgba(34, 197, 94, 0.1) 100%)`,
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}
                    animate={{
                      background: [
                        `linear-gradient(135deg, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}15 0%, rgba(34, 197, 94, 0.1) 100%)`,
                        `linear-gradient(225deg, rgba(34, 197, 94, 0.15) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 100%)`,
                        `linear-gradient(135deg, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}15 0%, rgba(34, 197, 94, 0.1) 100%)`
                      ]
                    }}
                    transition={{ background: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                    whileHover={{
                      scale: 1.1,
                      background: `linear-gradient(135deg, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}20 0%, rgba(34, 197, 94, 0.15) 100%)`,
                      transition: { duration: 0.3, ease: liquidEasing }
                    }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 relative z-10 filter drop-shadow-sm" />
                    {/* Pulse effect */}
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)'
                      }}
                      animate={{
                        scale: [0.5, 1.2, 0.5],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  <motion.span
                    className={`text-xs font-semibold text-green-600 backdrop-blur-lg bg-green-500/10 border border-green-400/30 px-4 py-2 rounded-xl shadow-lg relative overflow-hidden`}
                    animate={{
                      background: [
                        'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                        'linear-gradient(225deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%)',
                        'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                      ]
                    }}
                    transition={{ background: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                  >
                    <span className="relative z-10">Respuesta verificada</span>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)'
                      }}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.span>
                </motion.div>

                {/* Enhanced Liquid Crystal Answer Content Container */}
                <motion.div
                  className="backdrop-blur-lg bg-white/8 border border-white/15 rounded-2xl p-6 shadow-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}05 50%, rgba(255,255,255,0.05) 100%)`
                  }}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    background: [
                      `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}05 50%, rgba(255,255,255,0.05) 100%)`,
                      `linear-gradient(225deg, rgba(255,255,255,0.06) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}08 50%, rgba(255,255,255,0.1) 100%)`,
                      `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}05 50%, rgba(255,255,255,0.05) 100%)`
                    ]
                  }}
                  transition={{
                    scale: { type: "spring", stiffness: 150, damping: 20, delay: 0.4 },
                    opacity: { duration: 0.5, delay: 0.4, ease: liquidEasing },
                    background: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {/* Content Shimmer */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-20"
                    animate={{
                      background: [
                        `radial-gradient(circle at 20% 20%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 0%, transparent 70%)`,
                        `radial-gradient(circle at 80% 80%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}08 0%, transparent 70%)`,
                        `radial-gradient(circle at 50% 10%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}12 0%, transparent 70%)`,
                        `radial-gradient(circle at 20% 20%, ${crystalColor === 'azure' ? '#007CF0' : crystalColor === 'cyan' ? '#00D9FF' : crystalColor === 'violet' ? '#8B5DFF' : '#FF6B9D'}10 0%, transparent 70%)`
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="text-slate-700 leading-relaxed relative z-10">
                    {typeof answer === 'string' ? (
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          delay: 0.5,
                          duration: 0.6,
                          ease: liquidEasing
                        }}
                      >
                        {answer}
                      </motion.p>
                    ) : (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          delay: 0.5,
                          duration: 0.6,
                          ease: liquidEasing
                        }}
                        className="space-y-4"
                      >
                        {answer}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQItem;