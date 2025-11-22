/**
 * Accessibility utilities for WCAG compliance
 */

/**
 * Announce message to screen readers
 * @param message - The message to announce
 * @param priority - The priority of the announcement
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('role', 'status');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within a specific element (useful for modals)
 * @param element - The element to trap focus within
 * @returns Function to remove the focus trap
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  // Focus the first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check if user prefers reduced motion
 * @returns Boolean indicating if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generate unique ID for accessibility attributes
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateAccessibilityId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add keyboard navigation to a list of elements
 * @param container - The container element
 * @param items - The items to navigate
 * @param orientation - The orientation of the navigation
 */
export function addKeyboardNavigation(
  container: HTMLElement,
  items: NodeListOf<HTMLElement>,
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
) {
  let currentIndex = 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        if (orientation !== 'horizontal') {
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        break;
      case 'ArrowDown':
        if (orientation !== 'horizontal') {
          e.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'ArrowLeft':
        if (orientation !== 'vertical') {
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        break;
      case 'ArrowRight':
        if (orientation !== 'vertical') {
          e.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      items[currentIndex]?.setAttribute('tabindex', '-1');
      items[newIndex]?.setAttribute('tabindex', '0');
      items[newIndex]?.focus();
      currentIndex = newIndex;
    }
  };

  // Initialize tabindex
  items.forEach((item, index) => {
    item.setAttribute('tabindex', index === 0 ? '0' : '-1');
  });

  container.addEventListener('keydown', handleKeyDown);

  // Update currentIndex when an item is clicked
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentIndex = index;
    });
  });
}

/**
 * Check color contrast ratio for WCAG compliance
 * @param foreground - Foreground color in hex
 * @param background - Background color in hex
 * @returns Object with contrast ratio and WCAG compliance levels
 */
export function checkColorContrast(foreground: string, background: string) {
  const getLuminance = (color: string) => {
    const rgb = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!rgb || !rgb[1] || !rgb[2] || !rgb[3]) return 0;

    const values = [
      parseInt(rgb[1], 16) / 255,
      parseInt(rgb[2], 16) / 255,
      parseInt(rgb[3], 16) / 255,
    ].map((val) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    const [r = 0, g = 0, b = 0] = values;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: ratio.toFixed(2),
    normalAACompliant: ratio >= 4.5,
    normalAAACompliant: ratio >= 7,
    largeAACompliant: ratio >= 3,
    largeAAACompliant: ratio >= 4.5,
  };
}

/**
 * Debounce function for better performance with screen readers
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounceForA11y<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number = 500
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format time for screen readers
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTimeForScreenReader(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs === 1 ? 'segundo' : 'segundos'}`);
  }

  return parts.join(', ');
}

/**
 * Handle escape key for closing modals, dropdowns, etc.
 * @param callback - Function to call when escape is pressed
 * @returns Cleanup function
 */
export function handleEscapeKey(callback: () => void): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}