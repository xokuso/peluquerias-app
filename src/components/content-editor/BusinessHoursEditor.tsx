'use client'

import React, { useState, useEffect } from 'react'
import {
  Coffee,
  Calendar,
  Save,
  RotateCcw,
  AlertCircle,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BusinessHours {
  id?: string
  dayOfWeek: DayOfWeek
  isOpen: boolean
  openTime?: string | undefined
  closeTime?: string | undefined
  hasBreak: boolean
  breakStartTime?: string | undefined
  breakEndTime?: string | undefined
  notes?: string | undefined
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

interface BusinessHoursEditorProps {
  businessHours: BusinessHours[]
  onBusinessHoursChange: (hours: BusinessHours[]) => void
  onSave?: (hours: BusinessHours[]) => Promise<void>
  isLoading?: boolean
}

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
}

const daysOrder: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const defaultHours: BusinessHours[] = daysOrder.map(day => ({
  dayOfWeek: day,
  isOpen: day !== 'SUNDAY',
  openTime: '09:00',
  closeTime: day === 'SATURDAY' ? '16:00' : '18:00',
  hasBreak: false,
  breakStartTime: '13:00',
  breakEndTime: '14:00',
  notes: ''
}))

export default function BusinessHoursEditor({
  businessHours,
  onBusinessHoursChange,
  onSave,
  isLoading
}: BusinessHoursEditorProps) {
  const [localHours, setLocalHours] = useState<BusinessHours[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize with provided hours or defaults
  useEffect(() => {
    if (businessHours.length > 0) {
      // Ensure all days are present
      const completeHours = daysOrder.map(day => {
        const existingHour = businessHours.find(h => h.dayOfWeek === day)
        return existingHour || {
          dayOfWeek: day,
          isOpen: day !== 'SUNDAY',
          openTime: '09:00',
          closeTime: day === 'SATURDAY' ? '16:00' : '18:00',
          hasBreak: false,
        }
      })
      setLocalHours(completeHours)
    } else {
      setLocalHours(defaultHours)
    }
    setHasChanges(false)
  }, [businessHours])

  // Update parent when local hours change
  useEffect(() => {
    if (localHours.length > 0) {
      onBusinessHoursChange(localHours)
      setHasChanges(true)
    }
  }, [localHours, onBusinessHoursChange])

  const updateDay = (dayOfWeek: DayOfWeek, updates: Partial<BusinessHours>) => {
    setLocalHours(hours =>
      hours.map(hour =>
        hour.dayOfWeek === dayOfWeek
          ? { ...hour, ...updates }
          : hour
      )
    )
  }

  const copyToAllDays = (sourceDay: DayOfWeek, excludeSunday = true) => {
    const sourceHour = localHours.find(h => h.dayOfWeek === sourceDay)
    if (!sourceHour) return

    setLocalHours(hours =>
      hours.map(hour => {
        if (hour.dayOfWeek === sourceDay) return hour
        if (excludeSunday && hour.dayOfWeek === 'SUNDAY') return hour

        return {
          ...hour,
          isOpen: sourceHour.isOpen,
          openTime: sourceHour.openTime ?? undefined,
          closeTime: sourceHour.closeTime ?? undefined,
          hasBreak: sourceHour.hasBreak,
          breakStartTime: sourceHour.breakStartTime ?? undefined,
          breakEndTime: sourceHour.breakEndTime ?? undefined,
        }
      })
    )
  }

  const resetToDefaults = () => {
    setLocalHours(defaultHours)
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(localHours)
      setHasChanges(false)
    }
  }

  const timeOptions = () => {
    const options = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeString)
      }
    }
    return options
  }

  const validateTime = (day: BusinessHours): string | null => {
    if (!day.isOpen) return null

    if (!day.openTime || !day.closeTime) {
      return 'Horario de apertura y cierre requeridos'
    }

    const open = new Date(`2000-01-01 ${day.openTime}`)
    const close = new Date(`2000-01-01 ${day.closeTime}`)

    if (close <= open) {
      return 'La hora de cierre debe ser posterior a la de apertura'
    }

    if (day.hasBreak && day.breakStartTime && day.breakEndTime) {
      const breakStart = new Date(`2000-01-01 ${day.breakStartTime}`)
      const breakEnd = new Date(`2000-01-01 ${day.breakEndTime}`)

      if (breakEnd <= breakStart) {
        return 'La hora de fin de descanso debe ser posterior al inicio'
      }

      if (breakStart <= open || breakEnd >= close) {
        return 'El descanso debe estar dentro del horario de trabajo'
      }
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Horarios de Apertura
          </h3>
          <p className="text-sm text-neutral-600">
            Configura los horarios de tu salón para cada día de la semana
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetToDefaults}
            className="text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restablecer
          </Button>
          {onSave && (
            <Button
              type="button"
              variant="salon"
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? 'Guardando...' : hasChanges ? 'Guardar Cambios' : 'Guardado'}
              {!isLoading && (hasChanges ? <Save className="w-4 h-4 ml-2" /> : <Check className="w-4 h-4 ml-2" />)}
            </Button>
          )}
        </div>
      </div>

      {/* Hours Grid */}
      <div className="space-y-4">
        {localHours.map((day) => {
          const validationError = validateTime(day)

          return (
            <div
              key={day.dayOfWeek}
              className={cn(
                "bg-white border border-neutral-200 rounded-lg p-4",
                validationError && "border-red-200 bg-red-50"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <h4 className="font-medium text-neutral-900">
                    {dayLabels[day.dayOfWeek]}
                  </h4>
                  {day.dayOfWeek === 'SUNDAY' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Domingo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={(e) => updateDay(day.dayOfWeek, { isOpen: e.target.checked })}
                      className="rounded border-neutral-300"
                    />
                    <span className={cn(
                      day.isOpen ? 'text-green-700 font-medium' : 'text-neutral-500'
                    )}>
                      {day.isOpen ? 'Abierto' : 'Cerrado'}
                    </span>
                  </label>

                  {day.isOpen && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllDays(day.dayOfWeek)}
                      className="text-xs"
                    >
                      Copiar a todos
                    </Button>
                  )}
                </div>
              </div>

              {day.isOpen && (
                <div className="space-y-4">
                  {/* Basic Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Hora de apertura
                      </label>
                      <select
                        value={day.openTime || ''}
                        onChange={(e) => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar hora</option>
                        {timeOptions().map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Hora de cierre
                      </label>
                      <select
                        value={day.closeTime || ''}
                        onChange={(e) => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar hora</option>
                        {timeOptions().map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Break Time */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={day.hasBreak}
                        onChange={(e) => updateDay(day.dayOfWeek, { hasBreak: e.target.checked })}
                        className="rounded border-neutral-300"
                      />
                      <Coffee className="w-4 h-4 text-neutral-500" />
                      <span>Horario de descanso/comida</span>
                    </label>

                    {day.hasBreak && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Inicio del descanso
                          </label>
                          <select
                            value={day.breakStartTime || ''}
                            onChange={(e) => updateDay(day.dayOfWeek, { breakStartTime: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar hora</option>
                            {timeOptions().map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Fin del descanso
                          </label>
                          <select
                            value={day.breakEndTime || ''}
                            onChange={(e) => updateDay(day.dayOfWeek, { breakEndTime: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar hora</option>
                            {timeOptions().map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Notas especiales (opcional)
                    </label>
                    <input
                      type="text"
                      value={day.notes || ''}
                      onChange={(e) => updateDay(day.dayOfWeek, { notes: e.target.value })}
                      placeholder="Ej: Citas solo con reserva previa"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Resumen de horarios</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {localHours.map(day => (
            <div key={day.dayOfWeek} className="flex justify-between text-blue-800">
              <span className="font-medium">{dayLabels[day.dayOfWeek]}:</span>
              <span>
                {day.isOpen
                  ? day.openTime && day.closeTime
                    ? `${day.openTime} - ${day.closeTime}${day.hasBreak ? ' (con descanso)' : ''}`
                    : 'Horarios por definir'
                  : 'Cerrado'
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}