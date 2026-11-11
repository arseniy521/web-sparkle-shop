interface LanguageFlagProps {
  lang: string;
  className?: string;
}

/** Small inline SVG flags (no emoji, so they render the same on every OS). */
export const LanguageFlag = ({ lang, className = 'h-3.5 w-[21px]' }: LanguageFlagProps) => {
  const art = (() => {
    switch (lang) {
      case 'cs':
        return (
          <>
            <rect width="24" height="8" fill="#ffffff" />
            <rect y="8" width="24" height="8" fill="#d7141a" />
            <path d="M0 0L12 8L0 16Z" fill="#11457e" />
          </>
        );
      case 'en':
        return (
          <>
            <rect width="24" height="16" fill="#012169" />
            <path d="M0 0L24 16M24 0L0 16" stroke="#ffffff" strokeWidth="3" />
            <path d="M0 0L24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.2" />
            <path d="M12 0V16M0 8H24" stroke="#ffffff" strokeWidth="5" />
            <path d="M12 0V16M0 8H24" stroke="#c8102e" strokeWidth="3" />
          </>
        );
      case 'ru':
        return (
          <>
            <rect width="24" height="5.34" fill="#ffffff" />
            <rect y="5.33" width="24" height="5.34" fill="#0039a6" />
            <rect y="10.66" width="24" height="5.34" fill="#d52b1e" />
          </>
        );
      case 'uk':
        return (
          <>
            <rect width="24" height="8" fill="#0057b7" />
            <rect y="8" width="24" height="8" fill="#ffd700" />
          </>
        );
      default:
        return <rect width="24" height="16" fill="#d9d9d9" />;
    }
  })();

  return (
    <svg
      viewBox="0 0 24 16"
      className={`${className} rounded-[2px] flex-shrink-0`}
      style={{ boxShadow: '0 0 0 0.5px rgba(42,44,46,0.25)' }}
      aria-hidden="true"
      focusable="false"
    >
      {art}
    </svg>
  );
};
