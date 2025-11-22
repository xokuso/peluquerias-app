import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { salonName: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Fetch all orders with filters
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            price: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            salonName: true,
            phone: true,
            city: true
          }
        },
        photos: {
          select: {
            id: true
          }
        },
        businessContent: {
          select: {
            isComplete: true,
            services: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Create CSV content
    const csvHeaders = [
      'ID Pedido',
      'Fecha Creación',
      'Estado',
      'Nombre Salón',
      'Propietario',
      'Email',
      'Teléfono',
      'Dirección',
      'Ciudad',
      'Dominio',
      'Extensión Dominio',
      'Plantilla',
      'Categoría Plantilla',
      'Precio Plantilla',
      'Precio Dominio',
      'Precio Usuario Dominio',
      'Total',
      'Paso Configuración',
      'Configuración Completada',
      'Fecha Completado',
      'Usuario Registrado',
      'Email Usuario',
      'Número de Fotos',
      'Número de Servicios',
      'Contenido Completo',
      'ID Sesión Stripe',
      'ID Pago Stripe'
    ];

    const csvRows = orders.map(order => {
      const userCity = order.user?.city || '';
      const registeredUserEmail = order.user?.email || '';
      const photoCount = order.photos?.length || 0;
      const serviceCount = order.businessContent?.services?.length || 0;
      const contentComplete = order.businessContent?.isComplete ? 'Sí' : 'No';

      return [
        order.id,
        format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        translateStatus(order.status),
        escapeCSV(order.salonName),
        escapeCSV(order.ownerName),
        order.email,
        order.phone,
        escapeCSV(order.address || ''),
        escapeCSV(userCity),
        order.domain,
        order.domainExtension || '',
        escapeCSV(order.template.name),
        order.template.category,
        order.template.price.toFixed(2),
        order.domainPrice?.toFixed(2) || '',
        order.domainUserPrice?.toFixed(2) || '',
        order.total.toFixed(2),
        translateSetupStep(order.setupStep || ''),
        order.setupCompleted ? 'Sí' : 'No',
        order.completedAt ? format(new Date(order.completedAt), 'yyyy-MM-dd HH:mm:ss') : '',
        order.userId ? 'Sí' : 'No',
        registeredUserEmail,
        photoCount.toString(),
        serviceCount.toString(),
        contentComplete,
        order.stripeSessionId || '',
        order.paymentIntentId || ''
      ];
    });

    // Combine headers and rows
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create response with CSV file
    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error exporting orders:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (!value) return '';

  // If the value contains comma, quotes, or newlines, wrap in quotes and escape existing quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

// Helper function to translate status
function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendiente',
    'PROCESSING': 'En Proceso',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
    'REFUNDED': 'Reembolsado'
  };

  return statusMap[status] || status;
}

// Helper function to translate setup step
function translateSetupStep(step: string): string {
  const stepMap: Record<string, string> = {
    'DOMAIN_SELECTION': 'Selección de Dominio',
    'BUSINESS_INFO': 'Información del Negocio',
    'DESIGN_PREFERENCES': 'Preferencias de Diseño',
    'CONTENT_EDITOR': 'Editor de Contenido',
    'PHOTOS_UPLOAD': 'Carga de Fotos',
    'REVIEW_LAUNCH': 'Revisión y Lanzamiento',
    'COMPLETED': 'Completado'
  };

  return stepMap[step] || step;
}

// Alternative GET endpoint for downloading with query parameters
export async function GET(req: NextRequest) {
  // Redirect to POST for consistency
  return POST(req);
}