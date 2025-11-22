import { Suspense } from 'react';
import { Metadata } from 'next';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { generateMetadata, SEO_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Contratar Web Peluquería | Configurar Tu Página',
  description: 'Configura tu página web profesional para peluquerías en solo 3 pasos. Proceso rápido y seguro. Entrega garantizada en 48h. ¡Empieza ahora!',
  keywords: SEO_KEYWORDS.checkout.join(', '),
  canonical: '/checkout',
  noIndex: true // No indexar páginas de checkout por seguridad
});

// Componente de loading para Suspense
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Cargando checkout...
        </h2>
        <p className="text-gray-600">
          Preparando tu formulario de configuración
        </p>
      </div>
    </div>
  );
}

// Página principal del checkout
export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutForm />
      </Suspense>
    </main>
  );
}