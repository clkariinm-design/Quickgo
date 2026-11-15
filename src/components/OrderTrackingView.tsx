import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { LiveTrackingMap } from './LiveTrackingMap';

interface OrderTrackingViewProps {
  order: Order;
}

const ORDER_FLOW: OrderStatus[] = [
  'confirmed',
  'preparing',
  'driver_assigned',
  'picked_up',
  'delivered',
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ order }) => {
  const {
    language,
    tr,
    closeOrderTracking,
    advanceOrderStatus,
    cancelOrder,
    requestRefund,
    stepOrderGps,
    submitReview,
    reorderOrder,
    showToast,
  } = useApp();

  const [storeRating, setStoreRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Smooth real-time GPS polling when courier is active
  useEffect(() => {
    if (order.status !== 'driver_assigned' && order.status !== 'picked_up') return;
    const interval = window.setInterval(() => {
      stepOrderGps(order.id);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [order.id, order.status]);

  const currentIdx = ORDER_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const stages: { id: OrderStatus; title: string; desc: string }[] = [
    { id: 'confirmed', title: tr('stageConfirmed'), desc: tr('stageConfirmedDesc') },
    { id: 'preparing', title: tr('stagePreparing'), desc: tr('stagePreparingDesc') },
    {
      id: 'driver_assigned',
      title: tr('stageDriverAssigned'),
      desc: tr('stageDriverAssignedDesc'),
    },
    { id: 'picked_up', title: tr('stagePickedUp'), desc: tr('stagePickedUpDesc') },
    { id: 'delivered', title: tr('stageDelivered'), desc: tr('stageDeliveredDesc') },
  ];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview({
      orderId: order.id,
      storeId: order.storeId,
      storeRating,
      driverRating,
      comment: reviewComment || 'Fast delivery in Burco!',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:pb-12 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={closeOrderTracking}
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-[#142B4A] hover:text-[#FF8A24] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{tr('navOrders')}</span>
        </button>

        <span className="font-mono text-xs font-semibold text-slate-500">
          {order.orderNumber}
        </span>
      </div>

      {/* ETA Hero Card */}
      <section className="rounded-3xl bg-[#142B4A] text-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#FF8A24] uppercase tracking-wider">
              {order.storeName}
            </p>
            <h1 className="font-display text-2xl font-bold mt-1">
              {isCancelled ? tr('stageCancelled') : stages[currentIdx]?.title}
            </h1>
            <p className="text-sm text-white/75 mt-1">
              {isCancelled
                ? order.cancellationReason || tr('stageCancelledDesc')
                : stages[currentIdx]?.desc}
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl px-4 py-3 text-left sm:text-right shrink-0">
            <p className="text-[11px] text-white/70">{tr('estimatedArrival')}</p>
            <p className="font-display text-2xl font-bold tabular-nums flex items-center sm:justify-end gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-[#FF8A24]" />
              <span>
                {isCancelled
                  ? '—'
                  : isDelivered
                    ? tr('stageDelivered')
                    : `${order.estimatedMinutes} ${tr('mins')}`}
              </span>
            </p>
          </div>
        </div>

        {!isCancelled && (
          <div className="grid grid-cols-5 gap-1.5 pt-2">
            {ORDER_FLOW.map((step, i) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-colors ${
                  i <= currentIdx ? 'bg-[#FF8A24]' : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        )}

        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-white/75">
            {order.paymentMethod.toUpperCase()} · {order.paymentReference}{' '}
            {order.paymentIsTestMode ? '(TEST MODE)' : ''}
          </span>
          {!isDelivered && !isCancelled && (
            <button
              type="button"
              onClick={() => advanceOrderStatus(order.id)}
              className="min-h-[38px] px-3.5 rounded-lg bg-white/15 hover:bg-white/25 font-semibold text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tr('advanceDemoStatus')}</span>
            </button>
          )}
        </div>
      </section>

      {/* Interactive Burco Live GPS Tracking Map */}
      <LiveTrackingMap
        storeCoords={order.storeCoordinates}
        storeName={order.storeName}
        destinationCoords={order.deliveryAddress.coordinates}
        destinationLabel={`${order.deliveryAddress.label} · ${order.deliveryAddress.district}`}
        driverCoords={order.driver?.currentGps}
        driverName={order.driver?.name}
        status={order.status}
        onStepGps={() => stepOrderGps(order.id)}
      />

      {/* Delivery Progress Stepper */}
      {!isCancelled && (
        <section className="rounded-2xl border border-slate-200/80 p-5 sm:p-6">
          <h2 className="font-display font-bold text-base text-[#142B4A] mb-5">
            {tr('liveProgress')}
          </h2>

          <ol className="space-y-5">
            {stages.map((stage, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <li key={stage.id} className="relative flex gap-4">
                  {idx < stages.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[15px] top-8 bottom-[-20px] w-0.5 ${
                        idx < currentIdx ? 'bg-[#FF8A24]' : 'bg-slate-200'
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                      done
                        ? active
                          ? 'bg-[#FF8A24] text-white ring-4 ring-orange-100'
                          : 'bg-[#142B4A] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className={`font-display font-semibold text-sm ${
                        done ? 'text-[#142B4A]' : 'text-slate-400'
                      }`}
                    >
                      {stage.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Driver Contact Card */}
      <section className="rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4">
        <h2 className="font-display font-bold text-base text-[#142B4A]">
          {tr('driverDetails')}
        </h2>

        {currentIdx < 2 || !order.driver ? (
          <div className="flex items-center gap-3 text-sm text-slate-500 py-2">
            <Truck className="w-5 h-5 text-[#FF8A24]" />
            <span>{tr('driverNotAssigned')}</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#142B4A] text-white font-display font-bold flex items-center justify-center shrink-0">
                {order.driver.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-sm text-[#142B4A]">
                    {order.driver.name}
                  </p>
                  {order.driver.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-[#FF8A24]" />
                  )}
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#142B4A] tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#FF8A24] text-[#FF8A24]" />
                    {order.driver.rating.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {order.driver.vehicle} ·{' '}
                  <span className="font-mono font-medium text-[#142B4A]">
                    {order.driver.plateNumber}
                  </span>
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {order.driver.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast(tr('callToast'))}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{tr('callDriver')}</span>
              </button>
              <button
                type="button"
                onClick={() => showToast(tr('msgSentToast'))}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 rounded-xl border border-slate-200 hover:border-[#142B4A] text-[#142B4A] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{tr('messageDriver')}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Ratings & Reviews on Delivered Order */}
      {isDelivered && !order.isReviewed && !order.isParcel && (
        <section className="rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4">
          <h2 className="font-display font-bold text-base text-[#142B4A]">
            {tr('rateOrder')}
          </h2>
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Store Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setStoreRating(n)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          n <= storeRating
                            ? 'fill-[#FF8A24] text-[#FF8A24]'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Driver Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDriverRating(n)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          n <= driverRating
                            ? 'fill-[#142B4A] text-[#142B4A]'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              rows={2}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share feedback on food quality and Burco courier speed..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
            />
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-xl bg-[#FF8A24] text-white text-xs font-semibold"
            >
              {tr('submitReview')}
            </button>
          </form>
        </section>
      )}

      {/* Receipt, Cancel & Refund Actions */}
      <section className="rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-[#FF8A24] shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-[#142B4A]">
              {order.deliveryAddress.label} · {order.deliveryAddress.district}
            </p>
            <p className="text-slate-600">{order.deliveryAddress.street}, Burco</p>
          </div>
        </div>

        <ul className="divide-y divide-slate-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-700">
                <span className="font-mono font-semibold text-[#142B4A] mr-2">
                  {item.quantity}x
                </span>
                {item.product.name[language]}
              </span>
              <span className="font-mono font-medium tabular-nums text-[#142B4A]">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-display font-bold text-base text-[#142B4A]">
          <span>{tr('total')}</span>
          <span className="font-mono tabular-nums">${order.total.toFixed(2)}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => reorderOrder(order)}
            className="flex-1 min-h-[44px] px-4 rounded-xl border border-slate-200 hover:border-[#142B4A] text-sm font-semibold text-[#142B4A] transition-colors"
          >
            {tr('reorder')}
          </button>

          {(order.status === 'confirmed' || order.status === 'preparing') && (
            <button
              type="button"
              onClick={() => cancelOrder(order.id, 'Cancelled by customer')}
              className="min-h-[44px] px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>{tr('cancelOrder')}</span>
            </button>
          )}

          {(isDelivered || isCancelled) && order.refundStatus === 'none' && (
            <button
              type="button"
              onClick={() => requestRefund(order.id)}
              className="min-h-[44px] px-4 rounded-xl border border-amber-200 text-amber-800 hover:bg-amber-50 text-sm font-semibold"
            >
              {tr('requestRefund')}
            </button>
          )}

          {order.refundStatus !== 'none' && (
            <span className="min-h-[44px] px-4 rounded-xl bg-slate-100 text-xs font-semibold text-[#142B4A] flex items-center">
              Refund: {order.refundStatus.replace('_', ' ')}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};
