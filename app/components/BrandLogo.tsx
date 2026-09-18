export default function BrandLogo() {
  return (
    <span className="brandLogoFrame" aria-hidden="true">
      <svg className="brandLogoSvg" viewBox="0 0 260 126" role="presentation">
        <g className="brandSymbol">
          <circle cx="130" cy="13" r="8" fill="#c74238" />
          <path d="M126 53C103 50 91 35 93 17c18 1 32 13 35 31" fill="#0b6b60" />
          <path d="M134 53c23-3 35-18 33-36-18 1-32 13-35 31" fill="#0b6b60" />
          <path d="M130 39c-1 19-1 38 0 58" fill="none" stroke="#0b6b60" strokeWidth="6" strokeLinecap="round" />
          <path d="M104 25c8 5 15 12 22 22M156 25c-8 5-15 12-22 22" fill="none" stroke="#f4fbf8" strokeWidth="2.5" strokeLinecap="round" opacity=".72" />
        </g>

        <text x="9" y="82" fill="#c74238" fontFamily="Trebuchet MS, Arial, sans-serif" fontSize="38" fontWeight="500" letterSpacing="-2">nutri</text>
        <text x="139" y="82" fill="#c74238" fontFamily="Trebuchet MS, Arial, sans-serif" fontSize="38" fontWeight="500" letterSpacing="-2">packs</text>
        <text x="130" y="113" fill="#c74238" fontFamily="Tahoma, Arial, sans-serif" fontSize="27" fontWeight="500" textAnchor="middle" direction="rtl">نوتري باكس</text>
      </svg>
    </span>
  );
}
