import React from 'react';

export function GoFlowLogo({
  variant = 'dark',
  size = 'md',
}: {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  const textSize =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const textColor = variant === 'light' ? 'text-white' : 'text-[#3A1952]';
  const gColor = variant === 'light' ? '#FFFFFF' : '#4C2368';

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 select-none">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className={iconSize}
        aria-hidden="true"
      >
        <path
          d="M27.5 11.2A12.5 12.5 0 1 0 30.8 25.5"
          stroke={gColor}
          strokeWidth="5.2"
          strokeLinecap="round"
        />
        <path
          d="M17.5 26.5L29.5 14.5M29.5 14.5H20.5M29.5 14.5V23.5"
          stroke="#3FE07C"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-display font-bold tracking-tight ${textSize} ${textColor}`}>
        GoFlow
      </span>
    </span>
  );
}

export function GoFlowWelcomeIllustration({compact = false}: {compact?: boolean}) {
  return (
    <svg
      viewBox="0 0 260 200"
      fill="none"
      className={compact ? 'w-32 h-24 mx-auto' : 'w-52 h-40 mx-auto'}
      aria-hidden="true"
    >
      {/* Lavender organic backdrop */}
      <path
        d="M42 156C24 128 32 80 62 56C94 30 156 26 192 58C226 88 228 138 200 162C176 182 62 184 42 156Z"
        fill="#DDD0F5"
      />
      {/* Left chart card */}
      <rect x="26" y="48" width="52" height="36" rx="6" fill="#FFFFFF" stroke="#221233" strokeWidth="2.5" />
      <path d="M34 74L46 62L56 70L68 58L74 64" stroke="#6B3FA0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="56" r="3" fill="#6B3FA0" />
      {/* Right analytics window */}
      <rect x="172" y="38" width="54" height="38" rx="6" fill="#FFFFFF" stroke="#221233" strokeWidth="2.5" />
      <line x1="172" y1="48" x2="226" y2="48" stroke="#221233" strokeWidth="2" />
      <path d="M180 68L192 58L202 64L216 52" stroke="#3FE07C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Thumbs up & heart bubbles */}
      <rect x="44" y="96" width="28" height="22" rx="6" fill="#FFFFFF" stroke="#221233" strokeWidth="2.2" />
      <path d="M53 111V103M53 105H61C62.5 105 63.5 106.5 63 108L61.5 112H53" stroke="#4C2368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="184" y="96" width="30" height="24" rx="6" fill="#FFFFFF" stroke="#221233" strokeWidth="2.2" />
      <path d="M199 113C199 113 192 108.5 192 104.5C192 102.5 193.5 101 195.5 101C197 101 198.2 102 199 103.2C199.8 102 201 101 202.5 101C204.5 101 206 102.5 206 104.5C206 108.5 199 113 199 113Z" fill="#6B3FA0" />
      {/* Center person */}
      <path d="M90 162C90 130 104 114 130 114C156 114 170 130 170 162H90Z" fill="#5A2A82" stroke="#221233" strokeWidth="2.5" />
      <rect x="122" y="98" width="16" height="18" rx="6" fill="#FFFFFF" stroke="#221233" strokeWidth="2.5" />
      <circle cx="130" cy="80" r="20" fill="#FFFFFF" stroke="#221233" strokeWidth="2.5" />
      {/* Hair */}
      <path d="M110 78C110 64 118 54 132 54C144 54 152 62 150 74C146 68 136 66 124 68C118 70 114 74 110 78Z" fill="#221233" />
      {/* Face */}
      <circle cx="123" cy="80" r="2" fill="#221233" />
      <circle cx="137" cy="80" r="2" fill="#221233" />
      <path d="M126 88C128.5 90.5 132 90.5 134 88" stroke="#221233" strokeWidth="2" strokeLinecap="round" />
      {/* Folded arms */}
      <rect x="98" y="138" width="64" height="18" rx="9" fill="#FFFFFF" stroke="#221233" strokeWidth="2.5" />
      {/* Plants */}
      <path d="M40 162H56L53 142H43L40 162Z" fill="#FFFFFF" stroke="#221233" strokeWidth="2.2" />
      <path d="M48 142C44 130 38 122 36 116M48 142C48 128 48 118 50 112M48 142C54 130 60 124 62 118" stroke="#4C2368" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M204 162H220L217 142H207L204 162Z" fill="#FFFFFF" stroke="#221233" strokeWidth="2.2" />
      <path d="M212 142C208 130 202 122 200 118M212 142C212 128 212 118 214 114M212 142C218 130 224 124 226 120" stroke="#4C2368" strokeWidth="2.5" strokeLinecap="round" />
      {/* Ground line */}
      <line x1="28" y1="162" x2="232" y2="162" stroke="#221233" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
