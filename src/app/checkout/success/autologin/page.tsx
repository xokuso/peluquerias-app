'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface RetryState {
  attempt: number;
  maxAttempts: number;
  nextRetryIn: number;
  totalWaitTime: number;
}

function AutoLoginComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'fallback'>('processing');
  const [message, setMessage] = useState('Configurando tu cuenta...');
  const [retryState, setRetryState] = useState<RetryState | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Exponential backoff with jitter
  const calculateBackoffDelay = (attempt: number): number => {
    const baseDelay = 2000; // 2 seconds
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    return exponentialDelay + jitter;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const attemptAutoLogin = async (sessionId: string, token: string) => {
    try {
      const loginResponse = await fetch('/api/auth/auto-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Retry-Attempt': retryState?.attempt.toString() || '0'
        },
        body: JSON.stringify({ token, sessionId }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Auto-login failed');
      }

      const loginData = await loginResponse.json();

      if (loginData.success) {
        setStatus('success');
        setMessage('¡Cuenta configurada con éxito! Redirigiendo...');

        // Clear any retry state
        setRetryState(null);

        // The API already set the cookie, just redirect
        setTimeout(() => {
          window.location.href = loginData.redirectUrl || '/client/onboarding';
        }, 1500);

        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('Auto-login attempt failed:', error);
      throw error;
    }
  };

  const fetchTokenWithRetries = async (sessionId: string): Promise<string> => {
    const maxAttempts = 8; // Will wait up to ~2-3 minutes total
    let totalWaitTime = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Update retry state for UI feedback
        const nextDelay = attempt < maxAttempts - 1 ? calculateBackoffDelay(attempt) : 0;
        setRetryState({
          attempt: attempt + 1,
          maxAttempts,
          nextRetryIn: Math.ceil(nextDelay / 1000),
          totalWaitTime: Math.ceil(totalWaitTime / 1000)
        });

        // Wait before first attempt (webhook processing time)
        if (attempt === 0) {
          setMessage('Procesando tu pago y configurando tu cuenta...');
          await sleep(5000); // Initial 5 second wait
          totalWaitTime += 5000;
        } else {
          const delay = calculateBackoffDelay(attempt - 1);
          setMessage(`Reintentando en ${Math.ceil(delay / 1000)} segundos... (${attempt}/${maxAttempts})`);

          // Countdown for better UX
          for (let i = Math.ceil(delay / 1000); i > 0; i--) {
            setMessage(`Reintentando en ${i} segundos... (${attempt}/${maxAttempts})`);
            await sleep(1000);
            totalWaitTime += 1000;
          }
        }

        setMessage('Verificando configuración de cuenta...');

        const tokenResponse = await fetch(`/api/auth/auto-login?session_id=${sessionId}`, {
          headers: {
            'X-Retry-Attempt': attempt.toString()
          }
        });

        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();
          console.log(`✅ Token retrieved on attempt ${attempt + 1}`);
          return token;
        }

        // Log the specific error for debugging
        const errorData = await tokenResponse.json().catch(() => ({}));
        console.log(`❌ Token attempt ${attempt + 1} failed:`, {
          status: tokenResponse.status,
          error: errorData.error || 'Unknown error',
          totalWaitTime: Math.ceil(totalWaitTime / 1000) + 's'
        });

        // If we're past attempt 4 and still no token, try fallback creation
        if (attempt >= 3) {
          console.log('🔄 Attempting fallback token creation...');
          try {
            const fallbackResponse = await fetch('/api/auth/auto-login/fallback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });

            if (fallbackResponse.ok) {
              const { token } = await fallbackResponse.json();
              console.log('✅ Fallback token created successfully');
              return token;
            }
          } catch (fallbackError) {
            console.log('❌ Fallback token creation failed:', fallbackError);
          }
        }

      } catch (fetchError) {
        console.error(`❌ Network error on attempt ${attempt + 1}:`, fetchError);

        if (attempt === maxAttempts - 1) {
          throw new Error('Network connectivity issues');
        }
      }
    }

    throw new Error('Max retry attempts exceeded');
  };

  useEffect(() => {
    const performAutoLogin = async () => {
      const sessionId = searchParams?.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setMessage('No se encontró la sesión de pago. Por favor, contacta con soporte.');
        setTimeout(() => router.push('/login'), 5000);
        return;
      }

      try {
        console.log('🚀 Starting auto-login process for session:', sessionId);

        // Step 1: Get the auto-login token with retries
        const token = await fetchTokenWithRetries(sessionId);

        // Step 2: Attempt to login with the token
        setMessage('Iniciando sesión automáticamente...');
        await attemptAutoLogin(sessionId, token);

      } catch (error: any) {
        console.error('❌ Auto-login process failed completely:', error);

        // Show fallback options
        setStatus('fallback');
        setMessage('Tu pago se procesó correctamente, pero hubo un problema técnico con el acceso automático.');
        setShowFallback(true);
        setRetryState(null);
      }
    };

    performAutoLogin();
  }, [searchParams, router]);

  const handleManualLogin = () => {
    router.push(`/login?session_id=${searchParams?.get('session_id')}&auto_verify=true`);
  };

  const handleRetryAutoLogin = () => {
    setStatus('processing');
    setMessage('Reintentando configuración automática...');
    setShowFallback(false);
    setRetryState(null);

    // Restart the auto-login process
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Procesando...</h2>

              {/* Retry information */}
              {retryState && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <div className="font-medium mb-2">Intento {retryState.attempt} de {retryState.maxAttempts}</div>
                  <div className="text-xs text-blue-600">
                    Tiempo transcurrido: {retryState.totalWaitTime}s
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(retryState.attempt / retryState.maxAttempts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">¡Éxito!</h2>
            </>
          )}

          {status === 'fallback' && (
            <>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-orange-700 mb-2">Acceso Manual Necesario</h2>

              {showFallback && (
                <div className="mt-6 space-y-4">
                  <div className="text-left bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">¿Qué ha pasado?</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Tu pago se procesó correctamente y tu cuenta está creada. Solo necesitamos que inicies sesión manualmente.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleManualLogin}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Ir al inicio de sesión
                    </button>

                    <button
                      onClick={handleRetryAutoLogin}
                      className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Reintentar acceso automático
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                    <strong>ID de sesión:</strong> {searchParams?.get('session_id')}<br/>
                    Guarda este ID si necesitas contactar con soporte.
                  </div>
                </div>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>

              <div className="mt-4 p-4 bg-red-50 rounded-lg text-sm text-red-700">
                <p className="mb-3">Por favor, contacta con nuestro equipo de soporte.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Ir al login
                </button>
              </div>
            </>
          )}

          <p className="text-gray-600 mt-4">{message}</p>

          {/* Help text for processing state */}
          {status === 'processing' && (
            <div className="mt-6 text-xs text-gray-500">
              <p>Este proceso puede tardar hasta 3 minutos.</p>
              <p>Por favor, mantén esta página abierta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AutoLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando...</h2>
            <p className="text-gray-600">Preparando tu cuenta...</p>
          </div>
        </div>
      </div>
    }>
      <AutoLoginComponent />
    </Suspense>
  );
}