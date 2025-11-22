import { Wrench, Clock, Mail } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="bg-orange-100 rounded-full p-8 mb-4">
              <Wrench className="w-16 h-16 text-orange-600 mx-auto animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-2">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sitio en
            <span className="block text-orange-600">Mantenimiento</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
            Estamos mejorando nuestros servicios para ofrecerte una mejor experiencia.
            Volveremos muy pronto.
          </p>

          {/* Features List */}
          <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Qué estamos mejorando?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Nuevas plantillas para peluquerías</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Sistema de reservas mejorado</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Panel de administración actualizado</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Optimización de rendimiento</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Mail className="w-5 h-5" />
              <h3 className="text-lg font-semibold">¿Necesitas ayuda urgente?</h3>
            </div>
            <p className="text-orange-100 mb-4">
              Si tienes alguna consulta urgente, no dudes en contactarnos
            </p>
            <a
              href="mailto:soporte@peluquerias-web.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors"
            >
              Contactar Soporte
            </a>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center justify-center space-x-3 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Tiempo estimado de mantenimiento: menos de 2 horas
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-orange-200">
          <p className="text-sm text-gray-500">
            © 2024 PeluqueríasPRO - Creando webs profesionales para peluquerías
          </p>
        </div>
      </div>
    </div>
  );
}