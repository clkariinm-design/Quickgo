import React, { useState } from 'react';
import { Check, MapPin, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LocationSheet: React.FC = () => {
  const {
    tr,
    isLocationSheetOpen,
    closeLocationSheet,
    addresses,
    deliveryZones,
    selectedAddress,
    selectAddress,
    addAddress,
  } = useApp();

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [zoneId, setZoneId] = useState(deliveryZones[0]?.id || 'zone-plaza');
  const [instructions, setInstructions] = useState('');

  if (!isLocationSheetOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) return;
    const zone = deliveryZones.find((z) => z.id === zoneId) || deliveryZones[0];
    addAddress({
      label: label.trim() || 'Home',
      street: street.trim(),
      district: zone.neighborhood,
      zoneId: zone.id,
      city: 'Burco',
      coordinates: zone.coordinates,
      instructions: instructions.trim() || undefined,
      isDefault: true,
    });
    setAdding(false);
    setLabel('');
    setStreet('');
    setInstructions('');
    closeLocationSheet();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={tr('selectLocation')}
      onClick={closeLocationSheet}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-[#142B4A]">
              {tr('selectLocation')}
            </h2>
            <p className="text-xs text-slate-500">Burco, Somaliland · Delivery Zones</p>
          </div>
          <button
            type="button"
            onClick={closeLocationSheet}
            aria-label="Close"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#142B4A] hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {!adding ? (
            <>
              <div className="space-y-2.5">
                {addresses.map((addr) => {
                  const active = selectedAddress?.id === addr.id;
                  const zone = deliveryZones.find((z) => z.id === addr.zoneId);
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectAddress(addr.id)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                        active
                          ? 'border-[#142B4A] bg-slate-50 ring-1 ring-[#142B4A]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            active ? 'text-[#FF8A24]' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <p className="font-display font-bold text-sm text-[#142B4A]">
                            {addr.label} · {addr.district}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {addr.street}, {addr.city}
                          </p>
                          {zone && (
                            <p className="text-[11px] font-mono text-slate-500 mt-1 tabular-nums">
                              Zone Fee: ${zone.deliveryFeeUsd.toFixed(2)} · {zone.etaMin}–{zone.etaMax} min
                            </p>
                          )}
                        </div>
                      </div>
                      {active && <Check className="w-5 h-5 text-[#FF8A24] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full min-h-[46px] rounded-xl border border-dashed border-slate-300 hover:border-[#142B4A] text-sm font-semibold text-[#142B4A] flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#FF8A24]" />
                <span>{tr('addNewAddress')}</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Label (e.g. Home, Office, Family)
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Home"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Burco Neighborhood / Delivery Zone
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#142B4A]"
                >
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.neighborhood} — ${z.deliveryFeeUsd.toFixed(2)} ({z.etaMin}–{z.etaMax} min)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Street / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Near Burco Central Mosque, Street 12"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#142B4A] mb-1">
                  Delivery Note
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Gate color or nearby landmark"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  {tr('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#142B4A] text-white text-sm font-semibold"
                >
                  {tr('saveChanges')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
