/**
 * Funnel Tracker - Sistema especializado para tracking de funnels de conversión
 * Rastrea exactamente dónde abandonan los usuarios en el proceso de compra
 */

import analyticsService from './analytics-service';
import { EventCategory } from '@prisma/client';

export interface FunnelDefinition {
  name: string;
  steps: FunnelStepDefinition[];
}

export interface FunnelStepDefinition {
  name: string;
  order: number;
  required: boolean;
  timeout?: number; // Tiempo máximo esperado en este paso (segundos)
}

// Definición de funnels principales de la aplicación
export const FUNNELS = {
  MAIN_PURCHASE: {
    name: 'main_purchase',
    steps: [
      { name: 'landing', order: 1, required: true },
      { name: 'template_selection', order: 2, required: true },
      { name: 'info_form', order: 3, required: true, timeout: 300 },
      { name: 'payment', order: 4, required: true, timeout: 600 },
      { name: 'confirmation', order: 5, required: true },
    ],
  } as FunnelDefinition,

  OFERTA_PURCHASE: {
    name: 'oferta_purchase',
    steps: [
      { name: 'oferta_landing', order: 1, required: true },
      { name: 'template_selection', order: 2, required: true },
      { name: 'info_form', order: 3, required: true, timeout: 300 },
      { name: 'payment', order: 4, required: true, timeout: 600 },
      { name: 'confirmation', order: 5, required: true },
    ],
  } as FunnelDefinition,

  CONTACT_FUNNEL: {
    name: 'contact_funnel',
    steps: [
      { name: 'contact_page', order: 1, required: true },
      { name: 'form_started', order: 2, required: true },
      { name: 'form_completed', order: 3, required: true },
      { name: 'form_submitted', order: 4, required: true },
    ],
  } as FunnelDefinition,

  SIGNUP_FUNNEL: {
    name: 'signup_funnel',
    steps: [
      { name: 'signup_page', order: 1, required: true },
      { name: 'form_started', order: 2, required: true },
      { name: 'email_entered', order: 3, required: true },
      { name: 'password_entered', order: 4, required: true },
      { name: 'form_submitted', order: 5, required: true },
      { name: 'email_verified', order: 6, required: false },
    ],
  } as FunnelDefinition,
};

class FunnelTracker {
  private activeSteps: Map<string, { step: string; startTime: number }> = new Map();

  /**
   * Iniciar tracking de un paso del funnel
   */
  async enterStep(sessionId: string, funnelName: string, stepName: string, metadata?: any) {
    try {
      const funnel = Object.values(FUNNELS).find(f => f.name === funnelName);
      if (!funnel) {
        console.warn(`Funnel ${funnelName} not found`);
        return;
      }

      const stepDef = funnel.steps.find(s => s.name === stepName);
      if (!stepDef) {
        console.warn(`Step ${stepName} not found in funnel ${funnelName}`);
        return;
      }

      // Marcar pasos anteriores como salida si no fueron completados
      await this.markPreviousStepsAsExit(sessionId, funnelName, stepDef.order);

      // Registrar entrada al nuevo paso
      await analyticsService.trackFunnelStep(sessionId, {
        funnelName,
        stepName,
        stepOrder: stepDef.order,
        completed: false,
        metadata,
      });

      // Registrar evento analytics
      await analyticsService.trackEvent(sessionId, {
        name: `funnel_step_entered`,
        category: EventCategory.NAVIGATION,
        action: 'enter',
        label: `${funnelName}_${stepName}`,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        properties: {
          funnelName,
          stepName,
          stepOrder: stepDef.order,
          ...metadata,
        },
      });

      // Guardar en memoria para tracking de tiempo
      const key = `${sessionId}_${funnelName}_${stepName}`;
      this.activeSteps.set(key, {
        step: stepName,
        startTime: Date.now(),
      });

      console.log(`🔹 Funnel step entered: ${funnelName} -> ${stepName}`);
    } catch (error) {
      console.error('Error entering funnel step:', error);
    }
  }

  /**
   * Completar un paso del funnel
   */
  async completeStep(sessionId: string, funnelName: string, stepName: string, metadata?: any) {
    try {
      const key = `${sessionId}_${funnelName}_${stepName}`;
      const activeStep = this.activeSteps.get(key);

      // Calcular tiempo transcurrido
      const timeSpent = activeStep
        ? Math.floor((Date.now() - activeStep.startTime) / 1000)
        : undefined;

      // Marcar como completado
      await analyticsService.completeFunnelStep(sessionId, funnelName, stepName);

      // Registrar evento analytics
      const eventData: any = {
        name: `funnel_step_completed`,
        category: EventCategory.NAVIGATION,
        action: 'complete',
        label: `${funnelName}_${stepName}`,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        properties: {
          funnelName,
          stepName,
          timeSpent,
          ...metadata,
        },
      };
      if (timeSpent !== undefined) {
        eventData.value = timeSpent;
      }
      await analyticsService.trackEvent(sessionId, eventData);

      // Limpiar de memoria
      this.activeSteps.delete(key);

      console.log(`✅ Funnel step completed: ${funnelName} -> ${stepName} (${timeSpent}s)`);
    } catch (error) {
      console.error('Error completing funnel step:', error);
    }
  }

