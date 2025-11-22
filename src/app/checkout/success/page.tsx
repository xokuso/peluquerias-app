'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface CheckoutSession {
  id: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  metadata?: {
    business_name?: string;
    customer_name?: string;
  };
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session_id');
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoLoginStatus, setAutoLoginStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (sessionId) {
      // Fetch session details and attempt auto-login
      fetchSessionDetailsAndAutoLogin(sessionId);
    } else {
      setError('No se encontró el ID de sesión');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchSessionDetailsAndAutoLogin = async (sessionId: string) => {
    try {
      // 1. Fetch session details from Stripe
      const sessionResponse = await fetch(`/api/stripe/session/${sessionId}`);
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
      } else {
        setError('Error al obtener los detalles del pago');
        setLoading(false);
        return;
      }

      // 2. Attempt to retrieve and use auto-login token
      setAutoLoginStatus('processing');
      await performAutoLogin(sessionId);

    } catch (err) {
      console.error('Error in checkout success:', err);
      setError('Error al conectar con el servidor');
      setAutoLoginStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const performAutoLogin = async (sessionId: string) => {
    const maxRetries = 5;
    const retryDelay = 2000; // 2 segundos

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Auto-login attempt ${attempt}/${maxRetries}`);

        // Wait before each attempt (webhook might still be processing)
        await new Promise(resolve => setTimeout(resolve, retryDelay));

        // 1. Get auto-login token for this session
        const tokenResponse = await fetch(`/api/auth/auto-login?session_id=${sessionId}`);

        if (!tokenResponse.ok) {
          console.log(`❌ Attempt ${attempt}: No auto-login token available yet`);

          // If this is the last attempt, mark as failed
          if (attempt === maxRetries) {
            setAutoLoginStatus('failed');
            return;
          }

          // Continue to next attempt
          continue;
        }

        const { token } = await tokenResponse.json();

        // 2. Use the token to authenticate
        const loginResponse = await fetch('/api/auth/auto-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, sessionId }),
        });

        if (!loginResponse.ok) {
          console.log(`❌ Attempt ${attempt}: Auto-login failed`);
          setAutoLoginStatus('failed');
          return;
        }

        const loginData = await loginResponse.json();

        if (loginData.success) {
          console.log('✅ Auto-login successful');
          setAutoLoginStatus('success');

          // The backend already set the session cookie, just redirect
          setTimeout(() => {
            window.location.href = loginData.redirectUrl || '/client/onboarding';
          }, 1500);

          return; // Success! Exit the retry loop
        } else {
          setAutoLoginStatus('failed');
          return;
        }
      } catch (error) {
        console.error(`❌ Auto-login attempt ${attempt} error:`, error);

        // If this is the last attempt, mark as failed
        if (attempt === maxRetries) {
          setAutoLoginStatus('failed');
          return;
        }

        // Continue to next attempt
      }
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading || autoLoginStatus === 'processing') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-700">
            {loading ? 'Verificando tu pago...' : 'Configurando tu cuenta...'}
          </p>
        </div>
      </div>
    );
  }

  if (autoLoginStatus === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
            <CheckCircleIcon className="h-12 w-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Cuenta configurada con éxito!
          </h2>
          <p className="text-gray-600 mb-4">
            Redirigiendo a tu panel de control...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">

          {/* Icono de éxito */}
          <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8">
            <CheckCircleIcon className="h-12 w-12 text-green-400" />
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ¡Pago Completado!
          </h1>

          {/* Mensaje de confirmación */}
          <p className="text-xl text-gray-600 mb-8">
            Tu pago ha sido procesado exitosamente. Ahora puedes configurar los detalles de tu sitio web.
          </p>

          {/* Monto del pago (opcional) */}
          {session && (
            <div className="inline-block px-6 py-3 bg-blue-100 border border-blue-300 rounded-full text-blue-800 font-semibold mb-12">
              Pago confirmado: {formatAmount(session.amount_total, session.currency)}
            </div>
          )}

          {/* Botón principal de configuración */}
          <div className="mb-8">
            {autoLoginStatus === 'failed' ? (
              <>
                <p className="text-amber-600 mb-4">
                  Se ha creado tu cuenta. Por favor, revisa tu email para acceder.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Iniciar sesión
                </Link>
              </>
            ) : (
              <Link
                href="/client/onboarding"
                className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Configurar mi página
              </Link>
            )}
          </div>

          {/* Mensaje adicional */}
          <p className="text-gray-500 text-sm mb-8">
            Tu sitio web será creado una vez que completes la configuración inicial
          </p>

          {/* Enlace secundario */}
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-transparent border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            Volver al inicio
          </Link>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando página de éxito...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}