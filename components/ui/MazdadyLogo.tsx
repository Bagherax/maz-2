import React from 'react';

interface MazdadyLogoProps {
  className?: string;
}

const MazdadyLogo: React.FC<MazdadyLogoProps> = ({ className }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 300 150" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MAZDADY Logo"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#888888', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#333333', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#666666', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="lens-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#e0f7ff', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#a0e0ff', stopOpacity: 0.9 }} />
        </linearGradient>
         <radialGradient id="lens-highlight" cx="0.25" cy="0.25" r="0.65">
            <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.8}} />
            <stop offset="100%" style={{stopColor: 'white', stopOpacity: 0}} />
        </radialGradient>
        <filter id="bevel">
          <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#ffffff" floodOpacity="0.7"/>
          <feDropShadow dx="-0.5" dy="-0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Main Logo Shapes */}
      <g filter="url(#bevel)">
        {/* Triple M Shapes */}
        <g fill="url(#metal-gradient)" stroke="#e0e0e0" strokeWidth="1.5">
          <path d="M20 90 L55 10 L90 90 L80 90 L55 35 L30 90 Z" />
          <path d="M75 90 L110 10 L145 90 L135 90 L110 35 L85 90 Z" />
          <path d="M130 90 L165 10 L200 90 L190 90 L165 35 L140 90 Z" />
        </g>
        
        {/* MAZ Text */}
        <g fill="url(#metal-gradient)" stroke="#e0e0e0" strokeWidth="1.5" transform="translate(0, 15)">
          {/* M */}
          <path d="M60 118 V 100 h 2 l 8 12 l 8 -12 h 2 v 18 h -2 v -12 l -6 9 h -2 l -6 -9 v 12 Z" />
          {/* A */}
          <path d="M95 118 L 103 100 h 2 l 8 18 h -2 l -1.5 -4 h -9 l -1.5 4 Z M 104 111 h 3 l -1.5 -5 Z" />
          {/* Z */}
          <path d="M120 100 h 14 l -8 9 l 8 9 h -14 l 8 -9 Z" />
        </g>
      </g>
      
      {/* Magnifying Glass */}
      <g transform="translate(175, 55) rotate(40)">
        {/* Handle */}
        <path d="M-55 -15 L -75 5 L -55 25 L -35 5 Z" fill="#222" />
        <rect x="-50" y="-10" width="40" height="20" rx="5" fill="#111" />

        {/* Rim */}
        <circle cx="0" cy="0" r="45" fill="none" stroke="url(#metal-gradient)" strokeWidth="10" filter="url(#bevel)" />

        {/* Lens */}
        <circle cx="0" cy="0" r="40" fill="url(#lens-gradient)" />
        <circle cx="0" cy="0" r="40" fill="url(#lens-highlight)" />
      </g>
    </svg>
  );
};

export default MazdadyLogo;
