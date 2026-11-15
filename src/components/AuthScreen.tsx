import React, { useEffect, useState } from 'react';
import { ArrowLeft, Phone, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthMode } from '../types';
import { Logo } from './Logo';

export const AuthScreen: React.FC = () => {
  const {
    tr,
    isAuthOpen,
    closeAuth,
    loginWithEmail,
    signUp,
    sendPhoneOtp,
    verifyOtp,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+252');
  const [phone, setPhone] = useState('63 441 8920');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    if (mode !== 'otp' || resendTimer <= 0) return;
    const t = window.setInterval(() => {
      setResendTimer((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [mode, resendTimer]);

  if (!isAuthOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gelitaanka waa fashilmay.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(fullName, `${countryCode} ${phone}`, email, password);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Diiwaangelintu waa fashilantay.');
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setResendTimer(30);
    try {
      await sendPhoneOtp(`${countryCode} ${phone}`);
      setMode('otp');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'OTP lama diri karin.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyOtp(`${countryCode} ${phone}`, otp);
    if (!ok) {
      setOtpError('Koodhka aad gelisay sax ma aha. Hubi SMS-ka oo mar kale isku day.');
    }
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    showToast('Password reset link sent.');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="QuickGo Authentication"
    >
      <div className="w-full min-h-screen sm:min-h-0 sm:max-w-md bg-white sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between mb-6">
            {mode === 'otp' || mode === 'forgot_password' ? (
              <button
                type="button"
                onClick={() => setMode(mode === 'otp' ? 'phone' : 'login')}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#142B4A] hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Logo size="sm" />
            )}

            <button
              type="button"
              onClick={closeAuth}
              aria-label="Close"
              className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:text-[#142B4A] hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                  {tr('loginTitle')}
                </h1>
                <p className="text-sm text-slate-500 mt-1">{tr('loginSubtitle')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('emailAddress')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#142B4A]">
                    {tr('password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoverySent(false);
                      setMode('forgot_password');
                    }}
                    className="text-xs font-semibold text-[#FF8A24] hover:underline"
                  >
                    {tr('forgotPasswordLink')}
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white font-semibold text-sm transition-colors"
              >
                {tr('signInBtn')}
              </button>

              <button
                type="button"
                onClick={() => setMode('phone')}
                className="w-full min-h-[46px] rounded-xl border border-slate-200 hover:border-[#142B4A] text-[#142B4A] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#FF8A24]" />
                <span>{tr('usePhoneInstead')}</span>
              </button>

              <p className="text-center text-xs text-slate-500 pt-2">
                {tr('noAccountYet')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-semibold text-[#FF8A24] hover:underline"
                >
                  {tr('signUpBtn')}
                </button>
              </p>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                  {tr('signupTitle')}
                </h1>
                <p className="text-sm text-slate-500 mt-1">{tr('signupSubtitle')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maxamed Muuse"
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('phoneNumber')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="min-h-[46px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-[#142B4A]"
                  >
                    <option value="+252">+252</option>
                    <option value="+254">+254</option>
                    <option value="+44">+44</option>
                    <option value="+1">+1</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono focus:outline-none focus:bg-white focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('emailAddress')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm transition-colors"
              >
                {tr('signUpBtn')}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                {tr('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-[#142B4A] hover:underline"
                >
                  {tr('signInBtn')}
                </button>
              </p>
            </form>
          )}

          {mode === 'phone' && (
            <form onSubmit={handleSendPhoneOtp} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                  {tr('phoneAuthTitle')}
                </h1>
                <p className="text-sm text-slate-500 mt-1">{tr('phoneAuthSubtitle')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('phoneNumber')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="min-h-[46px] px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-[#142B4A]"
                  >
                    <option value="+252">+252</option>
                    <option value="+254">+254</option>
                    <option value="+44">+44</option>
                    <option value="+1">+1</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono focus:outline-none focus:bg-white focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white font-semibold text-sm transition-colors"
              >
                {tr('sendOtpBtn')}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full min-h-[44px] text-xs font-semibold text-slate-600 hover:text-[#142B4A]"
              >
                {tr('useEmailInstead')}
              </button>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF8A24] flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                  {tr('otpTitle')}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {tr('otpSubtitle')} ({countryCode} {phone})
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full min-h-[54px] px-4 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-2xl tracking-[0.45em] text-[#142B4A] focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  {tr('demoOtpHint')}
                </p>
                {otpError && (
                  <p className="mt-1 text-xs text-rose-600 text-center font-medium">
                    {otpError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm transition-colors"
              >
                {tr('verifyOtpBtn')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={async () => {
                    setResendTimer(30);
                    await sendPhoneOtp(`${countryCode} ${phone}`);
                  }}
                  className="text-xs font-semibold text-[#142B4A] disabled:text-slate-400 tabular-nums"
                >
                  {tr('resendCode')} {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot_password' && (
            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#142B4A]">
                  {tr('forgotTitle')}
                </h1>
                <p className="text-sm text-slate-500 mt-1">{tr('forgotSubtitle')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1.5">
                  {tr('emailAddress')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:border-[#142B4A]"
                />
              </div>

              {recoverySent && (
                <p className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                  Password reset instructions have been sent to {email}.
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white font-semibold text-sm transition-colors"
              >
                {tr('resetPasswordBtn')}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full min-h-[44px] text-xs font-semibold text-slate-600 hover:text-[#142B4A]"
              >
                {tr('backToLogin')}
              </button>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={closeAuth}
          className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500 hover:text-[#142B4A] text-center"
        >
          {tr('continueAsGuest')}
        </button>
      </div>
    </div>
  );
};
