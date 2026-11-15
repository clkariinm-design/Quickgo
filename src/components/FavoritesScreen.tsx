import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoreCard } from './StoreCard';

export const FavoritesScreen: React.FC = () => {
  const { tr, stores, favoriteStoreIds, setActiveTab } = useApp();

  const favoriteStores = stores.filter((s) => favoriteStoreIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-bold text-[#142B4A]">
          {tr('favoritesTitle')}
        </h1>
        {favoriteStores.length > 0 && (
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {favoriteStores.length}
          </span>
        )}
      </div>

      {favoriteStores.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-slate-200/80 bg-slate-50/60 px-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF8A24] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#142B4A]">
            {tr('noFavoritesTitle')}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            {tr('noFavoritesSubtitle')}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="mt-6 min-h-[44px] px-6 rounded-xl bg-[#142B4A] text-white text-sm font-semibold hover:bg-[#0E1F36] transition-colors"
          >
            {tr('browseStores')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {favoriteStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
};
