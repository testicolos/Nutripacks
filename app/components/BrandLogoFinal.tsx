export default function BrandLogoFinal({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 250 112" role="img" aria-label="Nutri Packs">
      <g fill="none" fillRule="evenodd">
        <path d="M122 7c8 4 12 11 12 21-9-1-15-7-17-17 1-2 3-3 5-4Z" fill="#0B6B5F"/>
        <path d="M139 8c-1 11-6 18-16 21 0-10 4-17 13-22l3 1Z" fill="#087C6E"/>
        <circle cx="128" cy="7" r="6" fill="#D64239"/>
        <path d="M126 25v22" stroke="#0B6B5F" strokeWidth="4" strokeLinecap="round"/>
        <text x="12" y="68" fill="#D63B34" fontFamily="Trebuchet MS, Arial, sans-serif" fontSize="45" fontWeight="400" letterSpacing="-2">nutri</text>
        <text x="126" y="68" fill="#D63B34" fontFamily="Trebuchet MS, Arial, sans-serif" fontSize="45" fontWeight="400" letterSpacing="-2">packs</text>
        <path d="M112 62c4-17 10-27 17-31" stroke="#0A6B5E" strokeWidth="5" strokeLinecap="round"/>
        <path d="M129 31c8 2 13 8 14 17-8-1-13-6-15-14" fill="#0A6B5E"/>
        <path d="M124 40c-7 0-12 4-16 11 8 2 14-1 18-8" fill="#0A6B5E"/>
        <text x="20" y="103" fill="#D63B34" fontFamily="Tahoma, Arial, sans-serif" fontSize="26">نوتري باكس</text>
      </g>
    </svg>
  );
}
