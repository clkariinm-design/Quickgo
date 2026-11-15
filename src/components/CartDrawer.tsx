import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SmartImage } from './SmartImage';

export const CartDrawer: React.FC = () => {
  const {
    language,
    tr,
    isCartOpen,
    closeCart,
    cart,
    cartSubtotal,
    deliveryFee,
    serviceFee,
    cartTotal,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    openCheckout,
    setActiveTab,
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={tr('yourCart')}
      onClick={closeCart}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-bold text-[#142B4A]">
              {tr('yourCart')}
            </h2>
            {cart.length > 0 && (
              <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                ({cart.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="min-h-[40px] px-3 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                {tr('clearCart')}
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="w-11 h-11 rounded-full flex items-center justify-center text-[#142B4A] hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-[#142B4A] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#142B4A]">
                {tr('emptyCartTitle')}
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 max-w-xs">
                {tr('emptyCartSubtitle')}
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  setActiveTab('home');
                }}
                className="mt-6 min-h-[44px] px-6 rounded-xl bg-[#142B4A] text-white text-sm font-semibold hover:bg-[#0E1F36] transition-colors"
              >
                {tr('browseStores')}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {cart.map((item) => (
                <li key={item.id} className="py-4 first:pt-0 flex gap-3.5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <SmartImage
                      src={item.product.image}
                      alt={item.product.name[language]}
                      fallbackLabel={item.product.name[language]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-400 truncate">
                          {item.product.storeName}
                        </p>
                        <h4 className="font-display font-semibold text-sm text-[#142B4A] line-clamp-1">
                          {item.product.name[language]}
                        </h4>
                        {item.note && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {item.note}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        aria-label="Remove item"
                        className="w-9 h-9 -mr-1.5 -mt-1 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display font-bold text-sm text-[#142B4A] tabular-nums">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>

                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 rounded-md flex items-center justify-center text-[#142B4A] hover:bg-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 rounded-md flex items-center justify-center text-[#142B4A] hover:bg-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4 pb-safe">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>{tr('subtotal')}</span>
                <span className="font-mono tabular-nums">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{tr('deliveryFee')}</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? tr('freeDelivery') : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{tr('serviceFee')}</span>
                <span className="font-mono tabular-nums">
                  ${serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-display font-bold text-base text-[#142B4A]">
                <span>{tr('total')}</span>
                <span className="font-mono tabular-nums">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openCheckout}
              className="w-full min-h-[48px] rounded-xl bg-[#FF8A24] hover:bg-[#EB7610] text-white font-semibold text-sm flex items-center justify-center transition-colors shadow-sm"
            >
              {tr('proceedToCheckout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
