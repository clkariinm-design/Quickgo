import React from 'react';
import { ChevronRight, Clock, PackageCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { OrderTrackingView } from './OrderTrackingView';

export const OrdersScreen: React.FC = () => {
  const { tr, orders, activeOrderId, openOrderTracking, setActiveTab } = useApp();

  const selectedOrder = orders.find((o) => o.id === activeOrderId);
  if (selectedOrder) {
    return <OrderTrackingView order={selectedOrder} />;
  }

  const activeList = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const pastList = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  const statusLabel = (order: Order) => {
    switch (order.status) {
      case 'confirmed':
        return tr('stageConfirmed');
      case 'preparing':
        return tr('stagePreparing');
      case 'driver_assigned':
        return tr('stageDriverAssigned');
      case 'picked_up':
        return tr('stagePickedUp');
      case 'delivered':
        return tr('stageDelivered');
      case 'cancelled':
        return tr('stageCancelled');
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-[#142B4A] flex items-center justify-center mx-auto mb-4">
          <PackageCheck className="w-7 h-7" />
        </div>
        <h1 className="font-display text-xl font-bold text-[#142B4A]">
          {tr('noOrdersTitle')}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto">
          {tr('noOrdersSubtitle')}
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="mt-6 min-h-[44px] px-6 rounded-xl bg-[#142B4A] text-white text-sm font-semibold hover:bg-[#0E1F36] transition-colors"
        >
          {tr('browseStores')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12 space-y-8">
      <h1 className="font-display text-2xl font-bold text-[#142B4A]">
        {tr('navOrders')}
      </h1>

      {activeList.length > 0 && (
        <section className="space-y-3.5">
          <h2 className="font-display text-base font-bold text-[#142B4A]">
            {tr('activeOrders')}
          </h2>
          <div className="space-y-3">
            {activeList.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrderTracking(order.id)}
                className="w-full text-left rounded-2xl border border-[#142B4A]/20 bg-white p-5 hover:border-[#142B4A] transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-[#142B4A]">
                      {order.orderNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#FF8A24]">
                      {statusLabel(order)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#142B4A]">
                    {order.storeName}
                  </h3>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items ·{' '}
                    <span className="font-mono font-semibold text-[#142B4A]">
                      ${order.total.toFixed(2)} USD
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#142B4A] tabular-nums">
                    <Clock className="w-4 h-4 text-[#FF8A24]" />
                    <span>
                      {order.estimatedMinutes} {tr('mins')}
                    </span>
                  </div>
                  <span className="min-h-[40px] px-4 rounded-xl bg-[#142B4A] text-white text-xs font-semibold inline-flex items-center gap-1.5">
                    <span>{tr('trackOrder')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {pastList.length > 0 && (
        <section className="space-y-3.5">
          <h2 className="font-display text-base font-bold text-[#142B4A]">
            {tr('pastOrders')}
          </h2>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
            {pastList.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrderTracking(order.id)}
                className="w-full text-left p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-medium">{order.orderNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-medium ${
                        order.status === 'cancelled' ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {statusLabel(order)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#142B4A] mt-0.5 truncate">
                    {order.storeName}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-sm text-[#142B4A] tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
