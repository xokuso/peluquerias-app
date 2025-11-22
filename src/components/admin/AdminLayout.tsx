'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  UserCircle,
  ShoppingBag,
  Scissors,
  DollarSign,
  FileText,
  UserCheck,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { User, Notification } from '@/types/admin';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: User;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: NavItem[];
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Clients',
      href: '/admin/clients',
      icon: Users,
      subItems: [
        { label: 'All Clients', href: '/admin/clients', icon: Users },
        { label: 'Add Client', href: '/admin/clients/new', icon: UserCircle },
        { label: 'VIP Clients', href: '/admin/clients/vip', icon: UserCheck },
      ]
    },
    {
      label: 'Appointments',
      href: '/admin/appointments',
      icon: Calendar,
      badge: 5,
      subItems: [
        { label: 'Calendar', href: '/admin/appointments', icon: Calendar },
        { label: 'New Booking', href: '/admin/appointments/new', icon: Calendar },
        { label: 'Waiting List', href: '/admin/appointments/waiting', icon: Calendar },
      ]
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: 3,
      subItems: [
        { label: 'All Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'New Order', href: '/admin/orders/new', icon: ShoppingBag },
        { label: 'Invoices', href: '/admin/orders/invoices', icon: FileText },
      ]
    },
    {
      label: 'Services',
      href: '/admin/services',
      icon: Scissors,
      subItems: [
        { label: 'All Services', href: '/admin/services', icon: Scissors },
        { label: 'Categories', href: '/admin/services/categories', icon: Package },
        { label: 'Pricing', href: '/admin/services/pricing', icon: DollarSign },
      ]
    },
    {
      label: 'Products',
      href: '/admin/products',
      icon: Package,
      subItems: [
        { label: 'Inventory', href: '/admin/products', icon: Package },
        { label: 'Add Product', href: '/admin/products/new', icon: Package },
        { label: 'Low Stock', href: '/admin/products/low-stock', icon: Package },
      ]
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      subItems: [
        { label: 'Overview', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Revenue', href: '/admin/analytics/revenue', icon: DollarSign },
        { label: 'Reports', href: '/admin/analytics/reports', icon: FileText },
      ]
    },
    {
      label: 'Staff',
      href: '/admin/staff',
      icon: UserCheck,
      subItems: [
        { label: 'All Staff', href: '/admin/staff', icon: Users },
        { label: 'Schedule', href: '/admin/staff/schedule', icon: Calendar },
        { label: 'Performance', href: '/admin/staff/performance', icon: BarChart3 },
      ]
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  useEffect(() => {
    // Load notifications
    fetchNotifications();

    // Check dark mode preference
    const savedDarkMode = localStorage.getItem('adminDarkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const fetchNotifications = async () => {
    // Mock notifications - replace with API call
    setNotifications([
      {
        id: '1',
        type: 'INFO',
        title: 'New Booking',
        message: 'Jane Doe booked a haircut for tomorrow',
        timestamp: new Date(),
        read: false,
      },
      {
        id: '2',
        type: 'WARNING',
        title: 'Low Stock',
        message: 'Hair color product is running low',
        timestamp: new Date(),
        read: false,
      },
    ]);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('adminDarkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
            <Link href="/admin" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                Salon Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            {navItems.map((item) => (
              <div key={item.label} className="mb-2">
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2 rounded-lg
                        transition-colors duration-200
                        ${isActive(item.href)
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`
                        h-4 w-4 transition-transform
                        ${expandedItems.includes(item.label) ? 'rotate-180' : ''}
                      `} />
                    </button>
                    {expandedItems.includes(item.label) && (
                      <div className="mt-1 ml-4">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`
                              flex items-center px-4 py-2 rounded-lg text-sm
                              transition-colors duration-200
                              ${isActive(subItem.href)
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }
                            `}
                          >
                            <ChevronRight className="h-3 w-3 mr-2" />
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-4 py-2 rounded-lg
                      transition-colors duration-200
                      ${isActive(item.href)
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div className="border-t dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clients, orders, services..."
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
                    <div className="p-4 border-b dark:border-gray-700">
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`
                              p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
                              ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                            `}
                          >
                            <div className="flex items-start">
                              <div className={`
                                h-2 w-2 rounded-full mt-2 mr-3
                                ${notif.type === 'ERROR' ? 'bg-red-500' : ''}
                                ${notif.type === 'WARNING' ? 'bg-yellow-500' : ''}
                                ${notif.type === 'SUCCESS' ? 'bg-green-500' : ''}
                                ${notif.type === 'INFO' ? 'bg-blue-500' : ''}
                              `} />
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 dark:text-white">
                                  {notif.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  {new Date(notif.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t dark:border-gray-700">
                      <Link
                        href="/admin/notifications"
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                    <hr className="my-1 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}