/**
 * Analytics Service - Servicio principal para tracking completo
 * Maneja sesiones, eventos, funnels y Facebook Pixel
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { EventCategory, PixelEventType } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  page: string;
  element?: string;
  position?: string;
  // Ecommerce
  revenue?: number;
  currency?: string;
  transactionId?: string;
  itemCategory?: string;
  itemName?: string;
  itemId?: string;
  quantity?: number;
  // Custom properties
  properties?: Record<string, any>;
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface PageViewData {
  path: string;
  title?: string;
  url: string;
  referrer?: string;
  loadTime?: number;
}

export interface FunnelStepData {
  funnelName: string;
  stepName: string;
  stepOrder: number;
  completed?: boolean;
  timeSpent?: number;
  exitPoint?: boolean;
  metadata?: Record<string, any>;
}

export interface FacebookPixelData {
  eventName: PixelEventType;
  eventId?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  customData?: Record<string, any>;
  hashedEmail?: string;
  hashedPhone?: string;
  sourceUrl: string;
}

class AnalyticsService {

  /**
   * Crear o actualizar sesión de usuario
   */
  async createOrUpdateSession(data: SessionData) {
    try {
      const session = await prisma.userSession.upsert({
        where: { sessionId: data.sessionId },
        update: {
          lastActivity: new Date(),
          userId: data.userId || null,
          country: data.country || null,
          city: data.city || null,
          device: data.device || null,
          browser: data.browser || null,
          os: data.os || null,
        },
        create: {
          sessionId: data.sessionId,
          userId: data.userId || null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          country: data.country || null,
          city: data.city || null,
          device: data.device || null,
          browser: data.browser || null,
          os: data.os || null,
          referrer: data.referrer || null,
          utmSource: data.utmSource || null,
          utmMedium: data.utmMedium || null,
          utmCampaign: data.utmCampaign || null,
          utmContent: data.utmContent || null,
          utmTerm: data.utmTerm || null,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating/updating session:', error);
      throw error;
    }
  }

  /**
   * Registrar vista de página
   */
  async trackPageView(sessionId: string, data: PageViewData) {
    try {
      const pageView = await prisma.pageView.create({
        data: {
          sessionId,
          path: data.path,
          title: data.title || null,
          url: data.url,
          referrer: data.referrer || null,
          loadTime: data.loadTime || null,
        },
      });

      // Actualizar contador de páginas vistas en la sesión
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          pageViewCount: { increment: 1 },
          lastActivity: new Date(),
        },
      });

      return pageView;
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
  }

  /**
   * Registrar evento personalizado
   */
  async trackEvent(sessionId: string, event: AnalyticsEvent) {
    try {
      const analyticsEvent = await prisma.analyticsEvent.create({
        data: {
          sessionId,
          name: event.name,
          category: event.category,
          action: event.action,
          label: event.label || null,
          value: event.value || null,
          page: event.page,
          element: event.element || null,
          position: event.position || null,
          revenue: event.revenue || null,
          currency: event.currency || 'EUR',
          transactionId: event.transactionId || null,
          itemCategory: event.itemCategory || null,
          itemName: event.itemName || null,
          itemId: event.itemId || null,
          quantity: event.quantity || null,
          properties: event.properties ? (event.properties as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      return analyticsEvent;
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  /**
   * Registrar paso del funnel
   */
  async trackFunnelStep(sessionId: string, data: FunnelStepData) {
    try {
      const funnelStep = await prisma.funnelStep.create({
        data: {
          sessionId,
          funnelName: data.funnelName,
          stepName: data.stepName,
          stepOrder: data.stepOrder,
          completed: data.completed || false,
          timeSpent: data.timeSpent || null,
          exitPoint: data.exitPoint || false,
          metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
          completedAt: data.completed ? new Date() : null,
        },
      });

      return funnelStep;
    } catch (error) {
      console.error('Error tracking funnel step:', error);
      throw error;
    }
  }

  /**
   * Completar paso del funnel
   */
  async completeFunnelStep(sessionId: string, funnelName: string, stepName: string) {
    try {
      const funnelStep = await prisma.funnelStep.updateMany({
        where: {
          sessionId,
          funnelName,
          stepName,
          completed: false,
        },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });

      return funnelStep;
    } catch (error) {
      console.error('Error completing funnel step:', error);
      throw error;
    }
  }

  /**
   * Marcar punto de salida en funnel
   */
  async markFunnelExit(sessionId: string, funnelName: string, stepName: string) {
    try {
      const funnelStep = await prisma.funnelStep.updateMany({
        where: {
          sessionId,
          funnelName,
          stepName,
        },
        data: {
          exitPoint: true,
        },
      });

      return funnelStep;
    } catch (error) {
      console.error('Error marking funnel exit:', error);
      throw error;
    }
  }

  /**
   * Registrar conversión
   */
  async trackConversion(sessionId: string, type: string, value?: number) {
    try {
      const session = await prisma.userSession.update({
        where: { sessionId },
        data: {
          hasConverted: true,
          conversionValue: value ?? null,
          conversionType: type,
        },
      });

      return session;
    } catch (error) {
      console.error('Error tracking conversion:', error);
      throw error;
    }
  }

  /**
   * Registrar click para heatmap
   */
  async trackClick(page: string, x: number, y: number, element: string, deviceType?: string, screenWidth?: number, screenHeight?: number) {
    try {
      // Buscar si ya existe un click en la misma posición
      const existingClick = await prisma.heatmapData.findFirst({
        where: {
          page,
          xPosition: x,
          yPosition: y,
          elementTag: element,
          deviceType: deviceType || 'desktop',
        },
      });

      if (existingClick) {
        // Incrementar contador
        const updatedClick = await prisma.heatmapData.update({
          where: { id: existingClick.id },
          data: {
            clickCount: { increment: 1 },
          },
        });
        return updatedClick;
      } else {
        // Crear nuevo registro
        const heatmapData = await prisma.heatmapData.create({
          data: {
            page,
            xPosition: x,
            yPosition: y,
            elementTag: element,
            deviceType: deviceType || 'desktop',
            screenWidth: screenWidth ?? null,
            screenHeight: screenHeight ?? null,
            clickCount: 1,
          },
        });
        return heatmapData;
      }
    } catch (error) {
      console.error('Error tracking click:', error);
      throw error;
    }
  }

  /**
   * Registrar evento de Facebook Pixel
   */
  async trackFacebookPixelEvent(sessionId: string | null, data: FacebookPixelData) {
    try {
      const pixelEvent = await prisma.facebookPixelEvent.create({
        data: {
          sessionId: sessionId || null,
          eventName: data.eventName,
          eventId: data.eventId || null,
          value: data.value || null,
          currency: data.currency || 'EUR',
          contentName: data.contentName || null,
          contentCategory: data.contentCategory || null,
          contentIds: data.contentIds ? JSON.stringify(data.contentIds) : null,
          contentType: data.contentType || null,
          numItems: data.numItems || null,
          customData: data.customData ? (data.customData as Prisma.InputJsonValue) : Prisma.JsonNull,
          hashedEmail: data.hashedEmail || null,
          hashedPhone: data.hashedPhone || null,
          sourceUrl: data.sourceUrl,
        },
      });

      return pixelEvent;
    } catch (error) {
      console.error('Error tracking Facebook Pixel event:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de sesión
   */
  async getSession(sessionId: string) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionId },
        include: {
          pageViews: true,
          events: true,
        },
      });

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Finalizar sesión
   */
  async endSession(sessionId: string) {
    try {
      const session = await prisma.userSession.update({
        where: { sessionId },
        data: {
          endTime: new Date(),
          isActive: false,
          duration: await this.calculateSessionDuration(sessionId),
        },
      });

      return session;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Calcular duración de sesión
   */
  private async calculateSessionDuration(sessionId: string): Promise<number> {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionId },
      });

      if (!session) return 0;

      const duration = Math.floor(
        (session.lastActivity.getTime() - session.startTime.getTime()) / 1000
      );

      return duration;
    } catch (error) {
      console.error('Error calculating session duration:', error);
      return 0;
    }
  }

  /**
   * Obtener métricas del funnel
   */
  async getFunnelMetrics(funnelName: string, dateFrom?: Date, dateTo?: Date) {
    try {
      const whereClause: any = { funnelName };

      if (dateFrom && dateTo) {
        whereClause.enteredAt = {
          gte: dateFrom,
          lte: dateTo,
        };
      }

      const steps = await prisma.funnelStep.groupBy({
        by: ['stepName', 'stepOrder'],
        where: whereClause,
        _count: {
          sessionId: true,
        },
      });

      const completedSteps = await prisma.funnelStep.groupBy({
        by: ['stepName', 'stepOrder'],
        where: {
          ...whereClause,
          completed: true,
        },
        _count: {
          sessionId: true,
        },
      });

      const exitPoints = await prisma.funnelStep.groupBy({
        by: ['stepName', 'stepOrder'],
        where: {
          ...whereClause,
          exitPoint: true,
        },
        _count: {
          sessionId: true,
        },
      });

      return {
        steps: steps.sort((a, b) => a.stepOrder - b.stepOrder),
        completedSteps: completedSteps.sort((a, b) => a.stepOrder - b.stepOrder),
        exitPoints: exitPoints.sort((a, b) => a.stepOrder - b.stepOrder),
      };
    } catch (error) {
      console.error('Error getting funnel metrics:', error);
      throw error;
    }
  }

  /**
   * Limpiar conexiones de base de datos
   */
  async disconnect() {
    await prisma.$disconnect();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;