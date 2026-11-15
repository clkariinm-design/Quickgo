import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceCategoryId } from '../types';
import { ProductCard } from './ProductCard';
import { StoreCard } from './StoreCard';

type SortOption = 'recommended' | 'fastest' | 'top_rated' | 'price_low';

export const SearchScreen: React.FC = () => {
  const {
    language,
    tr,
    categories,
    stores,
    products,
    searchQuery,
    setSearchQuery,
    openParcelModal,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<ServiceCategoryId>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const quickQueries =
    language === 'en'
      ? ['Lamb', 'Headphones', 'Avocado', 'Vitamin C', 'Linen', 'Sourdough']
      : ['Hilib', 'Sameecado', 'Avokaado', 'Fiitamiin', 'Shaati', 'Rooti'];

  const matchingStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = stores.filter((store) => {
      const catMatch = categoryFilter === 'all' || store.category === categoryFilter;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.tagline.en.toLowerCase().includes(q) ||
        store.tagline.so.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'fastest') {
      list = [...list].sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
    } else if (sortBy === 'top_rated') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [stores, searchQuery, categoryFilter, sortBy]);

  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const storeMap = new Map(stores.map((s) => [s.id, s]));

    let list = products.filter((prod) => {
      const store = storeMap.get(prod.storeId);
      const catMatch =
        categoryFilter === 'all' || (store && store.category === categoryFilter);
      if (!catMatch) return false;
      if (!q) return true;
      return (
        prod.name.en.toLowerCase().includes(q) ||
        prod.name.so.toLowerCase().includes(q) ||
        prod.description.en.toLowerCase().includes(q) ||
        prod.storeName.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'price_low') {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    return list;
  }, [products, stores, searchQuery, categoryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-[#142B4A]">
          {tr('searchTitle')}
        </h1>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'recommended', label: tr('sortRecommended') },
              { id: 'fastest', label: tr('sortFastest') },
              { id: 'top_rated', label: tr('sortTopRated') },
              { id: 'price_low', label: tr('sortPriceLow') },
            ] as { id: SortOption; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSortBy(opt.id)}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                sortBy === opt.id
                  ? 'bg-[#142B4A] text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-[#142B4A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tr('searchPlaceholder')}
          className="w-full min-h-[50px] pl-12 pr-12 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-[#142B4A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#142B4A] focus:ring-2 focus:ring-[#142B4A]/10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#142B4A]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Suggestions & Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === 'all'
                ? 'bg-[#FF8A24] text-white'
                : 'bg-slate-100 text-slate-600 hover:text-[#142B4A]'
            }`}
          >
            {tr('allProducts')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                cat.id === 'parcel'
                  ? openParcelModal()
                  : setCategoryFilter(cat.id)
              }
              className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-[#FF8A24] text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-[#142B4A]'
              }`}
            >
              {cat.name[language]}
            </button>
          ))}
        </div>

        {!searchQuery && (
          <div className="flex flex-wrap items-center gap-2">
            {quickQueries.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="min-h-[36px] px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-[#142B4A] hover:text-[#142B4A] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Matching Stores */}
      {matchingStores.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-lg font-bold text-[#142B4A]">
              {tr('storesFound')}
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {matchingStores.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Matching Products */}
      <section className="space-y-3.5">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-lg font-bold text-[#142B4A]">
            {tr('productsFound')}
          </h2>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {matchingProducts.length}
          </span>
        </div>

        {matchingProducts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-slate-200/80 bg-slate-50/50">
            <p className="text-sm font-medium text-slate-600">
              {tr('noProductsFound')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {matchingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
