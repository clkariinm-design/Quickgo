import React, { useState } from 'react';
import { BadgeCheck, CheckCircle2, Clock, FileCheck2, Store as StoreIcon, Upload, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceCategoryId } from '../types';

export const MerchantPortal: React.FC = () => {
  const {
    user,
    orders,
    deliveryZones,
    merchantApplications,
    submitMerchantApplication,
    updateOrderStatus,
    cancelOrder,
    setActivePortal,
    tr,
  } = useApp();

  const [ownerName, setOwnerName] = useState(user.fullName);
  const [ownerPhone, setOwnerPhone] = useState(user.phone);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<Exclude<ServiceCategoryId, 'all' | 'parcel'>>('food');
  const [neighborhood, setNeighborhood] = useState(deliveryZones[0]?.neighborhood || 'Plaza / Suuqa Weyn');
  const [licenseNumber, setLicenseNumber] = useState('BRC-TRD-2026-');
  const [openingHours, setOpeningHours] = useState('08:00 – 22:30');
  const [ownerIdFileName, setOwnerIdFileName] = useState('business_owner_id.jpg');
  const [businessLicenseFileName, setBusinessLicenseFileName] = useState('burco_trade_license.pdf');
  const [submitting, setSubmitting] = useState(false);

  const merchantOrders = orders.filter(
    (o) => !o.isParcel && (o.status === 'confirmed' || o.status === 'preparing')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    setSubmitting(true);
    await submitMerchantApplication({
      ownerName,
      ownerPhone,
      businessName,
      category,
      neighborhood,
      licenseNumber,
      openingHours,
      ownerIdFileName,
      businessLicenseFileName,
    });
    setBusinessName('');
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#FF8A24] uppercase tracking-wider">
            QuickGo Merchant Operations · Burco
          </p>
          <h1 className="font-display text-2xl font-bold text-[#142B4A]">
            {tr('portalMerchant')}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setActivePortal('customer')}
          className="min-h-[42px] px-4 rounded-xl border border-slate-200 hover:border-[#142B4A] text-xs font-semibold text-[#142B4A] self-start sm:self-auto"
        >
          {tr('backToCustomerApp')}
        </button>
      </div>

      {/* Merchant Verification Status Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {merchantApplications.slice(0, 2).map((app) => (
          <div
            key={app.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-[#142B4A]">
                  {app.businessName}
                </h3>
                {app.status === 'approved' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Merchant
                  </span>
                )}
                {app.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Approval
                  </span>
                )}
                {app.status === 'rejected' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                    <XCircle className="w-3.5 h-3.5" />
                    Rejected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {app.neighborhood} · License {app.licenseNumber}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Store Order Acceptance Queue */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#142B4A] flex items-center gap-2">
              <StoreIcon className="w-5 h-5 text-[#FF8A24]" />
              <span>Incoming Store Orders</span>
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {merchantOrders.length} pending
            </span>
          </div>

          {merchantOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              All incoming merchant orders are processed.
            </p>
          ) : (
            <div className="space-y-3">
              {merchantOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#FF8A24]">
                        {order.orderNumber} · {order.status}
                      </p>
                      <h3 className="font-display font-bold text-sm text-[#142B4A]">
                        {order.storeName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.customerName} · {order.deliveryAddress.district}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#142B4A] tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="min-h-[38px] px-3.5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Prepare</span>
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'driver_assigned')}
                        className="min-h-[38px] px-3.5 rounded-xl bg-[#FF8A24] text-white text-xs font-semibold"
                      >
                        Ready · Assign Driver
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cancelOrder(order.id, 'Merchant item unavailable')}
                      className="min-h-[38px] px-3.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold"
                    >
                      Reject & Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Business Registration & Verification Form */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              Business & Owner Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Register your Burco store and upload trade & owner identity documents.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Burco Fresh Roastery"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as Exclude<ServiceCategoryId, 'all' | 'parcel'>)
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                >
                  <option value="food">Food</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="fashion">Fashion</option>
                  <option value="electronics">Electronics</option>
                  <option value="groceries">Groceries</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Owner Phone
                </label>
                <input
                  type="tel"
                  required
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Burco Neighborhood
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                >
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.neighborhood}>
                      {z.neighborhood}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Trade License No.
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  required
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {[
                {
                  label: 'Owner Identity Document',
                  fileName: ownerIdFileName,
                  onChange: setOwnerIdFileName,
                },
                {
                  label: 'Municipality Business License',
                  fileName: businessLicenseFileName,
                  onChange: setBusinessLicenseFileName,
                },
              ].map((doc) => (
                <label
                  key={doc.label}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-dashed border-slate-300 hover:border-[#142B4A] cursor-pointer bg-slate-50/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck2 className="w-4 h-4 text-[#FF8A24] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#142B4A]">{doc.label}</p>
                      <p className="text-[11px] font-mono text-slate-500 truncate">
                        {doc.fileName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#142B4A] inline-flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) doc.onChange(f.name);
                    }}
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] rounded-xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Store for Approval'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
