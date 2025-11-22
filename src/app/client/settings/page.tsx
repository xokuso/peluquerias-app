'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Settings,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  MapPin,
  Calendar,
  Download,
  Trash2,
  Edit3,
  Lock,
  Smartphone,
  Monitor,
  Palette,
  Languages,
  Star,
  Shield as ShieldIcon,
  Key,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ClientSettings } from '@/types'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Form state interface
interface ProfileForm {
  name: string
  email: string
  phone: string
  salonName: string
  address: string
  website: string
  bio: string
}

interface SecurityForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorEnabled: boolean
}

interface BillingInfo {
  cardLast4: string
  cardType: string
  expiryDate: string
  billingAddress: string
  subscriptionPlan: string
  nextBilling: string
  amount: number
}

// Loading skeleton component
const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg ${className}`} />
)

// Success/Error message component
const StatusMessage = ({ type, message, onDismiss }: {
  type: 'success' | 'error',
  message: string,
  onDismiss: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={`flex items-center gap-3 p-4 rounded-lg border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}
  >
    {type === 'success' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    )}
    <span className="flex-1">{message}</span>
    <Button variant="ghost" size="sm" onClick={onDismiss}>
      ×
    </Button>
  </motion.div>
)

// Profile section component
const ProfileSection = ({
  profile,
  setProfile,
  onSave,
  loading,
  errors
}: {
  profile: ProfileForm
  setProfile: (profile: ProfileForm) => void
  onSave: () => void
  loading: boolean
  errors: Record<string, string>
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        <CardTitle>Información del Perfil</CardTitle>
      </div>
      <CardDescription>
        Gestiona la información básica de tu cuenta y salón
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Tu nombre completo"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="tu@email.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+34 600 000 000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salonName">Nombre del salón *</Label>
          <Input
            id="salonName"
            value={profile.salonName}
            onChange={(e) => setProfile({ ...profile, salonName: e.target.value })}
            placeholder="Nombre de tu peluquería"
            className={errors.salonName ? 'border-red-500' : ''}
          />
          {errors.salonName && (
            <p className="text-sm text-red-600">{errors.salonName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          placeholder="Calle, número, ciudad, código postal"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Sitio web actual</Label>
        <Input
          id="website"
          type="url"
          value={profile.website}
          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          placeholder="https://tu-salon.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Descripción del salón</Label>
        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Cuéntanos sobre tu salón, especialidades, ambiente..."
          className="min-h-[100px]"
        />
      </div>

      <Button onClick={onSave} disabled={loading} className="w-full md:w-auto">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Guardando...
          </div>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </>
        )}
      </Button>
    </CardContent>
  </Card>
)

// Notifications section component
const NotificationsSection = ({
  settings,
  setSettings,
  onSave,
  loading
}: {
  settings: ClientSettings
  setSettings: (settings: ClientSettings) => void
  onSave: () => void
  loading: boolean
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          <CardTitle>Notificaciones por Email</CardTitle>
        </div>
        <CardDescription>
          Configura qué notificaciones quieres recibir por correo electrónico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Actualizaciones de proyecto</Label>
            <p className="text-sm text-neutral-600">
              Recibe notificaciones cuando tu proyecto avance en las diferentes fases
            </p>
          </div>
          <Switch
            checked={settings.notifications.email.projectUpdates}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  email: { ...settings.notifications.email, projectUpdates: checked }
                }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Recordatorios de pago</Label>
            <p className="text-sm text-neutral-600">
              Avisos antes de vencimientos y confirmaciones de pagos
            </p>
          </div>
          <Switch
            checked={settings.notifications.email.paymentReminders}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  email: { ...settings.notifications.email, paymentReminders: checked }
                }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Mensajes de soporte</Label>
            <p className="text-sm text-neutral-600">
              Respuestas a tus tickets y mensajes del equipo de soporte
            </p>
          </div>
          <Switch
            checked={settings.notifications.email.supportMessages}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  email: { ...settings.notifications.email, supportMessages: checked }
                }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Comunicaciones de marketing</Label>
            <p className="text-sm text-neutral-600">
              Noticias, consejos y nuevas funcionalidades
            </p>
          </div>
          <Switch
            checked={settings.notifications.email.marketing}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  email: { ...settings.notifications.email, marketing: checked }
                }
              })
            }
          />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <CardTitle>Notificaciones Push</CardTitle>
        </div>
        <CardDescription>
          Notificaciones instantáneas en tu navegador (cuando esté disponible)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Actualizaciones de proyecto</Label>
            <p className="text-sm text-neutral-600">
              Notificaciones inmediatas sobre el progreso
            </p>
          </div>
          <Switch
            checked={settings.notifications.push.projectUpdates}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  push: { ...settings.notifications.push, projectUpdates: checked }
                }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Mensajes de soporte</Label>
            <p className="text-sm text-neutral-600">
              Respuestas inmediatas del equipo
            </p>
          </div>
          <Switch
            checked={settings.notifications.push.supportMessages}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  push: { ...settings.notifications.push, supportMessages: checked }
                }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Solo urgente</Label>
            <p className="text-sm text-neutral-600">
              Únicamente notificaciones importantes y urgentes
            </p>
          </div>
          <Switch
            checked={settings.notifications.push.urgentOnly}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                notifications: {
                  ...settings.notifications,
                  push: { ...settings.notifications.push, urgentOnly: checked }
                }
              })
            }
          />
        </div>
      </CardContent>
    </Card>

    <Button onClick={onSave} disabled={loading} className="w-full md:w-auto">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Guardando...
        </div>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Guardar configuración
        </>
      )}
    </Button>
  </div>
)

