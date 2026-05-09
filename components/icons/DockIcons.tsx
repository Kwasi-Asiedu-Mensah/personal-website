"use client";

import { useEffect, useState } from "react";

/**
 * Renders /icons/{name}.png if it loads successfully, otherwise falls back
 * to the inline SVG. Uses an Image() preload so we never flash a broken-img
 * placeholder (and so this works whether or not Next.js returns a real 404).
 */
function IconWithFallback({
  name,
  alt,
  fallback,
}: {
  name: string;
  alt: string;
  fallback: React.ReactNode;
}) {
  const [pngOk, setPngOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setPngOk(true);
    };
    img.onerror = () => {
      if (!cancelled) setPngOk(false);
    };
    img.src = `/icons/${name}.png`;
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (pngOk) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={`/icons/${name}.png`}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    );
  }
  return <>{fallback}</>;
}

/* -------------------------------- Finder -------------------------------- */

function FinderSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="finder-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DC0FF" />
          <stop offset="100%" stopColor="#1F5BC9" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#finder-bg)" />
      <g transform="translate(32 33) rotate(-13)">
        <path d="M 0 -22 A 18 22 0 0 0 0 22 Z" fill="#F2F1EC" />
        <path d="M 0 -22 A 18 22 0 0 1 0 22 Z" fill="#0A1A3A" />
        <ellipse cx="-8" cy="-3" rx="1.9" ry="3.6" fill="#0A1A3A" />
        <ellipse cx="8" cy="-3" rx="1.9" ry="3.6" fill="#F2F1EC" />
        <path
          d="M -9 9 Q 0 14 9 9"
          stroke="#0A1A3A"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function FinderIcon() {
  return <IconWithFallback name="finder" alt="Finder" fallback={<FinderSVG />} />;
}

/* --------------------------------- Notes -------------------------------- */

function NotesSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="notes-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="100%" stopColor="#F4B83A" />
        </linearGradient>
        <clipPath id="notes-clip">
          <rect width="64" height="64" rx="13" />
        </clipPath>
      </defs>
      <g clipPath="url(#notes-clip)">
        <rect width="64" height="64" fill="#FFFFFF" />
        <rect width="64" height="18" fill="url(#notes-band)" />
        {[26, 33, 40, 47, 54].map((y) => (
          <line
            key={y}
            x1="10"
            y1={y}
            x2="54"
            y2={y}
            stroke="#E0E0E0"
            strokeWidth="1"
          />
        ))}
      </g>
      <rect
        width="64"
        height="64"
        rx="13"
        fill="none"
        stroke="rgba(0,0,0,0.06)"
      />
    </svg>
  );
}

export function NotesIcon() {
  return <IconWithFallback name="notes" alt="Notes" fallback={<NotesSVG />} />;
}

/* ------------------------------- Settings ------------------------------- */

function SettingsSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="settings-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDEDED" />
          <stop offset="100%" stopColor="#9C9C9C" />
        </linearGradient>
        <radialGradient id="gear-fill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5C5C5C" />
          <stop offset="100%" stopColor="#1E1E1E" />
        </radialGradient>
        <radialGradient id="gear-center" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9A9A9A" />
          <stop offset="100%" stopColor="#5C5C5C" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#settings-bg)" />
      <g transform="translate(32 32)">
        <g fill="url(#gear-fill)">
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 45})`}>
              <rect x="-3.5" y="-22" width="7" height="9" rx="1.5" />
            </g>
          ))}
        </g>
        <circle r="14" fill="url(#gear-fill)" />
        <circle r="9" fill="url(#gear-center)" />
        <circle r="3.5" fill="url(#settings-bg)" />
      </g>
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <IconWithFallback
      name="settings"
      alt="System Settings"
      fallback={<SettingsSVG />}
    />
  );
}

/* ------------------------------- Terminal ------------------------------- */

function TerminalSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="terminal-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#070707" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#terminal-bg)" />
      {/* prompt */}
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily='"SF Mono", "Menlo", monospace'
        fontSize="22"
        fontWeight="600"
        fill="#34c759"
      >
        $_
      </text>
    </svg>
  );
}

export function TerminalIcon() {
  return (
    <IconWithFallback
      name="terminal"
      alt="Terminal"
      fallback={<TerminalSVG />}
    />
  );
}

/* --------------------------------- Trash -------------------------------- */

function TrashSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="trash-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4F4F4" />
          <stop offset="100%" stopColor="#C8C8C8" />
        </linearGradient>
        <linearGradient id="trash-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#A8A8A8" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="trash-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BABABA" />
          <stop offset="100%" stopColor="#8A8A8A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#trash-bg)" />
      <rect x="28" y="13" width="8" height="2.5" rx="1" fill="url(#trash-lid)" />
      <rect
        x="14"
        y="16"
        width="36"
        height="3.5"
        rx="1.5"
        fill="url(#trash-lid)"
      />
      <path
        d="M 17 22 L 19 50 Q 19 52 21 52 L 43 52 Q 45 52 45 50 L 47 22 Z"
        fill="url(#trash-glass)"
        stroke="#9A9A9A"
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

export function TrashIcon() {
  return <IconWithFallback name="trash" alt="Trash" fallback={<TrashSVG />} />;
}

/* -------------------------------- Preview ------------------------------- */

function PreviewSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="preview-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7CB6FF" />
          <stop offset="100%" stopColor="#2C72D6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#preview-bg)" />
      <circle
        cx="26"
        cy="26"
        r="14"
        fill="none"
        stroke="white"
        strokeWidth="4"
      />
      <line
        x1="36"
        y1="36"
        x2="50"
        y2="50"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PreviewIcon() {
  return (
    <IconWithFallback name="preview" alt="Preview" fallback={<PreviewSVG />} />
  );
}

/* --------------------------------- Music -------------------------------- */

function MusicSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="music-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7A99" />
          <stop offset="50%" stopColor="#FB4368" />
          <stop offset="100%" stopColor="#E8214B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#music-bg)" />
      {/* Eighth-note glyph */}
      <g fill="#FFFFFF">
        {/* stem connecting both noteheads */}
        <rect x="36" y="18" width="3.6" height="22" rx="1.2" />
        <rect x="20" y="22" width="3.6" height="22" rx="1.2" />
        {/* beam */}
        <path d="M 23.6 18 L 39.6 14 L 39.6 19 L 23.6 23 Z" />
        {/* left notehead */}
        <ellipse cx="20" cy="44" rx="6" ry="4.5" />
        {/* right notehead */}
        <ellipse cx="36" cy="40" rx="6" ry="4.5" />
      </g>
    </svg>
  );
}

export function MusicIcon() {
  return (
    <IconWithFallback name="music" alt="Music" fallback={<MusicSVG />} />
  );
}

/* -------------------------------- Weather ------------------------------- */

function WeatherSVG() {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="weather-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E7DD4" />
          <stop offset="100%" stopColor="#5FA8F0" />
        </linearGradient>
        <linearGradient id="weather-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor="#FFB830" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="13" fill="url(#weather-sky)" />
      {/* Sun */}
      <circle cx="40" cy="24" r="9" fill="url(#weather-sun)" />
      {/* Cloud body */}
      <ellipse cx="26" cy="40" rx="14" ry="9" fill="white" />
      <ellipse cx="34" cy="36" rx="11" ry="8" fill="white" />
      <ellipse cx="44" cy="40" rx="10" ry="7" fill="rgba(255,255,255,0.9)" />
      {/* Cloud underside fill */}
      <rect x="14" y="40" width="38" height="8" rx="3" fill="white" />
    </svg>
  );
}

export function WeatherIcon() {
  return (
    <IconWithFallback name="weather" alt="Weather" fallback={<WeatherSVG />} />
  );
}
