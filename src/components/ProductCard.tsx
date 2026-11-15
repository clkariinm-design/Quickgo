import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { SmartImage } from './SmartImage';

interface ProductCardProps {
  product: Product;
  hideStoreName?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  hideStoreName = false,
}) => {
  const { language, tr, openProduct, addToCart } = useApp();

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col">
      <button
        type="button"
        onClick={() => openProduct(product)}
        className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
      >
        <SmartImage
          src={product.image}
          alt={product.name[language]}
          fallbackLabel={product.name[language]}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>

      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <button
          type="button"
          onClick={() => openProduct(product)}
          className="text-left focus-visible:outline-none"
        >
          {!hideStoreName && (
            <p className="text-[11px] font-medium text-slate-400 truncate">
              {product.storeName}
            </p>
          )}
          <h3 className="font-display font-semibold text-sm sm:text-[15px] text-[#142B4A] line-clamp-2 leading-snug mt-0.5 group-hover:text-[#FF8A24] transition-colors">
            {product.name[language]}
          </h3>
          {discountPct !== null && (
            <p className="mt-1 text-xs font-semibold text-[#FF8A24] tabular-nums">
              {tr('savePercent')} {discountPct}%
            </p>
          )}
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display font-bold text-[15px] text-[#142B4A]">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => addToCart(product, 1)}
            aria-label={`${tr('add')} ${product.name[language]}`}
            className="min-h-[40px] min-w-[44px] px-3 rounded-xl bg-[#142B4A] text-white hover:bg-[#FF8A24] active:scale-[0.97] transition-all flex items-center justify-center gap-1 text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A24]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{tr('add')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
