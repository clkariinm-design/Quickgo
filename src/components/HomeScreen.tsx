import React, { useMemo, useState } from 'react';
import {
  Apple,
  ArrowRight,
  ChevronRight,
  Headphones,
  HeartPulse,
  Package,
  Search,
  Shirt,
  ShoppingBasket,
  Utensils,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceCategoryId } from '../types';
import { ProductCard } from './ProductCard';
import { SmartImage } from './SmartImage';
import { StoreCard } from './StoreCard';

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  ShoppingBasket,
  HeartPulse,
  Shirt,
  Headphones,
  Apple,
  Package,
};

export const HomeScreen: React.FC = () => {
  const {
    language,
    tr,
    categories,
    banners,
    stores,
    products,
    selectedCategory,
    setSelectedCategory,
    setActiveTab,
    openStore,
    openParcelModal,
  } = useApp();

  const [showcaseTab, setShowcaseTab] = useState<'recommended' | 'offers'>('recommended');

  const filteredStores = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory === 'parcel') {
      return stores;
    }
    return stores.filter((s) => s.category === selectedCategory);
  }, [stores, selectedCategory]);

  const filteredProducts = useMemo(() => {
    const storeIds = new Set(filteredStores.map((s) => s.id));
    const base =
      selectedCategory === 'all' || selectedCategory === 'parcel'
        ? products
        : products.filter((p) => storeIds.has(p.storeId));

    if (showcaseTab === 'offers') {
      return base.filter((p) => p.isSpecialOffer);
    }
    return base.filter((p) => p.isRecommended || selectedCategory !== 'all');
  }, [products, filteredStores, selectedCategory, showcaseTab]);

  const handleCategoryClick = (catId: ServiceCategoryId) => {
    if (catId === 'parcel') {
      openParcelModal();
      return;
    }
    setSelectedCategory(selectedCategory === catId ? 'all' : catId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:pb-12 space-y-8">
      {/* Search Bar Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className="flex-1 min-h-[48px] px-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 flex items-center gap-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
        >
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-500 truncate">
            {tr('searchPlaceholder')}
          </span>
        </button>

        <button
          type="button"
          onClick={openParcelModal}
          className="min-h-[48px] px-5 rounded-2xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142B4A]"
        >
          <Package className="w-4 h-4" />
          <span>{tr('bookParcel')}</span>
        </button>
      </div>

      {/* Promotional Banners */}
      <section aria-label="Promotions" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/10] bg-[#142B4A] group"
          >
            <SmartImage
              src={banner.image}
              alt={banner.title[language]}
              fallbackLabel={banner.title[language]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#142B4A]/95 via-[#142B4A]/65 to-transparent" />
            <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between items-start max-w-md">
              <div className="space-y-1.5">
                {banner.discountText && (
                  <p className="text-xs font-bold tracking-wide text-[#FF8A24] uppercase">
                    {banner.discountText}
                  </p>
                )}
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight text-balance">
                  {banner.title[language]}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
                  {banner.subtitle[language]}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (banner.targetStoreId) {
                    openStore(banner.targetStoreId);
                  } else {
                    setSelectedCategory(banner.targetCategory);
                  }
                }}
                className={`min-h-[44px] px-5 rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
                  idx === 0
                    ? 'bg-[#FF8A24] hover:bg-[#EB7610] text-white'
                    : 'bg-white hover:bg-slate-100 text-[#142B4A]'
                }`}
              >
                <span>{banner.ctaLabel[language]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Service Categories */}
      <section aria-labelledby="services-heading">
        <div className="flex items-center justify-between mb-3.5">
          <h2
            id="services-heading"
            className="font-display text-lg sm:text-xl font-bold text-[#142B4A]"
          >
            {tr('servicesTitle')}
          </h2>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-[#FF8A24] hover:underline min-h-[44px] px-2 flex items-center"
            >
              {tr('allProducts')}
            </button>
          )}
        </div>

        <div className="flex lg:grid lg:grid-cols-7 gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName] || Package;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`min-w-[104px] lg:min-w-0 p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24] ${
                  isSelected
                    ? 'border-[#142B4A] bg-[#142B4A] text-white shadow-sm'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 text-[#142B4A]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#FF8A24] text-white'
                      : `${cat.accentBg} ${cat.accentText}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-xs sm:text-sm leading-tight whitespace-nowrap">
                    {cat.name[language]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Stores */}
      <section aria-labelledby="stores-heading">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="stores-heading"
            className="font-display text-lg sm:text-xl font-bold text-[#142B4A]"
          >
            {tr('popularStores')}
          </h2>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#142B4A] hover:text-[#FF8A24] transition-colors min-h-[44px]"
          >
            <span>{tr('seeAll')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* Recommended Products & Special Offers */}
      <section aria-labelledby="products-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2
            id="products-heading"
            className="font-display text-lg sm:text-xl font-bold text-[#142B4A]"
          >
            {showcaseTab === 'recommended'
              ? tr('recommendedForYou')
              : tr('specialOffers')}
          </h2>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setShowcaseTab('recommended')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                showcaseTab === 'recommended'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-slate-500 hover:text-[#142B4A]'
              }`}
            >
              {tr('recommendedForYou')}
            </button>
            <button
              type="button"
              onClick={() => setShowcaseTab('offers')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                showcaseTab === 'offers'
                  ? 'bg-white text-[#142B4A] shadow-xs'
                  : 'text-slate-500 hover:text-[#142B4A]'
              }`}
            >
              {tr('specialOffers')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
