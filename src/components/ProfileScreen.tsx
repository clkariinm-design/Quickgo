import React, { useState } from 'react';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Copy,
  CreditCard,
  Gift,
  Globe,
  Headphones,
  Heart,
  LayoutDashboard,
  Lock,
  LogOut,
  MailCheck,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    tr,
    setActivePortal,
    isAuthenticated,
    user,
    updateProfile,
    sendPhoneOtp,
    verifyOtp,
    sendEmailVerification,
    verifyEmailCode,
    topUpWalletTestMode,
    claimReferralBonus,
    openAuth,
    logout,
    addresses,
    openLocationSheet,
    setDefaultAddress,
    orders,
    favoriteStoreIds,
    coupons,
    transactions,
    tickets,
    submitSupportTicket,
    setActiveTab,
    unreadCount,
    openNotifications,
    showToast,
  } = useApp();

  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(user.fullName);
  const [emailInput, setEmailInput] = useState(user.email);
  const [phoneInput, setPhoneInput] = useState(user.phone);

  // Verification inputs
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');

  // Support ticket inputs
  const [supportSubject, setSupportSubject] = useState('');
  const [supportOrderRef, setSupportOrderRef] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...user,
      fullName: nameInput.trim() || user.fullName,
      email: emailInput.trim() || user.email,
      phone: phoneInput.trim() || user.phone,
    });
    setEditingProfile(false);
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyOtp(user.phone, phoneOtpCode);
    if (ok) {
      setShowPhoneVerify(false);
      setPhoneOtpCode('');
    } else {
      showToast('Enter 6-digit OTP code (demo: 123456)');
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyEmailCode(user.email, emailOtpCode);
    if (ok) {
      setShowEmailVerify(false);
      setEmailOtpCode('');
    } else {
      showToast('Enter verification code (demo: 884210)');
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    submitSupportTicket({
      subject: supportSubject,
      orderNumber: supportOrderRef || undefined,
      message: supportMessage,
    });
    setSupportSubject('');
    setSupportOrderRef('');
    setSupportMessage('');
  };

  const isVerifiedAccount = user.phoneVerified && user.emailVerified;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12 space-y-6">
      <h1 className="font-display text-2xl font-bold text-[#142B4A]">
        {tr('profileTitle')}
      </h1>

      {/* Profile Header & Verified Customer Badge */}
      <section className="rounded-3xl bg-[#142B4A] text-white p-6">
        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-[#FF8A24]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">{tr('guestAccount')}</h2>
                <p className="text-xs sm:text-sm text-white/75 mt-0.5 max-w-md">
                  {tr('signInPrompt')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openAuth}
              className="min-h-[44px] px-5 rounded-xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
            >
              {tr('signInOrCreate')}
            </button>
          </div>
        ) : editingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">{tr('fullName')}</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:border-[#FF8A24]"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">{tr('phoneNumber')}</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-white/10 border border-white/20 text-sm font-mono text-white focus:outline-none focus:border-[#FF8A24]"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">{tr('emailAddress')}</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:border-[#FF8A24]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="min-h-[40px] px-4 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
              >
                {tr('cancel')}
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-4 rounded-xl bg-[#FF8A24] text-xs font-semibold text-white hover:bg-[#EB7610]"
              >
                {tr('saveChanges')}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FF8A24] text-white font-display font-bold text-lg flex items-center justify-center shrink-0">
                {user.avatarInitials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-xl font-bold truncate">{user.fullName}</h2>
                  {isVerifiedAccount ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                      <BadgeCheck className="w-4 h-4" />
                      {tr('verifiedCustomer')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF8A24]">
                      <BadgeCheck className="w-4 h-4" />
                      {user.phoneVerified ? 'Phone Verified' : tr('pendingVerification')}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/80 font-mono mt-0.5">{user.phone}</p>
                <p className="text-xs text-white/65 truncate">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNameInput(user.fullName);
                setEmailInput(user.email);
                setPhoneInput(user.phone);
                setEditingProfile(true);
              }}
              className="min-h-[42px] px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors self-start sm:self-auto"
            >
              {tr('editProfile')}
            </button>
          </div>
        )}
      </section>

      {/* Platform Role Portals (Driver, Merchant, Admin) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
        <h2 className="font-display font-bold text-base text-[#142B4A]">
          {tr('portalSwitcher')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActivePortal('driver')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-[#142B4A] text-left flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8A24] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#142B4A]">
                {tr('portalDriver')}
              </p>
              <p className="text-xs text-slate-500">Docs & live dispatch</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('merchant')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-[#142B4A] text-left flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#142B4A] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#142B4A]">
                {tr('portalMerchant')}
              </p>
              <p className="text-xs text-slate-500">Verify store & orders</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-[#142B4A] text-left flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#142B4A] text-white flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#142B4A]">
                {tr('portalAdmin')}
              </p>
              <p className="text-xs text-slate-500">Approvals, fraud & analytics</p>
            </div>
          </button>
        </div>
      </section>

      {/* Customer Verification & Security Settings */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#FF8A24]" />
          <h2 className="font-display font-bold text-base text-[#142B4A]">
            {tr('securityVerification')}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Phone Verification */}
          <div className="py-3 first:pt-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-[#142B4A]">
                  Phone OTP Verification ({user.phone})
                </p>
                <p className="text-xs text-slate-500">
                  {user.phoneVerified ? 'Verified via SMS OTP' : 'Verification recommended for COD & fast checkout'}
                </p>
              </div>
              {user.phoneVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await sendPhoneOtp(user.phone);
                    setShowPhoneVerify(true);
                  }}
                  className="min-h-[38px] px-3.5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold self-start"
                >
                  {tr('verifyPhoneBtn')}
                </button>
              )}
            </div>

            {showPhoneVerify && !user.phoneVerified && (
              <form onSubmit={handleVerifyPhone} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={phoneOtpCode}
                  onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-36 min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-4 rounded-xl bg-[#FF8A24] text-white text-xs font-semibold"
                >
                  Verify OTP
                </button>
              </form>
            )}
          </div>

          {/* Email Verification */}
          <div className="py-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-[#142B4A]">
                  Email Verification ({user.email})
                </p>
                <p className="text-xs text-slate-500">
                  {user.emailVerified ? 'Verified for receipts & security alerts' : 'Verify email for password recovery'}
                </p>
              </div>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <MailCheck className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await sendEmailVerification(user.email);
                    setShowEmailVerify(true);
                  }}
                  className="min-h-[38px] px-3.5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold self-start"
                >
                  {tr('verifyEmailBtn')}
                </button>
              )}
            </div>

            {showEmailVerify && !user.emailVerified && (
              <form onSubmit={handleVerifyEmail} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtpCode}
                  onChange={(e) => setEmailOtpCode(e.target.value)}
                  placeholder="884210"
                  className="w-36 min-h-[40px] px-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-4 rounded-xl bg-[#FF8A24] text-white text-xs font-semibold"
                >
                  Confirm Email
                </button>
              </form>
            )}
          </div>

          {/* 2FA Security Setting */}
          <div className="py-3 last:pb-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="font-semibold text-sm text-[#142B4A]">{tr('twoFactorLabel')}</p>
                <p className="text-xs text-slate-500">Require OTP confirmation on new devices</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                updateProfile({ ...user, twoFactorEnabled: !user.twoFactorEnabled })
              }
              className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold transition-colors ${
                user.twoFactorEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      {/* Wallet, Coupons & Referral Rewards */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-[#FF8A24]" />
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              {tr('walletAndReferrals')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-[#142B4A] tabular-nums">
              ${user.walletBalanceUsd.toFixed(2)} USD
            </span>
            <button
              type="button"
              onClick={() => topUpWalletTestMode(10)}
              className="min-h-[36px] px-3 rounded-xl bg-slate-100 hover:bg-[#142B4A] hover:text-white text-xs font-semibold text-[#142B4A] transition-colors"
            >
              +$10 (Test Top-Up)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#FF8A24]" />
                {tr('referralCodeLabel')}
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Earned: ${user.referralRewardsUsd.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-sm text-[#142B4A]">
                {user.referralCode}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(user.referralCode);
                    showToast(`Copied ${user.referralCode}`);
                  }}
                  className="min-h-[34px] px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#142B4A] inline-flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {tr('copyCode')}
                </button>
                <button
                  type="button"
                  onClick={claimReferralBonus}
                  className="min-h-[34px] px-3 rounded-lg bg-[#FF8A24] text-white text-xs font-semibold"
                >
                  Claim +$3
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <p className="text-xs font-semibold text-slate-600">{tr('availableCoupons')}</p>
            <div className="space-y-1">
              {coupons.map((c) => (
                <div key={c.code} className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#142B4A]">{c.code}</span>
                  <span className="text-slate-600">{c.description[language]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Transaction History */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#FF8A24]" />
          <h2 className="font-display font-bold text-base text-[#142B4A]">
            {tr('paymentHistory')}
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map((txn) => (
            <div
              key={txn.id}
              className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div>
                <p className="font-mono font-semibold text-[#142B4A]">
                  {txn.orderNumber} · {txn.provider.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">
                  {txn.reference} · {txn.isTestMode ? 'Test Mode' : 'COD'} ·{' '}
                  {txn.status.replace('_', ' ')}
                </p>
              </div>
              <span className="font-mono font-bold text-[#142B4A] tabular-nums">
                ${txn.amountUsd.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Navigation Shortcuts */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className="p-4 rounded-2xl border border-slate-200/80 hover:border-[#142B4A] bg-white flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#142B4A] flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#142B4A]">
                {tr('orderHistory')}
              </p>
              <p className="text-xs text-slate-500 tabular-nums">
                {orders.length} {tr('navOrders').toLowerCase()}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className="p-4 rounded-2xl border border-slate-200/80 hover:border-[#142B4A] bg-white flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8A24] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[#142B4A]">
                {tr('favoriteStores')}
              </p>
              <p className="text-xs text-slate-500 tabular-nums">
                {favoriteStoreIds.length} {tr('storesFound').toLowerCase()}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </section>

      {/* Saved Addresses */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#FF8A24]" />
            <h2 className="font-display font-bold text-base text-[#142B4A]">
              {tr('savedAddresses')}
            </h2>
          </div>
          <button
            type="button"
            onClick={openLocationSheet}
            className="text-xs font-semibold text-[#FF8A24] hover:underline min-h-[36px] px-2"
          >
            + {tr('addNewAddress')}
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#142B4A]">
                    {addr.label} · {addr.district}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[11px] font-semibold text-[#FF8A24]">
                      · {tr('defaultTag')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {addr.street}, {addr.city}
                </p>
              </div>
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefaultAddress(addr.id)}
                  className="text-xs font-semibold text-[#142B4A] hover:text-[#FF8A24] min-h-[36px] px-2 shrink-0"
                >
                  {tr('setDefault')}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Customer Support Desk */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#FF8A24]" />
          <h2 className="font-display font-bold text-base text-[#142B4A]">
            {tr('customerSupport')}
          </h2>
        </div>

        <form onSubmit={handleSupportSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="Issue subject"
              className="min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
            />
            <input
              type="text"
              value={supportOrderRef}
              onChange={(e) => setSupportOrderRef(e.target.value)}
              placeholder="Order Ref (optional, e.g. QG-BRC-9402)"
              className="min-h-[42px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono"
            />
          </div>
          <textarea
            rows={2}
            required
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            placeholder="Describe how QuickGo Burco support can help..."
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
          />
          <button
            type="submit"
            className="min-h-[42px] px-5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold"
          >
            {tr('submitTicket')}
          </button>
        </form>

        {tickets.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {tickets.slice(0, 3).map((tkt) => (
              <div key={tkt.id} className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#142B4A]">
                  {tkt.subject} {tkt.orderNumber ? `(${tkt.orderNumber})` : ''}
                </span>
                <span
                  className={`font-semibold uppercase ${
                    tkt.status === 'resolved' ? 'text-emerald-700' : 'text-[#FF8A24]'
                  }`}
                >
                  {tkt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Language Settings & Notifications */}
      <section className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#142B4A] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#142B4A]">
                {tr('languageSettings')}
              </h3>
              <p className="text-xs text-slate-500">English / Af-Soomaali</p>
            </div>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                language === 'en'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-slate-500 hover:text-[#142B4A]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('so')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                language === 'so'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-slate-500 hover:text-[#142B4A]'
              }`}
            >
              Af-Soomaali
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={openNotifications}
          className="w-full p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#142B4A] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#142B4A]">
                {tr('notifications')}
              </h3>
              <p className="text-xs text-slate-500 tabular-nums">
                {unreadCount} {tr('unread')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </section>

      {isAuthenticated && (
        <button
          type="button"
          onClick={logout}
          className="w-full min-h-[48px] rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{tr('logout')}</span>
        </button>
      )}
    </div>
  );
};
