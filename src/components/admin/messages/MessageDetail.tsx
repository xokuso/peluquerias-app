'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  User,
  Reply,
  Archive,
  Trash2,
  MailOpen,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { ContactStatus } from '@prisma/client';
import MessageReplyComposer from './MessageReplyComposer';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

interface MessageDetailProps {
  messageId: string;
  onClose?: () => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

export default function MessageDetail({ messageId, onClose, onStatusChange, onDelete }: MessageDetailProps) {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch message details
  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`);

      if (!response.ok) {
        throw new Error('Error al cargar el mensaje');
      }

      const data = await response.json();
      setMessage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    if (messageId) {
      fetchMessage();
    }
  }, [messageId, fetchMessage]);

  // Update message status
  const updateStatus = async (newStatus: ContactStatus) => {
    if (!message) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage({ ...message, status: newStatus });
        if (onStatusChange) onStatusChange();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete message
  const deleteMessage = async () => {
    if (!message || !confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (onDelete) onDelete();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status info
  const getStatusInfo = (status: ContactStatus) => {
    switch (status) {
      case 'UNREAD':
        return {
          label: 'No leído',
          color: 'bg-blue-100 text-blue-800',
          icon: <Mail className="w-4 h-4" />
        };
      case 'READ':
        return {
          label: 'Leído',
          color: 'bg-gray-100 text-gray-800',
          icon: <MailOpen className="w-4 h-4" />
        };
      case 'REPLIED':
        return {
          label: 'Respondido',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'ARCHIVED':
        return {
          label: 'Archivado',
          color: 'bg-purple-100 text-purple-800',
          icon: <Archive className="w-4 h-4" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: <Mail className="w-4 h-4" />
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando mensaje...</p>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-gray-900 font-medium">Error al cargar el mensaje</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={fetchMessage}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(message.status);

  if (showReplyComposer) {
    return (
      <MessageReplyComposer
        message={message}
        onClose={() => setShowReplyComposer(false)}
        onSent={() => {
          setShowReplyComposer(false);
          updateStatus('REPLIED');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">Detalle del Mensaje</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 ${statusInfo.color}`}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status actions */}
            {message.status !== 'UNREAD' && (
              <button
                onClick={() => updateStatus('UNREAD')}
                disabled={actionLoading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Marcar como no leído"
              >
                <Mail className="w-5 h-5" />
              </button>
            )}
            {message.status === 'UNREAD' && (
              <button
                onClick={() => updateStatus('READ')}
                disabled={actionLoading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Marcar como leído"
              >
                <MailOpen className="w-5 h-5" />
              </button>
            )}
            {message.status !== 'ARCHIVED' && (
              <button
                onClick={() => updateStatus('ARCHIVED')}
                disabled={actionLoading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Archivar"
              >
                <Archive className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={deleteMessage}
              disabled={actionLoading}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Message content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Sender information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Información del Remitente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-gray-900">{message.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a
                  href={`mailto:${message.email}`}
                  className="font-medium text-orange-600 hover:text-orange-700"
                >
                  {message.email}
                </a>
              </div>
            </div>
            {message.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <a
                    href={`tel:${message.phone}`}
                    className="font-medium text-orange-600 hover:text-orange-700"
                  >
                    {message.phone}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Fecha de envío</p>
                <p className="font-medium text-gray-900">{formatFullDate(message.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message subject */}
        {message.subject && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Asunto</h3>
            <p className="text-lg font-medium text-gray-900">{message.subject}</p>
          </div>
        )}

        {/* Message body */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Mensaje</h3>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
          <p>Recibido: {formatFullDate(message.createdAt)}</p>
          {message.updatedAt !== message.createdAt && (
            <p>Última actualización: {formatFullDate(message.updatedAt)}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t px-6 py-4">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowReplyComposer(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-2"
            >
              <Reply className="w-5 h-5" />
              <span>Responder</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}