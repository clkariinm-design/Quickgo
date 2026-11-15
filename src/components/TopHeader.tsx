import React from 'react';
import { Bell, ChevronDown, MapPin, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import { Logo } from './Logo';

export const TopHeader: React.FC = () => {
  const {
    activePortal,
    activeTab,
    setActiveTab,
    selectedAddress,
    openLocationSheet,
    language,
    setLanguage,
    cartCount,
    openCart,
    openNotifications,
    unreadCount,
    tr,
    orders,
  } = useApp();

  if (activePortal !== 'customer') return null;

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: tr('navHome') },
    { id: 'search', label: tr('navSearch') },
    { id: 'orders', label: tr('navOrders') },
    { id: 'favorites', label: tr('navFavorites') },
    { id: 'profile', label: tr('navProfile') },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6 min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="hidden md:flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24] rounded-lg"
          >
            <Logo size="sm" />
          </button>

          <button
            type="button"
            onClick={openLocationSheet}
            className="flex items-center gap-2 min-h-[44px] text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24] rounded-lg pr-2 min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF8A24] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 leading-none">
                {tr('deliverTo')} · {selectedAddress?.city || 'Burco'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-semibold text-[#142B4A] truncate max-w-[140px] sm:max-w-[220px]">
                  {selectedAddress?.label} · {selectedAddress?.district}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-[#142B4A] transition-colors" />
              </div>
            </div>
          </button>
        </div>

        <nav
          aria-label="Desktop Navigation"
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24] rounded ${
                  isActive
                    ? 'text-[#142B4A] font-semibold'
                    : 'text-slate-500 hover:text-[#142B4A]'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'orders' && activeOrders > 0 && (
                  <span className="ml-1.5 text-xs font-mono font-semibold text-[#FF8A24] tabular-nums">
                    ({activeOrders})
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF8A24] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openNotifications}
            aria-label={tr('notifications')}
            className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-[#142B4A] flex items-center justify-center transition-colors shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF8A24] text-white text-[10px] font-mono font-bold tabular-nums flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div
            role="group"
            aria-label="Language Selector"
            className="flex items-center bg-slate-100 rounded-lg p-0.5"
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                language === 'en'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-slate-500 hover:text-[#142B4A]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('so')}
              className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                language === 'so'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-slate-500 hover:text-[#142B4A]'
              }`}
            >
              SO
            </button>
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={tr('cart')}
            className="relative flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl bg-[#142B4A] text-white hover:bg-[#0E1F36] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
          >
            <ShoppingBag className="w-4 h-4 text-[#FF8A24]" />
            <span className="hidden sm:inline text-xs font-semibold">
              {tr('cart')}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums bg-white/15 px-1.5 py-0.5 rounded-md">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
