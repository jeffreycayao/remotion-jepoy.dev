import React from "react";

export type IconName = "bolt" | "bag" | "gem" | "sun" | "cap" | "comment" | "calendar" | "check";

const PATHS: Record<IconName, React.ReactNode> = {
  bolt: <path d="M18 3 6 18h9l-2 11 12-15h-9l2-11Z" fill="currentColor" stroke="none" />,
  bag: (
    <>
      <path d="M6 10h20l-1.5 18h-17L6 10Z" />
      <path d="M11 13V8a5 5 0 0 1 10 0v5" />
    </>
  ),
  gem: (
    <>
      <path d="M9 5h14l6 8-13 15L3 13l6-8Z" />
      <path d="M3 13h26M12 5l4 23M20 5l-4 23" />
    </>
  ),
  sun: (
    <>
      <circle cx="16" cy="16" r="6" />
      <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M6 26l3-3M23 9l3-3" />
    </>
  ),
  cap: (
    <>
      <path d="M2 12 16 6l14 6-14 6L2 12Z" />
      <path d="M8 15v7c0 2 4 4 8 4s8-2 8-4v-7M28 13v8" />
    </>
  ),
  comment: (
    <>
      <path d="M7 5h18a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H14l-7 5v-5a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" />
      <path d="M10 13h12M10 18h9" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="7" width="24" height="21" rx="3" />
      <path d="M4 14h24M10 4v6M22 4v6M10 20h4M18 20h4M10 24h4" />
    </>
  ),
  check: <path d="m6 17 7 7 13-15" />,
};

/** Line icons drawn in SVG so every render machine shows the same glyphs (no emoji fonts). */
export const Icon: React.FC<{ name: IconName; size: number; color: string; stroke?: number }> = ({ name, size, color, stroke = 2.8 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color }} aria-hidden="true">
    {PATHS[name]}
  </svg>
);
