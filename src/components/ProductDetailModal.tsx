import React, { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartImage } from './SmartImage';

export const ProductDetailModal: React.FC = () => {
  const { language, tr, selectedProduct, closeProduct, addToCart, openStore } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    setQuantity(1);
    setNote('');
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const totalPrice = (selectedProduct.price * quantity).toFixed(2);

  const handleAdd = () => {
    addToCart(selectedProduct, quantity, note.trim() || undefined);
    closeProduct();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tr('productDetails')}
      onClick={closeProduct}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Image */}
        <div className="relative aspect-[4/3] w-full bg-slate-100 shrink-0">
          <SmartImage
            src={selectedProduct.image}
            alt={selectedProduct.name[language]}
            fallbackLabel={selectedProduct.name[language]}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={closeProduct}
            aria-label="Close"
            className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/95 text-[#142B4A] flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Details */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                const sid = selectedProduct.storeId;
                closeProduct();
                openStore(sid);
              }}
              className="font-semibold text-[#FF8A24] hover:underline"
            >
              {selectedProduct.storeName}
            </button>
            {selectedProduct.unit && <span>{selectedProduct.unit}</span>}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142B4A] leading-tight">
              {selectedProduct.name[language]}
            </h2>
            <div className="text-right shrink-0 tabular-nums">
              <p className="font-display text-xl font-bold text-[#142B4A]">
                ${selectedProduct.price.toFixed(2)}
              </p>
              {selectedProduct.originalPrice && (
                <p className="text-xs text-slate-400 line-through">
                  ${selectedProduct.originalPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {selectedProduct.description[language]}
          </p>

          <div className="pt-2">
            <label
              htmlFor="product-note"
              className="block text-xs font-semibold text-[#142B4A] mb-1.5"
            >
              {tr('specialInstructions')}
            </label>
            <input
              id="product-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={tr('instructionsPlaceholder')}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#142B4A] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#142B4A]"
            />
          </div>
        </div>

        {/* Sticky Purchase Action */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0 pb-safe">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#142B4A] hover:bg-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-mono font-semibold text-sm tabular-nums text-[#142B4A]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[#142B4A] hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={!selectedProduct.inStock}
            onClick={handleAdd}
            className="flex-1 min-h-[48px] px-5 rounded-xl bg-[#142B4A] hover:bg-[#0E1F36] text-white font-semibold text-sm flex items-center justify-between transition-colors tabular-nums disabled:opacity-50"
          >
            <span>{tr('addToCart')}</span>
            <span className="font-mono">${totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
