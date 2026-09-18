export default function BrandLogo() {
  return (
    <span className="brandLogoFrame" aria-hidden="true">
      <svg className="brandLogoSvg" viewBox="0 0 360 190" role="presentation">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M178 73c-35-8-55-31-58-61 31 4 54 24 61 55" fill="#0b665b" stroke="#075147" strokeWidth="4" />
          <path d="M182 73c35-8 55-31 58-61-31 4-54 24-61 55" fill="#0b665b" stroke="#075147" strokeWidth="4" />
          <path d="M180 63v72" stroke="#0b665b" strokeWidth="9" />
          <path d="M180 82c-18 16-29 33-34 51" stroke="#0b665b" strokeWidth="7" />
          <circle cx="180" cy="13" r="12" fill="#c9362c" stroke="#b62c24" strokeWidth="3" />
        </g>
        <text x="8" y="116" fill="#cf4036" fontFamily="Arial Rounded MT Bold, Trebuchet MS, Arial, sans-serif" fontSize="66" fontWeight="500" letterSpacing="-4">nutri</text>
        <text x="188" y="116" fill="#cf4036" fontFamily="Arial Rounded MT Bold, Trebuchet MS, Arial, sans-serif" fontSize="66" fontWeight="500" letterSpacing="-4">packs</text>
        <text x="42" y="169" fill="#cf4036" fontFamily="Tahoma, Arial, sans-serif" fontSize="44" fontWeight="500">نوتري باكس</text>
      </svg>
    </span>
  );
}
