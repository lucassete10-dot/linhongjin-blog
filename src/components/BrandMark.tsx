type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <svg
      className={`hm-logo ${className}`.trim()}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Help Myself"
    >
      <rect x="2" y="2" width="44" height="44" rx="13" fill="currentColor" />
      <path d="M14 13v22M34 13v22M14 25h20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 32V16m0 0-5 5m5-5 5 5" fill="none" stroke="#36d7e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
