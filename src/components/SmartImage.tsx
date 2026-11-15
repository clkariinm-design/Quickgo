import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50 flex flex-col items-center justify-center p-4 text-center ${className}`}
      >
        <Package className="w-7 h-7 text-[#142B4A]/40 mb-1.5" />
        {fallbackLabel && (
          <span className="text-xs font-medium text-[#142B4A]/60 line-clamp-2">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
