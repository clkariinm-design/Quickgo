import React, { useState } from 'react';
import { Crosshair, MapPin, Minus, Navigation, Plus, Store as StoreIcon } from 'lucide-react';
import { BURCO_DELIVERY_ZONES } from '../data/mockData';
import { GPSPoint, OrderStatus } from '../types';

interface LiveTrackingMapProps {
  storeCoords: GPSPoint;
  storeName: string;
  destinationCoords: GPSPoint;
  destinationLabel: string;
  driverCoords?: GPSPoint;
  driverName?: string;
  status: OrderStatus;
  onStepGps?: () => void;
}

// Bounding box around Burco, Somaliland (9.505..9.545 N, 45.518..45.556 E)
const LAT_MIN = 9.508;
const LAT_MAX = 9.542;
const LNG_MIN = 45.520;
const LNG_MAX = 45.554;

function projectToSvg(pt: GPSPoint): { x: number; y: number } {
  const x = ((pt.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 600;
  const y = 320 - ((pt.lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 320;
  return {
    x: Math.max(24, Math.min(576, x)),
    y: Math.max(24, Math.min(296, y)),
  };
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  storeCoords,
  storeName,
  destinationCoords,
  destinationLabel,
  driverCoords,
  driverName,
  status,
  onStepGps,
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const storePt = projectToSvg(storeCoords);
  const destPt = projectToSvg(destinationCoords);
  const driverPt = driverCoords ? projectToSvg(driverCoords) : storePt;

  const isEnRoute = status === 'driver_assigned' || status === 'picked_up';

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50 overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF8A24]" />
          <span className="font-display font-bold text-sm text-[#142B4A]">
            Burco Live GPS Map
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 tabular-nums">
          {driverCoords && (
            <span>
              {driverCoords.lat.toFixed(4)}°N, {driverCoords.lng.toFixed(4)}°E
            </span>
          )}
          {isEnRoute && onStepGps && (
            <button
              type="button"
              onClick={onStepGps}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#142B4A] hover:text-white text-[#142B4A] font-sans font-semibold transition-colors"
            >
              Ping GPS
            </button>
          )}
        </div>
      </div>

      <div className="relative h-64 sm:h-72 overflow-hidden bg-[#EEF2F6]">
        <svg
          viewBox="0 0 600 320"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          role="img"
          aria-label="Interactive Burco Delivery GPS Map"
        >
          {/* Burco Urban Grid & Togdheer Riverbed Landmark */}
          <rect width="600" height="320" fill="#EDF1F5" />
          <path
            d="M 0 185 Q 180 155, 310 175 T 600 150"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <text x="235" y="177" fontSize="9" fill="#64748B" fontWeight="600">
            Togdheer Valley
          </text>

          {/* Main Arteries */}
          <path d="M 60 40 L 540 270" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M 100 265 L 510 55" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M 40 120 L 560 115" stroke="#FFFFFF" strokeWidth="4" />
          <path d="M 285 20 L 295 300" stroke="#FFFFFF" strokeWidth="4" />

          {/* Burco Neighborhood Labels */}
          {BURCO_DELIVERY_ZONES.map((z) => {
            const p = projectToSvg(z.coordinates);
            return (
              <g key={z.id}>
                <circle cx={p.x} cy={p.y} r="3" fill="#94A3B8" opacity="0.5" />
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#475569"
                  fontWeight="600"
                >
                  {z.neighborhood.split('/')[0].trim()}
                </text>
              </g>
            );
          })}

          {/* Delivery Route Path */}
          <line
            x1={storePt.x}
            y1={storePt.y}
            x2={destPt.x}
            y2={destPt.y}
            stroke="#142B4A"
            strokeWidth="2.5"
            strokeDasharray="6 5"
            opacity="0.45"
          />

          {status !== 'cancelled' && (
            <line
              x1={driverPt.x}
              y1={driverPt.y}
              x2={status === 'driver_assigned' ? storePt.x : destPt.x}
              y2={status === 'driver_assigned' ? storePt.y : destPt.y}
              stroke="#FF8A24"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Store Origin Pin */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedPin(`${storeName} (${storeCoords.lat.toFixed(4)}, ${storeCoords.lng.toFixed(4)})`)}
          >
            <circle cx={storePt.x} cy={storePt.y} r="13" fill="#142B4A" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x={storePt.x} y={storePt.y + 3.5} textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
              S
            </text>
          </g>

          {/* Customer Destination Pin */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedPin(`${destinationLabel} (${destinationCoords.lat.toFixed(4)}, ${destinationCoords.lng.toFixed(4)})`)}
          >
            <circle cx={destPt.x} cy={destPt.y} r="13" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x={destPt.x} y={destPt.y + 3.5} textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">
              D
            </text>
          </g>

          {/* Live Driver GPS Marker */}
          {driverCoords && status !== 'delivered' && status !== 'cancelled' && (
            <g
              className="cursor-pointer transition-all duration-700"
              onClick={() =>
                setSelectedPin(
                  `${driverName || 'Courier'} · Live GPS (${driverCoords.lat.toFixed(4)}, ${driverCoords.lng.toFixed(4)})`
                )
              }
            >
              <circle cx={driverPt.x} cy={driverPt.y} r="20" fill="#FF8A24" opacity="0.22" />
              <circle cx={driverPt.x} cy={driverPt.y} r="12" fill="#FF8A24" stroke="#FFFFFF" strokeWidth="2.5" />
              <text x={driverPt.x} y={driverPt.y + 3.5} textAnchor="middle" fontSize="9.5" fill="#FFFFFF" fontWeight="800">
                QG
              </text>
            </g>
          )}
        </svg>

        {/* Map Controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.2).toFixed(1))))}
            aria-label="Zoom in"
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#142B4A] flex items-center justify-center shadow-xs hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(1))))}
            aria-label="Zoom out"
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#142B4A] flex items-center justify-center shadow-xs hover:bg-slate-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setSelectedPin(null);
            }}
            aria-label="Center map"
            className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#142B4A] flex items-center justify-center shadow-xs hover:bg-slate-50"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Pin Info Bar */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-14 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#142B4A] shadow-sm">
            {selectedPin}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <StoreIcon className="w-3.5 h-3.5 text-[#142B4A]" />
          <span>{storeName}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <span>{destinationLabel}</span>
        </span>
        {driverName && status !== 'delivered' && status !== 'cancelled' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#FF8A24]">
            <Navigation className="w-3.5 h-3.5" />
            <span>{driverName}</span>
          </span>
        )}
      </div>
    </div>
  );
};
