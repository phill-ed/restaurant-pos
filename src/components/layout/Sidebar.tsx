'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Grid3X3, 
  ShoppingCart, 
  ChefHat, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Package, 
  Users, 
  UserCircle,
  LogOut,
  Menu,
  X,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePOS } from '@/context/POSContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Tables', href: '/tables', icon: Grid3X3 },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Kitchen', href: '/kitchen', icon: ChefHat },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Receipts', href: '/receipts', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Customers', href: '/customers', icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = usePOS();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-white
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-emerald-400">Restaurant POS</h1>
          <p className="text-xs text-slate-400">Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors duration-150
                      ${isActive 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="font-semibold">{currentUser?.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
