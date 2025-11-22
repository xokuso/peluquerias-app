'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  MailOpen,
  Archive,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Reply,
  AlertCircle
} from 'lucide-react';
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

interface MessageListProps {
  onSelectMessage: (message: Message) => void;
  selectedMessageId?: string | undefined;
  onRefresh?: () => void;
}

export default function MessageList({ onSelectMessage, selectedMessageId, onRefresh }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0
  });

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/messages?${params}`);

      if (!response.ok) {
        throw new Error('Error al cargar mensajes');
      }

      const data = await response.json();
      setMessages(data.messages);
      setTotalPages(data.pagination.totalPages);
      setStats(data.stats);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle bulk actions
  const handleBulkAction = async (action: 'read' | 'unread' | 'archive' | 'delete') => {
    if (selectedMessages.length === 0) return;

    try {
      const endpoint = '/api/admin/messages';
      let method = 'PATCH';
      const body: { messageIds: string[]; status?: string; action?: string } = { messageIds: selectedMessages };

      switch (action) {
        case 'read':
          body.status = 'READ';
          break;
        case 'unread':
          body.status = 'UNREAD';
          break;
        case 'archive':
          body.status = 'ARCHIVED';
          break;
        case 'delete':
          method = 'DELETE';
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setSelectedMessages([]);
        fetchMessages();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Toggle message selection
  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Select all messages
  const toggleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(m => m.id));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `Hace ${minutes} min`;
    } else if (hours < 24) {
      return `Hace ${hours}h`;
    } else if (hours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Get status icon
  const getStatusIcon = (status: ContactStatus) => {
    switch (status) {
      case 'UNREAD':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'READ':
        return <MailOpen className="w-4 h-4 text-gray-600" />;
      case 'REPLIED':
        return <Reply className="w-4 h-4 text-green-600" />;
      case 'ARCHIVED':
        return <Archive className="w-4 h-4 text-purple-600" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: ContactStatus) => {
    const styles = {
      UNREAD: 'bg-blue-100 text-blue-800',
      READ: 'bg-gray-100 text-gray-800',
      REPLIED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-purple-100 text-purple-800'
    };

    const labels = {
      UNREAD: 'No leído',
      READ: 'Leído',
      REPLIED: 'Respondido',
      ARCHIVED: 'Archivado'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-gray-900 font-medium">Error al cargar mensajes</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b px-4 py-3 bg-white">
        {/* Search and filters */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o asunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContactStatus | 'ALL')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">Todos ({stats.total})</option>
            <option value="UNREAD">No leídos ({stats.unread})</option>
            <option value="READ">Leídos ({stats.read})</option>
            <option value="REPLIED">Respondidos ({stats.replied})</option>
            <option value="ARCHIVED">Archivados ({stats.archived})</option>
          </select>

          <button
            onClick={fetchMessages}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Bulk actions */}
        {selectedMessages.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('read')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Marcar como leído
            </button>
            <button
              onClick={() => handleBulkAction('unread')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Marcar como no leído
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Archivar
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No hay mensajes</p>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {/* Select all checkbox */}
            <div className="px-4 py-2 bg-gray-50 flex items-center">
              <input
                type="checkbox"
                checked={selectedMessages.length === messages.length}
                onChange={toggleSelectAll}
                className="mr-3"
              />
              <span className="text-sm text-gray-600">
                Seleccionar todos
              </span>
            </div>

            {/* Message items */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start space-x-3 ${
                  selectedMessageId === message.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                } ${message.status === 'UNREAD' ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectMessage(message)}
              >
                <input
                  type="checkbox"
                  checked={selectedMessages.includes(message.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleMessageSelection(message.id);
                  }}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(message.status)}
                      <span className={`font-medium ${
                        message.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {message.name}
                      </span>
                      {getStatusBadge(message.status)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    {message.email}
                    {message.phone && ` • ${message.phone}`}
                  </div>

                  {message.subject && (
                    <div className="text-sm font-medium text-gray-800 mt-1">
                      {message.subject}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mt-1 truncate">
                    {message.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t px-4 py-3 bg-white flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}