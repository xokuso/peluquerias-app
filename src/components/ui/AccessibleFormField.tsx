'use client';

import React, { forwardRef, InputHTMLAttributes, useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { announceToScreenReader } from '@/lib/accessibility';

interface AccessibleFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  showLabel?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  onValidate?: (value: string) => string | undefined;
  successMessage?: string;
}

/**
 * Accessible form field component with proper ARIA attributes
 * Includes label, error handling, and screen reader support
 */
const AccessibleFormField = forwardRef<HTMLInputElement, AccessibleFormFieldProps>(
  (
    {
      label,
      error,
      hint,
      showLabel = true,
      required = false,
      icon,
      onValidate,
      successMessage,
      className,
      type = 'text',
      disabled,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState<string | undefined>();
    const [touched, setTouched] = useState(false);
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const displayError = error || internalError;
    const hasError = Boolean(displayError) && touched;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Clear error on change
      if (internalError) {
        setInternalError(undefined);
      }

      // Call validation if provided
      if (onValidate && touched) {
        const validationError = onValidate(value);
        if (validationError) {
          setInternalError(validationError);
          announceToScreenReader(`Error: ${validationError}`, 'polite');
        } else if (successMessage) {
          announceToScreenReader(successMessage, 'polite');
        }
      }

      if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);

      // Validate on blur
      if (onValidate) {
        const value = e.target.value;
        const validationError = onValidate(value);
        if (validationError) {
          setInternalError(validationError);
          announceToScreenReader(`Error: ${validationError}`, 'assertive');
        }
      }

      if (onBlur) {
        onBlur(e);
      }
    };

    const inputStyles = cn(
      'w-full px-3 py-2 border rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60',
      {
        'border-gray-300 focus:border-primary focus:ring-primary': !hasError,
        'border-red-500 focus:border-red-500 focus:ring-red-500': hasError,
        'pl-10': icon,
      },
      className
    );

    return (
      <div className="w-full">
        {/* Label */}
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            !showLabel && 'sr-only'
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="campo requerido">
              *
            </span>
          )}
        </label>

        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={id}
            type={type}
            className={inputStyles}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={hasError}
            aria-describedby={
              [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined
            }
            aria-label={!showLabel ? label : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
          />
        </div>

        {/* Hint text */}
        {hint && !hasError && (
          <p id={hintId} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            {displayError}
          </p>
        )}
      </div>
    );
  }
);

AccessibleFormField.displayName = 'AccessibleFormField';

export default AccessibleFormField;

// Export specific field types for convenience
export const EmailField = forwardRef<
  HTMLInputElement,
  Omit<AccessibleFormFieldProps, 'type' | 'onValidate'>
>((props, ref) => {
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'El email es requerido';
    if (!emailRegex.test(value)) return 'Ingrese un email válido';
    return undefined;
  };

  return (
    <AccessibleFormField
      ref={ref}
      type="email"
      onValidate={validateEmail}
      {...props}
    />
  );
});

export const PhoneField = forwardRef<
  HTMLInputElement,
  Omit<AccessibleFormFieldProps, 'type' | 'onValidate'>
>((props, ref) => {
  const validatePhone = (value: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!value) return 'El teléfono es requerido';
    if (!phoneRegex.test(value)) return 'Ingrese un teléfono válido';
    return undefined;
  };

  return (
    <AccessibleFormField
      ref={ref}
      type="tel"
      onValidate={validatePhone}
      {...props}
    />
  );
});

export const PasswordField = forwardRef<
  HTMLInputElement,
  Omit<AccessibleFormFieldProps, 'type'>
>((props, ref) => {
  return <AccessibleFormField ref={ref} type="password" {...props} />;
});

EmailField.displayName = 'EmailField';
PhoneField.displayName = 'PhoneField';
PasswordField.displayName = 'PasswordField';