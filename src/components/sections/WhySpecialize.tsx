"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Camera,
  Scissors,
  TrendingUp,
  Shield,
  Users,
  CheckCircle,
  Quote,
  Star,
  Clock
} from "lucide-react";

const WhySpecialize = () => {
  const smoothTransition = {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1]
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: smoothTransition
  };

  const cardFloat = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    transition: smoothTransition
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const benefits = [
    {
      icon: Calendar,
      title: "Sin más llamadas fuera de horario",
      outcome: "Tus clientes reservan online 24/7",
      description: "Sistema de reservas integrado con Google y redes sociales. Gestión automática de horarios y disponibilidad."
    },
    {
      icon: MapPin,
      title: "Atrae clientes de tu zona automáticamente",
      outcome: "Apareces primero en Google Maps",
      description: "SEO local optimizado para búsquedas como 'peluquería cerca de mí'. Ficha de Google My Business profesional."
    },
    {
      icon: Camera,
      title: "Tus clientes ven tu talento profesional",
      outcome: "Más reservas por trabajos destacados",
      description: "Galería optimizada para antes/después, looks especiales y técnicas de color que realmente venden."
    },
    {
      icon: Scissors,
      title: "Diseñado específicamente para peluquerías",
      outcome: "No pierdes tiempo explicando tu negocio",
      description: "Conocemos cortes, color, tratamientos y estilismo. Vocabulario y funciones pensadas para tu sector."
    }
  ];

  const trustElements = [
    { icon: Shield, text: "50+ peluquerías activas", subtext: "En toda España" },
    { icon: Users, text: "4.9/5 satisfacción", subtext: "127 reseñas verificadas" },
    { icon: TrendingUp, text: "+40% más reservas", subtext: "Promedio primer año" }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8f9fa_1px,transparent_1px),linear-gradient(to_bottom,#f8f9fa_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header Section */}
        <motion.div
          variants={cardFloat}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          {/* Clean card container */}
          <div className="bg-white border border-[var(--neutral-150)] rounded-2xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            {/* Engagement Hook - Question */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--neutral-900)] mb-6 leading-tight">
              ¿Por qué no usar{" "}
              <span className="relative">
                <span className="text-[var(--neutral-500)] line-through">Wix</span>
                <span className="absolute top-full left-0 w-full h-0.5 bg-red-400 opacity-60"></span>
              </span>{" "}
              o un{" "}
              <span className="relative">
                <span className="text-[var(--neutral-500)] line-through">freelancer</span>
                <span className="absolute top-full left-0 w-full h-0.5 bg-red-400 opacity-60"></span>
              </span>{" "}
              para tu{" "}
              <span className="text-[var(--accent-primary)] font-extrabold">
                peluquería
              </span>?
            </h2>

            {/* Reassurance Answer */}
            <p className="text-xl md:text-2xl text-[var(--neutral-600)] leading-relaxed mb-8">
              Porque tu negocio es único y necesita{" "}
              <span className="font-bold text-[var(--accent-primary)]">
                soluciones que realmente funcionen
              </span>{" "}
              para peluquerías
            </p>

            {/* Authority Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center bg-[var(--beige-50)] border border-[var(--neutral-200)] rounded-full px-6 py-4 gap-3"
            >
              <div className="p-2 rounded-full bg-[var(--accent-primary)]">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-[var(--neutral-800)]">
                Especialistas exclusivos en peluquerías desde 2019
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Benefits Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group relative"
              whileHover={{
                y: -4,
                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              {/* Clean Card Container */}
              <div className="bg-white border border-[var(--neutral-150)] rounded-xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">

                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-xl bg-[var(--beige-50)] border border-[var(--neutral-200)] transition-all duration-300 group-hover:scale-105">
                    <benefit.icon className="w-8 h-8 text-[var(--accent-primary)]" />
                  </div>
                </div>

                {/* Benefit Title */}
                <h3 className="text-xl md:text-2xl font-bold text-[var(--neutral-900)] mb-3">
                  {benefit.title}
                </h3>

                {/* Outcome */}
                <p className="text-lg font-semibold text-[var(--accent-primary)] mb-4">
                  {benefit.outcome}
                </p>

                {/* Description */}
                <p className="text-[var(--neutral-600)] leading-relaxed mb-6">
                  {benefit.description}
                </p>

                {/* Hover Effect Indicator */}
                <div className="flex items-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center bg-[var(--beige-50)] border border-[var(--neutral-200)] rounded-full px-4 py-2 gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="text-[var(--neutral-700)] font-medium">Específico para peluquerías</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Building Section */}
        <motion.div
          variants={cardFloat}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="relative"
        >
          {/* Main Container */}
          <div className="bg-white border border-[var(--neutral-150)] rounded-2xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">

            {/* Section Title */}
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--neutral-900)] mb-4">
                <span className="text-[var(--accent-primary)]">
                  Resultados que hablan por sí solos
                </span>
              </h3>
              <p className="text-lg text-[var(--neutral-600)] max-w-2xl mx-auto leading-relaxed">
                No somos una agencia genérica. Trabajamos exclusivamente con peluquerías
                y conocemos exactamente qué funciona en tu sector.
              </p>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {trustElements.map((trust, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center group"
                  whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
                >
                  {/* Card */}
                  <div className="bg-[var(--beige-50)] border border-[var(--neutral-200)] rounded-xl p-6 transition-all duration-300 group-hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                    {/* Icon */}
                    <div className="inline-flex p-3 rounded-xl bg-white border border-[var(--neutral-200)] mb-4 transition-all duration-300 group-hover:scale-105">
                      <trust.icon className="w-6 h-6 text-[var(--accent-primary)]" />
                    </div>

                    {/* Metric Text */}
                    <div className="font-bold text-lg text-[var(--neutral-900)] mb-1">
                      {trust.text}
                    </div>
                    <div className="text-[var(--neutral-600)] text-sm">
                      {trust.subtext}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-[var(--beige-50)] border border-[var(--neutral-200)] p-6 md:p-8 rounded-xl">
                {/* Quote Icon */}
                <div className="absolute top-6 left-6 p-2 rounded-full bg-[var(--accent-primary)]">
                  <Quote className="w-5 h-5 text-white" />
                </div>

                <div className="pl-14">
                  {/* Testimonial Text */}
                  <p className="text-lg italic text-[var(--neutral-700)] mb-6 leading-relaxed">
                    &ldquo;Desde que tengo la web, mis clientas me encuentran por Google
                    y reservan online. Ya no tengo que estar pendiente del teléfono.
                    Realmente entienden cómo funciona una peluquería.&rdquo;
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">M</span>
                    </div>

                    {/* Name and Location */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[var(--neutral-900)]">María Carmen</div>
                      <div className="text-sm text-[var(--neutral-600)]">Peluquería MC - Valencia</div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Time Urgency Element */}
            <motion.div
              variants={fadeInUp}
              className="text-center mt-8"
            >
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                {/* Urgency Header */}
                <div className="flex items-center justify-center mb-3 gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-[var(--neutral-800)] text-lg">
                    Cada día sin web profesional
                  </span>
                </div>

                {/* Warning Text */}
                <p className="text-[var(--neutral-700)] leading-relaxed">
                  pierdes clientes que van a peluquerías con mejor presencia online
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhySpecialize;