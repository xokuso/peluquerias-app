'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ArrowRight, LogIn, User, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { trackEvents } from '@/lib/analytics';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navbar = document.getElementById('navbar');
      if (navbar && !navbar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Navigation links - corrigiendo para páginas existentes
  const navLinks = [
    { href: '/', label: 'Inicio', description: 'Página principal' },
    { href: '/templates', label: '¿Cómo funciona?', description: 'Conoce nuestro proceso' },
    { href: '/plantillas', label: 'Plantillas', description: 'Ver diseños disponibles' },
    { href: '/pricing', label: 'Precios', description: 'Planes y tarifas' },
    { href: '/contact', label: 'Contacto', description: 'Habla con nosotros' }
  ];

  const handleCTAClick = () => {
    trackEvents.ctaClick('Crear mi web', 'navbar');
    router.push('/pricing');
  };

  const handleNavClick = (href: string, label: string) => {
    trackEvents.ctaClick(label, 'navbar');
  };

  const handleLoginClick = () => {
    trackEvents.ctaClick('Login', 'navbar');
    router.push('/auth/login');
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  // Animation variants
  const easeOut = [0.16, 1, 0.3, 1] as const;

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeOut as [number, number, number, number]
      }
    }
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: easeOut as [number, number, number, number]
      }
    },
    visible: {
      opacity: 1,
      height: 'auto' as const,
      transition: {
        duration: 0.3,
        ease: easeOut as [number, number, number, number]
      }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: easeOut as [number, number, number, number]
      }
    })
  };

  return (
    <>
      {/* Fixed navbar container */}
      <motion.nav
        id="navbar"
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: isScrolled ? 'var(--neutral-50)' : 'rgba(254, 254, 254, 0.95)',
          borderBottom: isScrolled ? '1px solid var(--border-light)' : '1px solid transparent',
          boxShadow: isScrolled ? 'var(--shadow-md)' : 'var(--shadow-xs)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              aria-label="PeluqueríasPRO - Inicio"
              onClick={() => handleNavClick('/', 'Logo')}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">
                  PeluqueríasPRO
                </h1>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => handleNavClick(link.href, link.label)}
                    className={`
                      relative px-3 py-2 rounded-md text-sm font-medium
                      transition-all duration-200 hover:text-neutral-800
                      focus-ring group
                      ${isActive(link.href)
                        ? 'text-neutral-800'
                        : 'text-neutral-600'
                      }
                    `}
                  >
                    <span className="relative z-10">{link.label}</span>

                    {/* Active indicator */}
                    {isActive(link.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-md"
                        style={{ backgroundColor: 'var(--bg-accent)' }}
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-md bg-hover-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Auth & CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {session ? (
                // User menu dropdown
                <div className="relative">
                  <motion.button
                    onClick={toggleUserMenu}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-800 focus-ring transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </motion.button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 py-2 z-50"
                      >
                        <Link
                          href={session.user?.role === 'ADMIN' ? '/admin' : '/client'}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors duration-200 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Login button for non-authenticated users
                <motion.button
                  onClick={handleLoginClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:text-neutral-800 focus-ring transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </motion.button>
              )}

              {/* Main CTA Button */}
              <motion.button
                onClick={handleCTAClick}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-lg group relative overflow-hidden"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span>Crear mi web</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />

                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%', opacity: 0 }}
                  whileHover={{ x: '100%', opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md focus-ring"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: isOpen ? 'var(--hover-overlay)' : 'transparent'
              }}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={mobileMenuVariants}
                className="lg:hidden overflow-hidden"
                style={{
                  borderTop: '1px solid var(--border-light)',
                  backgroundColor: 'var(--neutral-50)'
                }}
              >
                <div className="py-4 space-y-1">
                  {/* Mobile Navigation Links */}
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={linkVariants}
                    >
                      <Link
                        href={link.href}
                        onClick={() => {
                          handleNavClick(link.href, link.label);
                          setIsOpen(false);
                        }}
                        className={`
                          block px-4 py-3 rounded-lg transition-all duration-200
                          hover:bg-hover-overlay focus-ring group
                          ${isActive(link.href)
                            ? 'bg-bg-accent text-neutral-800'
                            : 'text-neutral-600 hover:text-neutral-800'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{link.label}</div>
                            <div className="text-sm opacity-70">{link.description}</div>
                          </div>
                          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Mobile Auth & CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 border-t space-y-3"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    {session ? (
                      <div className="space-y-3">
                        <Link
                          href={session.user?.role === 'ADMIN' ? '/admin' : '/client'}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-hover-overlay transition-all duration-200"
                        >
                          <User className="w-4 h-4" />
                          <span>Dashboard ({session.user?.name || session.user?.email})</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-hover-overlay transition-all duration-200 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handleLoginClick();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-hover-overlay transition-all duration-200 w-full text-left"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Iniciar sesión</span>
                      </button>
                    )}

                    <button
                      onClick={handleCTAClick}
                      className="btn btn-primary btn-lg w-full group relative overflow-hidden"
                    >
                      <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Crear mi web</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </motion.div>

                  {/* Contact Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 pt-6 border-t border-neutral-200"
                  >
                    <div className="text-center">
                      <p className="text-sm text-neutral-600 mb-2">
                        ¿Necesitas ayuda?
                      </p>
                      <Link
                        href="/contact"
                        className="text-sm font-medium gradient-text hover:underline focus-ring rounded"
                        onClick={() => setIsOpen(false)}
                      >
                        Contáctanos
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navbar;