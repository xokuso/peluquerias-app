import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GoogleAnalytics, FacebookPixel, CookieConsent } from '@/components/Analytics';
import AuthSessionProvider from '@/components/providers/SessionProvider';
import NavbarWrapper from '@/components/navigation/NavbarWrapper';


// Font optimization with preload and display swap
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap',
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
  preload: true,
});

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Web para Peluquería Profesional | Desde 199€ | PeluqueríasPRO",
  description: "✨ Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas. 6 plantillas específicas para salones de belleza. ¡Empieza hoy!",
  keywords: "web peluquería, página web salón belleza, diseño web peluquerías, plantillas web peluquería, reservas online peluquería, web peluquería profesional, crear web peluquería, diseño web salones belleza",
  authors: [{ name: "PeluqueríasPRO" }],
  creator: "PeluqueríasPRO",
  publisher: "PeluqueríasPRO",
  metadataBase: new URL('https://peluquerias-web.com'),
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/',
    },
  },
  openGraph: {
    title: "Web para Peluquería Profesional | Desde 199€ | PeluqueríasPRO",
    description: "✨ Transforma tu peluquería con una web profesional. 6 plantillas específicas, reservas online, gestión completa. 48h de entrega garantizada.",
    url: 'https://peluquerias-web.com',
    siteName: 'PeluqueríasPRO',
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Web profesional para peluquerías - PeluqueríasPRO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Web para Peluquería Profesional | Desde 199€",
    description: "✨ Crea la web de tu peluquería en 48h. Plantillas específicas, reservas online, gestión completa.",
    images: ['/twitter-image.jpg'],
    creator: '@PeluqueriasPRO',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
};

// Organization structured data
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PeluqueríasPRO",
  "url": "https://peluquerias-web.com",
  "logo": "https://peluquerias-web.com/logo.png",
  "description": "Creamos páginas web profesionales para peluquerías y salones de belleza en España. Diseños especializados con sistema de reservas online.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+34-XXX-XXX-XXX",
    "contactType": "customer service",
    "availableLanguage": ["Spanish"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES"
  },
  "sameAs": [
    "https://www.facebook.com/peluqueriaspro",
    "https://www.instagram.com/peluqueriaspro",
    "https://www.linkedin.com/company/peluqueriaspro"
  ],
  "areaServed": "ES",
  "serviceType": "Web Design for Hair Salons"
};

// Service structured data
const serviceStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Diseño Web para Peluquerías",
  "description": "Creación de páginas web profesionales para peluquerías y salones de belleza con sistema de reservas online, galería de trabajos y gestión de citas.",
  "provider": {
    "@type": "Organization",
    "name": "PeluqueríasPRO"
  },
  "areaServed": "ES",
  "offers": [
    {
      "@type": "Offer",
      "name": "Web Peluquería Básica",
      "price": "199",
      "priceCurrency": "EUR",
      "description": "Setup inicial + plantilla personalizada",
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "name": "Mantenimiento Mensual",
      "price": "49",
      "priceCurrency": "EUR",
      "description": "Hosting, mantenimiento y soporte técnico",
      "availability": "https://schema.org/InStock"
    }
  ],
  "serviceType": "Website Development",
  "category": "Web Design"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth overflow-x-hidden">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />

        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        {/* Service Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden max-w-full`}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50"
        >
          Saltar al contenido principal
        </a>

        {/* Analytics components */}
        <GoogleAnalytics />
        <FacebookPixel />

        {/* Web Vitals monitoring */}
        {/* <WebVitals /> */}

        {/* Main application */}
        <div id="main-content" className="overflow-x-hidden max-w-full">
          <AuthSessionProvider>
            <NavbarWrapper />
            {children}
          </AuthSessionProvider>
        </div>

        {/* Cookie consent */}
        <CookieConsent />
      </body>
    </html>
  );
}