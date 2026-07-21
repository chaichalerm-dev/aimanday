interface LogoMarkProps {
  className?: string;
}

/** Ascending estimate bars + a spark: raw input distilled into a confident number. */
export function LogoMark({ className = 'h-8 w-8' }: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#logoGradient)" />
      <rect x="8" y="17" width="4.5" height="8" rx="1.5" fill="white" />
      <rect x="14.25" y="12.5" width="4.5" height="12.5" rx="1.5" fill="white" />
      <rect x="20.5" y="8" width="4.5" height="17" rx="1.5" fill="white" fillOpacity="0.92" />
      <circle cx="22.75" cy="7" r="2" fill="white" />
    </svg>
  );
}
