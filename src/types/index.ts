// Global types for the hair salon application

export interface HairSalon {
  id: string
  name: string
  email: string
  phone: string
  address: string
  domain: string
  template: string
  createdAt: Date
  updatedAt: Date
}

export interface Template {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  preview: string
  category: 'basic' | 'premium' | 'enterprise'
}

// Enhanced Template Gallery Types with UX Psychology
export interface TemplatePersona {
  target: string
  psychology: string
  primaryMessage: string
  trustFactors: string[]
  demographicFit: string[]
}

export interface TemplatePsychology {
  decisionTriggers: string[]
  socialProofElements: string[]
  visualHierarchy: string[]
  emotionalResponse: string
}

export interface TemplateInteractions {
  hoverEffects: {
    scale: number
    shadowIntensity: 'low' | 'medium' | 'high'
    infoRevealSpeed: number
  }
  loadingStrategy: 'eager' | 'lazy' | 'progressive'
  animationTiming: {
    entrance: number
    hover: number
    selection: number
  }
}

export interface TemplateAnalytics {
  conversionRate?: number
  popularityScore: number
  usageCount: number
  averageSessionTime?: number
  recommendationWeight: number
}

export interface HairSalonTemplate {
  id: string
  name: string
  tagline: string // Short compelling tagline
  description: string
  longDescription: string // Detailed description for hover states

  // Visual Identity
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }

  // Assets
  mockup: {
    desktop: string
    mobile: string
    thumbnail: string
    gallery: string[] // Additional screenshots
    sections: string[]
  }

  // Psychology & UX
  persona: TemplatePersona
  psychology: TemplatePsychology
  interactions: TemplateInteractions

  // Business Logic
  category: 'elegant' | 'modern' | 'beauty' | 'barber' | 'classic' | 'trendy'
  pricing: {
    setupPrice: number
    monthlyPrice: number
    yearlyDiscount?: number
  }

  // Features & Social Proof
  features: {
    core: string[] // Essential features always visible
    advanced: string[] // Shown on hover/expansion
    exclusive: string[] // Unique selling points
  }

  // Trust & Social Proof
  socialProof: {
    usedBy: string // "12+ salones elegantes"
    testimonial?: {
      quote: string
      author: string
      salon: string
    }
    badges: ('popular' | 'new' | 'recommended' | 'trending')[]
  }

  // Technical
  analytics: TemplateAnalytics
  status: 'active' | 'coming_soon' | 'deprecated'
  lastUpdated: Date

  // SEO & Metadata
  metadata: {
    seoTitle: string
    seoDescription: string
    keywords: string[]
  }
}

export interface Order {
  id: string
  salonName: string
  email: string
  phone: string
  domain: string
  templateId: string
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  stripeSessionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface DomainStatus {
  domain: string
  available: boolean
  suggestions?: string[]
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  message: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface Testimonial {
  id: string
  name: string
  salon: string
  rating: number
  comment: string
  avatar?: string
}

// Client Portal Types
export interface Project {
  id: string
  orderId: string
  name: string
  status: 'planning' | 'design' | 'development' | 'testing' | 'completed' | 'live'
  progress: number
  domain: string
  template: string
  startDate: Date
  estimatedCompletion: Date
  actualCompletion?: Date
  lastUpdate: Date
  milestones: ProjectMilestone[]
  files: ProjectFile[]
  timeline: TimelineEvent[]
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  dueDate: Date
  completedAt?: Date
  order: number
}

export interface ProjectFile {
  id: string
  name: string
  type: 'design' | 'document' | 'image' | 'video' | 'code' | 'other'
  size: number
  url: string
  uploadedAt: Date
  category: string
  description?: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  type: 'milestone' | 'update' | 'message' | 'file' | 'meeting'
  date: Date
  author?: string
  metadata?: Record<string, unknown>
}

export interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'design' | 'content' | 'billing' | 'general'
  userId: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  messages: TicketMessage[]
  attachments: TicketAttachment[]
}

export interface TicketMessage {
  id: string
  ticketId: string
  message: string
  isInternal: boolean
  authorId: string
  authorName: string
  authorType: 'client' | 'staff' | 'admin'
  createdAt: Date
  attachments?: TicketAttachment[]
}

export interface TicketAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface Payment {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  method: 'card' | 'bank_transfer' | 'paypal' | 'other'
  stripePaymentId?: string
  description: string
  paidAt?: Date
  refundedAt?: Date
  refundAmount?: number
  metadata?: Record<string, unknown>
  invoice?: Invoice
}

export interface Invoice {
  id: string
  number: string
  paymentId: string
  amount: number
  tax: number
  subtotal: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issuedAt: Date
  dueAt: Date
  paidAt?: Date
  items: InvoiceItem[]
  downloadUrl?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category?: string
}

export interface ClientNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'project_update' | 'payment' | 'support'
  read: boolean
  actionUrl?: string
  actionText?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  readAt?: Date
}

export interface ClientMessage {
  id: string
  fromUserId: string
  toUserId?: string
  subject: string
  content: string
  type: 'message' | 'announcement' | 'update'
  priority: 'low' | 'normal' | 'high'
  read: boolean
  starred: boolean
  projectId?: string
  attachments?: MessageAttachment[]
  createdAt: Date
  readAt?: Date
}

export interface MessageAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
}

export interface ClientSettings {
  userId: string
  notifications: {
    email: {
      projectUpdates: boolean
      paymentReminders: boolean
      supportMessages: boolean
      marketing: boolean
    }
    push: {
      projectUpdates: boolean
      supportMessages: boolean
      urgentOnly: boolean
    }
  }
  preferences: {
    language: string
    timezone: string
    currency: string
    dateFormat: string
    theme: 'light' | 'dark' | 'auto'
  }
  privacy: {
    showProfile: boolean
    shareProgress: boolean
    allowAnalytics: boolean
  }
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalSpent: number
  openTickets: number
  unreadMessages: number
  upcomingMilestones: number
  recentActivity: TimelineEvent[]
}