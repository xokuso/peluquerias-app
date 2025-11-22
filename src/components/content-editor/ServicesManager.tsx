'use client'

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Clock,
  Save,
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Service {
  id: string
  name: string
  description?: string
  price?: number
  duration?: number
  category: ServiceCategory
  priceFrom?: number
  priceTo?: number
  priceType: PriceType
  requirements?: string
  aftercare?: string
  suitableFor?: string[]
  isActive: boolean
  sortOrder: number
}

export type ServiceCategory =
  | 'CUTS' | 'COLOR' | 'TREATMENTS' | 'STYLING' | 'PERMS'
  | 'EXTENSIONS' | 'NAILS' | 'EYEBROWS' | 'FACIAL' | 'MASSAGE' | 'OTHER'

export type PriceType = 'FIXED' | 'FROM' | 'RANGE' | 'CONSULTATION'

interface ServicesManagerProps {
  services: Service[]
  onServicesChange: (services: Service[]) => void
  onSave?: (services: Service[]) => Promise<void>
  isLoading?: boolean
}

const categoryLabels: Record<ServiceCategory, string> = {
  CUTS: 'Cortes',
  COLOR: 'Coloración',
  TREATMENTS: 'Tratamientos',
  STYLING: 'Peinado',
  PERMS: 'Permanentes',
  EXTENSIONS: 'Extensiones',
  NAILS: 'Manicura/Pedicura',
  EYEBROWS: 'Cejas',
  FACIAL: 'Facial',
  MASSAGE: 'Masaje',
  OTHER: 'Otros'
}

const priceTypeLabels: Record<PriceType, string> = {
  FIXED: 'Precio fijo',
  FROM: 'Desde',
  RANGE: 'Rango',
  CONSULTATION: 'Consultar'
}

const emptyService: Omit<Service, 'id' | 'sortOrder'> = {
  name: '',
  description: '',
  category: 'CUTS',
  priceType: 'FIXED',
  isActive: true,
}

// Utility function to format service price display
const formatPrice = (service: Service): string => {
  if (service.priceType === 'CONSULTATION') return 'Consultar'
  if (service.priceType === 'RANGE' && service.priceFrom && service.priceTo) {
    return `${service.priceFrom}€ - ${service.priceTo}€`
  }
  if (service.priceType === 'FROM' && service.priceFrom) {
    return `Desde ${service.priceFrom}€`
  }
  if (service.price) return `${service.price}€`
  return 'Sin precio'
}

