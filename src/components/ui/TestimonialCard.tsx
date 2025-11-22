"use client";

import { motion } from "framer-motion";
import { Star, MapPin, TrendingUp, Clock, Zap } from "lucide-react";

export interface Testimonial {
  name: string;
  business: string;
  location: string;
  avatar: string;
  quote: string;
  metrics: {
    improvement: string;
    timeframe: string;
    specificResult: string;
  };
  rating: number;
  template: string;
  service: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard = ({ testimonial, index }: TestimonialCardProps) => {
  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 }
  };

  const hoverVariants = {
    hover: { y: -8, scale: 1.02 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileInView="animate"
      whileHover="hover"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="group relative"
    >
      <motion.div
        variants={hoverVariants}
        className="card-elevated rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-medium)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-light)';
        }}
      >
        {/* Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors"
                style={{
                  background: 'linear-gradient(135deg, var(--beige-100), var(--beige-200))',
                  borderColor: 'var(--border-accent)'
                }}
              >
                <span className="text-xl font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              {/* Online Status Indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--success)',
                  borderColor: 'var(--bg-primary)'
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#059669' }}></div>
              </motion.div>
            </div>

            {/* Name and Business Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                {testimonial.name}
              </h3>
              <p className="font-medium" style={{ color: 'var(--accent-primary)' }}>
                {testimonial.business}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{testimonial.location}</span>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.7 + index * 0.1 + i * 0.1,
                      type: "spring",
                      stiffness: 300
                    }}
                    whileHover={{
                      scale: 1.2,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.4 }
                    }}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                {testimonial.rating}/5
              </div>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="px-6 pb-4">
          <div className="relative">
            <div className="absolute -top-2 -left-1 text-4xl leading-none" style={{ color: 'var(--border-accent)' }}>
              &ldquo;
            </div>
            <blockquote className="leading-relaxed pl-6 pr-2 italic" style={{ color: 'var(--text-secondary)' }}>
              {testimonial.quote}
            </blockquote>
            <div className="absolute -bottom-4 right-2 text-4xl leading-none rotate-180" style={{ color: 'var(--border-accent)' }}>
              &rdquo;
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              className="rounded-lg p-3 text-center transition-colors"
              style={{ backgroundColor: 'var(--accent-primary-50)' }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary-50)';
              }}
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--accent-primary)' }} />
              <div className="text-lg font-bold" style={{ color: 'var(--accent-primary-dark)' }}>
                {testimonial.metrics.improvement}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>mejora</div>
            </motion.div>

            <motion.div
              className="rounded-lg p-3 text-center transition-colors"
              style={{ backgroundColor: 'var(--beige-100)' }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--beige-200)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--beige-100)';
              }}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--beige-600)' }} />
              <div className="text-lg font-bold" style={{ color: 'var(--beige-600)' }}>
                {testimonial.metrics.timeframe}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>tiempo</div>
            </motion.div>

            <motion.div
              className="rounded-lg p-3 text-center transition-colors"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              }}
            >
              <Zap className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--success)' }} />
              <div className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                {testimonial.metrics.specificResult}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>ubicación</div>
            </motion.div>
          </div>
        </div>

        {/* Service Badge */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div
              className="text-white px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {testimonial.template}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {testimonial.service}
            </div>
          </div>
        </div>

        {/* Subtle Hover Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.02 }}
        />

        {/* Subtle Decorative Corner */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] transition-colors"
            style={{ borderTopColor: 'var(--bg-accent)' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TestimonialCard;