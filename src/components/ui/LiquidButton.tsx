'use client';

import React, { forwardRef, ButtonHTMLAttributes, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { announceToScreenReader, prefersReducedMotion, generateAccessibilityId } from '@/lib/accessibility';

/**
 * Advanced button variants with glassmorphism design
 */
type LiquidButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

/**
 * Button sizes with optimized touch targets
 */
type LiquidButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button states for comprehensive state management
 */
type LiquidButtonState = 'default' | 'hover' | 'pressed' | 'disabled' | 'loading';

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: LiquidButtonVariant;

  /** Size of the button with touch-optimized targets */
  size?: LiquidButtonSize;

  /** Loading state with spinner animation */
  loading?: boolean;

  /** Custom loading text for screen readers */
  loadingText?: string;

  /** Icon element to display */
  icon?: React.ReactNode;

  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';

  /** Make button full width */
  fullWidth?: boolean;

  /** Enable liquid ripple effect on click */
  enableRipple?: boolean;

  /** Enable spring physics animations */
  enableSpringPhysics?: boolean;

  /** Accessibility label override */
  ariaLabel?: string;

  /** Element described by this button */
  ariaDescribedBy?: string;

  /** Whether button controls expanded state */
  ariaExpanded?: boolean;

  /** Element controlled by this button */
  ariaControls?: string;

  /** Announce click action to screen readers */
  announceClick?: boolean;

  /** Success message for screen reader announcement */
  successMessage?: string;

  /** Error message for failed actions */
  errorMessage?: string;

  /** Enable haptic feedback on supported devices */
  enableHapticFeedback?: boolean;

  /** Glass intensity for glassmorphism effect */
  glassIntensity?: 'low' | 'medium' | 'high';
}

/**
 * LiquidButton - Advanced glassmorphism button component with spring physics,
 * accessibility features, and crystal liquid effects
 */
