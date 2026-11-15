import React, { useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CreditCard,
  ShieldAlert,
  Store as StoreIcon,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type AdminTab =
  | 'overview'
  | 'drivers'
  | 'merchants'
  | 'orders'
  | 'payments'
  | 'customers';

export const AdminDashboard: React.FC = () => {
  const {
    user,
    stores,
    orders,
    transactions,
    driverApplications,
    reviewDriverApplication,
    merchantApplications,
    reviewMerchantApplication,
    toggleStoreOpen,
    updateOrderStatus,
    resolveRefund,
    tickets,
    resolveSupportTicket,
    fraudAlerts,
    resolveFraudAlert,
    platformSettings,
    updatePlatformCommission,
    setActivePortal,
    tr,
  } = useApp();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [commissionInput, setCommissionInput] = useState(
    String(platformSettings.commissionRatePct)
  );

  const gmv = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const commissionRevenue = Number(
    ((gmv * platformSettings.commissionRatePct) / 100).toFixed(2)
  );
  const openFraudCount = fraudAlerts.filter((a) => !a.resolved).length;
  const pendingDrivers = driverApplications.filter((d) => d.status === 'pending').length;
  const pendingMerchants = merchantApplications.filter((m) => m.status === 'pending').length;

  const dailyVolume = [
    { day: 'Mon', orders: 24 },
    { day: 'Tue', orders: 31 },
    { day: 'Wed', orders: 28 },
    { day: 'Thu', orders: 42 },
    { day: 'Fri', orders: 56 },
    { day: 'Sat', orders: 49 },
    { day: 'Sun', orders: orders.length + 34 },
  ];

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Analytics & Fraud' },
    { id: 'drivers', label: `Drivers (${pendingDrivers})` },
    { id: 'merchants', label: `Merchants & Stores (${pendingMerchants})` },
    { id: 'orders', label: `Orders (${orders.length})` },
    { id: 'payments', label: 'Payments & Commission' },
    { id: 'customers', label: 'Customers & Support' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#FF8A24] uppercase tracking-wider">
            QuickGo Operations · {platformSettings.defaultMarket} ({platformSettings.currency})
          </p>
          <h1 className="font-display text-2xl font-bold text-[#142B4A]">
            {tr('portalAdmin')}
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

      {/* Admin Sub-Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === item.id
                ? 'bg-[#142B4A] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-[#142B4A]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW, ANALYTICS & FRAUD */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gross Volume (USD)', value: `$${gmv.toFixed(2)}` },
              {
                label: `Commission (${platformSettings.commissionRatePct}%)`,
                value: `$${commissionRevenue.toFixed(2)}`,
              },
              {
                label: 'Pending Verifications',
                value: `${pendingDrivers + pendingMerchants}`,
              },
              { label: 'Open Fraud Alerts', value: `${openFraudCount}` },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-5"
              >
                <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                <p className="font-display text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Orders Bar Chart */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
              <h2 className="font-display font-bold text-base text-[#142B4A]">
                Weekly Burco Delivery Volume
              </h2>
              <div className="h-44 flex items-end justify-between gap-3 pt-4">
                {dailyVolume.map((d) => {
                  const pct = Math.round((d.orders / 60) * 100);
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 tabular-nums">
                        {d.orders}
                      </span>
                      <div className="w-full bg-slate-100 rounded-lg h-28 flex items-end overflow-hidden">
                        <div
                          className="w-full bg-[#142B4A] rounded-t-lg transition-all"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Fraud Detection Alerts */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base text-[#142B4A] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#FF8A24]" />
                  <span>Fraud Detection Alerts</span>
                </h2>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {openFraudCount} open
                </span>
              </div>

              <div className="space-y-3">
                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${
                      alert.resolved
                        ? 'border-slate-100 bg-slate-50/70 opacity-70'
                        : 'border-amber-200 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              alert.severity === 'high' ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          />
                          <h3 className="font-display font-bold text-sm text-[#142B4A]">
                            {alert.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600">{alert.description}</p>
                      </div>

                      {!alert.resolved ? (
                        <button
                          type="button"
                          onClick={() => resolveFraudAlert(alert.id)}
                          className="min-h-[36px] px-3 rounded-lg bg-[#142B4A] text-white text-xs font-semibold shrink-0"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 shrink-0">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* DRIVER VERIFICATION WORKFLOW */}
      {tab === 'drivers' && (
        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg text-[#142B4A] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#FF8A24]" />
            <span>Driver Verification Dashboard</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driverApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-[#142B4A]">
                        {app.fullName}
                      </h3>
                      {app.status === 'approved' && (
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      {app.phone} · {app.vehicleType} ({app.plateNumber})
                    </p>
                    <p className="text-xs text-slate-500">Zone: {app.operatingZone}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase text-[#FF8A24]">
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 space-y-1 font-mono">
                  <p>ID: {app.idDocument?.fileName || 'Missing'}</p>
                  <p>License: {app.licenseDocument?.fileName || 'Missing'}</p>
                  <p>Vehicle: {app.vehicleDocument?.fileName || 'Missing'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => reviewDriverApplication(app.id, 'approved')}
                    className="flex-1 min-h-[40px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Driver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      reviewDriverApplication(app.id, 'rejected', 'Document blur / resubmit')
                    }
                    className="flex-1 min-h-[40px] rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MERCHANT VERIFICATION & STORE MANAGEMENT */}
      {tab === 'merchants' && (
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="font-display font-bold text-lg text-[#142B4A] flex items-center gap-2">
              <StoreIcon className="w-5 h-5 text-[#FF8A24]" />
              <span>Merchant Verification Queue</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {merchantApplications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-[#142B4A]">
                        {app.businessName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Owner: {app.ownerName} ({app.ownerPhone})
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        {app.neighborhood} · {app.licenseNumber}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase text-[#FF8A24]">
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 space-y-1 font-mono">
                    <p>Owner ID: {app.ownerIdDoc?.fileName || 'Missing'}</p>
                    <p>Trade License: {app.businessLicenseDoc?.fileName || 'Missing'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reviewMerchantApplication(app.id, 'approved')}
                      className="flex-1 min-h-[40px] rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white text-xs font-semibold"
                    >
                      Approve & Publish Store
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        reviewMerchantApplication(app.id, 'rejected', 'Invalid trade license')
                      }
                      className="flex-1 min-h-[40px] rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              Live Burco Stores ({stores.length})
            </h2>
            <div className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[#142B4A]">
                        {s.name}
                      </span>
                      {s.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {s.neighborhood}, {s.city} · {s.openingHours} · ★ {s.rating.toFixed(1)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStoreOpen(s.id)}
                    className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold ${
                      s.isOpen
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.isOpen ? 'Open · Pause Store' : 'Closed · Reopen'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ORDER MONITORING & REFUNDS */}
      {tab === 'orders' && (
        <section className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-[#FF8A24]">
                    {order.orderNumber} · {order.status.toUpperCase()} · Refund: {order.refundStatus}
                  </p>
                  <h3 className="font-display font-bold text-sm text-[#142B4A] mt-0.5">
                    {order.storeName} → {order.customerName} ({order.deliveryAddress.district})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 tabular-nums">
                    ${order.total.toFixed(2)} USD · {order.paymentMethod.toUpperCase()} (
                    {order.paymentIsTestMode ? 'TEST MODE' : 'COD'})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="min-h-[38px] px-3 rounded-xl bg-[#142B4A] text-white text-xs font-semibold"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.refundStatus === 'requested' && (
                    <button
                      type="button"
                      onClick={() => resolveRefund(order.id, 'approved_refunded')}
                      className="min-h-[38px] px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                    >
                      Approve Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PAYMENTS & COMMISSION SETTINGS */}
      {tab === 'payments' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-base text-[#142B4A]">
                Platform Commission Rate
              </h2>
              <p className="text-xs text-slate-500">
                Applied across Burco merchant orders ({platformSettings.paymentGatewayMode.toUpperCase()} payment mode active)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={40}
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                className="w-24 min-h-[42px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm text-[#142B4A]"
              />
              <button
                type="button"
                onClick={() => updatePlatformCommission(Number(commissionInput) || 12)}
                className="min-h-[42px] px-4 rounded-xl bg-[#142B4A] text-white text-xs font-semibold"
              >
                Save %
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF8A24]" />
              <h2 className="font-display font-bold text-sm text-[#142B4A]">
                Payment Transaction Ledger (USD)
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#142B4A]">
                      {txn.reference} · {txn.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {txn.customerName} · {txn.provider.toUpperCase()} ·{' '}
                      {txn.isTestMode ? 'SANDBOX TEST MODE' : 'CASH ON DELIVERY'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="text-xs font-semibold uppercase text-slate-600">
                      {txn.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono font-bold text-[#142B4A]">
                      ${txn.amountUsd.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* CUSTOMERS & SUPPORT TICKETS */}
      {tab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
            <h2 className="font-display font-bold text-base text-[#142B4A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF8A24]" />
              <span>Customer Verification Directory</span>
            </h2>
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-[#142B4A]">
                  {user.fullName}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Phone: {user.phoneVerified ? 'Verified' : 'Unverified'} · Email:{' '}
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500">
                {user.phone} · {user.email}
              </p>
              <p className="text-xs text-slate-500 tabular-nums">
                Wallet: ${user.walletBalanceUsd.toFixed(2)} USD · Referral: {user.referralCode}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              Customer Support Tickets
            </h2>
            <div className="space-y-2.5">
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-3.5 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-display font-bold text-sm text-[#142B4A]">
                      {tkt.subject}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{tkt.message}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {tkt.customerName} · {tkt.orderNumber || 'General'}
                    </p>
                  </div>
                  {tkt.status === 'open' ? (
                    <button
                      type="button"
                      onClick={() => resolveSupportTicket(tkt.id)}
                      className="min-h-[36px] px-3 rounded-lg bg-[#142B4A] text-white text-xs font-semibold shrink-0"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 shrink-0">
                      Resolved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
