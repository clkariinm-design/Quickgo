import React, { useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  Navigation,
  Power,
  Truck,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DriverPortal: React.FC = () => {
  const {
    user,
    orders,
    deliveryZones,
    driverApplications,
    submitDriverApplication,
    toggleDriverAvailability,
    updateOrderStatus,
    stepOrderGps,
    setActivePortal,
    tr,
  } = useApp();

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [vehicleType, setVehicleType] = useState('Bajaj Boxer 150');
  const [plateNumber, setPlateNumber] = useState('SL-BRC-');
  const [operatingZone, setOperatingZone] = useState(deliveryZones[0]?.neighborhood || 'October');
  const [idFileName, setIdFileName] = useState('somaliland_national_id.jpg');
  const [licenseFileName, setLicenseFileName] = useState('driving_license_burco.pdf');
  const [vehicleFileName, setVehicleFileName] = useState('vehicle_registration.pdf');
  const [submitting, setSubmitting] = useState(false);

  const activeDriver = driverApplications[0];
  const driverOrders = orders.filter(
    (o) => o.status === 'preparing' || o.status === 'driver_assigned' || o.status === 'picked_up'
  );

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitDriverApplication({
      fullName,
      phone,
      vehicleType,
      plateNumber,
      operatingZone,
      idFileName,
      licenseFileName,
      vehicleFileName,
    });
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#FF8A24] uppercase tracking-wider">
            QuickGo Courier Network · Burco
          </p>
          <h1 className="font-display text-2xl font-bold text-[#142B4A]">
            {tr('portalDriver')}
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

      {/* Verified Driver Status & Availability Card */}
      {activeDriver && (
        <section className="rounded-3xl bg-[#142B4A] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">{activeDriver.fullName}</h2>
              {activeDriver.status === 'approved' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF8A24]">
                  <BadgeCheck className="w-4 h-4" />
                  Verified Driver
                </span>
              )}
              {activeDriver.status === 'pending' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                  <Clock className="w-4 h-4" />
                  Pending Admin Review
                </span>
              )}
              {activeDriver.status === 'rejected' && (
                <span className="text-xs font-semibold text-rose-300">
                  Rejected
                </span>
              )}
            </div>
            <p className="text-xs text-white/75 font-mono">
              {activeDriver.vehicleType} · {activeDriver.plateNumber} · {activeDriver.operatingZone}
            </p>
          </div>

          <button
            type="button"
            disabled={activeDriver.status !== 'approved'}
            onClick={() => toggleDriverAvailability(activeDriver.id)}
            className={`min-h-[44px] px-5 rounded-xl font-semibold text-xs inline-flex items-center gap-2 transition-colors disabled:opacity-40 ${
              activeDriver.isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{activeDriver.isAvailable ? 'Online & Available' : 'Offline'}</span>
          </button>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Courier Dispatch Queue */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#142B4A] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#FF8A24]" />
              <span>Active Burco Deliveries</span>
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {driverOrders.length} active
            </span>
          </div>

          {driverOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No active deliveries awaiting courier action.
            </p>
          ) : (
            <div className="space-y-3">
              {driverOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-semibold text-[#FF8A24]">
                        {order.orderNumber} · {order.status.replace('_', ' ')}
                      </p>
                      <h3 className="font-display font-bold text-sm text-[#142B4A]">
                        {order.storeName} → {order.deliveryAddress.district}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {order.deliveryAddress.street}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#142B4A] tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'driver_assigned')}
                        className="min-h-[38px] px-3.5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold"
                      >
                        Accept Assignment
                      </button>
                    )}
                    {order.status === 'driver_assigned' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'picked_up')}
                        className="min-h-[38px] px-3.5 rounded-xl bg-[#FF8A24] text-white text-xs font-semibold"
                      >
                        Confirm Pickup
                      </button>
                    )}
                    {(order.status === 'driver_assigned' || order.status === 'picked_up') && (
                      <button
                        type="button"
                        onClick={() => stepOrderGps(order.id)}
                        className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 text-[#142B4A] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#FF8A24]" />
                        <span>Broadcast GPS</span>
                      </button>
                    )}
                    {order.status === 'picked_up' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Driver Registration & Document Upload */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              Driver Registration & Document Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Documents are stored in Supabase Storage bucket verification-documents for Admin approval.
            </p>
          </div>

          <form onSubmit={handleApply} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Burco Zone
                </label>
                <select
                  value={operatingZone}
                  onChange={(e) => setOperatingZone(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                >
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.neighborhood}>
                      {z.neighborhood}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document File Inputs */}
            <div className="space-y-2.5 pt-1">
              {[
                {
                  label: 'Identity Document (National ID / Passport)',
                  fileName: idFileName,
                  onChange: setIdFileName,
                },
                {
                  label: 'Driving License',
                  fileName: licenseFileName,
                  onChange: setLicenseFileName,
                },
                {
                  label: 'Vehicle Registration Card',
                  fileName: vehicleFileName,
                  onChange: setVehicleFileName,
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
                    Select
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
              className="w-full min-h-[46px] rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Uploading Documents...' : 'Submit Driver Verification'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