// Security section component
const SecuritySection = ({
  securityForm,
  setSecurityForm,
  onSave,
  loading,
  errors
}: {
  securityForm: SecurityForm
  setSecurityForm: (form: SecurityForm) => void
  onSave: () => void
  loading: boolean
  errors: Record<string, string>
}) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            <CardTitle>Cambiar Contraseña</CardTitle>
          </div>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                placeholder="Tu contraseña actual"
                className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                placeholder="Repite la nueva contraseña"
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Requisitos de contraseña:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mínimo 8 caracteres</li>
              <li>• Al menos una letra mayúscula</li>
              <li>• Al menos una letra minúscula</li>
              <li>• Al menos un número</li>
              <li>• Al menos un carácter especial</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5 text-green-600" />
            <CardTitle>Autenticación de Dos Factores</CardTitle>
          </div>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label>Autenticación 2FA</Label>
                {securityForm.twoFactorEnabled && (
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    Activado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                {securityForm.twoFactorEnabled
                  ? 'Tu cuenta está protegida con 2FA'
                  : 'Protege tu cuenta con un código adicional'
                }
              </p>
            </div>
            <Switch
              checked={securityForm.twoFactorEnabled}
              onCheckedChange={(checked) =>
                setSecurityForm({ ...securityForm, twoFactorEnabled: checked })
              }
            />
          </div>

          {securityForm.twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">2FA Configurado</span>
              </div>
              <p className="text-sm text-green-700">
                Tu cuenta está protegida. Puedes gestionar tus métodos de autenticación.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            <CardTitle>Sesiones Activas</CardTitle>
          </div>
          <CardDescription>
            Gestiona los dispositivos donde tienes sesión iniciada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-neutral-500" />
                <div>
                  <p className="font-medium">Navegador actual</p>
                  <p className="text-sm text-neutral-600">Chrome en Madrid, España</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                Actual
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-neutral-500" />
                <div>
                  <p className="font-medium">iPhone</p>
                  <p className="text-sm text-neutral-600">Safari - hace 2 días</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onSave} disabled={loading} className="w-full md:w-auto">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Guardando...
          </div>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Actualizar seguridad
          </>
        )}
      </Button>
    </div>
  )
}

