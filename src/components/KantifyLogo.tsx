import type { SVGProps } from 'react';

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
      {/* K letter stylized */}
      <path d="M12 2L12 22" /> {/* Vertical line of K */}
      <path d="M17.5 3L6.5 12L17.5 21" /> {/* Angled strokes of K */}
      
      {/* Optional subtle circle to hint at a "compass" or "focus" */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      
      {/* Small dot at the center of K, can be styled or removed */}
      <circle cx="12" cy="12" r="1.5" fill="hsl(var(--accent))" opacity="0.8" />
    </svg>
  );
}
