import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Ship,
  Search,
  Map,
  Users,
  FileText,
  Calendar,
  Route,
  Calculator,
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Anchor,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: '',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
    ],
  },
  {
    title: 'ENQUIRIES',
    items: [
      { title: 'Cargo Enquiries', href: '/enquiries/cargo', icon: Package },
      { title: 'Vessel Enquiries', href: '/enquiries/vessel', icon: Ship },
    ],
  },
  {
    title: 'TONNAGE',
    items: [
      { title: 'Tonnage Search', href: '/tonnage/search', icon: Search },
      { title: 'Vessels', href: '/vessels', icon: Ship },
      { title: 'Live Map', href: '/map', icon: Map },
    ],
  },
  {
    title: 'FLEET',
    items: [
      { title: 'My Fleet', href: '/fleet', icon: Users },
      { title: 'Certificates', href: '/fleet/certificates', icon: FileText },
      { title: 'Calendar', href: '/fleet/calendar', icon: Calendar },
    ],
  },
  {
    title: 'VOYAGE',
    items: [
      { title: 'Distance', href: '/voyage/distance', icon: Route },
      { title: 'Estimator', href: '/voyage/estimator', icon: Calculator },
    ],
  },
  {
    title: 'FORECASTING',
    items: [
      { title: 'Freight Forecast', href: '/forecast', icon: TrendingUp },
      { title: 'Market Intelligence', href: '/market-intelligence', icon: BarChart3 },
    ],
  },
  {
    title: 'OPTIMIZATION',
    items: [
      { title: 'Charter Optimizer', href: '/optimization/charter', icon: Settings },
      { title: 'Vessel Recommendation', href: '/optimization/vessels', icon: Ship },
    ],
  },
  {
    title: 'REFERENCE',
    items: [
      { title: 'Ports', href: '/ports', icon: Anchor },
      { title: 'Alerts', href: '/alerts', icon: Bell },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/ship_icon.png" alt="BonVoyage" className="w-full h-full object-contain"/>
            </div>
            <span className="font-semibold text-lg">BonVoyage</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {section.title && !collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
