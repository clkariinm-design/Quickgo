import React from 'react';
import { Bell, CheckCheck, CreditCard, PackageCheck, ShieldCheck, Tag, Truck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    language,
    tr,
    isNotificationsOpen,
    closeNotifications,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    openOrderTracking,
  } = useApp();

  if (!isNotificationsOpen) return null;

  const iconForCategory = (cat: string) => {
    switch (cat) {
      case 'otp':
        return ShieldCheck;
      case 'driver':
        return Truck;
      case 'payment':
        return CreditCard;
      case 'promo':
        return Tag;
      default:
        return PackageCheck;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={tr('notifications')}
      onClick={closeNotifications}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF8A24]" />
            <h2 className="font-display text-lg font-bold text-[#142B4A]">
              {tr('notifications')}
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-semibold text-[#FF8A24] tabular-nums">
                ({unreadCount})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="min-h-[40px] px-3 text-xs font-semibold text-[#142B4A] hover:text-[#FF8A24] inline-flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{tr('markAllRead')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeNotifications}
              aria-label="Close"
              className="w-11 h-11 rounded-full flex items-center justify-center text-[#142B4A] hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.map((n) => {
            const Icon = iconForCategory(n.category);
            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.orderId) {
                    closeNotifications();
                    openOrderTracking(n.orderId);
                  }
                }}
                className={`p-4 rounded-2xl border transition-colors ${
                  n.read
                    ? 'border-slate-200/80 bg-white'
                    : 'border-orange-200 bg-orange-50/40'
                } ${n.orderId ? 'cursor-pointer hover:border-[#142B4A]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#142B4A] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display font-bold text-sm text-[#142B4A]">
                        {n.title[language]}
                      </p>
                      <span className="text-[11px] text-slate-400 uppercase font-medium">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {n.message[language]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
