"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/lib/theme";
import { useWallpaper, useWallpaperImage, WALLPAPERS } from "@/lib/wallpaper";
import { useSettingsRouter, type SettingsPane } from "@/lib/settings-router";
import { useSystemState } from "@/lib/system-state";

/**
 * Drop a PNG at /public/icons/settings-{name}.png and it will replace the
 * inline SVG glyph for that nav row. Falls back silently if the file is missing.
 */
function useSettingsIconOverride(name: string): string | null {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => !cancelled && setSrc(`/icons/settings-${name}.png`);
    img.onerror = () => !cancelled && setSrc(null);
    img.src = `/icons/settings-${name}.png`;
    return () => {
      cancelled = true;
    };
  }, [name]);
  return src;
}

function GlyphWithOverride({
  name,
  fallback,
}: {
  name: string;
  fallback: ReactNode;
}) {
  const src = useSettingsIconOverride(name);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-[22px] h-[22px] rounded-[6px] shrink-0 select-none pointer-events-none"
      />
    );
  }
  return <>{fallback}</>;
}

/* ============================== iOS Glyphs ============================== */

function SidebarGlyph({
  bg,
  children,
}: {
  bg: string;
  children: ReactNode;
}) {
  return (
    <span
      className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}

const BLUE = "linear-gradient(180deg, #4FAEF8 0%, #1C72E0 100%)";
const GRAY = "linear-gradient(180deg, #C0C0C0 0%, #6E6E6E 100%)";

const WiFiGlyph = () => (
  <GlyphWithOverride
    name="wifi"
    fallback={
      <SidebarGlyph bg={BLUE}>
        <WiFiSymbol size={15} />
      </SidebarGlyph>
    }
  />
);

function WiFiSymbol({ size = 16 }: { size?: number }) {
  // Three concentric arcs converging on a dot at the bottom-center.
  // 100x100 viewBox so the geometry stays precise at any size.
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
      <path
        d="M 17 61 Q 50 24 83 61"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 29 68 Q 50 42 71 68"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 40 74 Q 50 60 60 74"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="80" r="6" fill="white" />
    </svg>
  );
}

const BluetoothGlyph = () => (
  <GlyphWithOverride
    name="bluetooth"
    fallback={
      <SidebarGlyph bg={BLUE}>
        <BluetoothSymbol size={14} />
      </SidebarGlyph>
    }
  />
);

