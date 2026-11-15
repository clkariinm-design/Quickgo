import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', inverted = false }) => {
  const iconDim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none shrink-0">
      <div
        className={`${iconDim} rounded-xl flex items-center justify-center shrink-0 ${
          inverted ? 'bg-white text-[#142B4A]' : 'bg-[#142B4A] text-white'
        }`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-[62%] h-[62%]"
          aria-hidden="true"
        >
          <path
            d="M5 9.5H19.5C22.8137 9.5 25.5 12.1863 25.5 15.5C25.5 18.8137 22.8137 21.5 19.5 21.5H12.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M17 16L25.5 23.5"
            stroke="#FF8A24"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M6 16H14"
            stroke="#FF8A24"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="8" cy="22.5" r="2.2" fill="#FF8A24" />
        </svg>
      </div>
      <span
        className={`font-display font-extrabold tracking-tight whitespace-nowrap ${textSize} ${
          inverted ? 'text-white' : 'text-[#142B4A]'
        }`}
      >
        Quick<span className="text-[#FF8A24]">Go</span>
      </span>
    </div>
  );
};
