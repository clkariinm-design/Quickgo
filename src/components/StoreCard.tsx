import React from 'react';
import { BadgeCheck, Heart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Store } from '../types';
import { SmartImage } from './SmartImage';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { language, tr, openStore, favoriteStoreIds, toggleFavoriteStore } = useApp();
  const isFav = favoriteStoreIds.includes(store.id);

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <button
          type="button"
          onClick={() => openStore(store.id)}
          className="w-full h-full block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
        >
          <SmartImage
            src={store.coverImage}
            alt={store.name}
            fallbackLabel={store.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteStore(store.id);
          }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-2.5 right-2.5 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFav ? 'fill-[#FF8A24] text-[#FF8A24]' : 'text-[#142B4A]'
            }`}
          />
        </button>

        <div
          className="absolute bottom-3 left-3 w-10 h-10 rounded-xl text-white font-display font-bold text-sm flex items-center justify-center shadow-sm border border-white/20"
          style={{ backgroundColor: store.logoBg }}
        >
          {store.logoInitials}
        </div>
      </div>

      <button
        type="button"
        onClick={() => openStore(store.id)}
        className="p-4 text-left flex-1 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
      >
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-display font-bold text-base text-[#142B4A] line-clamp-1 group-hover:text-[#FF8A24] transition-colors">
                {store.name}
              </h3>
              {store.isVerified && (
                <BadgeCheck
                  className="w-4 h-4 text-[#FF8A24] shrink-0"
                  aria-label={tr('verifiedBadge')}
                />
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-[#142B4A] tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#FF8A24] text-[#FF8A24]" />
              <span>{store.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            {store.tagline[language]}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 tabular-nums">
          <span className="font-medium text-[#142B4A]">
            {store.deliveryTimeMin}–{store.deliveryTimeMax} {tr('mins')}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            {store.deliveryFee === 0
              ? tr('freeDelivery')
              : `$${store.deliveryFee.toFixed(2)}`}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className={store.isOpen ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
            {store.isOpen ? tr('openNow') : tr('closed')}
          </span>
        </div>
      </button>
    </article>
  );
};
