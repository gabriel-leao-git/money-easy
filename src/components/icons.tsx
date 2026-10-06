import type { ReactNode } from 'react';

function Svg({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconCoin = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.6 9.6c-.4-.9-1.4-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2s1 1.6 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.2-.6-2.6-1.6M12 6.4v1.6M12 16v1.6" />
  </Svg>
);

export const IconStore = () => (
  <Svg>
    <path d="M4.5 10.5V19a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-8.5" />
    <path d="M3 10l1.9-5.3A1 1 0 0 1 5.8 4h12.4a1 1 0 0 1 .9.7L21 10c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3c0 1.7-1.3 3-3 3s-3-1.3-3-3z" />
    <path d="M10 20v-4h4v4" />
  </Svg>
);

export const IconCash = () => (
  <Svg>
    <rect x="2.5" y="9.5" width="19" height="11" rx="2.2" />
    <circle cx="12" cy="15" r="2.2" />
    <path d="M12 2.5V7M9.6 4.9 12 2.5l2.4 2.4" />
  </Svg>
);

export const IconTrophy = () => (
  <Svg>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
    <path d="M8 6H5.5a2.5 2.5 0 0 0 2.8 3.6M16 6h2.5a2.5 2.5 0 0 1-2.8 3.6" />
    <path d="M12 13v3.5M8.5 20h7M9.5 16.5h5V20h-5z" />
  </Svg>
);

export const IconSound = () => (
  <Svg size={20}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.3a8 8 0 0 1 0 11.4" />
  </Svg>
);

export const IconMute = () => (
  <Svg size={20}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Svg>
);

export const IconUser = () => (
  <Svg size={20}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c.9-3.6 3.9-5.6 7.5-5.6s6.6 2 7.5 5.6" />
  </Svg>
);

export const IconLock = () => (
  <Svg size={20}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
);

export const IconEye = () => (
  <Svg size={20}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);

export const IconEyeOff = () => (
  <Svg size={20}>
    <path d="M10 5.7A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 6.9C4 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.7 0 3.2-.5 4.5-1.2" />
    <path d="M3 3l18 18M9.9 9.9a2.8 2.8 0 0 0 4 4" />
  </Svg>
);

export const IconArrow = () => (
  <Svg size={18}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconBolt = () => (
  <Svg size={18}>
    <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8z" />
  </Svg>
);

export const IconLogout = () => (
  <Svg size={18}>
    <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 16.5 5.5 12 10 7.5M5.5 12H15" />
  </Svg>
);

export const IconReset = () => (
  <Svg size={18}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4" />
  </Svg>
);
