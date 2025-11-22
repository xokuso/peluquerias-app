'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Token de verificación no encontrado')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Email verificado correctamente. Ya puedes iniciar sesión.')
        } else {
          setStatus(data.error === 'TOKEN_EXPIRED' ? 'expired' : 'error')
          setMessage(data.message || 'Error al verificar el email')
        }
      } catch {
        setStatus('error')
        setMessage('Error de conexión. Inténtalo más tarde.')
      }
    }

    verifyEmail()
  }, [token])

  const handleRedirect = () => {
    router.push('/auth/login')
  }

  const handleResendEmail = async () => {
    // Aquí implementarías la lógica para reenviar el email
    setMessage('Función de reenvío no implementada aún')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verificando email...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Email verificado!
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Button onClick={handleRedirect} className="w-full">
              Iniciar sesión
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error de verificación
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button onClick={handleRedirect} variant="outline" className="w-full">
                Ir a iniciar sesión
              </Button>
              <Button onClick={handleResendEmail} variant="ghost" className="w-full text-sm">
                Reenviar email de verificación
              </Button>
            </div>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Token expirado
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button onClick={handleResendEmail} className="w-full">
                Solicitar nuevo email
              </Button>
              <Button onClick={handleRedirect} variant="outline" className="w-full">
                Ir a iniciar sesión
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}