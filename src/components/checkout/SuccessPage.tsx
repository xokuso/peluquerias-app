"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, Mail, Globe,
  ArrowRight, Download, Clock, Zap, Shield, Send
} from 'lucide-react';

interface PaymentDetails {
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  metadata: {
    salonName?: string;
    ownerName?: string;
    email?: string;
    domainName?: string;
    selectedTemplate?: string;
    hasMigration?: string;
  };
}

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const paymentIntentId = searchParams.get('payment_intent');
  const sessionId = searchParams.get('session_id');

  const fetchPaymentDetails = useCallback(async () => {
    try {
      const id = paymentIntentId || sessionId;
      const response = await fetch(`/api/create-payment-intent?payment_intent_id=${id}`);

      if (!response.ok) {
        throw new Error('Error verificando el pago');
      }

      const data = await response.json();
      setPaymentDetails(data);
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError('Error verificando el pago. Por favor contacta con soporte.');
    } finally {
      setIsLoading(false);
    }
  }, [paymentIntentId, sessionId]);

  useEffect(() => {
    if (!paymentIntentId && !sessionId) {
      setError('No se encontró información del pago');
      setIsLoading(false);
      return;
    }

    fetchPaymentDetails();
  }, [paymentIntentId, sessionId, fetchPaymentDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando tu pago...
          </h2>
          <p className="text-gray-600">
            Esto puede tomar unos segundos
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error verificando pago
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/contact"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contactar soporte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const salonName = paymentDetails?.metadata?.salonName || 'tu peluquería';
  const ownerName = paymentDetails?.metadata?.ownerName || '';
  const email = paymentDetails?.metadata?.email || '';
  const domainName = paymentDetails?.metadata?.domainName || '';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header de éxito */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Pago exitoso!
          </h1>

          <p className="text-xl text-gray-600 mb-2">
            Hemos recibido tu pago de <span className="font-bold text-green-600">{paymentDetails?.amount}€</span>
          </p>

          <p className="text-gray-600">
            Tu web profesional para <strong>{salonName}</strong> está en proceso
          </p>
        </div>

        {/* Email notification banner */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-8">
          <div className="flex items-center">
            <Send className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-700 font-medium">
                Email de confirmación enviado
              </p>
              <p className="text-green-600 text-sm mt-1">
                Revisa tu bandeja de entrada en <strong>{email}</strong>. Si no lo ves, revisa la carpeta de spam.
              </p>
            </div>
          </div>
        </div>

        {/* Información del pedido */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Detalles del pedido
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">INFORMACIÓN DEL NEGOCIO</h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <strong>Peluquería:</strong> {salonName}
                </p>
                <p className="text-gray-900">
                  <strong>Propietario:</strong> {ownerName}
                </p>
                <p className="text-gray-900">
                  <strong>Email:</strong> {email}
                </p>
                {domainName && (
                  <p className="text-gray-900">
                    <strong>Dominio:</strong> {domainName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">DETALLES DEL PAGO</h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <strong>ID de transacción:</strong>
                  <br />
                  <span className="text-sm text-gray-600 font-mono">{paymentDetails?.paymentIntentId}</span>
                </p>
                <p className="text-gray-900">
                  <strong>Estado:</strong> <span className="text-green-600">Confirmado</span>
                </p>
                <p className="text-gray-900">
                  <strong>Total pagado:</strong> {paymentDetails?.amount}€
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">
            ¿Qué sigue ahora?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Confirmación por email (inmediato)
                </h3>
                <p className="text-blue-700 text-sm">
                  Recibirás un email de confirmación en <strong>{email}</strong> con todos los detalles de tu pedido,
                  incluyendo el resumen de tu compra y los próximos pasos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Contacto de nuestro equipo (24-48h)
                </h3>
                <p className="text-blue-700 text-sm">
                  Un especialista se pondrá en contacto contigo para comenzar el desarrollo de tu web.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Desarrollo y lanzamiento (3-5 días)
                </h3>
                <p className="text-blue-700 text-sm">
                  Crearemos tu web profesional y te enviaremos el acceso completo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lo que incluye */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Tu paquete incluye:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Dominio incluido</h3>
              <p className="text-sm text-gray-600">Primer año gratis</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Hosting optimizado</h3>
              <p className="text-sm text-gray-600">Velocidad garantizada</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Certificado SSL</h3>
              <p className="text-sm text-gray-600">Seguridad máxima</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Soporte 24/7</h3>
              <p className="text-sm text-gray-600">Siempre disponible</p>
            </div>
          </div>
        </div>

        {/* Contacto y acciones */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contactar soporte
            </Link>

            <a
              href={`mailto:${email}?subject=Confirmación%20de%20pedido&body=Hola%20${ownerName},%0A%0ATu%20pedido%20para%20${salonName}%20ha%20sido%20confirmado.%0A%0AID:%20${paymentDetails?.paymentIntentId}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar confirmación
            </a>

            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>Volver al inicio</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}