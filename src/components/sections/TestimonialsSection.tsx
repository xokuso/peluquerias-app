"use client";

import { motion } from "framer-motion";
import TestimonialCard, { Testimonial } from "@/components/ui/TestimonialCard";
import { Users, CheckCircle, TrendingUp } from "lucide-react";

// Datos específicos de testimoniales según los requisitos
const testimonialsData: Testimonial[] = [
  {
    name: "Carmen Ruiz",
    business: "Peluquería Bella",
    location: "Madrid",
    avatar: "CR",
    quote: "En 3 meses aumenté mis reservas un 40%. Antes perdía clientes porque no me encontraban online. Ahora aparezco primera en Google cuando buscan 'peluquería Chamartín'.",
    metrics: {
      improvement: "+40%",
      timeframe: "3 meses",
      specificResult: "Madrid"
    },
    rating: 5,
    template: "Diseño Elegance",
    service: "SEO local"
  },
  {
    name: "Ana García",
    business: "Studio Ana",
    location: "Sevilla",
    avatar: "AG",
    quote: "La galería automática me ha cambiado la vida. Subo las fotos de mis trabajos y se organizan solas. Mis clientas ven todo mi trabajo de color y cortes.",
    metrics: {
      improvement: "+60%",
      timeframe: "2 meses",
      specificResult: "Sevilla"
    },
    rating: 5,
    template: "Diseño Beauty",
    service: "Sistema galería"
  },
  {
    name: "María López",
    business: "Hair Style",
    location: "Valencia",
    avatar: "ML",
    quote: "El sistema de reservas online es increíble. Ya no tengo que coger el móvil fuera de horario. Las clientas reservan ellas mismas y reciben recordatorios automáticos.",
    metrics: {
      improvement: "-80%",
      timeframe: "1 mes",
      specificResult: "Valencia"
    },
    rating: 5,
    template: "Diseño Modern",
    service: "Reservas online"
  }
];

const TestimonialsSection = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const statsVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
  };

  return (
    <section className="section overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>

      <div className="container relative">
        {/* Header Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: 'var(--bg-accent)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-accent)'
            }}
          >
            <Users className="w-4 h-4" />
            Testimonios Reales
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Lo Que Dicen Nuestras{" "}
            <span className="gradient-text">
              Peluqueras
            </span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Casos reales de peluquerías que han transformado su negocio con nosotros.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { icon: TrendingUp, label: "Promedio de crecimiento", value: "+47%" },
              { icon: CheckCircle, label: "Peluquerías activas", value: "50+" },
              { icon: Users, label: "Satisfacción", value: "4.9/5" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={statsVariants}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.5 + index * 0.1
                }}
                className="card flex items-center gap-3 px-6 py-3"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-primary-50)' }}>
                  <stat.icon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 mb-16"
        >
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div
            className="card-elevated rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark))',
              border: 'none'
            }}
          >

            <div className="relative z-10">
              <motion.h3
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl lg:text-3xl font-bold mb-4"
              >
                Únete a 50+ Peluquerías Exitosas
              </motion.h3>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg mb-8 text-white/90"
              >
                Miles de clientes satisfechos ya disfrutan de su web perfecta
              </motion.p>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-6 lg:gap-8"
              >
                {/* Location Badges */}
                {["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"].map((city, index) => (
                  <motion.div
                    key={city}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                    className="px-4 py-2 rounded-full text-sm font-medium border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {city}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Subtle decorative elements */}
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full blur-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
            <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;