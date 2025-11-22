'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  MailOpen,
  Archive,
  RefreshCw,
  Download,
  MessageSquare,
  ChevronLeft,
  Inbox,
  CheckCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import MessageList from '@/components/admin/messages/MessageList';
import MessageDetail from '@/components/admin/messages/MessageDetail';
import { ContactStatus } from '@prisma/client';

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

interface Stats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/messages?limit=1');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchStats();
    }
  }, [isLoading, refreshKey]);

  // Handle message selection
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchStats();
  };

  // Handle message status change
  const handleStatusChange = () => {
    handleRefresh();
  };

  // Handle message deletion
  const handleDelete = () => {
    setSelectedMessage(null);
    handleRefresh();
  };

  // Export messages
  const exportMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const csv = convertToCSV(data.messages);
        downloadCSV(csv, 'messages_export.csv');
      }
    } catch (error) {
      console.error('Error exporting messages:', error);
    }
  };

  // Convert to CSV
  const convertToCSV = (messages: Message[]) => {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Asunto', 'Mensaje', 'Estado', 'Fecha'];
    const rows = messages.map(msg => [
      msg.id,
      msg.name,
      msg.email,
      msg.phone || '',
      msg.subject || '',
      msg.message.replace(/,/g, ';'),
      msg.status,
      new Date(msg.createdAt).toLocaleDateString('es-ES')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Download CSV
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-7 h-7 mr-2 text-orange-500" />
                  Gestión de Mensajes
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Administra y responde los mensajes de contacto
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dividido
                </button>
              </div>

              {/* Export button */}
              <button
                onClick={exportMessages}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Exportar mensajes"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded">
              <Inbox className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
              <p className="text-xs text-gray-600">No leídos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded">
              <MailOpen className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
              <p className="text-xs text-gray-600">Leídos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.replied}</p>
              <p className="text-xs text-gray-600">Respondidos</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded">
              <Archive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
              <p className="text-xs text-gray-600">Archivados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'list' ? (
          // List view
          <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border overflow-hidden">
            <MessageList
              key={refreshKey}
              onSelectMessage={handleSelectMessage}
              selectedMessageId={selectedMessage?.id}
              onRefresh={handleRefresh}
            />
          </div>
        ) : (
          // Split view
          <>
            <div className="w-full md:w-2/5 lg:w-1/3 bg-white m-4 ml-4 mr-2 rounded-lg shadow-sm border overflow-hidden">
              <MessageList
                key={refreshKey}
                onSelectMessage={handleSelectMessage}
                selectedMessageId={selectedMessage?.id}
                onRefresh={handleRefresh}
              />
            </div>

            <div className="flex-1 bg-white m-4 mr-4 ml-2 rounded-lg shadow-sm border overflow-hidden">
              {selectedMessage ? (
                <MessageDetail
                  key={selectedMessage.id}
                  messageId={selectedMessage.id}
                  onClose={() => setSelectedMessage(null)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona un mensaje
                    </h3>
                    <p className="text-gray-600">
                      Elige un mensaje de la lista para ver sus detalles
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick stats footer */}
      <div className="bg-white border-t px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-gray-600">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Última actualización: {new Date().toLocaleTimeString('es-ES')}
            </span>
            <span>
              Tasa de respuesta: {stats.total > 0 ? Math.round((stats.replied / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Volver al panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}