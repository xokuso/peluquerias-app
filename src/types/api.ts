// API Response Types for Admin Dashboard

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Admin Dashboard Statistics
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  monthlyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  newMessages: number;
  activeTemplates: number;
  recentOrders: RecentOrderData[];
  monthlyGrowth: {
    users: number;
    orders: number;
    revenue: number;
  };
}

// Recent Order Data for Dashboard
export interface RecentOrderData {
  id: string;
  salonName: string;
  ownerName: string;
  email: string;
  template: {
    name: string;
    category: string;
  };
  amount: number;
  status: string;
  date: string;
  domain: string;
}

// User Statistics
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    CLIENT: number;
    ADMIN: number;
  };
  byBusinessType: {
    [key: string]: number;
  };
  recentSignups: number;
  completedOnboarding: number;
}

// Order Statistics
export interface OrderStats {
  total: number;
  byStatus: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    CANCELLED: number;
    REFUNDED: number;
  };
  monthlyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
}

// Message Statistics
export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
  recentMessages: number;
}

// Template Statistics
export interface TemplateStats {
  total: number;
  active: number;
  byCategory: {
    BASIC: number;
    PREMIUM: number;
    ENTERPRISE: number;
  };
  mostPopular: {
    id: string;
    name: string;
    orderCount: number;
  }[];
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Parameters
export interface AdminFilterParams extends PaginationParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

// Dashboard Chart Data
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface DashboardChartData {
  revenue: ChartDataPoint[];
  orders: ChartDataPoint[];
  users: ChartDataPoint[];
}

// Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
}

// Utility type for async API handlers
export type ApiHandler<T = unknown> = () => Promise<ApiResponse<T>>;

// Date range for analytics
export interface DateRange {
  start: Date;
  end: Date;
}

// Monthly metrics calculation
export interface MonthlyMetrics {
  currentMonth: {
    revenue: number;
    orders: number;
    users: number;
  };
  previousMonth: {
    revenue: number;
    orders: number;
    users: number;
  };
  growth: {
    revenue: number;
    orders: number;
    users: number;
  };
}