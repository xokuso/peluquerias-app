'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Instagram,
  Facebook,
  Youtube,
  Music,
  Mail,
  Phone,
  Clock,
  Shield,
  CheckCircle,
  Lock,
  MapPin
} from 'lucide-react';

const FooterComponent: React.FC = () => {
  // Clean animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <footer className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
      {/* Main Footer Content */}
      <div className="container">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid-auto lg:grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* Company Info Section */}
          <motion.div
            variants={fadeIn}
            className="lg:col-span-5 card"
            style={{
              backgroundColor: 'var(--bg-primary)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div className="stack-lg">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>Web</span>
                  <span style={{ color: 'var(--text-primary)' }}>Peluquerías</span>
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Webs profesionales diseñadas exclusivamente para peluquerías.
                  Más reservas, menos complicaciones.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="stack">
                <div className="flex items-center space-x-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Shield className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <span>SSL Certificate Secured</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                  <span>Empresa registrada en España</span>
                </div>
                <div className="flex items-center space-x-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Lock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <span>Datos protegidos bajo GDPR/LOPD</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            variants={fadeIn}
            className="lg:col-span-2"
          >
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navegación
            </h4>
            <ul className="stack-sm">
              <li>
                <Link
                  href="/"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Plantillas
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre-nosotros"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            variants={fadeIn}
            className="lg:col-span-2"
          >
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Legal
            </h4>
            <ul className="stack-sm">
              <li>
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/legal-notice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Política de Reembolso
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            variants={fadeIn}
            className="lg:col-span-3 stack-lg"
          >
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contacto
              </h4>
              <div className="stack-sm">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <a
                    href="mailto:hola@webpeluquerias.es"
                    className="text-sm transition-colors duration-200 hover:underline"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    hola@webpeluquerias.es
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <a
                    href="tel:+34900123456"
                    className="text-sm transition-colors duration-200 hover:underline"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    +34 900 123 456
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Lun-Vie 9:00-18:00
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Horario España (CET)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Síguenos
              </h4>
              <div className="flex gap-3">
                <motion.a
                  href="https://instagram.com/webpeluquerias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Instagram"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="p-3 rounded-md border transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    <Instagram className="h-5 w-5 transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </motion.a>
                <motion.a
                  href="https://facebook.com/webpeluquerias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Facebook"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="p-3 rounded-md border transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    <Facebook className="h-5 w-5 transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </motion.a>
                <motion.a
                  href="https://youtube.com/webpeluquerias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="YouTube"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="p-3 rounded-md border transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    <Youtube className="h-5 w-5 transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </motion.a>
                <motion.a
                  href="https://tiktok.com/@webpeluquerias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="TikTok"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="p-3 rounded-md border transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    <Music className="h-5 w-5 transition-colors duration-200" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-primary)',
          paddingTop: 'var(--space-lg)',
          paddingBottom: 'var(--space-lg)'
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-center md:text-left" style={{ color: 'var(--text-secondary)' }}>
                © 2024 WebPeluquerías. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <span>Madrid, España</span>
              </div>
            </div>

            {/* Additional Trust Elements */}
            <div className="flex flex-col sm:flex-row items-center text-sm gap-4" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <span>256-bit SSL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;