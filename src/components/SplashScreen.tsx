import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';

export const SplashScreen: React.FC = () => {
  const { tr, dismissSplash } = useApp();

  return (
    <div
      className="fixed inset-0 z-50 bg-[#142B4A] flex flex-col items-center justify-between px-6 py-12 text-white"
      role="dialog"
      aria-label="QuickGo Splash Screen"
    >
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={dismissSplash}
          className="min-h-[44px] px-4 text-xs font-medium text-white/75 hover:text-white transition-colors"
        >
          {tr('skipToApp')}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <div className="mb-6">
          <Logo size="lg" inverted />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance leading-snug text-white">
          {tr('tagline')}
        </h1>

        <div className="mt-10 w-48">
          <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-[#FF8A24] rounded-full"
            />
          </div>
          <p className="mt-3 text-xs text-white/70 font-medium">
            {tr('loadingApp')}
          </p>
        </div>
      </motion.div>

      <div className="text-xs text-white/50 tracking-wide">
        Mogadishu · Hargeisa · Express City Network
      </div>
    </div>
  );
};