export default function ServicesManager({
  services,
  onServicesChange,
  onSave,
  isLoading
}: ServicesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Service>>({})
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex(service => service.id === active.id)
      const newIndex = services.findIndex(service => service.id === over.id)

      const reorderedServices = arrayMove(services, oldIndex, newIndex).map((service, index) => ({
        ...service,
        sortOrder: index
      }))

      onServicesChange(reorderedServices)
    }
  }, [services, onServicesChange])

  const handleCreate = () => {
    setIsCreating(true)
    setEditForm({ ...emptyService })
  }

  const handleEdit = (service: Service) => {
    setEditingId(service.id)
    setEditForm({ ...service })
  }

  const handleSave = () => {
    if (!editForm.name?.trim()) return

    if (isCreating) {
      const newService: Service = {
        id: `temp-${Date.now()}`,
        ...emptyService,
        ...editForm,
        name: editForm.name.trim(),
        sortOrder: services.length
      } as Service

      onServicesChange([...services, newService])
      setIsCreating(false)
    } else if (editingId) {
      const updatedServices = services.map(service =>
        service.id === editingId
          ? { ...service, ...editForm, name: editForm.name?.trim() || service.name }
          : service
      )
      onServicesChange(updatedServices)
      setEditingId(null)
    }

    setEditForm({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsCreating(false)
    setEditForm({})
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      const updatedServices = services
        .filter(service => service.id !== id)
        .map((service, index) => ({ ...service, sortOrder: index }))
      onServicesChange(updatedServices)
    }
  }

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<ServiceCategory, Service[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Gestión de Servicios
          </h3>
          <p className="text-sm text-neutral-600">
            Añade y organiza los servicios de tu salón
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCreate}
            disabled={isCreating || !!editingId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Servicio
          </Button>
          {onSave && (
            <Button
              type="button"
              variant="salon"
              onClick={() => onSave(services)}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </div>

      {/* Create new service form */}
      {isCreating && (
        <ServiceForm
          service={editForm}
          onChange={setEditForm}
          onSave={handleSave}
          onCancel={handleCancel}
          isNew={true}
        />
      )}

      {/* Services by category */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                <h4 className="font-medium text-neutral-800">
                  {categoryLabels[category as ServiceCategory]}
                </h4>
                <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  {categoryServices.length} servicio{categoryServices.length !== 1 ? 's' : ''}
                </span>
              </div>

              <SortableContext
                items={categoryServices.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categoryServices.map((service) => (
                    <ServiceItem
                      key={service.id}
                      service={service}
                      isEditing={editingId === service.id}
                      editForm={editingId === service.id ? editForm : {}}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      onFormChange={setEditForm}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Empty state */}
      {services.length === 0 && !isCreating && (
        <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-lg">
          <div className="w-12 h-12 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            No hay servicios añadidos
          </h3>
          <p className="text-neutral-600 mb-4">
            Añade servicios para que tus clientes sepan qué ofreces
          </p>
          <Button onClick={handleCreate} variant="salon">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Primer Servicio
          </Button>
        </div>
      )}
    </div>
  )
}

// Sortable Service Item Component
interface ServiceItemProps {
  service: Service
  isEditing: boolean
  editForm: Partial<Service>
  onEdit: (service: Service) => void
  onSave: () => void
  onCancel: () => void
  onDelete: (id: string) => void
  onFormChange: (form: Partial<Service>) => void
}

function ServiceItem({
  service,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onFormChange
}: ServiceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <ServiceForm
          service={editForm}
          onChange={onFormChange}
          onSave={onSave}
          onCancel={onCancel}
          isNew={false}
        />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border border-neutral-200 rounded-lg p-4 transition-shadow",
        isDragging && "shadow-lg"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h5 className="font-medium text-neutral-900">{service.name}</h5>
            {service.description && (
              <p className="text-sm text-neutral-600 mt-1">{service.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
              <span className="font-medium">{formatPrice(service)}</span>
              {service.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {service.duration} min
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(service)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(service.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Service Form Component
interface ServiceFormProps {
  service: Partial<Service>
  onChange: (service: Partial<Service>) => void
  onSave: () => void
  onCancel: () => void
  isNew: boolean
}

function ServiceForm({ service, onChange, onSave, onCancel, isNew }: ServiceFormProps) {
  return (
    <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nombre del servicio *
          </label>
          <input
            type="text"
            value={service.name || ''}
            onChange={(e) => onChange({ ...service, name: e.target.value })}
            placeholder="Ej: Corte y peinado"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Categoría
          </label>
          <select
            value={service.category || 'CUTS'}
            onChange={(e) => onChange({ ...service, category: e.target.value as ServiceCategory })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Descripción
          </label>
          <textarea
            value={service.description || ''}
            onChange={(e) => onChange({ ...service, description: e.target.value })}
            placeholder="Describe el servicio..."
            rows={2}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Tipo de precio
          </label>
          <select
            value={service.priceType || 'FIXED'}
            onChange={(e) => onChange({ ...service, priceType: e.target.value as PriceType })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(priceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Duración (minutos)
          </label>
          <input
            type="number"
            value={service.duration || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              const updates = { ...service };
              if (value !== null) {
                updates.duration = value;
              } else {
                delete updates.duration;
              }
              onChange(updates);
            }}
            placeholder="60"
            min="0"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price inputs based on price type */}
        {service.priceType === 'FIXED' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Precio (€)
            </label>
            <input
              type="number"
              value={service.price || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : null;
                const updates = { ...service };
                if (value !== null) {
                  updates.price = value;
                } else {
                  delete updates.price;
                }
                onChange(updates);
              }}
              placeholder="25.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {service.priceType === 'FROM' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Precio desde (€)
            </label>
            <input
              type="number"
              value={service.priceFrom || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : null;
                const updates = { ...service };
                if (value !== null) {
                  updates.priceFrom = value;
                } else {
                  delete updates.priceFrom;
                }
                onChange(updates);
              }}
              placeholder="20.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {service.priceType === 'RANGE' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Precio mínimo (€)
              </label>
              <input
                type="number"
                value={service.priceFrom || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : null;
                  const updates = { ...service };
                  if (value !== null) {
                    updates.priceFrom = value;
                  } else {
                    delete updates.priceFrom;
                  }
                  onChange(updates);
                }}
                placeholder="20.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Precio máximo (€)
              </label>
              <input
                type="number"
                value={service.priceTo || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : null;
                  const updates = { ...service };
                  if (value !== null) {
                    updates.priceTo = value;
                  } else {
                    delete updates.priceTo;
                  }
                  onChange(updates);
                }}
                placeholder="50.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="button"
          variant="salon"
          onClick={onSave}
          disabled={!service.name?.trim()}
        >
          <Save className="w-4 h-4 mr-2" />
          {isNew ? 'Crear Servicio' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}