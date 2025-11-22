import { NextRequest, NextResponse } from 'next/server';

// Mock templates data - en producción esto vendría de la base de datos
const templates = [
  {
    id: 'elegance-studio',
    name: 'Elegance Studio',
    category: 'Elegante',
    image: '/api/placeholder/400/300',
    features: ['Reservas online', 'Galería premium', 'Blog integrado', 'SEO optimizado'],
    popular: true,
    originalPrice: 299,
    discountedPrice: 209,
    description: 'Diseño sofisticado perfecto para peluquerías de alta gama'
  },
  {
    id: 'modern-cut',
    name: 'Modern Cut',
    category: 'Moderno',
    image: '/api/placeholder/400/300',
    features: ['Diseño responsive', 'Animaciones CSS', 'SEO optimizado', 'Galería interactiva'],
    recommended: true,
    originalPrice: 299,
    discountedPrice: 209,
    description: 'Template contemporáneo con líneas limpias y funcionalidad avanzada'
  },
  {
    id: 'beauty-salon',
    name: 'Beauty Salon',
    category: 'Clásico',
    image: '/api/placeholder/400/300',
    features: ['Estilo atemporal', 'Fácil navegación', 'Multidioma', 'Sistema de citas'],
    originalPrice: 299,
    discountedPrice: 209,
    description: 'Diseño tradicional y elegante que nunca pasa de moda'
  },
  {
    id: 'minimal-hair',
    name: 'Minimal Hair',
    category: 'Minimalista',
    image: '/api/placeholder/400/300',
    features: ['Diseño limpio', 'Carga rápida', 'Mobile-first', 'Portfolio integrado'],
    originalPrice: 299,
    discountedPrice: 209,
    description: 'Menos es más. Diseño minimalista que destaca tu trabajo'
  }
];

export async function GET(request: NextRequest) {
  try {
    // En el futuro, aquí puedes agregar filtros, búsqueda, etc.
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    // const _active = searchParams.get('active');

    let filteredTemplates = [...templates];

    // Filtrar por categoría si se especifica
    if (category) {
      filteredTemplates = filteredTemplates.filter(
        template => template.category.toLowerCase() === category.toLowerCase()
      );
    }

    // En el futuro, podrías agregar filtros por activo/inactivo
    // if (active !== null) {
    //   const isActive = active === 'true';
    //   filteredTemplates = filteredTemplates.filter(template => template.active === isActive);
    // }

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length
    });

  } catch (error) {
    console.error('Error fetching templates:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

// GET individual template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template ID es requerido'
        },
        { status: 400 }
      );
    }

    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template no encontrado'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    });

  } catch (error) {
    console.error('Error fetching template:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}