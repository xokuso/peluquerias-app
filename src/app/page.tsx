'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import NoSSR from "@/components/NoSSR";
import StructuredData from "@/components/SEO/StructuredData";
import { generateFAQStructuredData, generateOfferStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';

// Dynamic imports with NoSSR wrapper to prevent hydration issues
const Hero = dynamic(() => import("@/components/sections/Hero"), {
  ssr: false,
  loading: () => (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Consigue tu web perfecta para <span className="text-orange-600">peluquería</span> en solo <span className="text-orange-600">2 minutos</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Diseños profesionales especializados en peluquerías. Setup completo por solo <span className="font-bold text-orange-600">199€</span> <span className="text-sm text-gray-500 line-through">799€</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors">
            Ver mi web en 2 minutos
          </button>
          <button className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors">
            Ver plantillas
          </button>
        </div>
      </div>
    </section>
  )
});

const WhySpecialize = dynamic(() => import("@/components/sections/WhySpecialize"), {
  ssr: false,
  loading: () => (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          ¿Por qué no usar Wix o un freelancer para tu peluquería?
        </h2>
        <p className="text-xl text-gray-600">
          Porque tu negocio es único y necesita soluciones que realmente funcionen para peluquerías
        </p>
      </div>
    </section>
  )
});

// Dynamic imports for non-critical sections with loading states
const TemplatesGallery = dynamic(
  () => import("@/components/sections/TemplatesGallery"),
  {
    loading: () => <div className="min-h-[400px] bg-gray-50 animate-pulse" />,
    ssr: true,
  }
);

const PricingSection = dynamic(
  () => import("@/components/sections/PricingSection"),
  {
    loading: () => <div className="min-h-[300px] bg-white animate-pulse" />,
    ssr: true,
  }
);

const TestimonialsSection = dynamic(
  () => import("@/components/sections/TestimonialsSection"),
  {
    loading: () => <div className="min-h-[200px] bg-gray-50 animate-pulse" />,
    ssr: true,
  }
);

const FAQSection = dynamic(
  () => import("@/components/sections/FAQSection"),
  {
    loading: () => <div className="min-h-[300px] bg-white animate-pulse" />,
    ssr: true,
  }
);

const Footer = dynamic(
  () => import("@/components/sections/Footer"),
  {
    loading: () => <div className="min-h-[200px] bg-gray-900 animate-pulse" />,
    ssr: true,
  }
);

// Client-side analytics wrapper
const AnalyticsWrapper = dynamic(
  () => import("@/components/AnalyticsWrapper"),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  // Structured data for homepage
  const faqData = generateFAQStructuredData([
    {
      question: "¿Cuánto tiempo tarda en estar lista mi web?",
      answer: "Tu página web estará completamente funcional en máximo 48 horas después de proporcionarnos toda la información necesaria."
    },
    {
      question: "¿Incluye sistema de reservas online?",
      answer: "Sí, todas nuestras webs incluyen un sistema completo de reservas online integrado, donde tus clientes podrán agendar citas las 24 horas."
    },
    {
      question: "¿Puedo cambiar de plantilla después?",
      answer: "Sí, puedes cambiar de diseño cuando quieras. Solo te cobraríamos el trabajo de migración de contenido."
    },
    {
      question: "¿Funciona en móviles?",
      answer: "Por supuesto. Todos nuestros diseños son completamente responsive y se adaptan perfectamente a móviles, tablets y computadoras."
    },
    {
      question: "¿Qué incluye el mantenimiento mensual?",
      answer: "Incluye hosting, copias de seguridad, actualizaciones de seguridad, soporte técnico y pequeñas modificaciones de contenido."
    }
  ]);

  const offerData = generateOfferStructuredData([
    {
      name: "Web Profesional para Peluquería - Oferta Especial",
      description: "Setup completo de tu página web profesional para peluquería con precio de lanzamiento",
      price: "199",
      currency: "EUR"
    }
  ]);

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Inicio", url: "/" }
  ]);

  // WebPage structured data for homepage
  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Web para Peluquería Profesional | PeluqueríasPRO",
    "description": "Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas. 6 plantillas específicas para salones de belleza.",
    "url": "https://peluquerias-web.com",
    "mainEntity": {
      "@type": "Service",
      "name": "Diseño Web para Peluquerías",
      "description": "Servicio especializado en crear páginas web profesionales para peluquerías y salones de belleza",
      "provider": {
        "@type": "Organization",
        "name": "PeluqueríasPRO"
      }
    },
    "breadcrumb": breadcrumbData,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".hero-description"]
    }
  };

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={[webPageData, faqData, offerData]} id="homepage" />

      {/* Analytics Wrapper */}
      <AnalyticsWrapper pageName="landing_page" />

      <main>
        {/* Critical above-the-fold content with NoSSR wrapper */}
        <NoSSR>
          <Hero />
          <WhySpecialize />
        </NoSSR>

        {/* Dynamically loaded sections */}
        <Suspense fallback={<div className="min-h-[400px] bg-gray-50" />}>
          <TemplatesGallery onSelectTemplate={(id) => router.push(`/checkout?template=${id}`)} />
        </Suspense>

        <Suspense fallback={<div className="min-h-[300px] bg-white" />}>
          <PricingSection onSelectPlan={() => router.push('/checkout')} />
        </Suspense>

        <Suspense fallback={<div className="min-h-[200px] bg-gray-50" />}>
          <TestimonialsSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-[300px] bg-white" />}>
          <FAQSection />
        </Suspense>

        <Suspense fallback={<div className="min-h-[200px] bg-gray-900" />}>
          <Footer />
        </Suspense>
      </main>
    </>
  );
}