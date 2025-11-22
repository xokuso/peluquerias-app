'use client';

import { useState } from 'react';
import {
  X,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  ArrowLeft
} from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  createdAt: string;
}

interface MessageReplyComposerProps {
  message: Message;
  onClose: () => void;
  onSent: () => void;
}

export default function MessageReplyComposer({ message, onClose, onSent }: MessageReplyComposerProps) {
  const [subject, setSubject] = useState(`Re: ${message.subject || 'Tu consulta'}`);
  const [replyContent, setReplyContent] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-filled templates
  const templates = [
    {
      name: 'Respuesta estándar',
      content: `Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.\n\nSi necesitas asistencia inmediata, no dudes en llamarnos al teléfono que encontrarás en nuestra página web.`
    },
    {
      name: 'Solicitud de información',
      content: `Gracias por tu interés en nuestros servicios. Para poder ayudarte mejor, necesitaríamos algunos detalles adicionales:\n\n- [Información necesaria]\n- [Otra información]\n\nQuedamos a la espera de tu respuesta.`
    },
    {
      name: 'Confirmación de cita',
      content: `Tu solicitud ha sido procesada correctamente. Te confirmaremos los detalles por esta vía en las próximas 24 horas.\n\nMientras tanto, si tienes alguna pregunta adicional, no dudes en contactarnos.`
    },
    {
      name: 'Problema resuelto',
      content: `Nos complace informarte que el problema que reportaste ha sido resuelto. Por favor, verifica y haznos saber si todo funciona correctamente.\n\nSi encuentras algún otro problema, no dudes en contactarnos nuevamente.`
    }
  ];

  // Insert template
  const insertTemplate = (templateContent: string) => {
    setReplyContent(templateContent);
  };

  // Send reply
  const sendReply = async () => {
    if (!replyContent.trim()) {
      setError('El contenido del mensaje es requerido');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/messages/${message.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          replyContent,
          cc: cc.trim() || undefined,
          bcc: bcc.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al enviar la respuesta');
      }

      setSuccess(true);
      setTimeout(() => {
        onSent();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al enviar');
    } finally {
      setSending(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Respuesta enviada!</h3>
          <p className="text-gray-600">El mensaje ha sido enviado correctamente a {message.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Redactar Respuesta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compose form */}
      <div className="flex-1 overflow-y-auto">
        {/* Recipient info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="space-y-3">
            <div className="flex items-center">
              <label className="w-20 text-sm font-medium text-gray-700">Para:</label>
              <div className="flex-1 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{message.name}</span>
                <span className="text-gray-600">&lt;{message.email}&gt;</span>
              </div>
            </div>

            {/* CC/BCC toggle */}
            {!showCcBcc && (
              <button
                onClick={() => setShowCcBcc(true)}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Agregar CC/BCC
              </button>
            )}

            {/* CC/BCC fields */}
            {showCcBcc && (
              <>
                <div className="flex items-center">
                  <label className="w-20 text-sm font-medium text-gray-700">CC:</label>
                  <input
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-20 text-sm font-medium text-gray-700">BCC:</label>
                  <input
                    type="email"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}

            <div className="flex items-center">
              <label className="w-20 text-sm font-medium text-gray-700">Asunto:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Plantillas rápidas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(template.content)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* Message composer */}
        <div className="px-6 py-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            className="w-full h-64 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          {/* Original message */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm font-medium text-gray-700 mb-2">
              El {formatDate(message.createdAt)}, {message.name} escribió:
            </p>
            <div className="text-sm text-gray-600 pl-4 border-l-2 border-gray-300">
              {message.subject && (
                <p className="font-medium mb-2">Asunto: {message.subject}</p>
              )}
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-3">
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {replyContent.length > 0 && (
              <span>{replyContent.length} caracteres</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={sendReply}
              disabled={sending || !replyContent.trim()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar respuesta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}