// Billing section component
const BillingSection = ({
  billingInfo,
  onUpdatePaymentMethod,
  onCancelSubscription,
  loading
}: {
  billingInfo: BillingInfo
  onUpdatePaymentMethod: () => void
  onCancelSubscription: () => void
  loading: boolean
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <CardTitle>Método de Pago</CardTitle>
        </div>
        <CardDescription>
          Gestiona tu método de pago predeterminado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="font-medium">**** **** **** {billingInfo.cardLast4}</p>
              <p className="text-sm text-neutral-600">Expira {billingInfo.expiryDate}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onUpdatePaymentMethod} disabled={loading}>
            <Edit3 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          <CardTitle>Suscripción Actual</CardTitle>
        </div>
        <CardDescription>
          Detalles de tu plan y facturación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Plan {billingInfo.subscriptionPlan}</h3>
            <p className="text-blue-700">Desarrollo web + hosting incluido</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">€{billingInfo.amount}</p>
            <p className="text-sm text-blue-700">por mes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-neutral-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Próxima facturación</span>
            </div>
            <p className="font-medium">{billingInfo.nextBilling}</p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-neutral-600 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Dirección de facturación</span>
            </div>
            <p className="font-medium">{billingInfo.billingAddress}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onUpdatePaymentMethod}>
            <Edit3 className="w-4 h-4 mr-2" />
            Actualizar plan
          </Button>
          <Button variant="outline" onClick={onCancelSubscription} className="text-red-600 border-red-300 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Cancelar suscripción
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          <CardTitle>Historial de Facturación</CardTitle>
        </div>
        <CardDescription>
          Descarga tus facturas y consulta el historial de pagos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { date: '01 Nov 2024', amount: 89, status: 'Pagada', invoice: 'INV-001' },
            { date: '01 Oct 2024', amount: 89, status: 'Pagada', invoice: 'INV-002' },
            { date: '01 Sep 2024', amount: 89, status: 'Pagada', invoice: 'INV-003' },
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{invoice.invoice}</p>
                  <p className="text-sm text-neutral-600">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">€{invoice.amount}</p>
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    {invoice.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Preferences section component
const PreferencesSection = ({
  settings,
  setSettings,
  onSave,
  loading
}: {
  settings: ClientSettings
  setSettings: (settings: ClientSettings) => void
  onSave: () => void
  loading: boolean
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          <CardTitle>Idioma y Región</CardTitle>
        </div>
        <CardDescription>
          Configura tu idioma preferido y configuración regional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select
              value={settings.preferences.language}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, language: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Select
              value={settings.preferences.timezone}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, timezone: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select
              value={settings.preferences.currency}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, currency: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">Dólar US ($)</SelectItem>
                <SelectItem value="GBP">Libra (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato de fecha</Label>
            <Select
              value={settings.preferences.dateFormat}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, dateFormat: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <CardTitle>Apariencia</CardTitle>
        </div>
        <CardDescription>
          Personaliza la apariencia del panel de cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tema</Label>
          <Select
            value={settings.preferences.theme}
            onValueChange={(value: 'light' | 'dark' | 'auto') =>
              setSettings({
                ...settings,
                preferences: { ...settings.preferences, theme: value }
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="auto">Automático</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 border rounded-lg bg-neutral-50">
          <h4 className="font-medium mb-2">Vista previa del tema</h4>
          <div className="flex gap-3">
            <div className="w-12 h-8 bg-white border rounded shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-neutral-300 rounded"></div>
            </div>
            <div className="w-12 h-8 bg-neutral-900 border rounded shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-neutral-600 rounded"></div>
            </div>
            <div className="w-12 h-8 bg-gradient-to-br from-white to-neutral-100 border rounded shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-400 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <CardTitle>Privacidad</CardTitle>
        </div>
        <CardDescription>
          Controla la privacidad de tu información y actividad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Mostrar perfil público</Label>
            <p className="text-sm text-neutral-600">
              Permite que otros clientes vean información básica de tu salón
            </p>
          </div>
          <Switch
            checked={settings.privacy.showProfile}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                privacy: { ...settings.privacy, showProfile: checked }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Compartir progreso</Label>
            <p className="text-sm text-neutral-600">
              Permite usar tu proyecto como ejemplo (datos anonimizados)
            </p>
          </div>
          <Switch
            checked={settings.privacy.shareProgress}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                privacy: { ...settings.privacy, shareProgress: checked }
              })
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Análisis de uso</Label>
            <p className="text-sm text-neutral-600">
              Ayúdanos a mejorar permitiendo análisis anónimos de uso
            </p>
          </div>
          <Switch
            checked={settings.privacy.allowAnalytics}
            onCheckedChange={(checked) =>
              setSettings({
                ...settings,
                privacy: { ...settings.privacy, allowAnalytics: checked }
              })
            }
          />
        </div>
      </CardContent>
    </Card>

    <Button onClick={onSave} disabled={loading} className="w-full md:w-auto">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Guardando...
        </div>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Guardar preferencias
        </>
      )}
    </Button>
  </div>
)

export default function ClientSettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({
    profile: false,
    notifications: false,
    security: false,
    billing: false,
    preferences: false
  })

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Form states
  const [profile, setProfile] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    salonName: '',
    address: '',
    website: '',
    bio: ''
  })

  const [settings, setSettings] = useState<ClientSettings>({
    userId: '',
    notifications: {
      email: {
        projectUpdates: true,
        paymentReminders: true,
        supportMessages: true,
        marketing: false
      },
      push: {
        projectUpdates: true,
        supportMessages: true,
        urgentOnly: false
      }
    },
    preferences: {
      language: 'es',
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light'
    },
    privacy: {
      showProfile: false,
      shareProgress: true,
      allowAnalytics: true
    }
  })

  const [securityForm, setSecurityForm] = useState<SecurityForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  })

  const [billingInfo] = useState<BillingInfo>({
    cardLast4: '1234',
    cardType: 'Visa',
    expiryDate: '12/26',
    billingAddress: 'Madrid, España',
    subscriptionPlan: 'Premium',
    nextBilling: '1 de diciembre, 2024',
    amount: 89
  })

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({
    profile: {},
    security: {}
  })

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!session) return

      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Load mock data
      setProfile({
        name: session.user?.name || '',
        email: session.user?.email || '',
        phone: '+34 600 123 456',
        salonName: session.user?.salonName || 'Mi Salón',
        address: 'Calle Gran Vía 12, 28013 Madrid',
        website: 'https://mi-salon.com',
        bio: 'Salón especializado en cortes modernos y tratamientos capilares de alta calidad. Más de 15 años de experiencia creando looks únicos.'
      })

      setSettings(prev => ({
        ...prev,
        userId: session.user?.id || ''
      }))

      setLoading(false)
    }

    loadData()
  }, [session])

  // Validation functions
  const validateProfile = (profileData: ProfileForm) => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!profileData.salonName.trim()) {
      newErrors.salonName = 'El nombre del salón es obligatorio'
    }

    return newErrors
  }

  const validateSecurity = (securityData: SecurityForm) => {
    const newErrors: Record<string, string> = {}

    if (!securityData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria'
    }

    if (!securityData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria'
    } else if (securityData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(securityData.newPassword)) {
      newErrors.newPassword = 'La contraseña no cumple los requisitos de seguridad'
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return newErrors
  }

  // Save functions
  const saveProfile = async () => {
    const validationErrors = validateProfile(profile)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, profile: validationErrors }))
      return
    }

    setErrors(prev => ({ ...prev, profile: {} }))
    setSaving(prev => ({ ...prev, profile: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStatusMessage({ type: 'success', message: 'Perfil actualizado correctamente' })

      setTimeout(() => setStatusMessage(null), 5000)
    } catch {
      setStatusMessage({ type: 'error', message: 'Error al actualizar el perfil' })
    } finally {
      setSaving(prev => ({ ...prev, profile: false }))
    }
  }

  const saveNotifications = async () => {
    setSaving(prev => ({ ...prev, notifications: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setStatusMessage({ type: 'success', message: 'Configuración de notificaciones guardada' })

      setTimeout(() => setStatusMessage(null), 5000)
    } catch {
      setStatusMessage({ type: 'error', message: 'Error al guardar la configuración' })
    } finally {
      setSaving(prev => ({ ...prev, notifications: false }))
    }
  }

  const saveSecurity = async () => {
    const validationErrors = validateSecurity(securityForm)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, security: validationErrors }))
      return
    }

    setErrors(prev => ({ ...prev, security: {} }))
    setSaving(prev => ({ ...prev, security: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setStatusMessage({ type: 'success', message: 'Configuración de seguridad actualizada' })

      // Clear password fields
      setSecurityForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      setTimeout(() => setStatusMessage(null), 5000)
    } catch {
      setStatusMessage({ type: 'error', message: 'Error al actualizar la seguridad' })
    } finally {
      setSaving(prev => ({ ...prev, security: false }))
    }
  }

  const savePreferences = async () => {
    setSaving(prev => ({ ...prev, preferences: true }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setStatusMessage({ type: 'success', message: 'Preferencias guardadas correctamente' })

      setTimeout(() => setStatusMessage(null), 5000)
    } catch {
      setStatusMessage({ type: 'error', message: 'Error al guardar las preferencias' })
    } finally {
      setSaving(prev => ({ ...prev, preferences: false }))
    }
  }

  const updatePaymentMethod = () => {
    setStatusMessage({ type: 'success', message: 'Función de actualización de pago próximamente disponible' })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  const cancelSubscription = () => {
    setStatusMessage({ type: 'success', message: 'Función de cancelación próximamente disponible' })
    setTimeout(() => setStatusMessage(null), 5000)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <LoadingSkeleton className="h-96 w-full lg:col-span-1" />
          <LoadingSkeleton className="h-96 w-full lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Configuración
            </h1>
            <p className="text-neutral-600">
              Gestiona tu perfil, preferencias y configuración de cuenta
            </p>
          </div>
        </div>

        {/* Status Message */}
        <AnimatePresence>
          {statusMessage && (
            <StatusMessage
              type={statusMessage.type}
              message={statusMessage.message}
              onDismiss={() => setStatusMessage(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Facturación</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preferencias</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSection
              profile={profile}
              setProfile={setProfile}
              onSave={saveProfile}
              loading={saving.profile}
              errors={errors.profile || {}}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSection
              settings={settings}
              setSettings={setSettings}
              onSave={saveNotifications}
              loading={saving.notifications}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySection
              securityForm={securityForm}
              setSecurityForm={setSecurityForm}
              onSave={saveSecurity}
              loading={saving.security}
              errors={errors.security || {}}
            />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingSection
              billingInfo={billingInfo}
              onUpdatePaymentMethod={updatePaymentMethod}
              onCancelSubscription={cancelSubscription}
              loading={saving.billing}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <PreferencesSection
              settings={settings}
              setSettings={setSettings}
              onSave={savePreferences}
              loading={saving.preferences}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}