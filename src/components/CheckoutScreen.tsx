import React, { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Info,
  MapPin,
  Smartphone,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethodId } from '../types';

export const CheckoutScreen: React.FC = () => {
  const {
    language,
    tr,
    isCheckoutOpen,
    closeCheckout,
    cart,
    cartSubtotal,
    deliveryFee,
    serviceFee,
    appliedCoupon,
    discountAmount,
    cartTotal,
    applyCouponCode,
    removeCoupon,
    selectedAddress,
    openLocationSheet,
    user,
    placeOrder,
  } = useApp();

  const [phone, setPhone] = useState(user.phone);
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('zaad');
  const [submitting, setSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const paymentOptions: {
    id: PaymentMethodId;
    title: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'zaad', title: tr('payZaad'), desc: tr('payZaadDesc'), icon: Smartphone },
    { id: 'evc_plus', title: tr('payEvc'), desc: tr('payEvcDesc'), icon: Smartphone },
    { id: 'sahal', title: tr('paySahal'), desc: tr('paySahalDesc'), icon: Smartphone },
    { id: 'cash_on_delivery', title: tr('payCod'), desc: tr('payCodDesc'), icon: Banknote },
    { id: 'card', title: tr('payCard'), desc: tr('payCardDesc'), icon: CreditCard },
    {
      id: 'wallet',
      title: `${tr('payWallet')} ($${user.walletBalanceUsd.toFixed(2)})`,
      desc: tr('payWalletDesc'),
      icon: Wallet,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    await placeOrder({
      customerPhone: phone.trim() || user.phone,
      orderNotes: notes.trim() || undefined,
      paymentMethod,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Back"
            className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center text-[#142B4A] hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-[#142B4A]">
            {tr('checkout')}
          </h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6"
      >
        {/* Delivery Address */}
        <section className="rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              {tr('deliveryAddress')}
            </h2>
            <button
              type="button"
              onClick={openLocationSheet}
              className="text-xs font-semibold text-[#FF8A24] hover:underline min-h-[36px] px-2"
            >
              {tr('selectLocation')}
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8A24] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#142B4A]">
                {selectedAddress?.label} · {selectedAddress?.district}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                {selectedAddress?.street}, {selectedAddress?.city}
              </p>
              {selectedAddress?.instructions && (
                <p className="text-xs text-slate-500 mt-1">
                  {selectedAddress.instructions}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Contact & Notes */}
        <section className="rounded-2xl border border-slate-200/80 p-5 space-y-4">
          <div>
            <label
              htmlFor="checkout-phone"
              className="block text-xs font-semibold text-[#142B4A] mb-1.5"
            >
              {tr('contactPhone')}
            </label>
            <input
              id="checkout-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#142B4A] font-mono focus:outline-none focus:bg-white focus:border-[#142B4A]"
            />
          </div>

          <div>
            <label
              htmlFor="checkout-notes"
              className="block text-xs font-semibold text-[#142B4A] mb-1.5"
            >
              {tr('orderNotes')}
            </label>
            <textarea
              id="checkout-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tr('orderNotesPlaceholder')}
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#142B4A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#142B4A]"
            />
          </div>
        </section>

        {/* Coupons & Promo Code */}
        <section className="rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#FF8A24]" />
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              {tr('couponCode')}
            </h2>
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div>
                <span className="font-mono font-bold text-emerald-800">
                  {appliedCoupon.code}
                </span>
                <span className="text-emerald-700 ml-2">
                  {appliedCoupon.description[language]}
                </span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                aria-label="Remove coupon"
                className="p-1 text-emerald-800 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="BURCO10 · QUICKFREE · WELCOME5"
                className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:bg-white focus:border-[#142B4A]"
              />
              <button
                type="button"
                onClick={() => applyCouponCode(couponInput)}
                className="min-h-[44px] px-5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#0E1F36]"
              >
                {tr('applyCoupon')}
              </button>
            </div>
          )}
        </section>

        {/* Payment Method Selection */}
        <section className="rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <h2 className="font-display font-bold text-base text-[#142B4A]">
            {tr('paymentMethod')}
          </h2>

          {paymentMethod !== 'cash_on_delivery' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>{tr('testModeNotice')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentOptions.map((opt) => {
              const Icon = opt.icon;
              const selected = paymentMethod === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    selected
                      ? 'border-[#142B4A] bg-slate-50 ring-1 ring-[#142B4A]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selected
                        ? 'bg-[#142B4A] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[#142B4A] truncate">
                        {opt.title}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-[#FF8A24] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Order Summary */}
        <section className="rounded-2xl border border-slate-200/80 p-5 space-y-3">
          <h2 className="font-display font-bold text-base text-[#142B4A]">
            {tr('orderItems')}
          </h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {cart.map((item) => (
              <li key={item.id} className="py-2.5 flex justify-between gap-4">
                <span className="text-slate-700">
                  <span className="font-mono font-semibold text-[#142B4A] mr-2">
                    {item.quantity}x
                  </span>
                  {item.product.name[language]}
                </span>
                <span className="font-mono font-medium text-[#142B4A] tabular-nums shrink-0">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{tr('subtotal')}</span>
              <span className="font-mono tabular-nums">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{tr('deliveryFee')}</span>
              <span className="font-mono tabular-nums">
                {deliveryFee === 0 ? tr('freeDelivery') : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{tr('serviceFee')}</span>
              <span className="font-mono tabular-nums">${serviceFee.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>{tr('discount')}</span>
                <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-display font-bold text-base text-[#142B4A]">
              <span>{tr('total')}</span>
              <span className="font-mono tabular-nums">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe">
          <div className="max-w-3xl mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[50px] rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white font-semibold text-sm flex items-center justify-between px-6 transition-colors shadow-lg shadow-[#142B4A]/15 disabled:opacity-50"
            >
              <span>{tr('placeOrder')}</span>
              <span className="font-mono tabular-nums">${cartTotal.toFixed(2)} USD</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
