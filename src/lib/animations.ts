/**
 * Shared animation constants and easing functions for liquid crystal glassmorphism effects
 * This ensures consistent animations across all components
 */

import { Easing } from "framer-motion";

// Liquid crystal easing function - converts bezier values to proper cubic-bezier function
export const liquidEasing: Easing = [0.16, 1, 0.3, 1];

// Alternative easing functions for variety
export const crystalEasing: Easing = [0.25, 0.46, 0.45, 0.94];
export const smoothEasing: Easing = [0.25, 0.1, 0.25, 1];
export const bounceEasing: Easing = [0.68, -0.55, 0.265, 1.55];

// Animation constants
export const PHI = 1.618033988749895; // Golden ratio for natural proportions

// Common animation durations
export const ANIMATION_DURATIONS = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.8,
  verySlow: 1.2
} as const;

// Common stagger delays
export const STAGGER_DELAYS = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.2
} as const;