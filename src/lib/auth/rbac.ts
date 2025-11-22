import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

/**
 * Role-Based Access Control (RBAC) utilities
 * Manages permissions and access control based on user roles
 */

// Define permissions for each role
export const PERMISSIONS = {
  // Admin permissions
  ADMIN: [
    'manage_users',
    'manage_orders',
    'manage_templates',
    'manage_settings',
    'view_analytics',
    'manage_content',
    'manage_testimonials',
    'manage_faq',
    'access_admin_panel',
    'export_data',
    'manage_billing',
    'manage_domains',
    'send_notifications',
    'view_all_orders',
    'edit_all_orders',
    'delete_all_orders',
    'view_all_users',
    'edit_all_users',
    'delete_users',
    'manage_api_keys',
  ],
  // Client permissions
  CLIENT: [
    'view_own_profile',
    'edit_own_profile',
    'view_own_orders',
    'create_order',
    'view_templates',
    'contact_support',
    'manage_own_website',
    'view_own_analytics',
    'download_own_data',
    'manage_own_billing',
    'cancel_own_subscription',
  ],
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][number];

/**
 * Check if a role has a specific permission
 * @param role - User role
 * @param permission - Permission to check
 * @returns True if role has permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[role];
  return rolePermissions ? (rolePermissions as readonly string[]).includes(permission as string) : false;
}

/**
 * Check if current user has a specific permission
 * @param permission - Permission to check
 * @returns True if user has permission
 */
export async function currentUserHasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return roleHasPermission(user.role, permission);
}

/**
 * Get all permissions for a role
 * @param role - User role
 * @returns Array of permissions
 */
export function getRolePermissions(role: UserRole): readonly Permission[] {
  return PERMISSIONS[role] || [];
}

/**
 * Check if current user can perform an action on a resource
 * @param action - Action to perform
 * @param resource - Resource to act upon
 * @returns True if user can perform action
 */
export async function canUserPerformAction(
  action: string,
  resource: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Admin can do everything
  if (user.role === 'ADMIN') return true;

  // Check specific resource-based permissions
  const permission = `${action}_${resource}` as Permission;
  return roleHasPermission(user.role, permission);
}

/**
 * Resource ownership check
 * @param resourceOwnerId - ID of the resource owner
 * @returns True if current user owns the resource or is admin
 */
export async function userOwnsResource(resourceOwnerId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Admin can access all resources
  if (user.role === 'ADMIN') return true;
  
  // Check if user owns the resource
  return user.id === resourceOwnerId;
}

/**
 * Check if user can access a specific route
 * @param route - Route path
 * @param role - User role
 * @returns True if user can access route
 */
export function canAccessRoute(route: string, role: UserRole): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/admin': ['ADMIN'],
    '/dashboard': ['CLIENT', 'ADMIN'],
    '/profile': ['CLIENT', 'ADMIN'],
    '/settings': ['CLIENT', 'ADMIN'],
    '/orders': ['CLIENT', 'ADMIN'],
    '/analytics': ['CLIENT', 'ADMIN'],
    '/users': ['ADMIN'],
    '/templates/manage': ['ADMIN'],
    '/billing': ['CLIENT', 'ADMIN'],
    '/support': ['CLIENT', 'ADMIN'],
  };

  // Check if route has specific role requirements
  for (const [path, allowedRoles] of Object.entries(routePermissions)) {
    if (route.startsWith(path)) {
      return allowedRoles.includes(role);
    }
  }

  // Default: allow access to public routes
  return true;
}

/**
 * Get accessible menu items based on user role
 * @param role - User role
 * @returns Array of menu items user can access
 */
export function getAccessibleMenuItems(role: UserRole) {
  const allMenuItems = [
    { label: 'Dashboard', href: '/dashboard', roles: ['CLIENT', 'ADMIN'] },
    { label: 'Orders', href: '/orders', roles: ['CLIENT', 'ADMIN'] },
    { label: 'Templates', href: '/templates', roles: ['CLIENT', 'ADMIN'] },
    { label: 'Analytics', href: '/analytics', roles: ['CLIENT', 'ADMIN'] },
    { label: 'Profile', href: '/profile', roles: ['CLIENT', 'ADMIN'] },
    { label: 'Settings', href: '/settings', roles: ['CLIENT', 'ADMIN'] },
    { label: 'Admin Panel', href: '/admin', roles: ['ADMIN'] },
    { label: 'User Management', href: '/admin/users', roles: ['ADMIN'] },
    { label: 'Template Management', href: '/admin/templates', roles: ['ADMIN'] },
    { label: 'System Settings', href: '/admin/settings', roles: ['ADMIN'] },
  ];

  return allMenuItems.filter(item => 
    item.roles.includes(role)
  );
}