const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText = 'Cargando...',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      enableRipple = true,
      enableSpringPhysics = true,
      ariaLabel,
      ariaDescribedBy,
      ariaExpanded,
      ariaControls,
      announceClick = false,
      successMessage,
      errorMessage,
      enableHapticFeedback = true,
      glassIntensity = 'medium',
      disabled,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onFocus,
      onBlur,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleContainerRef = useRef<HTMLDivElement>(null);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [uniqueId] = useState(() => generateAccessibilityId('liquid-btn'));

    // Merge refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(buttonRef.current);
      } else if (ref) {
        ref.current = buttonRef.current;
      }
    }, [ref]);

    // Haptic feedback for supported devices
    const triggerHapticFeedback = () => {
      if (enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(1);
      }
    };

    // Liquid ripple effect
    const createRipple = (event: React.MouseEvent) => {
      if (!enableRipple || !rippleContainerRef.current || prefersReducedMotion()) return;

      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: liquid-ripple 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        background: currentColor;
        opacity: 0.15;
        pointer-events: none;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      rippleContainerRef.current.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    };

    // Handle click with accessibility announcements
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }

      triggerHapticFeedback();
      createRipple(event);

      if (announceClick && successMessage) {
        announceToScreenReader(successMessage, 'polite');
      }

      if (errorMessage) {
        announceToScreenReader(errorMessage, 'assertive');
      }

      if (onClick) {
        onClick(event);
      }
    };

    // Enhanced interaction handlers
    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        setIsPressed(false);
      }
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onMouseLeave?.(event);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        setIsPressed(true);
      }
      onMouseDown?.(event);
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      onMouseUp?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
      setIsFocused(false);
      setIsPressed(false);
      onBlur?.(event);
    };

    // Glass intensity styles
    const glassStyles = {
      low: 'backdrop-blur-sm bg-white/5 border-white/10',
      medium: 'backdrop-blur-md bg-white/10 border-white/20',
      high: 'backdrop-blur-lg bg-white/15 border-white/30',
    };

    // Variant-specific styles with glassmorphism
    const variantStyles = {
      primary: cn(
        'text-white shadow-primary-lg',
        'bg-gradient-to-br from-primary-500/90 to-primary-600/90',
        'hover:from-primary-400/95 hover:to-primary-500/95',
        'border border-primary-300/30',
        glassStyles[glassIntensity],
        'hover:shadow-primary-lg hover:shadow-primary/25'
      ),
      secondary: cn(
        'text-white shadow-secondary-lg',
        'bg-gradient-to-br from-secondary-500/90 to-secondary-600/90',
        'hover:from-secondary-400/95 hover:to-secondary-500/95',
        'border border-secondary-300/30',
        glassStyles[glassIntensity],
        'hover:shadow-secondary-lg hover:shadow-secondary/25'
      ),
      ghost: cn(
        'text-gray-700 dark:text-gray-300',
        'bg-transparent hover:bg-white/10 dark:hover:bg-gray-800/10',
        'border border-transparent hover:border-white/20',
        glassStyles[glassIntensity],
        'hover:shadow-md'
      ),
      outline: cn(
        'text-primary-600 dark:text-primary-400',
        'bg-transparent hover:bg-primary-50/50 dark:hover:bg-primary-900/20',
        'border-2 border-primary-300/50 hover:border-primary-400/70',
        glassStyles[glassIntensity],
        'hover:shadow-primary hover:shadow-primary/15'
      ),
    };

    // Size styles with optimized touch targets
    const sizeStyles = {
      sm: 'text-sm px-3 py-2 rounded-lg min-h-[44px] min-w-[44px]',
      md: 'text-base px-4 py-2.5 rounded-xl min-h-[44px] min-w-[44px]',
      lg: 'text-lg px-6 py-3 rounded-2xl min-h-[48px] min-w-[48px]',
      xl: 'text-xl px-8 py-4 rounded-2xl min-h-[52px] min-w-[52px]',
    };

    // Spring physics animation styles
    const springStyles = enableSpringPhysics && !prefersReducedMotion()
      ? cn(
          'transition-all duration-200 ease-out',
          'hover:scale-102 active:scale-98',
          isPressed && 'scale-98',
          isFocused && 'ring-4 ring-current ring-opacity-20',
          'transform-gpu will-change-transform'
        )
      : 'transition-all duration-200';

    // Compute final className
    const buttonClassName = cn(
      // Base styles
      'relative inline-flex items-center justify-center',
      'font-medium tracking-wide',
      'focus:outline-none focus-visible:ring-4 focus-visible:ring-current focus-visible:ring-opacity-20',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'overflow-hidden select-none touch-manipulation',
      'backdrop-saturate-150 backdrop-contrast-105',

      // Width
      fullWidth && 'w-full',

      // Size and variant styles
      sizeStyles[size],
      variantStyles[variant],
      springStyles,

      // Loading state
      loading && 'cursor-wait',

      className
    );

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Button content with proper spacing
    const content = (
      <>
        {loading && <LoadingSpinner />}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="truncate">
          {loading ? loadingText : children}
        </span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </>
    );

    return (
      <button
        ref={buttonRef}
        type={type}
        className={buttonClassName}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        role="button"
        tabIndex={disabled ? -1 : 0}
        id={uniqueId}
        {...props}
      >
        {/* Ripple container */}
        <div
          ref={rippleContainerRef}
          className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none"
          aria-hidden="true"
        />

        {/* Crystal highlight overlay */}
        <div
          className="absolute inset-0 rounded-inherit bg-gradient-to-t from-transparent via-white/5 to-white/20 pointer-events-none opacity-60"
          aria-hidden="true"
        />

        {/* Button content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {content}
        </div>
      </button>
    );
  }
);

LiquidButton.displayName = 'LiquidButton';

export default LiquidButton;

// Convenience components for specific variants
export const PrimaryLiquidButton = forwardRef<HTMLButtonElement, Omit<LiquidButtonProps, 'variant'>>(
  (props, ref) => <LiquidButton ref={ref} variant="primary" {...props} />
);

export const SecondaryLiquidButton = forwardRef<HTMLButtonElement, Omit<LiquidButtonProps, 'variant'>>(
  (props, ref) => <LiquidButton ref={ref} variant="secondary" {...props} />
);

export const GhostLiquidButton = forwardRef<HTMLButtonElement, Omit<LiquidButtonProps, 'variant'>>(
  (props, ref) => <LiquidButton ref={ref} variant="ghost" {...props} />
);

export const OutlineLiquidButton = forwardRef<HTMLButtonElement, Omit<LiquidButtonProps, 'variant'>>(
  (props, ref) => <LiquidButton ref={ref} variant="outline" {...props} />
);

// Set display names
PrimaryLiquidButton.displayName = 'PrimaryLiquidButton';
SecondaryLiquidButton.displayName = 'SecondaryLiquidButton';
GhostLiquidButton.displayName = 'GhostLiquidButton';
OutlineLiquidButton.displayName = 'OutlineLiquidButton';

// Export types for external use
export type { LiquidButtonProps, LiquidButtonVariant, LiquidButtonSize, LiquidButtonState };