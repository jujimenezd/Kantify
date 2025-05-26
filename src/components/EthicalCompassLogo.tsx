import type { SVGProps } from 'react';

export default function EthicalCompassLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary" // Adjust size and color as needed
      {...props}
    >
      <path d="M12 2L12 22" /> {/* Vertical line */}
      <path d="M22 12L2 12" /> {/* Horizontal line */}
      <circle cx="12" cy="12" r="10" /> {/* Outer circle */}
      <path d="M12 5L15 12L12 19L9 12L12 5Z" fill="currentColor" strokeWidth="1"/> {/* Inner diamond / compass needle */}
      <circle cx="12" cy="12" r="1.5" fill="hsl(var(--background))" /> {/* Center dot */}
    </svg>
  );
}
