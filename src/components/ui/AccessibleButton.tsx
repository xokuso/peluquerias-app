'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { announceToScreenReader } from '@/lib/accessibility';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  announceClick?: boolean;
  successMessage?: string;
}

/**
 * Accessible button component with proper ARIA attributes and keyboard support
 */
const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
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
      ariaLabel,
      ariaDescribedBy,
      ariaExpanded,
      ariaControls,
      announceClick = false,
      successMessage,
      disabled,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }

      if (announceClick && successMessage) {
        announceToScreenReader(successMessage, 'polite');
      }

      if (onClick) {
        onClick(e);
      }
    };

    const baseStyles = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95 transform-gpu touch-manipulation',

      // Width
      fullWidth && 'w-full',

      // Size variations with proper touch targets
      {
        'text-sm px-3 py-2 rounded-md min-h-[44px]': size === 'sm',
        'text-base px-4 py-2.5 rounded-lg min-h-[44px]': size === 'md',
        'text-lg px-6 py-3 rounded-xl min-h-[48px]': size === 'lg',
      },

      // Variant styles
      {
        'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary':
          variant === 'primary',
        'bg-secondary text-gray-900 hover:bg-secondary/90 focus-visible:ring-secondary':
          variant === 'secondary',
        'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500':
          variant === 'ghost',
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500':
          variant === 'danger',
      },

      // Loading state
      loading && 'cursor-wait',

      className
    );

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
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

    const content = (
      <>
        {loading && <LoadingSpinner />}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2" aria-hidden="true">{icon}</span>
        )}
        <span>{loading ? loadingText : children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2" aria-hidden="true">{icon}</span>
        )}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        className={baseStyles}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;

// Export specific button types for convenience
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="primary" {...props} />
);

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="secondary" {...props} />
);

export const GhostButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="ghost" {...props} />
);

export const DangerButton = forwardRef<HTMLButtonElement, Omit<AccessibleButtonProps, 'variant'>>(
  (props, ref) => <AccessibleButton ref={ref} variant="danger" {...props} />
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
GhostButton.displayName = 'GhostButton';
DangerButton.displayName = 'DangerButton';