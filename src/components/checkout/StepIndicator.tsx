"use client";

import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
}

const steps: Step[] = [
  {
    id: 1,
    title: "Datos del Negocio",
    description: "Información básica de tu peluquería"
  },
  {
    id: 2,
    title: "Configuración Web",
    description: "Plantilla, dominio y servicios"
  },
  {
    id: 3,
    title: "Resumen y Pago",
    description: "Confirma tu pedido y paga"
  }
];

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-600';
      case 'current':
        return 'text-blue-600 bg-blue-100 border-blue-600';
      default:
        return 'text-gray-400 bg-gray-100 border-gray-300';
    }
  };

  const getConnectorColor = (stepId: number) => {
    return completedSteps.includes(stepId) || stepId < currentStep
      ? 'bg-green-500'
      : 'bg-gray-300';
  };

  return (
    <div className="w-full py-8">
      {/* Indicador visual para móvil */}
      <div className="block md:hidden mb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-sm font-medium text-gray-600">
            Paso {currentStep} de {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep - 1]?.title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Indicador visual completo para desktop */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between w-full max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const isLast = index === steps.length - 1;

              return (
                <li key={step.id} className="relative flex-1">
                  <div className="flex items-center">
                    {/* Círculo del paso */}
                    <div
                      className={`
                        relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                        ${getStepColor(status)}
                        ${status === 'current' ? 'ring-4 ring-blue-100' : ''}
                      `}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : status === 'current' ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}

                      {/* Número del paso */}
                      <span
                        className={`
                          absolute text-xs font-bold
                          ${status === 'completed' ? 'text-white' :
                            status === 'current' ? 'text-white' : 'text-gray-400'}
                        `}
                      >
                        {status !== 'completed' && step.id}
                      </span>
                    </div>

                    {/* Conector */}
                    {!isLast && (
                      <div className="flex-1 h-1 mx-4">
                        <div
                          className={`
                            h-full rounded-full transition-all duration-300
                            ${getConnectorColor(step.id)}
                          `}
                        />
                      </div>
                    )}
                  </div>

                  {/* Título y descripción */}
                  <div className="mt-4 text-center">
                    <h3
                      className={`
                        text-sm font-medium transition-colors
                        ${status === 'current' ? 'text-blue-600' :
                          status === 'completed' ? 'text-green-600' : 'text-gray-400'}
                      `}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`
                        text-xs mt-1 transition-colors
                        ${status === 'current' ? 'text-blue-500' :
                          status === 'completed' ? 'text-green-500' : 'text-gray-400'}
                      `}
                    >
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Información adicional del paso actual */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {steps[currentStep - 1]?.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>Paso {currentStep} de {steps.length}</span>
              {currentStep < steps.length && (
                <>
                  <ArrowRight className="w-4 h-4 mx-2" />
                  <span className="text-blue-600 font-medium">
                    Siguiente: {steps[currentStep]?.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para manejar el estado de los pasos
export function useStepProgress() {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const goToNextStep = () => {
    if (currentStep < 3) {
      completeStep(currentStep);
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const goToStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
  };

  const isStepAccessible = (step: number) => {
    // El paso 1 siempre es accesible
    if (step === 1) return true;

    // Para acceder al paso 2, debe completar el 1
    if (step === 2) return completedSteps.includes(1);

    // Para acceder al paso 3, debe completar 1 y 2
    if (step === 3) return completedSteps.includes(1) && completedSteps.includes(2);

    return false;
  };

  const isCheckoutComplete = () => {
    return completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
  };

  return {
    currentStep,
    completedSteps,
    completeStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isStepAccessible,
    isCheckoutComplete
  };
}