  /**
   * Marcar punto de abandono en el funnel
   */
  async abandonStep(sessionId: string, funnelName: string, stepName: string, reason?: string) {
    try {
      const key = `${sessionId}_${funnelName}_${stepName}`;
      const activeStep = this.activeSteps.get(key);

      // Calcular tiempo transcurrido
      const timeSpent = activeStep
        ? Math.floor((Date.now() - activeStep.startTime) / 1000)
        : undefined;

      // Marcar como punto de salida
      await analyticsService.markFunnelExit(sessionId, funnelName, stepName);

      // Registrar evento analytics
      const eventData: any = {
        name: `funnel_step_abandoned`,
        category: EventCategory.NAVIGATION,
        action: 'abandon',
        label: `${funnelName}_${stepName}`,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        properties: {
          funnelName,
          stepName,
          timeSpent,
          reason,
        },
      };
      if (timeSpent !== undefined) {
        eventData.value = timeSpent;
      }
      await analyticsService.trackEvent(sessionId, eventData);

      // Limpiar de memoria
      this.activeSteps.delete(key);

      console.log(`❌ Funnel step abandoned: ${funnelName} -> ${stepName} (${reason || 'unknown'})`);
    } catch (error) {
      console.error('Error abandoning funnel step:', error);
    }
  }

  /**
   * Marcar pasos anteriores como puntos de salida si no fueron completados
   */
  private async markPreviousStepsAsExit(sessionId: string, funnelName: string, currentStepOrder: number) {
    try {
      const funnel = Object.values(FUNNELS).find(f => f.name === funnelName);
      if (!funnel) return;

      // Buscar pasos anteriores que no fueron completados
      const previousSteps = funnel.steps.filter(s => s.order < currentStepOrder);

      for (const step of previousSteps) {
        // Marcar como salida si está activo pero no completado
        const key = `${sessionId}_${funnelName}_${step.name}`;
        if (this.activeSteps.has(key)) {
          await this.abandonStep(sessionId, funnelName, step.name, 'skipped_to_next_step');
        }
      }
    } catch (error) {
      console.error('Error marking previous steps as exit:', error);
    }
  }

  /**
   * Tracking automático de timeout en pasos
   */
  async startTimeoutTracking(sessionId: string, funnelName: string, stepName: string, timeoutSeconds: number) {
    setTimeout(async () => {
      const key = `${sessionId}_${funnelName}_${stepName}`;
      if (this.activeSteps.has(key)) {
        await this.abandonStep(sessionId, funnelName, stepName, 'timeout');
      }
    }, timeoutSeconds * 1000);
  }

  /**
   * Obtener métricas del funnel en tiempo real
   */
  async getFunnelMetrics(funnelName: string, dateFrom?: Date, dateTo?: Date) {
    try {
      return await analyticsService.getFunnelMetrics(funnelName, dateFrom, dateTo);
    } catch (error) {
      console.error('Error getting funnel metrics:', error);
      return null;
    }
  }

  /**
   * Helpers específicos para los funnels de la aplicación
   */

  // Funnel de compra principal
  async startMainPurchaseFunnel(sessionId: string, metadata?: any) {
    await this.enterStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'landing', metadata);
  }

  async selectTemplate(sessionId: string, templateId: string, templateName: string) {
    await this.completeStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'landing');
    await this.enterStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'template_selection', {
      templateId,
      templateName,
    });
  }

  async completeTemplateSelection(sessionId: string, templateId: string) {
    await this.completeStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'template_selection', {
      templateId,
    });
    await this.enterStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'info_form');
    // Iniciar timeout tracking para formulario (5 minutos)
    await this.startTimeoutTracking(sessionId, FUNNELS.MAIN_PURCHASE.name, 'info_form', 300);
  }

  async startInfoForm(sessionId: string, formData?: any) {
    await this.enterStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'info_form', formData);
  }

  async completeInfoForm(sessionId: string, formData: any) {
    await this.completeStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'info_form', formData);
    await this.enterStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'payment');
    // Iniciar timeout tracking para pago (10 minutos)
    await this.startTimeoutTracking(sessionId, FUNNELS.MAIN_PURCHASE.name, 'payment', 600);
  }

  async completePayment(sessionId: string, paymentData: any) {
    await this.completeStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'payment', paymentData);
    await this.enterStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'confirmation');

    // Marcar conversión
    await analyticsService.trackConversion(sessionId, 'purchase', paymentData.amount);
  }

  async completeMainPurchaseFunnel(sessionId: string, orderData: any) {
    await this.completeStep(sessionId, FUNNELS.MAIN_PURCHASE.name, 'confirmation', orderData);
  }

  // Funnel de oferta
  async startOfertaPurchaseFunnel(sessionId: string, metadata?: any) {
    await this.enterStep(sessionId, FUNNELS.OFERTA_PURCHASE.name, 'oferta_landing', metadata);
  }

  // Funnel de contacto
  async startContactFunnel(sessionId: string) {
    await this.enterStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'contact_page');
  }

  async startContactForm(sessionId: string) {
    await this.completeStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'contact_page');
    await this.enterStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'form_started');
  }

  async completeContactForm(sessionId: string, formData: any) {
    await this.completeStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'form_started');
    await this.enterStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'form_completed', formData);
  }

  async submitContactForm(sessionId: string) {
    await this.completeStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'form_completed');
    await this.enterStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'form_submitted');
    await this.completeStep(sessionId, FUNNELS.CONTACT_FUNNEL.name, 'form_submitted');

    // Marcar conversión de contacto
    await analyticsService.trackConversion(sessionId, 'contact');
  }
}

export const funnelTracker = new FunnelTracker();
export default funnelTracker;