/**
 * Check if user can edit a specific field
 * @param field - Field name
 * @param role - User role
 * @returns True if user can edit field
 */
export function canEditField(field: string, role: UserRole): boolean {
  const fieldPermissions: Record<string, UserRole[]> = {
    // User fields
    'user.email': ['CLIENT', 'ADMIN'],
    'user.name': ['CLIENT', 'ADMIN'],
    'user.password': ['CLIENT', 'ADMIN'],
    'user.phone': ['CLIENT', 'ADMIN'],
    'user.role': ['ADMIN'],
    'user.isActive': ['ADMIN'],
    
    // Order fields
    'order.status': ['ADMIN'],
    'order.total': ['ADMIN'],
    'order.templateId': ['ADMIN'],
    
    // Template fields
    'template.price': ['ADMIN'],
    'template.active': ['ADMIN'],
    'template.features': ['ADMIN'],
    
    // System settings
    'settings.maintenance': ['ADMIN'],
    'settings.emailProvider': ['ADMIN'],
    'settings.paymentProvider': ['ADMIN'],
  };

  return fieldPermissions[field]?.includes(role) || false;
}

/**
 * Get data access level for a user role
 * @param role - User role
 * @returns Data access level
 */
export function getDataAccessLevel(role: UserRole): 'own' | 'all' | 'none' {
  switch (role) {
    case 'ADMIN':
      return 'all';
    case 'CLIENT':
      return 'own';
    default:
      return 'none';
  }
}

/**
 * Check if user can perform bulk operations
 * @param role - User role
 * @returns True if user can perform bulk operations
 */
export function canPerformBulkOperations(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Get API rate limits based on role
 * @param role - User role
 * @returns Rate limit configuration
 */
export function getRateLimits(role: UserRole) {
  const limits = {
    ADMIN: {
      requests: 1000,
      window: 60 * 1000, // 1 minute
      maxBurst: 50,
    },
    CLIENT: {
      requests: 100,
      window: 60 * 1000, // 1 minute
      maxBurst: 10,
    },
  };

  return limits[role] || limits.CLIENT;
}

/**
 * Check if user can export data
 * @param dataType - Type of data to export
 * @param role - User role
 * @returns True if user can export data
 */
export function canExportData(dataType: string, role: UserRole): boolean {
  const exportPermissions: Record<string, UserRole[]> = {
    'users': ['ADMIN'],
    'orders': ['ADMIN'],
    'templates': ['ADMIN'],
    'analytics': ['ADMIN'],
    'own_orders': ['CLIENT', 'ADMIN'],
    'own_data': ['CLIENT', 'ADMIN'],
  };

  return exportPermissions[dataType]?.includes(role) || false;
}

/**
 * Validate action against user permissions
 * @param action - Action to validate
 * @returns True if action is allowed
 */
export async function validateAction(action: {
  type: string;
  resource?: string;
  resourceOwnerId?: string;
}): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Admin bypass
  if (user.role === 'ADMIN') return true;

  // Check resource ownership if applicable
  if (action.resourceOwnerId) {
    const ownsResource = await userOwnsResource(action.resourceOwnerId);
    if (!ownsResource) return false;
  }

  // Check specific permissions
  const permission = action.resource 
    ? `${action.type}_${action.resource}` as Permission
    : action.type as Permission;

  return roleHasPermission(user.role, permission);
}

/**
 * Get filtered data based on user role
 * @param data - Data to filter
 * @param role - User role
 * @param userId - User ID
 * @returns Filtered data
 */
export function filterDataByRole<T extends { userId?: string }>(
  data: T[],
  role: UserRole,
  userId: string
): T[] {
  if (role === 'ADMIN') {
    return data; // Admin sees everything
  }

  // Client only sees their own data
  return data.filter(item => item.userId === userId);
}

/**
 * Check if user has elevated privileges
 * @param role - User role
 * @returns True if user has elevated privileges
 */
export function hasElevatedPrivileges(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Get maximum allowed file upload size based on role
 * @param role - User role
 * @returns Maximum file size in bytes
 */
export function getMaxFileUploadSize(role: UserRole): number {
  const limits = {
    ADMIN: 50 * 1024 * 1024, // 50MB
    CLIENT: 10 * 1024 * 1024, // 10MB
  };

  return limits[role] || limits.CLIENT;
}