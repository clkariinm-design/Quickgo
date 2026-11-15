import React, { useState } from 'react';
import { Package, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethodId } from '../types';

export const ParcelDeliveryModal: React.FC = () => {
  const { tr, isParcelOpen, closeParcelModal, selectedAddress, placeParcelOrder } =
    useApp();

  const [pickupAddress, setPickupAddress] = useState(
    selectedAddress ? `${selectedAddress.street}, ${selectedAddress.district}, Burco` : ''
  );
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+252 63 ');
  const [packageSize, setPackageSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('zaad');
  const [submitting, setSubmitting] = useState(false);

  if (!isParcelOpen) return null;

  const fare = packageSize === 'small' ? 2.5 : packageSize === 'medium' ? 4.0 : 7.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await placeParcelOrder({
      pickupAddress: pickupAddress.trim(),
      dropoffAddress: dropoffAddress.trim(),
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      packageSize,
      fare,
      paymentMethod,
    });
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tr('parcelTitle')}
      onClick={closeParcelModal}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#142B4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF8A24] text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">{tr('parcelTitle')}</h2>
              <p className="text-xs text-white/75">{tr('parcelSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeParcelModal}
            aria-label="Close"
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
              {tr('pickupAddress')}
            </label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Plaza / Suuqa Weyn, Burco"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
              {tr('dropoffAddress')}
            </label>
            <input
              type="text"
              required
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Tuurka / Hodan, Burco"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                {tr('recipientName')}
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Aamina Cali"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                {tr('recipientPhone')}
              </label>
              <input
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono focus:outline-none focus:bg-white focus:border-[#142B4A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
              {tr('packageSize')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'small', label: tr('smallPkg'), price: '$2.50' },
                  { id: 'medium', label: tr('mediumPkg'), price: '$4.00' },
                  { id: 'large', label: tr('largePkg'), price: '$7.50' },
                ] as const
              ).map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => setPackageSize(sz.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    packageSize === sz.id
                      ? 'border-[#142B4A] bg-slate-50 ring-1 ring-[#142B4A]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-mono font-bold text-sm text-[#FF8A24]">{sz.price}</p>
                  <p className="text-[11px] font-medium text-[#142B4A] mt-0.5 leading-snug">
                    {sz.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
              {tr('paymentMethod')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'zaad', label: 'Zaad' },
                  { id: 'evc_plus', label: 'EVC Plus' },
                  { id: 'sahal', label: 'Sahal' },
                  { id: 'cash_on_delivery', label: 'COD' },
                ] as const
              ).map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`min-h-[40px] px-2.5 rounded-xl border text-xs font-semibold ${
                    paymentMethod === pm.id
                      ? 'border-[#142B4A] bg-[#142B4A] text-white'
                      : 'border-slate-200 text-[#142B4A]'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-600">{tr('estimatedFare')}</span>
            <span className="font-mono font-bold text-lg text-[#142B4A] tabular-nums">
              ${fare.toFixed(2)} USD
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] rounded-xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {tr('bookParcel')}
          </button>
        </form>
      </div>
    </div>
  );
};
