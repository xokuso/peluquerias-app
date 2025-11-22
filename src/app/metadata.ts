import { Metadata } from 'next';
import { generateMetadata, SEO_KEYWORDS } from '@/lib/seo';

// Enhanced metadata for homepage with better SEO targeting
export const metadata: Metadata = generateMetadata({
  title: 'Web para Peluquería Profesional | Desde 199€',
  description: '🌟 Crea la web de tu peluquería en 48h. Diseño profesional, reservas online, gestión de citas. 6 plantillas exclusivas para salones de belleza. ¡Empieza hoy desde 199€!',
  keywords: SEO_KEYWORDS.homepage.join(', '),
  canonical: '/',
  ogImage: '/og-homepage.jpg',
  twitterImage: '/twitter-homepage.jpg'
});