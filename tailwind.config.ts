import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

// Golden ratio for spacing calculations
const PHI = 1.618033988749895;

// Liquid Crystal Color System
const liquidColors = {
  // Base crystal whites and transparencies
  crystal: {
    50: 'rgba(255, 255, 255, 0.95)',
    100: 'rgba(255, 255, 255, 0.90)',
    200: 'rgba(255, 255, 255, 0.80)',
    300: 'rgba(255, 255, 255, 0.70)',
    400: 'rgba(255, 255, 255, 0.60)',
    500: 'rgba(255, 255, 255, 0.50)',
    600: 'rgba(255, 255, 255, 0.40)',
    700: 'rgba(255, 255, 255, 0.30)',
    800: 'rgba(255, 255, 255, 0.20)',
    900: 'rgba(255, 255, 255, 0.10)',
    950: 'rgba(255, 255, 255, 0.05)',
  },
  // Dark crystal variants
  obsidian: {
    50: 'rgba(15, 23, 42, 0.95)',
    100: 'rgba(15, 23, 42, 0.90)',
    200: 'rgba(15, 23, 42, 0.80)',
    300: 'rgba(15, 23, 42, 0.70)',
    400: 'rgba(15, 23, 42, 0.60)',
    500: 'rgba(15, 23, 42, 0.50)',
    600: 'rgba(15, 23, 42, 0.40)',
    700: 'rgba(15, 23, 42, 0.30)',
    800: 'rgba(15, 23, 42, 0.20)',
    900: 'rgba(15, 23, 42, 0.10)',
    950: 'rgba(15, 23, 42, 0.05)',
  },
  // Liquid primary (ethereal blue)
  liquid: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  // Accent colors for glassmorphism
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
};

// Golden ratio based spacing system
const goldenSpacing = {
  'phi-xs': `${0.618}rem`,     // φ⁻¹
  'phi-sm': `${1}rem`,         // 1
  'phi': `${PHI}rem`,          // φ
  'phi-md': `${PHI * 1.618}rem`, // φ²
  'phi-lg': `${PHI * PHI * PHI}rem`, // φ³
  'phi-xl': `${PHI * PHI * PHI * PHI}rem`, // φ⁴
  'phi-2xl': `${PHI * PHI * PHI * PHI * PHI}rem`, // φ⁵
  'phi-3xl': `${PHI * PHI * PHI * PHI * PHI * PHI}rem`, // φ⁶
};

