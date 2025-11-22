import { AdminDashboardStats, ApiResponse, RecentOrderData } from '@/types/api';

class AdminService {
  private baseUrl = '/api/admin';

  async getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        error: `HTTP error! status: ${response.status}`
      }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: 'GET',
      headers: await this.getHeaders(),
      cache: 'no-store'
    });

    const result = await this.handleResponse<AdminDashboardStats>(response);
    return result.data!;
  }

  async getRecentOrders(limit: number = 10, status?: string): Promise<RecentOrderData[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await fetch(`${this.baseUrl}/orders/recent?${params}`, {
      method: 'GET',
      headers: await this.getHeaders(),
      cache: 'no-store'
    });

    const result = await this.handleResponse<RecentOrderData[]>(response);
    return result.data || [];
  }

  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  } = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/orders?${searchParams}`, {
      method: 'GET',
      headers: await this.getHeaders(),
      cache: 'no-store'
    });

    return this.handleResponse(response);
  }

  async getUserStats() {
    const response = await fetch(`${this.baseUrl}/users/stats`, {
      method: 'GET',
      headers: await this.getHeaders(),
      cache: 'no-store'
    });

    return this.handleResponse(response);
  }

  async getMessageStats() {
    const response = await fetch(`${this.baseUrl}/messages/stats`, {
      method: 'GET',
      headers: await this.getHeaders(),
      cache: 'no-store'
    });

    return this.handleResponse(response);
  }

  // Order management methods
  async updateOrderStatus(orderId: string, status: string) {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ status })
    });

    return this.handleResponse(response);
  }

  async deleteOrder(orderId: string) {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      method: 'DELETE',
      headers: await this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Message management methods
  async markMessageAsRead(messageId: string) {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: await this.getHeaders()
    });

    return this.handleResponse(response);
  }

  async replyToMessage(messageId: string, reply: string) {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}/reply`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ reply })
    });

    return this.handleResponse(response);
  }

  // Template management methods
  async getTemplateStats() {
    const response = await fetch(`${this.baseUrl}/templates/stats`, {
      method: 'GET',
      headers: await this.getHeaders(),
      cache: 'no-store'
    });

    return this.handleResponse(response);
  }

  async toggleTemplateStatus(templateId: string, active: boolean) {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ active })
    });

    return this.handleResponse(response);
  }
}

export const adminService = new AdminService();