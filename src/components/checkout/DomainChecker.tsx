"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Loader2, Globe, AlertCircle, Lightbulb } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface DomainCheckResult {
  available: boolean;
  domain: string;
  price?: number;
  suggestions?: string[];
  error?: string;
}

interface DomainCheckerProps {
  value: string;
  extension: '.es' | '.com';
  onChange: (value: string) => void;
  onExtensionChange: (extension: '.es' | '.com') => void;
  onValidDomain?: (domain: string, available: boolean) => void;
  error?: string | undefined;
}

export default function DomainChecker({
  value,
  extension,
  onChange,
  onExtensionChange,
  onValidDomain,
  error
}: DomainCheckerProps) {
  const [checkResult, setCheckResult] = useState<DomainCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce para evitar requests excesivos
  const debouncedDomain = useDebounce(value, 800);

  // Función para verificar disponibilidad de dominio
  const checkDomainAvailability = useCallback(async (domain: string, ext: string) => {
    if (!domain || domain.length < 2) {
      setCheckResult(null);
      return;
    }

    setIsChecking(true);
    setSuggestions([]);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/check-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain.toLowerCase(),
          extension: ext
        })
      });

      const result: DomainCheckResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error verificando dominio');
      }

      setCheckResult(result);

      // Notificar al componente padre sobre la validez del dominio
      if (onValidDomain) {
        onValidDomain(result.domain, result.available);
      }

      // Si no está disponible y hay sugerencias, mostrarlas
      if (!result.available && result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      }

    } catch (error) {
      console.error('Error checking domain:', error);
      setCheckResult({
        available: false,
        domain: `${domain}${ext}`,
        error: error instanceof Error ? error.message : 'Error verificando dominio'
      });
    } finally {
      setIsChecking(false);
    }
  }, [onValidDomain]);

  // Efecto para verificar dominio cuando cambia el valor debounced
  useEffect(() => {
    if (debouncedDomain) {
      checkDomainAvailability(debouncedDomain, extension);
    }
  }, [debouncedDomain, extension, checkDomainAvailability]);

  // Función para seleccionar una sugerencia
  const selectSuggestion = (suggestedDomain: string) => {
    const domainWithoutExtension = suggestedDomain.replace(/\.(com|es)$/, '');
    onChange(domainWithoutExtension);
    setShowSuggestions(false);
  };

  // Función para validar input en tiempo real
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.toLowerCase();

    // Remover caracteres no válidos
    inputValue = inputValue.replace(/[^a-zA-Z0-9-]/g, '');

    // No permitir guión al inicio o al final
    inputValue = inputValue.replace(/^-|-$/g, '');

    onChange(inputValue);
  };

  const getDomainStatusIcon = () => {
    if (isChecking) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (checkResult?.error) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (checkResult?.available) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (checkResult && !checkResult.available) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Search className="w-5 h-5 text-gray-400" />;
  };

  const getDomainStatusMessage = () => {
    if (isChecking) return "Verificando disponibilidad...";
    if (checkResult?.error) return checkResult.error;
    if (checkResult?.available) return `¡Disponible! ${checkResult.price ? `- ${checkResult.price}€/año` : ''}`;
    if (checkResult && !checkResult.available) return "No disponible";
    return "Introduce un nombre de dominio";
  };

  const getStatusColor = () => {
    if (isChecking) return "text-blue-600";
    if (checkResult?.error) return "text-red-600";
    if (checkResult?.available) return "text-green-600";
    if (checkResult && !checkResult.available) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-4">
      {/* Input principal del dominio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dominio deseado
        </label>

        <div className="flex rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <div className="flex items-center px-3">
            <Globe className="w-5 h-5 text-gray-400" />
          </div>

          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="mi-peluqueria"
            className="flex-1 px-3 py-3 border-0 focus:outline-none rounded-none"
            maxLength={50}
          />

          <select
            value={extension}
            onChange={(e) => onExtensionChange(e.target.value as '.es' | '.com')}
            className="px-3 py-3 border-l border-gray-300 bg-gray-50 text-gray-700 focus:outline-none focus:bg-white"
          >
            <option value=".com">.com</option>
            <option value=".es">.es</option>
          </select>

          <div className="flex items-center px-3">
            {getDomainStatusIcon()}
          </div>
        </div>

        {/* Mensaje de estado */}
        <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
          <span>{getDomainStatusMessage()}</span>
        </div>

        {/* Error del formulario */}
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Vista previa del dominio completo */}
      {value && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600">Tu dominio será:</p>
          <p className="font-medium text-gray-900">
            https://{value}{extension}
          </p>
        </div>
      )}

      {/* Sugerencias de dominios alternativos */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-amber-600">
            <Lightbulb className="w-4 h-4" />
            <span>Dominios alternativos disponibles:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                    {suggestion}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Disponible - Hacer clic para seleccionar
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSuggestions(false)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Ocultar sugerencias
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• El dominio puede contener letras, números y guiones</p>
        <p>• No puede empezar o terminar con guión</p>
        <p>• El primer año está incluido en el setup inicial</p>
      </div>
    </div>
  );
}

// Hook personalizado para debounce
// Si no existe, crear en hooks/useDebounce.ts