import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string
  canonical?: string
  ogImage?: string
  twitterImage?: string
  noIndex?: boolean
  structuredData?: object
}

const DEFAULT_DOMAIN = 'https://peluquerias-web.com'
const DEFAULT_TITLE = 'PeluqueríasPRO - Web Profesional para Peluquerías'
const DEFAULT_DESCRIPTION = 'Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas. 6 plantillas específicas para salones de belleza.'
const DEFAULT_KEYWORDS = 'web peluquería, página web salón belleza, diseño web peluquerías, plantillas web peluquería, reservas online peluquería'

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = DEFAULT_KEYWORDS,
    canonical,
    ogImage = '/og-image.jpg',
    twitterImage = '/twitter-image.jpg',
    noIndex = false,
  } = config

  const fullTitle = title.includes('PeluqueríasPRO') ? title : `${title} | PeluqueríasPRO`
  const canonicalUrl = canonical ? `${DEFAULT_DOMAIN}${canonical}` : undefined

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: "PeluqueríasPRO" }],
    creator: "PeluqueríasPRO",
    publisher: "PeluqueríasPRO",
    metadataBase: new URL(DEFAULT_DOMAIN),
    openGraph: {
      title: fullTitle,
      description,
      ...(canonicalUrl && { url: canonicalUrl }),
      siteName: 'PeluqueríasPRO',
      type: "website",
      locale: "es_ES",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - PeluqueríasPRO`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle.replace(' | PeluqueríasPRO', ''),
      description,
      images: [twitterImage],
      creator: '@PeluqueriasPRO',
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
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
  }

  // Add alternates conditionally
  if (canonical) {
    metadata.alternates = {
      canonical: canonical,
      languages: {
        'es-ES': canonical,
      },
    }
  }

  return metadata
}

/**
 * Generate structured data for FAQ section
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generate structured data for product/service offerings
 */
export function generateOfferStructuredData(offers: Array<{
  name: string
  description: string
  price: string
  currency?: string
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": offers.map((offer, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "name": offer.name,
      "description": offer.description,
      "price": offer.price,
      "priceCurrency": offer.currency || "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "PeluqueríasPRO"
      }
    }))
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string
  url: string
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": `${DEFAULT_DOMAIN}${breadcrumb.url}`
    }))
  }
}

/**
 * Generate local business structured data for salon owners
 */
export function generateLocalBusinessStructuredData(business: {
  name: string
  address: string
  city: string
  phone: string
  website: string
  description: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": business.name,
    "description": business.description,
    "url": business.website,
    "telephone": business.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.city,
      "addressCountry": "ES"
    },
    "openingHours": "Mo-Sa 09:00-20:00",
    "priceRange": "€€",
    "acceptsReservations": true
  }
}

/**
 * SEO keywords by page/section for better targeting
 */
export const SEO_KEYWORDS = {
  homepage: [
    'web para peluquería',
    'diseño web peluquerías',
    'página web salón belleza',
    'web peluquería profesional',
    'plantillas web peluquería',
    'reservas online peluquería',
    'crear web peluquería'
  ],
  templates: [
    'plantillas web peluquería',
    'diseños web salones belleza',
    'templates peluquería responsive',
    'diseño web moderno peluquería',
    'plantillas profesionales salón'
  ],
  checkout: [
    'contratar web peluquería',
    'precio web peluquería',
    'desarrollo web salón belleza'
  ]
} as const

/**
 * Generate optimized title for specific page types
 */
export function generateOptimizedTitle(
  type: 'homepage' | 'templates' | 'checkout' | 'custom',
  customTitle?: string
): string {
  switch (type) {
    case 'homepage':
      return 'Web para Peluquería Profesional | Desde 199€ | PeluqueríasPRO'
    case 'templates':
      return 'Plantillas Web para Peluquerías | Diseños Profesionales | PeluqueríasPRO'
    case 'checkout':
      return 'Contratar Web Peluquería | Configurar Tu Página | PeluqueríasPRO'
    case 'custom':
      return customTitle ? `${customTitle} | PeluqueríasPRO` : DEFAULT_TITLE
    default:
      return DEFAULT_TITLE
  }
}

/**
 * Generate optimized description for specific page types
 */
export function generateOptimizedDescription(
  type: 'homepage' | 'templates' | 'checkout' | 'custom',
  customDescription?: string
): string {
  switch (type) {
    case 'homepage':
      return 'Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas. 6 plantillas específicas para salones de belleza. Desde 199€ + 49€/mes.'
    case 'templates':
      return 'Descubre nuestras plantillas web especializadas para peluquerías. Diseños modernos, responsive y optimizados para salones de belleza. Elige tu estilo ideal.'
    case 'checkout':
      return 'Configura tu página web profesional para peluquerías en solo 3 pasos. Setup rápido, plantillas exclusivas y entrega garantizada en 48h.'
    case 'custom':
      return customDescription || DEFAULT_DESCRIPTION
    default:
      return DEFAULT_DESCRIPTION
  }
}