const config: Config = {
  // Optimize content paths for better tree shaking
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  // Dark mode support
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS variables for dynamic theming
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Liquid Crystal Color System
        ...liquidColors,

        // Primary now maps to liquid system
        primary: {
          DEFAULT: liquidColors.liquid[500],
          ...liquidColors.liquid,
        },

        // Secondary maps to accent
        secondary: {
          DEFAULT: liquidColors.accent[500],
          ...liquidColors.accent,
        },

        // Semantic colors with crystal transparency
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: liquidColors.liquid[500],

        // Crystal color system for liquid crystal glassmorphism
        'crystal-azure': '#007CF0',
        'crystal-cyan': '#00D9FF',
        'crystal-violet': '#8B5DFF',
        'crystal-pink': '#FF6B9D',

        // Border colors for glassmorphism
        border: {
          light: 'rgba(255, 255, 255, 0.18)',
          dark: 'rgba(15, 23, 42, 0.18)',
          DEFAULT: 'rgba(255, 255, 255, 0.18)',
        },
      },
      fontFamily: {
        // Inter with variable weights for liquid crystal design
        'sans': [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif'
        ],
        'mono': [
          'JetBrains Mono',
          'Monaco',
          'Consolas',
          'monospace'
        ],
        'display': [
          'Inter Display',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        // Golden ratio spacing system
        ...goldenSpacing,

        // Standard spacing extended
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',

        // Additional golden ratio breakpoints
        'phi-4xl': `${Math.pow(PHI, 7)}rem`,
        'phi-5xl': `${Math.pow(PHI, 8)}rem`,
        'phi-6xl': `${Math.pow(PHI, 9)}rem`,
      },
      animation: {
        // Liquid crystal animations - smooth and ethereal
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.7s cubic-bezier(0.16, 1, 0.3, 1)',

        // Glassmorphism specific animations
        'glass-morph': 'glassMorph 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'glass-float': 'glassFloat 4s ease-in-out infinite',
        'glass-pulse': 'glassPulse 3s ease-in-out infinite',

        // Liquid crystal effects
        'liquid-flow': 'liquidFlow 6s ease-in-out infinite',
        'crystal-shimmer': 'crystalShimmer 2s ease-in-out infinite',
        'backdrop-shift': 'backdropShift 8s ease-in-out infinite',

        // Refined existing animations
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
      },
      keyframes: {
        // Base animations enhanced for liquid crystal
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

        // Glassmorphism animations
        glassMorph: {
          '0%': {
            opacity: '0',
            backdropFilter: 'blur(0px) saturate(100%)',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            backdropFilter: 'blur(20px) saturate(180%)',
            transform: 'scale(1)',
          },
        },
        glassFloat: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
            backdropFilter: 'blur(20px) saturate(180%)',
          },
          '50%': {
            transform: 'translateY(-8px) rotate(1deg)',
            backdropFilter: 'blur(22px) saturate(190%)',
          },
        },
        glassPulse: {
          '0%, 100%': {
            backdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'rgba(255, 255, 255, 0.18)',
          },
          '50%': {
            backdropFilter: 'blur(25px) saturate(200%)',
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
        },

        // Liquid crystal effects
        liquidFlow: {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
        crystalShimmer: {
          '0%': {
            backgroundPosition: '-100% 0',
          },
          '100%': {
            backgroundPosition: '100% 0',
          },
        },
        backdropShift: {
          '0%, 100%': {
            backdropFilter: 'blur(20px) hue-rotate(0deg) saturate(180%)',
          },
          '25%': {
            backdropFilter: 'blur(22px) hue-rotate(90deg) saturate(190%)',
          },
          '50%': {
            backdropFilter: 'blur(25px) hue-rotate(180deg) saturate(200%)',
          },
          '75%': {
            backdropFilter: 'blur(22px) hue-rotate(270deg) saturate(190%)',
          },
        },

        // Enhanced existing animations
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(0deg)' },
          '50%': { transform: 'translateY(-12px) rotateX(2deg)' },
        },
      },
      boxShadow: {
        // Standard shadows with softer appearance
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',

        // Glassmorphism shadows
        'glass-sm': '0 2px 8px rgba(31, 38, 135, 0.2)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 12px 40px rgba(31, 38, 135, 0.45)',
        'glass-xl': '0 20px 60px rgba(31, 38, 135, 0.55)',

        // Liquid crystal shadows
        'liquid': '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
        'liquid-lg': '0 10px 25px 0 rgba(14, 165, 233, 0.2)',
        'liquid-xl': '0 20px 40px 0 rgba(14, 165, 233, 0.25)',

        // Accent/secondary shadows
        'accent': '0 4px 14px 0 rgba(217, 70, 239, 0.15)',
        'accent-lg': '0 10px 25px 0 rgba(217, 70, 239, 0.2)',

        // Crystal inner glow effect
        'crystal-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        'crystal-glow': '0 0 20px rgba(255, 255, 255, 0.2)',

        // Compatibility with existing system
        'primary': '0 4px 14px 0 rgba(14, 165, 233, 0.15)',
        'primary-lg': '0 10px 25px 0 rgba(14, 165, 233, 0.2)',
        'secondary': '0 4px 14px 0 rgba(217, 70, 239, 0.15)',
        'secondary-lg': '0 10px 25px 0 rgba(217, 70, 239, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Add forms plugin for better form styling
    // require("@tailwindcss/forms"),
  ],
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Remove unused keyframes
    experimental: {
      optimizeUniversalDefaults: true,
    },
  }),
};

export default config;