function BluetoothSymbol({ size = 14 }: { size?: number }) {
  // The Bluetooth runic-B glyph as one continuous stroke.
  // Path: middle-left → upper-right peak → top → bottom → lower-right peak → middle-left.
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
      <path
        d="M 35 50 L 65 35 L 50 20 L 50 80 L 65 65 L 35 50"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const GeneralGlyph = () => (
  <GlyphWithOverride
    name="general"
    fallback={
      <SidebarGlyph bg={GRAY}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
          <g>
            <rect x="11" y="2" width="2" height="3" rx="0.5" />
            <rect x="11" y="19" width="2" height="3" rx="0.5" />
            <rect x="2" y="11" width="3" height="2" rx="0.5" />
            <rect x="19" y="11" width="3" height="2" rx="0.5" />
            <g transform="rotate(45 12 12)">
              <rect x="11" y="2" width="2" height="3" rx="0.5" />
              <rect x="11" y="19" width="2" height="3" rx="0.5" />
              <rect x="2" y="11" width="3" height="2" rx="0.5" />
              <rect x="19" y="11" width="3" height="2" rx="0.5" />
            </g>
          </g>
          <circle
            cx="12"
            cy="12"
            r="6"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
      </SidebarGlyph>
    }
  />
);

const APPEARANCE_BG = "linear-gradient(180deg, #2a2a2a 0%, #0d0d0d 100%)";

const AppearanceGlyph = () => (
  <GlyphWithOverride
    name="appearance"
    fallback={
      <SidebarGlyph bg={APPEARANCE_BG}>
        <AppearanceSymbol size={15} />
      </SidebarGlyph>
    }
  />
);

function AppearanceSymbol({ size = 15 }: { size?: number }) {
  // Real macOS Appearance glyph: a circle split light-left / dark-right.
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="34" fill="white" />
      <path d="M 50 16 A 34 34 0 0 1 50 84 Z" fill="#0a0a0a" />
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ================================ Hero ================================ */

type HeroVariant = "wifi" | "bluetooth" | "general" | "appearance";

function HeroIcon({ variant, large }: { variant: HeroVariant; large?: boolean }) {
  const size = large ? 56 : 44;
  const inner = large ? 26 : 22;
  if (variant === "wifi") {
    return (
      <div
        className="rounded-[14px] flex items-center justify-center"
        style={{ width: size, height: size, background: BLUE }}
      >
        <WiFiSymbol size={inner} />
      </div>
    );
  }
  if (variant === "bluetooth") {
    return (
      <div
        className="rounded-[14px] flex items-center justify-center"
        style={{ width: size, height: size, background: BLUE }}
      >
        <BluetoothSymbol size={inner} />
      </div>
    );
  }
  if (variant === "general") {
    return (
      <div
        className="rounded-[14px] flex items-center justify-center"
        style={{ width: size, height: size, background: GRAY }}
      >
        <svg viewBox="0 0 24 24" width={inner} height={inner} fill="white">
          <g>
            <rect x="11" y="2" width="2" height="3" rx="0.5" />
            <rect x="11" y="19" width="2" height="3" rx="0.5" />
            <rect x="2" y="11" width="3" height="2" rx="0.5" />
            <rect x="19" y="11" width="3" height="2" rx="0.5" />
            <g transform="rotate(45 12 12)">
              <rect x="11" y="2" width="2" height="3" rx="0.5" />
              <rect x="11" y="19" width="2" height="3" rx="0.5" />
              <rect x="2" y="11" width="3" height="2" rx="0.5" />
              <rect x="19" y="11" width="3" height="2" rx="0.5" />
            </g>
          </g>
          <circle
            cx="12"
            cy="12"
            r="6"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
      </div>
    );
  }
  // appearance
  return (
    <div
      className="rounded-[14px] flex items-center justify-center"
      style={{ width: size, height: size, background: APPEARANCE_BG }}
    >
      <AppearanceSymbol size={inner} />
    </div>
  );
}

/* ============================== Settings ============================== */

type NavId = SettingsPane;

const NAV: { id: NavId; label: string; Icon: () => ReactNode }[] = [
  { id: "wifi", label: "Wi-Fi", Icon: WiFiGlyph },
  { id: "bluetooth", label: "Bluetooth", Icon: BluetoothGlyph },
  { id: "general", label: "General", Icon: GeneralGlyph },
  { id: "appearance", label: "Appearance", Icon: AppearanceGlyph },
];

export default function Settings() {
  const {
    pane: selectedId,
    setPane: setSelectedId,
    anchor,
  } = useSettingsRouter();

  const inStorage = selectedId === "general" && anchor === "storage";
  const inAbout = selectedId === "general" && anchor === "about";

  return (
    <div
      className="flex h-full w-full"
      style={{ background: "var(--window-bg)" }}
    >
      <Sidebar selectedId={selectedId} onSelect={setSelectedId} />
      <section className="flex-1 min-w-0 overflow-y-auto">
        {inStorage ? (
          <StoragePane />
        ) : inAbout ? (
          <AboutPane />
        ) : (
          <>
            <PaneHeader
              title={NAV.find((n) => n.id === selectedId)?.label ?? ""}
            />
            {selectedId === "wifi" && <WiFiPane />}
            {selectedId === "bluetooth" && <BluetoothPane />}
            {selectedId === "general" && <GeneralPane />}
            {selectedId === "appearance" && <AppearancePane />}
          </>
        )}
      </section>
    </div>
  );
}

function Sidebar({
  selectedId,
  onSelect,
}: {
  selectedId: NavId;
  onSelect: (id: NavId) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredNav = query.trim()
    ? NAV.filter((n) =>
        n.label.toLowerCase().includes(query.toLowerCase())
      )
    : NAV;

  return (
    <aside
      className="w-[230px] shrink-0 flex flex-col"
      style={{ borderRight: "1px solid var(--window-divider)" }}
    >
      <div className="px-3 pt-4 pb-3">
        <div
          className="flex items-center gap-2 px-2.5 h-8 rounded-md"
          style={{
            background: "var(--searchbar-bg)",
            border: "1px solid var(--searchbar-border)",
          }}
        >
          <span
            className="text-[12px]"
            style={{ color: "var(--window-text-muted)" }}
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[var(--window-text-faint)]"
            style={{ color: "var(--window-text)" }}
          />
        </div>
      </div>

      <button className="px-4 pb-4 flex items-center gap-3 text-left">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-semibold text-white shrink-0"
          style={{
            background: "linear-gradient(160deg, #6366f1, #8b5cf6)",
          }}
        >
          K
        </div>
        <div className="min-w-0">
          <div
            className="text-[13px] font-semibold truncate"
            style={{ color: "var(--window-text)" }}
          >
            Kwasi Asiedu-Mensah
          </div>
          <div
            className="text-[11px] truncate"
            style={{ color: "var(--window-text-muted)" }}
          >
            Apple Account
          </div>
        </div>
      </button>

      <div className="flex-1 overflow-y-auto pb-4 px-2 space-y-0.5">
        {filteredNav.length === 0 ? (
          <div
            className="px-3 py-3 text-[12px]"
            style={{ color: "var(--window-text-muted)" }}
          >
            No settings match &ldquo;{query}&rdquo;.
          </div>
        ) : (
          filteredNav.map((n) => {
            const active = n.id === selectedId;
            const Icon = n.Icon;
            return (
              <button
                key={n.id}
                onClick={() => onSelect(n.id)}
                className="w-full text-left px-2 py-1.5 rounded-md flex items-center gap-3 transition-colors"
                style={{
                  background: active ? "var(--row-active)" : "transparent",
                  color: "var(--window-text)",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--row-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                <Icon />
                <span className="text-[13px]">{n.label}</span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

function PaneHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-1 px-6 h-12"
      style={{
        background: "var(--window-bg)",
        borderBottom: "1px solid var(--window-divider)",
      }}
    >
      <NavArrow direction="back" onClick={onBack} />
      <NavArrow direction="forward" />
      <h1
        className="ml-3 text-[18px] font-semibold"
        style={{ color: "var(--window-text)" }}
      >
        {title}
      </h1>
    </div>
  );
}

function NavArrow({
  direction,
  onClick,
}: {
  direction: "back" | "forward";
  onClick?: () => void;
}) {
  const enabled = !!onClick;
  return (
    <button
      aria-label={direction}
      onClick={onClick}
      disabled={!enabled}
      className="w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-40"
      style={{ color: "var(--window-text-muted)" }}
      onMouseEnter={(e) => {
        if (enabled)
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--row-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
        {direction === "back" ? (
          <path
            d="M8 1 L2 7 L8 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M2 1 L8 7 L2 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

/* =============================== Wi-Fi =============================== */

type WifiNetwork = { ssid: string; secured?: boolean; bars?: 1 | 2 | 3 };

const KNOWN: WifiNetwork = { ssid: "Asiedu-mensah", secured: true, bars: 3 };
const PERSONAL_HOTSPOT = { name: "Kwasi's iPhone", secured: true };
const OTHER_NETWORKS: WifiNetwork[] = [
  { ssid: "MTN_FibreNet_5G", secured: true, bars: 2 },
  { ssid: "Vodafone Cafe", secured: true, bars: 2 },
  { ssid: "Surfline_Home_2.4", secured: true, bars: 1 },
  { ssid: "Busy_HotSpot", secured: true, bars: 1 },
  { ssid: "GhanaPostGPS_Guest", secured: false, bars: 1 },
];

function WiFiPane() {
  const { wifiOn: on, setWifiOn: setOn } = useSystemState();

  return (
    <div className="px-8 py-7 max-w-[700px]">
      <Card>
        <div className="flex items-start gap-4 px-4 py-3.5">
          <HeroIcon variant="wifi" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div
                className="text-[14px] font-semibold"
                style={{ color: "var(--window-text)" }}
              >
                Wi-Fi
              </div>
              <Toggle on={on} onChange={setOn} />
            </div>
            <p
              className="text-[12px] mt-1 leading-relaxed"
              style={{ color: "var(--window-text-muted)" }}
            >
              Set up Wi-Fi to wirelessly connect your Mac to the internet. Turn
              on Wi-Fi, then choose a network to join.{" "}
              <span style={{ color: "#4F9EFF", cursor: "pointer" }}>
                Learn More…
              </span>
            </p>
          </div>
        </div>
      </Card>

      {on && (
        <>
          <Spacer />

          <Card>
            <Row
              left={
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--window-text)" }}
                  >
                    {KNOWN.ssid}
                  </span>
                </div>
              }
              right={
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#34c759]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
                    Connected
                  </span>
                  {KNOWN.secured && <Lock />}
                  <WifiBars bars={KNOWN.bars ?? 3} />
                  <DetailsButton />
                </div>
              }
            />
          </Card>

          <SectionLabel>Personal Hotspots</SectionLabel>
      <Card>
        <Row
          left={
            <span
              className="text-[13px]"
              style={{ color: "var(--window-text)" }}
            >
              {PERSONAL_HOTSPOT.name}
            </span>
          }
          right={
            <div className="flex items-center gap-3">
              {PERSONAL_HOTSPOT.secured && <Lock />}
              <Phone />
            </div>
          }
        />
      </Card>

      <SectionLabel>Known Networks</SectionLabel>
      <Card>
        <Row
          left={
            <span
              className="text-[13px] flex items-center gap-2"
              style={{ color: "var(--window-text)" }}
            >
              <Check />
              {KNOWN.ssid}
            </span>
          }
          right={
            <div className="flex items-center gap-3">
              {KNOWN.secured && <Lock />}
              <WifiBars bars={3} />
              <Ellipsis />
            </div>
          }
        />
      </Card>

      <SectionLabel>
        <span className="flex items-center justify-between">
          Other Networks
          <Spinner />
        </span>
      </SectionLabel>
      <Card>
        {OTHER_NETWORKS.map((n, i) => (
          <div key={n.ssid}>
            <Row
              left={
                <span
                  className="text-[13px]"
                  style={{ color: "var(--window-text)" }}
                >
                  {n.ssid}
                </span>
              }
              right={
                <div className="flex items-center gap-3">
                  {n.secured && <Lock />}
                  <WifiBars bars={n.bars ?? 2} />
                  <Ellipsis />
                </div>
              }
            />
            {i < OTHER_NETWORKS.length - 1 && <Divider />}
          </div>
        ))}
      </Card>

      <div className="flex justify-end mt-2">
        <button
          className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
          style={{
            background: "var(--searchbar-bg)",
            border: "1px solid var(--window-border)",
            color: "var(--window-text)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--row-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--searchbar-bg)";
          }}
        >
          Other…
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <PrefRow
          label="Ask to join networks"
          hint="Known networks will be joined automatically. If no known networks are available, you will be notified of available networks."
          options={["Off", "Notify", "Ask"]}
          defaultValue="Notify"
        />
        <PrefRow
          label="Ask to join hotspots"
          hint="Allow this Mac to automatically discover nearby personal hotspots when no Wi-Fi network is available."
          options={["Off", "Notify", "Ask To Join", "Automatic"]}
          defaultValue="Ask To Join"
        />
      </div>

          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
              style={{
                background: "var(--searchbar-bg)",
                border: "1px solid var(--window-border)",
                color: "var(--window-text)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--row-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--searchbar-bg)";
              }}
            >
              Advanced…
            </button>
            <HelpButton />
          </div>
        </>
      )}
    </div>
  );
}

function PrefRow({
  label,
  hint,
  options,
  defaultValue,
}: {
  label: string;
  hint: string;
  options: string[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] font-medium"
          style={{ color: "var(--window-text)" }}
        >
          {label}
        </div>
        <div
          className="text-[11px] mt-1 leading-relaxed"
          style={{ color: "var(--window-text-muted)" }}
        >
          {hint}
        </div>
      </div>
      <div className="shrink-0 mt-0.5">
        <SelectMenu
          options={options}
          value={value}
          onChange={setValue}
        />
      </div>
    </div>
  );
}

function SelectMenu({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-1 rounded-md text-[12px] font-medium cursor-pointer outline-none"
        style={{
          background: "var(--searchbar-bg)",
          border: "1px solid var(--window-border)",
          color: "var(--window-text)",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"
        style={{ color: "var(--window-text-muted)" }}
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
          <path
            d="M2 5 L5 2 L8 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 9 L5 12 L8 9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

function HelpButton() {
  return (
    <button
      aria-label="help"
      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: "var(--searchbar-bg)",
        border: "1px solid var(--window-border)",
        color: "var(--window-text-muted)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--row-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--searchbar-bg)";
      }}
    >
      <span className="text-[12px] font-semibold">?</span>
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={{
        border: "1.5px solid var(--window-text-muted)",
        borderTopColor: "transparent",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

/* ============================= Bluetooth ============================= */

type BTDevice = {
  id: string;
  name: string;
  emoji: string;
  connected: boolean;
  battery?: number;
};

const BT_DEVICES: BTDevice[] = [
  { id: "kb", name: "Kwasi's Magic Keyboard", emoji: "⌨️", connected: true, battery: 91 },
  { id: "tp", name: "Kwasi's Magic Trackpad", emoji: "🖱️", connected: true, battery: 20 },
  { id: "hp", name: "Sony WH-1000XM5", emoji: "🎧", connected: false },
  { id: "apm", name: "Kwasi's AirPods Max", emoji: "🎧", connected: false },
  { id: "app", name: "Kwasi's AirPods Pro", emoji: "🎧", connected: false },
  { id: "fl", name: "Kwasi's iPhone", emoji: "📱", connected: false },
];

function BluetoothPane() {
  const { bluetoothOn: on, setBluetoothOn: setOn } = useSystemState();

  return (
    <div className="px-8 py-7 max-w-[700px]">
      <Card>
        <div className="flex items-start gap-4 px-4 py-3.5">
          <HeroIcon variant="bluetooth" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div
                className="text-[14px] font-semibold"
                style={{ color: "var(--window-text)" }}
              >
                Bluetooth
              </div>
              <Toggle on={on} onChange={setOn} />
            </div>
            <p
              className="text-[12px] mt-1 leading-relaxed"
              style={{ color: "var(--window-text-muted)" }}
            >
              Connect to accessories you can use for activities such as
              streaming music, typing, and gaming.{" "}
              <span style={{ color: "#4F9EFF", cursor: "pointer" }}>
                Learn more…
              </span>
            </p>
          </div>
        </div>
      </Card>

      {on && (
        <>
          <p
            className="text-[12px] mt-4 mb-1 px-1"
            style={{ color: "var(--window-text-muted)" }}
          >
            This Mac is discoverable as &ldquo;Kwasi's MacBook Pro&rdquo; while
            Bluetooth Settings is open.
          </p>

          <SectionLabel>My Devices</SectionLabel>
          <Card>
            {BT_DEVICES.map((d, i) => (
              <div key={d.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center text-[16px] shrink-0"
                    style={{
                      background: "var(--searchbar-bg)",
                      border: "1px solid var(--window-border)",
                    }}
                  >
                    {d.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--window-text)" }}
                    >
                      {d.name}
                    </div>
                    <div
                      className="text-[11px] mt-0.5"
                      style={{
                        color: d.connected
                          ? "var(--window-text-muted)"
                          : "var(--window-text-faint)",
                      }}
                    >
                      {d.connected ? "Connected" : "Not Connected"}
                    </div>
                  </div>
                  {d.connected && d.battery !== undefined && (
                    <BatteryIndicator pct={d.battery} />
                  )}
                  <InfoButton />
                </div>
                {i < BT_DEVICES.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

/* ============================== General ============================== */

function GeneralPane() {
  const { setPane } = useSettingsRouter();
  const { current: wallpaper } = useWallpaper();
  return (
    <div className="px-8 py-7 max-w-[700px]">
      <Hero
        variant="general"
        title="General"
        description="Manage your overall setup and preferences for your Mac, including software updates, device language, AirDrop, and more."
      />

      <Card>
        <Row
          onClick={() => setPane("general", "about")}
          left={
            <div className="flex items-center gap-3">
              <RowIcon bg="#3b82f6">ⓘ</RowIcon>
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                About
              </span>
            </div>
          }
          right={<Chevron />}
        />
        <Divider />
        <Row
          onClick={() => setPane("appearance", "wallpaper")}
          left={
            <div className="flex items-center gap-3">
              <RowIcon bg="#34c759">⤓</RowIcon>
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                Software Update
              </span>
            </div>
          }
          right={<Chevron />}
        />
        <Divider />
        <Row
          onClick={() => setPane("general", "storage")}
          left={
            <div className="flex items-center gap-3">
              <RowIcon bg="#9ca3af">▥</RowIcon>
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                Storage
              </span>
            </div>
          }
          right={
            <div
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "var(--window-text-muted)" }}
            >
              380.95 GB available
              <Chevron />
            </div>
          }
        />
      </Card>

      <SectionLabel>This Mac</SectionLabel>
      <Card>
        <Row
          left={
            <span
              className="text-[13px]"
              style={{ color: "var(--window-text)" }}
            >
              Device name
            </span>
          }
          right={
            <span
              className="text-[12px]"
              style={{ color: "var(--window-text-muted)" }}
            >
              Kwasi's MacBook Pro
            </span>
          }
        />
        <Divider />
        <Row
          left={
            <span
              className="text-[13px]"
              style={{ color: "var(--window-text)" }}
            >
              macOS version
            </span>
          }
          right={
            <span
              className="text-[12px]"
              style={{ color: "var(--window-text-muted)" }}
            >
              {wallpaper.label} {wallpaper.subtitle}
            </span>
          }
        />
      </Card>
    </div>
  );
}

/* =============================== About =============================== */

function AboutPane() {
  const { setPane } = useSettingsRouter();
  const { current: wallpaper } = useWallpaper();
  const wallpaperImage = useWallpaperImage(wallpaper.id);
  const macSphereBg = wallpaperImage
    ? `url(${wallpaperImage}) center/cover no-repeat`
    : wallpaper.sphere;

  return (
    <>
      <PaneHeader title="About" onBack={() => setPane("general")} />
      <div className="px-8 py-7 max-w-[700px]">
        <div className="flex justify-center mb-3">
          <MacBookIllustration />
        </div>
        <div className="text-center mb-7">
          <div
            className="text-[28px] font-semibold"
            style={{ color: "var(--window-text)" }}
          >
            MacBook Pro
          </div>
          <div
            className="text-[13px] mt-0.5"
            style={{ color: "var(--window-text-muted)" }}
          >
            M3, 2024
          </div>
        </div>

        <Card>
          <Row
            left={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                Name
              </span>
            }
            right={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text-soft)" }}
              >
                Kwasi&rsquo;s MacBook Pro
              </span>
            }
          />
          <Divider />
          <Row
            left={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                Chip
              </span>
            }
            right={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text-soft)" }}
              >
                Apple M3
              </span>
            }
          />
          <Divider />
          <Row
            left={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                Memory
              </span>
            }
            right={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text-soft)" }}
              >
                24 GB
              </span>
            }
          />
          <Divider />
          <Row
            left={
              <span
                className="text-[13px]"
                style={{ color: "var(--window-text)" }}
              >
                Serial number
              </span>
            }
            right={
              <span
                className="text-[13px] tabular-nums"
                style={{ color: "var(--window-text-soft)" }}
              >
                L76NXH926Q
              </span>
            }
          />
        </Card>

        <SectionLabel>macOS</SectionLabel>
        <Card>
          <Row
            onClick={() => setPane("appearance", "wallpaper")}
            left={
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full shrink-0"
                  style={{
                    background: macSphereBg,
                    boxShadow:
                      "inset -2px -2px 5px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.2)",
                  }}
                />
                <span
                  className="text-[13px]"
                  style={{ color: "var(--window-text)" }}
                >
                  macOS {wallpaper.label}
                </span>
              </div>
            }
            right={
              <div
                className="flex items-center gap-2 text-[12px]"
                style={{ color: "var(--window-text-muted)" }}
              >
                Version {wallpaper.subtitle}
                <Chevron />
              </div>
            }
          />
        </Card>
      </div>
    </>
  );
}

function MacBookIllustration() {
  return (
    <svg viewBox="0 0 240 160" className="w-[180px] h-[120px]" fill="none">
      <defs>
        <linearGradient id="mbp-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DAEFF" />
          <stop offset="100%" stopColor="#1F6AD0" />
        </linearGradient>
        <linearGradient id="mbp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dadada" />
          <stop offset="100%" stopColor="#9c9c9c" />
        </linearGradient>
      </defs>
      {/* Lid (screen bezel) */}
      <rect x="20" y="4" width="200" height="124" rx="8" fill="#1a1a1a" />
      {/* Screen content */}
      <rect x="26" y="10" width="188" height="112" rx="3" fill="url(#mbp-screen)" />
      {/* Camera notch */}
      <rect x="113" y="10" width="14" height="3" rx="1.5" fill="#0a0a0a" />
      {/* Hinge line */}
      <rect x="14" y="128" width="212" height="4" fill="#7a7a7a" />
      {/* Keyboard base front (slight perspective) */}
      <path
        d="M 4 132 L 236 132 L 240 148 L 0 148 Z"
        fill="url(#mbp-body)"
      />
      {/* Trackpad notch */}
      <path
        d="M 96 148 Q 102 154 120 154 Q 138 154 144 148 Z"
        fill="#888"
      />
    </svg>
  );
}

/* ============================== Storage ============================== */

type StorageSegment = { label: string; gb: number; color: string };

const STORAGE_SEGMENTS: StorageSegment[] = [
  { label: "Documents", gb: 245.3, color: "#ff453a" },
  { label: "Messages", gb: 22.85, color: "#ff9f0a" },
  { label: "Files", gb: 128.65, color: "#ffd60a" },
  { label: "Notes", gb: 11.4, color: "#30d158" },
  { label: "Applications", gb: 78.2, color: "#5ac8fa" },
  { label: "System Data", gb: 127.31, color: "#8e8e93" },
];

const STORAGE_TOTAL_GB = 994.66;

function StoragePane() {
  const { setPane } = useSettingsRouter();
  const usedGB = STORAGE_SEGMENTS.reduce((s, x) => s + x.gb, 0);
  const freeGB = STORAGE_TOTAL_GB - usedGB;

  return (
    <>
      <PaneHeader title="Storage" onBack={() => setPane("general")} />
      <div className="px-8 py-7 max-w-[760px]">
        {/* Macintosh HD title row */}
        <div className="flex items-baseline justify-between mb-3">
          <div
            className="text-[16px] font-semibold"
            style={{ color: "var(--window-text)" }}
          >
            Macintosh HD
          </div>
          <div
            className="text-[12px]"
            style={{ color: "var(--window-text-muted)" }}
          >
            {usedGB.toFixed(2)} GB of {STORAGE_TOTAL_GB.toFixed(2)} GB used
          </div>
        </div>

        <StorageBar
          segments={STORAGE_SEGMENTS}
          totalGB={STORAGE_TOTAL_GB}
          freeGB={freeGB}
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
          {STORAGE_SEGMENTS.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 text-[13px]"
              style={{ color: "var(--window-text-soft)" }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function StorageBar({
  segments,
  totalGB,
  freeGB,
}: {
  segments: StorageSegment[];
  totalGB: number;
  freeGB: number;
}) {
  return (
    <div
      className="relative h-5 rounded-md overflow-hidden flex"
      style={{ background: "var(--searchbar-bg)" }}
    >
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            width: `${(s.gb / totalGB) * 100}%`,
            background: s.color,
          }}
          title={`${s.label}: ${s.gb.toFixed(2)} GB`}
        />
      ))}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium pointer-events-none tabular-nums"
        style={{ color: "var(--window-text)" }}
      >
        {freeGB.toFixed(2)} GB
      </div>
    </div>
  );
}

/* ============================ Appearance ============================ */

function AppearancePane() {
  const { mode, setMode } = useTheme();
  const { id: wallpaperId, setId: setWallpaperId } = useWallpaper();
  const { anchor, clearAnchor } = useSettingsRouter();

  // When the user landed on this pane via Software Update (or any other
  // entry point that sets anchor="wallpaper"), scroll the currently-selected
  // wallpaper sphere into view.
  useEffect(() => {
    if (anchor !== "wallpaper") return;
    // wait a tick so the grid has actually painted
    const t = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(
        '[data-wallpaper-selected="true"]'
      );
      if (el)
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      clearAnchor();
    }, 0);
    return () => window.clearTimeout(t);
  }, [anchor, clearAnchor]);

  return (
    <div className="px-8 py-7 max-w-[700px]">
      <Hero
        variant="appearance"
        title="Appearance"
        description="Customize the look and feel of your Mac."
      />

      <Card>
        <div className="px-4 pt-4 pb-4">
          <div
            className="text-[13px] mb-3 px-1"
            style={{ color: "var(--window-text)" }}
          >
            Appearance
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ThemeSwatch
              label="Auto"
              type="auto"
              selected={mode === "auto"}
              onClick={() => setMode("auto")}
            />
            <ThemeSwatch
              label="Light"
              type="light"
              selected={mode === "light"}
              onClick={() => setMode("light")}
            />
            <ThemeSwatch
              label="Dark"
              type="dark"
              selected={mode === "dark"}
              onClick={() => setMode("dark")}
            />
          </div>
        </div>
      </Card>

      <SectionLabel>macOS Version</SectionLabel>
      <Card>
        <div className="grid grid-cols-4 gap-x-4 gap-y-5 p-5">
          {WALLPAPERS.map((v) => {
            const selected = v.id === wallpaperId;
            return (
              <WallpaperOption
                key={v.id}
                wp={v}
                selected={selected}
                onSelect={() => setWallpaperId(v.id)}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function WallpaperOption({
  wp,
  selected,
  onSelect,
}: {
  wp: { id: string; label: string; subtitle: string; sphere: string };
  selected: boolean;
  onSelect: () => void;
}) {
  const imageUrl = useWallpaperImage(wp.id);
  const sphereBg = imageUrl
    ? `url(${imageUrl}) center/cover no-repeat`
    : wp.sphere;
  return (
    <button
      onClick={onSelect}
      data-wallpaper-id={wp.id}
      data-wallpaper-selected={selected ? "true" : undefined}
      className="flex flex-col items-center gap-2 p-2 rounded-[12px] transition-all"
      style={{
        border: selected ? "1.5px solid #4F9EFF" : "1.5px solid transparent",
        background: selected ? "rgba(79,158,255,0.08)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--row-hover)";
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
      }}
    >
      <Sphere background={sphereBg} selected={selected} />
      <div className="text-center">
        <div
          className="text-[12px] font-medium"
          style={{ color: "var(--window-text)" }}
        >
          {wp.label}
        </div>
        <div
          className="text-[11px]"
          style={{ color: "var(--window-text-muted)" }}
        >
          {wp.subtitle}
        </div>
      </div>
    </button>
  );
}

function Sphere({
  background,
  selected,
}: {
  background: string;
  selected?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className="w-14 h-14 rounded-full"
        style={{
          background,
          boxShadow:
            "inset -3px -4px 8px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.25)",
        }}
      />
      {selected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#4F9EFF] flex items-center justify-center text-white text-[9px] shadow">
          ✓
        </div>
      )}
    </div>
  );
}

function ThemeSwatch({
  label,
  type,
  selected,
  onClick,
}: {
  label: string;
  type: "auto" | "light" | "dark";
  selected: boolean;
  onClick: () => void;
}) {
  const swatch =
    type === "light" ? (
      <MockWindow bg="#fafafa" border="#d4d4d8" line="#d4d4d8" />
    ) : type === "dark" ? (
      <MockWindow bg="#1a1a1a" border="#3a3a3a" line="#404040" />
    ) : (
      <div
        className="w-full h-[68px] rounded-md overflow-hidden flex"
        style={{ border: "1px solid #d4d4d8" }}
      >
        <div className="w-1/2">
          <MockWindow bg="#fafafa" border="transparent" line="#d4d4d8" rounded={false} />
        </div>
        <div className="w-1/2">
          <MockWindow bg="#1a1a1a" border="transparent" line="#404040" rounded={false} />
        </div>
      </div>
    );

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-2 rounded-[10px] transition-all"
      style={{
        border: selected ? "1.5px solid #4F9EFF" : "1.5px solid transparent",
        background: selected ? "rgba(79,158,255,0.06)" : "transparent",
      }}
    >
      {swatch}
      <span
        className="text-[12px]"
        style={{ color: "var(--window-text)" }}
      >
        {label}
      </span>
    </button>
  );
}

function MockWindow({
  bg,
  border,
  line,
  rounded = true,
}: {
  bg: string;
  border: string;
  line: string;
  rounded?: boolean;
}) {
  return (
    <div
      className={`w-full h-[68px] flex flex-col ${rounded ? "rounded-md" : ""}`}
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="h-2.5 flex items-center gap-1 px-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#febc2e]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex-1 flex items-end gap-1 p-1.5">
        <span
          className="block w-3 h-1.5 rounded"
          style={{ background: line }}
        />
        <span
          className="block w-2 h-1.5 rounded"
          style={{ background: line }}
        />
      </div>
    </div>
  );
}

/* ============================= primitives ============================= */

function Hero({
  variant,
  title,
  description,
}: {
  variant: HeroVariant;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center mb-6 mt-2">
      <div className="flex justify-center mb-3">
        <HeroIcon variant={variant} large />
      </div>
      <div
        className="text-[18px] font-semibold"
        style={{ color: "var(--window-text)" }}
      >
        {title}
      </div>
      <p
        className="text-[12px] mt-1 max-w-[460px] mx-auto leading-relaxed"
        style={{ color: "var(--window-text-muted)" }}
      >
        {description}
      </p>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{
        background: "var(--searchbar-bg)",
        border: "1px solid var(--window-border)",
      }}
    >
      {children}
    </div>
  );
}

function Row({
  left,
  right,
  onClick,
}: {
  left: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left transition-colors"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--row-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
        }}
      >
        <div className="min-w-0 flex-1">{left}</div>
        {right && (
          <div className="flex items-center gap-2 shrink-0">{right}</div>
        )}
      </button>
    );
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
      <div className="min-w-0 flex-1">{left}</div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </div>
  );
}

function Divider() {
  return (
    <div className="h-px mx-4" style={{ background: "var(--window-divider)" }} />
  );
}

function Spacer() {
  return <div className="h-3" />;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-1 pt-5 pb-2 text-[11px] font-semibold tracking-wide uppercase"
      style={{ color: "var(--section-label)" }}
    >
      {children}
    </div>
  );
}

function RowIcon({
  bg,
  children,
}: {
  bg: string;
  children: ReactNode;
}) {
  return (
    <span
      className="w-6 h-6 rounded-md flex items-center justify-center text-[12px] text-white shrink-0"
      style={{ background: bg }}
    >
      {children}
    </span>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-[36px] h-[20px] rounded-full transition-colors shrink-0"
      style={{ background: on ? "#34c759" : "var(--row-active)" }}
      aria-pressed={on}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[16px]" : ""
        }`}
      />
    </button>
  );
}

function Lock() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
      <path
        d="M3 6 V4 a 2.5 2.5 0 0 1 5 0 V6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect
        x="1.5"
        y="6"
        width="8"
        height="6"
        rx="1.2"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function WifiBars({ bars }: { bars: 1 | 2 | 3 }) {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
      <path
        d="M 1 7.5 Q 7 4 13 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity={bars >= 3 ? 1 : 0.3}
      />
      <path
        d="M 3 9.2 Q 7 6.8 11 9.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity={bars >= 2 ? 1 : 0.3}
      />
      <circle cx="7" cy="10.4" r="0.8" fill="currentColor" />
    </svg>
  );
}

function Phone() {
  return (
    <svg width="9" height="14" viewBox="0 0 9 14" fill="none">
      <rect
        x="0.7"
        y="0.7"
        width="7.6"
        height="12.6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line x1="3.5" y1="11" x2="5.5" y2="11" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path
        d="M 1.5 5.5 L 4.5 8.5 L 9.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Ellipsis() {
  return (
    <svg width="14" height="4" viewBox="0 0 14 4" fill="currentColor">
      <circle cx="2" cy="2" r="1.2" />
      <circle cx="7" cy="2" r="1.2" />
      <circle cx="12" cy="2" r="1.2" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
      <path
        d="M1 1 L5 5 L1 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

function DetailsButton() {
  return (
    <button
      className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
      style={{
        background: "var(--searchbar-bg)",
        border: "1px solid var(--window-border)",
        color: "var(--window-text)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--row-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--searchbar-bg)";
      }}
    >
      Details…
    </button>
  );
}

function InfoButton() {
  return (
    <button
      aria-label="info"
      className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
      style={{
        color: "var(--window-text-muted)",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--row-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
        <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="7" cy="4" r="0.7" fill="currentColor" />
      </svg>
    </button>
  );
}

function BatteryIndicator({ pct }: { pct: number }) {
  const fill = pct > 20 ? "#34c759" : "#ff9500";
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ color: "var(--window-text-muted)" }}
    >
      <div
        className="relative w-[22px] h-[10px] rounded-[2.5px] flex items-center"
        style={{ border: "1px solid currentColor", padding: "1px" }}
      >
        <div
          className="h-full rounded-[1.5px]"
          style={{ width: `${Math.max(8, pct)}%`, background: fill }}
        />
        <div
          className="absolute -right-[3px] top-[3px] w-[1.5px] h-[4px] rounded-r-sm"
          style={{ background: "currentColor" }}
        />
      </div>
      <span className="text-[11px] tabular-nums">{pct}%</span>
    </div>
  );
}
