import React from 'react';
import { Heart, Home, PackageCheck, Search, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, tr, orders } = useApp();

  const activeOrderCount = orders.filter((o) => o.status !== 'delivered').length;

  const items: {
    id: NavTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'home', label: tr('navHome'), icon: Home },
    { id: 'search', label: tr('navSearch'), icon: Search },
    {
      id: 'orders',
      label: tr('navOrders'),
      icon: PackageCheck,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined,
    },
    { id: 'favorites', label: tr('navFavorites'), icon: Heart },
    { id: 'profile', label: tr('navProfile'), icon: User },
  ];

  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24] ${
                isActive ? 'text-[#142B4A]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-transform ${
                    isActive ? 'text-[#FF8A24] scale-105' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#142B4A] text-white text-[10px] font-bold tabular-nums flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight whitespace-nowrap ${
                  isActive ? 'font-bold text-[#142B4A]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
