import type { SVGProps } from 'react';

// Renamed from EthicalCompassLogo to KantifyLogo
export default function KantifyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary" 
      {...props}
    >
      {/* K letter stylized as a compass/balance */}
      <path d="M12 2L12 22" /> {/* Vertical line of K / center of compass */}
      <path d="M17 3L7 12L17 21" /> {/* Diagonal lines of K */}
      
      {/* Optional: Circle to evoke compass, or keep it abstract for K */}
      <circle cx="12" cy="12" r="10" opacity="0.3" /> 

      {/* Small elements to hint at balance/decision */}
      <circle cx="7" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 5L15 12L12 19L9 12L12 5Z" fill="hsl(var(--accent))" strokeWidth="1" opacity="0.7"/>
      <circle cx="12" cy="12" r="1" fill="hsl(var(--background))" />
    </svg>
  );
}
