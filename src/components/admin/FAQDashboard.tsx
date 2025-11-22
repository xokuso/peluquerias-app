'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { exportFAQData, getFAQDashboard } from '@/utils/faqAnalytics';

const FAQDashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    totalEngagement: number;
    uniqueQuestionsViewed: number;
    topQuestion?: { faqId: string; views: number };
    engagementScore: number;
    conversionLikelihood: number;
    recommendations: Array<{
      type: string;
      message: string;
      priority: 'urgent' | 'high' | 'medium';
    }>;
  } | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    const updateDashboard = () => {
      const data = getFAQDashboard();
      setDashboardData(data);
    };

    // Initial load
    updateDashboard();

    // Real-time updates if enabled
    let interval: NodeJS.Timeout;
    if (isRealTime) {
      interval = setInterval(updateDashboard, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTime]);

  const handleExportData = () => {
    const data = exportFAQData();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faq-analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!dashboardData) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <div className="text-center text-gray-600">
          No hay datos de FAQ disponibles aún.
          <br />
          <small>Los datos aparecerán cuando los usuarios interactúen con las FAQ.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">FAQ Analytics Dashboard</h2>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRealTime(!isRealTime)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isRealTime
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {isRealTime ? '🟢 Live' : '⚪ Static'}
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Exportar Datos
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-amber-600" />
            <div>
              <div className="text-2xl font-bold text-amber-900">
                {dashboardData.totalEngagement}
              </div>
              <div className="text-sm text-amber-700">Interacciones Totales</div>
            </div>
          </div>
        </motion.div>

        {/* Questions Viewed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <MousePointer className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-900">
                {dashboardData.uniqueQuestionsViewed}
              </div>
              <div className="text-sm text-green-700">Preguntas Únicas Vistas</div>
            </div>
          </div>
        </motion.div>

        {/* Engagement Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {dashboardData.engagementScore}%
              </div>
              <div className="text-sm text-orange-700">Score de Engagement</div>
            </div>
          </div>
        </motion.div>

        {/* Conversion Likelihood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {dashboardData.conversionLikelihood}%
              </div>
              <div className="text-sm text-purple-700">Probabilidad Conversión</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Question */}
      {dashboardData.topQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <h3 className="font-semibold text-yellow-900 mb-2">Pregunta Más Vista</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-yellow-800">ID: {dashboardData.topQuestion.faqId}</div>
              <div className="text-sm text-yellow-700">{dashboardData.topQuestion.views} visualizaciones</div>
            </div>
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {dashboardData.recommendations && dashboardData.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h3 className="font-semibold text-gray-900">Recomendaciones de Optimización</h3>
          {dashboardData.recommendations.map((rec, index: number) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                rec.priority === 'urgent'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : rec.priority === 'high'
                  ? 'bg-orange-50 border-orange-400 text-orange-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {rec.priority === 'urgent' && <ArrowUp className="w-5 h-5 mt-0.5" />}
                {rec.priority === 'high' && <ArrowUp className="w-5 h-5 mt-0.5" />}
                {rec.priority === 'medium' && <ArrowDown className="w-5 h-5 mt-0.5" />}
                <div>
                  <div className="font-medium">{rec.type.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm">{rec.message}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Conversion Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Engagement Breakdown */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Engagement Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Interacciones:</span>
              <span className="font-medium">{dashboardData.totalEngagement}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Preguntas Exploradas:</span>
              <span className="font-medium">{dashboardData.uniqueQuestionsViewed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Score de Engagement:</span>
              <span className={`font-medium ${
                dashboardData.engagementScore > 60 ? 'text-green-600' :
                dashboardData.engagementScore > 30 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {dashboardData.engagementScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Signals */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Señales de Conversión</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Probabilidad Conversión:</span>
              <span className={`font-medium ${
                dashboardData.conversionLikelihood > 70 ? 'text-green-600' :
                dashboardData.conversionLikelihood > 40 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {dashboardData.conversionLikelihood}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {dashboardData.conversionLikelihood > 70 && "🎯 Usuario altamente comprometido - mostrar CTA"}
              {dashboardData.conversionLikelihood > 40 && dashboardData.conversionLikelihood <= 70 && "📈 Usuario moderadamente interesado"}
              {dashboardData.conversionLikelihood <= 40 && "📋 Necesita más información"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Real-time Status */}
      {isRealTime && (
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Actualizando en tiempo real cada 5 segundos
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQDashboard;