import type { Metadata } from 'next'
import { generateMetadata, SEO_KEYWORDS } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Plantillas Web para Peluquerías | Diseños Profesionales',
  description: '🎨 Descubre 6 plantillas exclusivas para peluquerías. Diseños modernos, elegantes y funcionales con reservas online. Responsive y optimizadas para salones de belleza.',
  keywords: SEO_KEYWORDS.templates.join(', '),
  canonical: '/templates',
  ogImage: '/og-templates.jpg',
  twitterImage: '/twitter-templates.jpg'
})

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}