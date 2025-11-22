// Global type declarations
declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    fbq: (action: string, event?: string, data?: unknown) => void;
    dataLayer: unknown[];
  }
}

export {};