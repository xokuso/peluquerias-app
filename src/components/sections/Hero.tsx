"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star, Users, Sparkles, ChevronDown, Play } from "lucide-react";
import { trackEvents } from "@/lib/analytics";
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = {
    initial: isClient ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
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

  const handleCTAClick = () => {
    trackEvents.ctaClick('Ver mi web en 2 minutos', 'hero');
    router.push('/templates');
  };

  const handleViewTemplatesClick = () => {
    trackEvents.ctaClick('Ver plantillas', 'hero');
    router.push('/plantillas');
  };

  return (
    <section className="section min-h-screen relative bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-tertiary">
      {/* Clean Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="var(--neutral-300)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container">
          {/* Main Content Grid */}
          <div className="grid-2 items-center gap-12">
            {/* Left Column - Text Content */}
            <motion.div
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="text-center lg:text-left"
            >
              {/* Main Headline */}
              <motion.div variants={fadeIn} className="mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                  <span className="block mb-2" style={{ color: 'var(--text-primary)' }}>
                    Consigue tu web perfecta para
                  </span>
                  <span className="block gradient-text mb-2">
                    peluquería
                  </span>
                  <span className="block" style={{ color: 'var(--text-primary)' }}>
                    en solo
                  </span>
                  <span className="relative inline-block mt-2">
                    <span className="gradient-text font-black">
                      2 minutos
                    </span>
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                      style={{ background: 'var(--accent-primary)' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    />
                  </span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.div variants={fadeIn} className="mb-8">
                <p className="text-lg lg:text-xl leading-relaxed text-pretty" style={{ color: 'var(--text-secondary)' }}>
                  Diseños profesionales especializados en peluquerías. Setup completo por{" "}
                  <span className="font-semibold gradient-text">
                    199€ + 49€/mes
                  </span>
                  . Sin complicaciones técnicas.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeIn} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={handleCTAClick}
                    className="btn btn-primary btn-lg group relative overflow-hidden"
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Ver mi web en 2 minutos</span>
                    <motion.div
                      className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100"
                      animate={{
                        background: [
                          'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                          'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                          'linear-gradient(270deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                          'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
                        ]
                      }}
                      transition={{
                        background: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 0.3 }
                      }}
                    />
                  </button>

                  <button
                    onClick={handleViewTemplatesClick}
                    className="btn btn-secondary btn-lg group"
                  >
                    <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span>Ver plantillas</span>
                  </button>
                </div>
              </motion.div>

              {/* Social Proof */}
              <motion.div variants={fadeIn} className="mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  {/* Trust Badge */}
                  <div className="flex items-center gap-3 px-4 py-2 card card-elevated rounded-full">
                    <Users className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      50+ peluquerías confían en nosotros
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.1 + 0.5, duration: 0.3 }}
                        >
                          <Star className="w-4 h-4" style={{ fill: 'var(--accent-primary)', color: 'var(--accent-primary)' }} />
                        </motion.div>
                      ))}
                    </div>
                    <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      4.9/5 (127 reseñas)
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Features Grid */}
              <motion.div variants={fadeIn}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: CheckCircle, text: "Setup en 24 horas" },
                    { icon: CheckCircle, text: "Dominio incluido" },
                    { icon: CheckCircle, text: "Diseño responsive" },
                    { icon: CheckCircle, text: "Soporte 24/7" }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.8 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-hover-overlay transition-all duration-200"
                    >
                      <benefit.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Clean Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative order-first lg:order-last"
            >
              {/* Floating Status Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 z-20 card card-elevated px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'var(--success)' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Online</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 z-20 card card-elevated px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ fill: 'var(--accent-primary)', color: 'var(--accent-primary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>4.9★</span>
                </div>
              </motion.div>

              {/* Main Mockup */}
              <div className="relative card card-elevated rounded-2xl overflow-hidden group">
                {/* Browser Header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                    </div>
                    <div className="flex-1 mx-4 px-3 py-1 rounded border text-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>mipeluqueria.com</span>
                    </div>
                  </div>
                </div>

                {/* Website Content Mockup */}
                <div className="aspect-[4/5] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <motion.div
                        className="h-8 rounded-lg w-32"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="h-8 rounded-lg w-20"
                        style={{ backgroundColor: 'var(--neutral-300)' }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>

                    {/* Hero Section */}
                    <div className="space-y-3 pt-4">
                      <motion.div
                        className="h-6 rounded w-3/4"
                        style={{ backgroundColor: 'var(--neutral-300)' }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="h-4 rounded w-1/2"
                        style={{ backgroundColor: 'var(--neutral-250)' }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="h-10 rounded-lg w-40 mt-3"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="aspect-square rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-light)'
                          }}
                          animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{
                            duration: 2 + i * 0.3,
                            repeat: Infinity,
                            delay: i * 0.4
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      boxShadow: `0 20px 40px -12px var(--accent-primary-100)`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Clean Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            delay: 1.5,
            duration: 1
          }
        }}
        className="absolute left-1/2 transform -translate-x-1/2 bottom-8 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="card card-elevated px-4 py-3 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Descubre más
            </span>
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;