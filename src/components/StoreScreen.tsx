import React, { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Clock, Heart, MapPin, Search, ShoppingBag, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { SmartImage } from './SmartImage';

export const StoreScreen: React.FC = () => {
  const {
    language,
    tr,
    stores,
    products,
    reviews,
    selectedStoreId,
    closeStore,
    favoriteStoreIds,
    toggleFavoriteStore,
    cartCount,
    openCart,
  } = useApp();

  const [storeQuery, setStoreQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const store = useMemo(
    () => stores.find((s) => s.id === selectedStoreId),
    [stores, selectedStoreId]
  );

  const storeProducts = useMemo(() => {
    if (!store) return [];
    const q = storeQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (p.storeId !== store.id) return false;
      const catMatch = activeCategory === 'all' || p.category === activeCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        p.name.en.toLowerCase().includes(q) ||
        p.name.so.toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q)
      );
    });
  }, [store, products, storeQuery, activeCategory]);

  const storeReviews = useMemo(
    () => (store ? reviews.filter((r) => r.storeId === store.id) : []),
    [reviews, store]
  );

  if (!store) return null;

  const isFav = favoriteStoreIds.includes(store.id);

  return (
    <div className="pb-24 md:pb-14">
      <div className="relative h-56 sm:h-72 bg-[#142B4A] overflow-hidden">
        <SmartImage
          src={store.coverImage}
          alt={store.name}
          fallbackLabel={store.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />

        <div className="absolute top-4 left-4 right-4 max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={closeStore}
            aria-label="Back"
            className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm text-[#142B4A] flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              aria-label={tr('cart')}
              className="relative h-11 px-3.5 rounded-full bg-[#142B4A]/95 backdrop-blur-sm text-white flex items-center gap-1.5 shadow-sm hover:bg-[#142B4A] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#FF8A24]" />
              <span className="text-xs font-mono font-semibold tabular-nums">
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => toggleFavoriteStore(store.id)}
              aria-label="Toggle favorite store"
              className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFav ? 'fill-[#FF8A24] text-[#FF8A24]' : 'text-[#142B4A]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="-mt-10 relative z-10 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl text-white font-display font-bold text-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: store.logoBg }}
              >
                {store.logoInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-[#142B4A]">
                    {store.name}
                  </h1>
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="w-4 h-4 text-[#FF8A24]" />
                      {tr('verifiedBadge')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {store.tagline[language]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600 tabular-nums pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span className="inline-flex items-center gap-1 font-semibold text-[#142B4A]">
                <Star className="w-4 h-4 fill-[#FF8A24] text-[#FF8A24]" />
                {store.rating.toFixed(1)} ({store.reviewCount})
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {store.neighborhood}, {store.city}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {store.openingHours}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-[#142B4A] text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-[#142B4A]'
                }`}
              >
                {tr('allProducts')}
              </button>
              {store.productCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#142B4A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-[#142B4A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={storeQuery}
                onChange={(e) => setStoreQuery(e.target.value)}
                placeholder={tr('searchInStore')}
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#142B4A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#142B4A]"
              />
            </div>
          </div>
        </div>

        <div>
          {storeProducts.length === 0 ? (
            <div className="py-14 text-center rounded-2xl border border-slate-200/80 bg-slate-50">
              <p className="text-sm text-slate-600">{tr('noProductsFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {storeProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} hideStoreName />
              ))}
            </div>
          )}
        </div>

        {/* Store Reviews Section */}
        {storeReviews.length > 0 && (
          <section className="pt-2 space-y-3">
            <h2 className="font-display font-bold text-lg text-[#142B4A]">
              {tr('customerReviews')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {storeReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-[#142B4A]">
                      {rev.customerName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B4A] tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#FF8A24] text-[#FF8A24]" />
                      {rev.storeRating}.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  <p className="text-[11px] font-mono text-slate-400">{rev.createdAt}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
