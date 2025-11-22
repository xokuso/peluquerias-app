// Admin Panel Type Definitions

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  phone?: string;
  address?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT'
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: Date;
  notes?: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  preferredStylist?: string;
  allergies?: string[];
  preferences?: ClientPreferences;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  status: ClientStatus;
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VIP = 'VIP',
  BLOCKED = 'BLOCKED'
}

export interface ClientPreferences {
  hairType?: string;
  favoriteServices?: string[];
  preferredProducts?: string[];
  communicationPreference?: 'EMAIL' | 'SMS' | 'PHONE' | 'WHATSAPP';
  marketingOptIn: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration: number; // in minutes
  image?: string;
  isActive: boolean;
  requiresConsultation?: boolean;
  minimumNotice?: number; // hours
  maximumAdvanceBooking?: number; // days
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  client?: Client;
  serviceId: string;
  service?: Service;
  staffId: string;
  staff?: User;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  price: number;
  deposit?: number;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  client?: Client;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface OrderItem {
  id: string;
  productId?: string;
  serviceId?: string;
  product?: Product;
  service?: Service;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ONLINE = 'ONLINE',
  WALLET = 'WALLET'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  category: ProductCategory;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

export interface Employee {
  id: string;
  userId: string;
  user?: User;
  specialties: string[];
  workingHours: WorkingHours[];
  commission?: number;
  salary?: number;
  hireDate: Date;
  employeeCode: string;
  emergencyContact?: EmergencyContact;
  documents?: Document[];
  performance?: EmployeePerformance;
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6, Sunday-Saturday
  startTime: string; // HH:mm format
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isAvailable: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
}

export interface EmployeePerformance {
  rating: number;
  totalClients: number;
  totalRevenue: number;
  averageServiceTime: number;
  clientRetentionRate: number;
  lastReviewDate?: Date;
}

export interface Analytics {
  period: AnalyticsPeriod;
  revenue: RevenueMetrics;
  appointments: AppointmentMetrics;
  clients: ClientMetrics;
  services: ServiceMetrics;
  products: ProductMetrics;
  staff: StaffMetrics;
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  label: string;
}

export interface RevenueMetrics {
  total: number;
  growth: number;
  byService: { [key: string]: number };
  byProduct: { [key: string]: number };
  byPaymentMethod: { [key: string]: number };
  daily: TimeSeriesData[];
  topServices: { service: Service; revenue: number }[];
  topProducts: { product: Product; revenue: number }[];
}

export interface AppointmentMetrics {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  averageDuration: number;
  utilizationRate: number;
  peakHours: { hour: number; count: number }[];
  byStatus: { [key: string]: number };
}

export interface ClientMetrics {
  total: number;
  new: number;
  returning: number;
  churnRate: number;
  averageLifetimeValue: number;
  topClients: { client: Client; revenue: number }[];
  byStatus: { [key: string]: number };
  acquisitionChannels: { [key: string]: number };
}

export interface ServiceMetrics {
  mostPopular: { service: Service; count: number }[];
  leastPopular: { service: Service; count: number }[];
  averageRating: { [serviceId: string]: number };
  byCategory: { [category: string]: number };
}

export interface ProductMetrics {
  topSelling: { product: Product; quantity: number }[];
  lowStock: Product[];
  turnoverRate: number;
  byCategory: { [category: string]: number };
}

export interface StaffMetrics {
  performance: { employee: Employee; metrics: EmployeePerformance }[];
  utilization: { [employeeId: string]: number };
  topPerformers: Employee[];
  scheduleAdherence: number;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface Settings {
  general: GeneralSettings;
  booking: BookingSettings;
  payment: PaymentSettings;
  email: EmailSettings;
  sms: SMSSettings;
  notifications: NotificationSettings;
  loyalty: LoyaltySettings;
  tax: TaxSettings;
}

export interface GeneralSettings {
  businessName: string;
  logo: string;
  favicon?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  businessHours: WorkingHours[];
  holidays: Holiday[];
}

export interface Holiday {
  date: Date;
  name: string;
  isRecurring: boolean;
}

export interface BookingSettings {
  requireDeposit: boolean;
  depositAmount: number;
  depositType: 'FIXED' | 'PERCENTAGE';
  cancellationPolicy: string;
  cancellationFee: number;
  minimumNotice: number; // hours
  maximumAdvanceBooking: number; // days
  allowOnlineBooking: boolean;
  requireConfirmation: boolean;
  bufferTime: number; // minutes between appointments
}

export interface PaymentSettings {
  acceptedMethods: PaymentMethod[];
  stripeEnabled: boolean;
  stripePublicKey?: string;
  paypalEnabled: boolean;
  paypalClientId?: string;
  cashEnabled: boolean;
  bankTransferEnabled: boolean;
  taxRate: number;
}

export interface EmailSettings {
  provider: 'SMTP' | 'SENDGRID' | 'MAILGUN' | 'AWS_SES';
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpSecure?: boolean;
  apiKey?: string;
}

export interface SMSSettings {
  provider: 'TWILIO' | 'VONAGE' | 'AWS_SNS';
  enabled: boolean;
  fromNumber?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface NotificationSettings {
  emailNotifications: {
    appointmentConfirmation: boolean;
    appointmentReminder: boolean;
    appointmentCancellation: boolean;
    orderConfirmation: boolean;
    marketingEmails: boolean;
  };
  smsNotifications: {
    appointmentReminder: boolean;
    appointmentCancellation: boolean;
    marketingMessages: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    vapidPublicKey?: string;
  };
  reminderTiming: {
    firstReminder: number; // hours before appointment
    secondReminder?: number;
  };
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerCurrency: number;
  minimumRedeemPoints: number;
  pointsExpiry?: number; // days
  tiers: LoyaltyTier[];
  bonusEvents: BonusEvent[];
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  discountPercentage: number;
}

export interface BonusEvent {
  event: 'BIRTHDAY' | 'REFERRAL' | 'REVIEW' | 'FIRST_VISIT';
  points: number;
  description: string;
}

export interface TaxSettings {
  defaultRate: number;
  includeInPrices: boolean;
  taxNumber?: string;
  customRates: CustomTaxRate[];
}

export interface CustomTaxRate {
  name: string;
  rate: number;
  applicableTo: 'SERVICES' | 'PRODUCTS' | 'ALL';
}

// Dashboard specific types
export interface DashboardStats {
  todayRevenue: number;
  todayAppointments: number;
  newClients: number;
  pendingAppointments: number;
  revenueGrowth: number;
  appointmentGrowth: number;
  clientGrowth: number;
  averageRating: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
}

export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Filter and Sort Types
export interface TableFilters {
  search?: string;
  status?: string[];
  dateRange?: DateRange;
  categories?: string[];
  tags?: string[];
  priceRange?: PriceRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}