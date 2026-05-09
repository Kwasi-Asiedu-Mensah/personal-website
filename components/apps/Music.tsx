"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  TRACKS,
  PLAYLISTS,
  trackArtUrl,
  formatTime,
  getPlaylistTracks,
  tracksByAlbum,
  tracksByArtist,
  type Track,
  type Playlist,
} from "@/lib/music-data";
import { usePlayer } from "@/lib/player";
import { useSessionState } from "@/lib/sidebar-persistence";
import { useAppNavigation } from "@/lib/app-navigation";

/**
 * View identifiers — drive both sidebar selection and main panel rendering.
 * Custom playlist views are stored as `playlist:<id>`.
 */
type ViewId =
  | "home"
  | "browse"
  | "artists"
  | "albums"
  | "songs"
  | `playlist:${string}`;

const ACCENT = "#fb4368";

export default function Music() {
  const [view, setView] = useSessionState<ViewId>("music", "view", "home");
  const player = usePlayer();
  const { request: navRequest } = useAppNavigation();
  const lastNavNonceRef = useRef<number | null>(null);

  // Apply external navigation requests (e.g. clicking a track in the
  // Notes "on repeat" note). We dedupe by nonce so the same request
  // doesn't re-fire on every render.
  //
  // Resolution: if a trackId is given, find the first playlist in
  // PLAYLISTS order that contains it and switch to that view — so a
  // song clicked from the "all-time" section lands in `favorites`, a
  // song clicked from "lately" lands in `on-repeat`, etc., without the
  // caller having to hardcode the destination playlist.
  useEffect(() => {
    if (!navRequest || navRequest.app !== "music") return;
    if (lastNavNonceRef.current === navRequest.nonce) return;
    lastNavNonceRef.current = navRequest.nonce;

    const trackId = navRequest.data?.trackId;

    // Resolve the destination view + queue.
    let resolvedView: ViewId | null = null;
    let queue: Track[] = TRACKS;

    if (trackId) {
      // Prefer the explicitly requested playlist if it actually contains
      // the track; otherwise pick the first playlist (in PLAYLISTS
      // order) that has it. Falls back to the full library.
      const requestedId = navRequest.view?.startsWith("playlist:")
        ? navRequest.view.slice("playlist:".length)
        : null;
      const requested = requestedId
        ? PLAYLISTS.find((p) => p.id === requestedId)
        : null;
      const containing =
        requested && requested.trackIds.includes(trackId)
          ? requested
          : PLAYLISTS.find((p) => p.trackIds.includes(trackId));

      if (containing) {
        resolvedView = `playlist:${containing.id}` as ViewId;
        queue = getPlaylistTracks(containing);
      }
    } else if (navRequest.view) {
      resolvedView = navRequest.view as ViewId;
    }

    if (resolvedView) setView(resolvedView);

    if (trackId) {
      const idx = queue.findIndex((t) => t.id === trackId);
      if (idx >= 0) player.load(queue, idx);
    }
  }, [navRequest, setView, player]);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ background: "var(--window-bg)", color: "var(--window-text)" }}
    >
      <div className="flex flex-1 min-h-0">
        <MusicSidebar selected={view} onSelect={setView} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <MainView view={view} onSelect={setView} />
        </main>
      </div>
      <NowPlayingBar />
      <EqStyle />
    </div>
  );
}

/* ============================== Sidebar ============================== */

function MusicSidebar({
  selected,
  onSelect,
}: {
  selected: ViewId;
  onSelect: (id: ViewId) => void;
}) {
  return (
    <aside
      className="w-[220px] shrink-0 flex flex-col py-2 overflow-y-auto"
      style={{
        background: "var(--searchbar-bg)",
        borderRight: "1px solid var(--window-divider)",
      }}
    >
      <ul className="px-1 space-y-0.5 pt-1">
        <SidebarRow
          label="home"
          icon={<HomeGlyph />}
          selected={selected === "home"}
          onClick={() => onSelect("home")}
        />
        <SidebarRow
          label="browse"
          icon={<BrowseGlyph />}
          selected={selected === "browse"}
          onClick={() => onSelect("browse")}
        />
      </ul>

      <SidebarSection label="library" />
      <ul className="px-1 space-y-0.5">
        <SidebarRow
          label="artists"
          icon={<ArtistsGlyph />}
          selected={selected === "artists"}
          onClick={() => onSelect("artists")}
        />
        <SidebarRow
          label="albums"
          icon={<AlbumsGlyph />}
          selected={selected === "albums"}
          onClick={() => onSelect("albums")}
        />
        <SidebarRow
          label="songs"
          icon={<SongsGlyph />}
          selected={selected === "songs"}
          onClick={() => onSelect("songs")}
        />
      </ul>

      <SidebarSection label="playlists" />
      <ul className="px-1 space-y-0.5">
        {PLAYLISTS.map((p) => (
          <SidebarRow
            key={p.id}
            label=""
            icon={<span className="text-[15px] leading-none">{p.emoji}</span>}
            selected={selected === `playlist:${p.id}`}
            onClick={() => onSelect(`playlist:${p.id}`)}
          />
        ))}
      </ul>
    </aside>
  );
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div
      className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-wide uppercase"
      style={{ color: "var(--section-label)" }}
    >
      {label}
    </div>
  );
}

function SidebarRow({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors"
        style={{
          background: selected ? "rgba(120,120,128,0.20)" : "transparent",
          color: selected ? ACCENT : "var(--window-text-soft)",
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
        <span className="w-4 h-4 inline-flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span className="text-[13px] truncate font-medium">{label}</span>
      </button>
    </li>
  );
}

/* =========================== Sidebar glyphs =========================== */

const glyphProps = {
  viewBox: "0 0 16 16",
  className: "w-4 h-4",
  fill: "none" as const,
};

function HomeGlyph() {
  return (
    <svg {...glyphProps}>
      <path
        d="M 2.5 7 L 8 2.5 L 13.5 7 V 13 a 1 1 0 0 1 -1 1 H 3.5 a 1 1 0 0 1 -1 -1 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrowseGlyph() {
  return (
    <svg {...glyphProps}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M 5.4 5.4 L 10.6 6.6 L 9.2 11 L 4 9.8 Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function ArtistsGlyph() {
  return (
    <svg {...glyphProps}>
      <circle
        cx="8"
        cy="5.5"
        r="2.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M 3 13 a 5 5 0 0 1 10 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlbumsGlyph() {
  return (
    <svg {...glyphProps}>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}

function SongsGlyph() {
  return (
    <svg {...glyphProps}>
      <line
        x1="3"
        y1="3.5"
        x2="13"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="8"
        x2="13"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="12.5"
        x2="9"
        y2="12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================== Main view ============================== */

function MainView({
  view,
  onSelect,
}: {
  view: ViewId;
  onSelect: (id: ViewId) => void;
}) {
  if (view === "home") return <HomeView onSelect={onSelect} />;
  if (view === "browse") return <BrowseView />;
  if (view === "artists") return <ArtistsView />;
  if (view === "albums") return <AlbumsView />;
  if (view === "songs") return <SongsView />;
  if (view.startsWith("playlist:")) {
    const id = view.slice("playlist:".length);
    const p = PLAYLISTS.find((pl) => pl.id === id);
    if (p) return <PlaylistView playlist={p} />;
  }
  return null;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[19px] font-semibold tracking-tight mb-4 lowercase">
      {children}
    </h2>
  );
}

/* ============================== Home ============================== */

function HomeView({ onSelect }: { onSelect: (id: ViewId) => void }) {
  return (
    <div className="px-8 py-7">
      <SectionTitle>playlists</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-5 mb-10">
        {PLAYLISTS.map((p) => (
          <PlaylistCard
            key={p.id}
            playlist={p}
            onClick={() => onSelect(`playlist:${p.id}`)}
          />
        ))}
      </div>

      <SectionTitle>songs</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-5">
        {TRACKS.slice(0, 12).map((t) => (
          <SongCard key={t.id} track={t} queue={TRACKS} />
        ))}
      </div>
    </div>
  );
}

/* ============================== Browse ============================== */

function BrowseView() {
  return (
    <div className="px-8 py-7">
      <SectionTitle>browse</SectionTitle>
      <p
        className="text-[13px] max-w-[480px]"
        style={{ color: "var(--window-text-muted)" }}
      >
        nothing to browse yet — drop more songs into{" "}
        <code
          style={{
            background: "var(--searchbar-bg)",
            padding: "1px 6px",
            borderRadius: 4,
            fontFamily:
              '"SF Mono", Menlo, ui-monospace, monospace',
            fontSize: 12,
          }}
        >
          /public/music/
        </code>{" "}
        or add iTunes preview URLs in <code style={{
          background: "var(--searchbar-bg)",
          padding: "1px 6px",
          borderRadius: 4,
          fontFamily: '"SF Mono", Menlo, ui-monospace, monospace',
          fontSize: 12,
        }}>lib/music-data.ts</code> and they&rsquo;ll show up here.
      </p>
    </div>
  );
}

/* ============================== Songs ============================== */

function SongsView() {
  return (
    <div className="px-8 py-7">
      <SectionTitle>songs</SectionTitle>
      <TrackList tracks={TRACKS} queue={TRACKS} showAlbum />
    </div>
  );
}

/* ============================== Albums ============================== */

function AlbumsView() {
  const albums = useMemo(() => tracksByAlbum(), []);
  return (
    <div className="px-8 py-7">
      <SectionTitle>albums</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
        {albums.map(({ album, tracks }) => (
          <AlbumCard key={album} album={album} tracks={tracks} />
        ))}
      </div>
    </div>
  );
}

function AlbumCard({ album, tracks }: { album: string; tracks: Track[] }) {
  const cover = tracks[0];
  const { play } = usePlayer();
  return (
    <button
      onClick={() => play(tracks, 0)}
      className="text-left flex flex-col gap-2"
    >
      <div className="aspect-square overflow-hidden rounded-md shadow-md">
        {cover ? (
          <AlbumArt track={cover} />
        ) : (
          <FallbackTile seed={album} />
        )}
      </div>
      <div
        className="text-[13px] font-medium truncate"
        style={{ color: "var(--window-text)" }}
      >
        {album}
      </div>
      <div
        className="text-[12px] truncate -mt-1"
        style={{ color: "var(--window-text-muted)" }}
      >
        {tracks[0]?.artist ?? "—"}
      </div>
    </button>
  );
}

/* ============================== Artists ============================== */

function ArtistsView() {
  const artists = useMemo(() => tracksByArtist(), []);
  return (
    <div className="px-8 py-7">
      <SectionTitle>artists</SectionTitle>
      <div className="space-y-7">
        {artists.map(({ artist, tracks }) => (
          <div key={artist}>
            <div
              className="text-[14px] font-semibold mb-2 flex items-baseline gap-2"
              style={{ color: "var(--window-text)" }}
            >
              {artist}
              <span
                className="text-[11px] font-normal"
                style={{ color: "var(--window-text-muted)" }}
              >
                {tracks.length} song{tracks.length === 1 ? "" : "s"}
              </span>
            </div>
            <TrackList tracks={tracks} queue={tracks} showAlbum />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== Playlist ============================== */

function PlaylistView({ playlist }: { playlist: Playlist }) {
  const tracks = useMemo(() => getPlaylistTracks(playlist), [playlist]);
  const { play } = usePlayer();

  return (
    <div className="px-8 py-7">
      <div className="flex items-end gap-5 mb-7">
        <div
          className="w-[140px] h-[140px] rounded-md shrink-0 flex items-center justify-center text-[60px] shadow-lg"
          style={{
            background: playlistGradient(playlist.id),
          }}
        >
          {playlist.emoji}
        </div>
        <div className="flex flex-col gap-1.5 pb-2">
          <div
            className="text-[12px] mt-1"
            style={{ color: "var(--window-text-muted)" }}
          >
            {tracks.length} song{tracks.length === 1 ? "" : "s"}
          </div>
          <div className="mt-3">
            <button
              onClick={() => tracks.length > 0 && play(tracks, 0)}
              disabled={tracks.length === 0}
              className="px-4 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-2 disabled:opacity-50"
              style={{
                background: ACCENT,
                color: "white",
              }}
            >
              <PlaySymbol size={11} />
              play
            </button>
          </div>
        </div>
      </div>

      <TrackList tracks={tracks} queue={tracks} showAlbum />
    </div>
  );
}

/* ============================== Track list ============================== */

function TrackList({
  tracks,
  queue,
  showAlbum,
}: {
  tracks: Track[];
  queue: Track[];
  showAlbum?: boolean;
}) {
  const { currentTrack, isPlaying, play, toggle } = usePlayer();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the active track into view whenever it changes — covers
  // the "click song in notes → land on the right row in the playlist"
  // case as well as next/prev navigation while the playlist is open.
  // `block: "center"` matches alana's behavior: the song lands centered
  // rather than just being technically "in the viewport".
  useEffect(() => {
    if (!currentTrack || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[data-track-id="${currentTrack.id}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTrack?.id]);

  if (tracks.length === 0) {
    return (
      <div
        className="text-[13px] py-6"
        style={{ color: "var(--window-text-muted)" }}
      >
        no tracks
      </div>
    );
  }
  return (
    <div ref={containerRef} className="rounded-lg overflow-hidden">
      <div
        className="flex items-center px-3 py-1.5 text-[11px] uppercase tracking-wide font-medium"
        style={{
          color: "var(--window-text-muted)",
          borderBottom: "1px solid var(--window-divider)",
        }}
      >
        <div className="w-8 text-center">#</div>
        <div className="flex-1 px-3">title</div>
        {showAlbum && <div className="w-[28%] hidden md:block">album</div>}
        <div className="w-12 text-right">time</div>
      </div>
      {tracks.map((t, i) => {
        const isActive = currentTrack?.id === t.id;
        // Active track gets a subtle accent-tinted background band that
        // makes the row instantly findable when you scroll into a long
        // playlist (alana uses bg-red-500/10 — same idea, our accent).
        const activeBg = "rgba(251, 67, 104, 0.10)";
        return (
          <button
            key={t.id}
            data-track-id={t.id}
            onClick={() => {
              if (isActive) toggle();
              else play(queue, queue.findIndex((q) => q.id === t.id));
            }}
            className="flex items-center w-full px-3 py-2 text-[13px] text-left transition-colors"
            style={{
              background: isActive ? activeBg : "transparent",
              color: isActive ? ACCENT : "var(--window-text)",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--row-hover)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                isActive ? activeBg : "transparent";
            }}
          >
            <div
              className="w-8 text-center text-[12px] tabular-nums"
              style={{
                color: isActive ? ACCENT : "var(--window-text-muted)",
              }}
            >
              {isActive && isPlaying ? <EqualizerGlyph /> : i + 1}
            </div>
            <div className="flex-1 px-3 flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-sm overflow-hidden shrink-0">
                <AlbumArt track={t} />
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{t.title}</div>
                <div
                  className="truncate text-[11.5px]"
                  style={{ color: "var(--window-text-muted)" }}
                >
                  {t.artist}
                </div>
              </div>
            </div>
            {showAlbum && (
              <div
                className="w-[28%] truncate text-[12px] hidden md:block"
                style={{ color: "var(--window-text-muted)" }}
              >
                {t.album ?? "—"}
              </div>
            )}
            <div
              className="w-12 text-right text-[12px] tabular-nums"
              style={{ color: "var(--window-text-muted)" }}
            >
              {formatTime(t.duration ?? NaN)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function EqualizerGlyph() {
  // Three little bars that pulse — pure CSS so no JS overhead.
  return (
    <span className="inline-flex items-end gap-[2px] h-3 align-middle">
      <span
        className="w-[2px] eq-bar"
        style={{ height: "100%", animationDelay: "0s" }}
      />
      <span
        className="w-[2px] eq-bar"
        style={{ height: "60%", animationDelay: "0.15s" }}
      />
      <span
        className="w-[2px] eq-bar"
        style={{ height: "80%", animationDelay: "0.3s" }}
      />
    </span>
  );
}

function EqStyle() {
  // Inject keyframes once. Safe to render multiple times — `dangerouslySetInnerHTML`
  // produces identical strings, and CSS dedupes.
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@keyframes music-eq {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
.eq-bar {
  display: inline-block;
  background: currentColor;
  transform-origin: bottom center;
  animation: music-eq 0.8s ease-in-out infinite;
}
`,
      }}
    />
  );
}

/* ============================== Cards ============================== */

function PlaylistCard({
  playlist,
  onClick,
}: {
  playlist: Playlist;
  onClick: () => void;
}) {
  const tracks = useMemo(() => getPlaylistTracks(playlist), [playlist]);
  return (
    <button onClick={onClick} className="text-left flex flex-col gap-2">
      <div className="aspect-square overflow-hidden rounded-md shadow-md relative">
        <div
          className="absolute inset-0 flex items-center justify-center text-[64px]"
          style={{
            background: playlistGradient(playlist.id),
          }}
        >
          {playlist.emoji}
        </div>
      </div>
      <div
        className="text-[12px] truncate"
        style={{ color: "var(--window-text-muted)" }}
      >
        {tracks.length} song{tracks.length === 1 ? "" : "s"}
      </div>
    </button>
  );
}

function SongCard({ track, queue }: { track: Track; queue: Track[] }) {
  const { play } = usePlayer();
  return (
    <button
      onClick={() =>
        play(queue, queue.findIndex((q) => q.id === track.id))
      }
      className="text-left flex flex-col gap-2"
    >
      <div className="aspect-square overflow-hidden rounded-md shadow-md">
        <AlbumArt track={track} />
      </div>
      <div
        className="text-[13px] font-medium truncate"
        style={{ color: "var(--window-text)" }}
      >
        {track.title}
      </div>
      <div
        className="text-[12px] truncate -mt-1"
        style={{ color: "var(--window-text-muted)" }}
      >
        {track.artist}
      </div>
    </button>
  );
}

/* ============================== Album art ============================== */

function AlbumArt({ track }: { track: Track | null }) {
  const [errored, setErrored] = useState(false);
  if (!track) return <FallbackTile />;
  const url = trackArtUrl(track);
  if (!url || errored) return <FallbackTile seed={track.id} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setErrored(true)}
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

const GRADIENT_PALETTES: [string, string][] = [
  ["#fb4368", "#7c1933"],
  ["#3478f6", "#0a3a8a"],
  ["#34c759", "#0d4a1f"],
  ["#ff9f0a", "#7a3f06"],
  ["#bf5af2", "#4a1a6e"],
  ["#5ac8fa", "#1a4a6a"],
  ["#ffd60a", "#7a6204"],
];

function playlistGradient(id: string): string {
  const [a, b] = GRADIENT_PALETTES[seedHash(id) % GRADIENT_PALETTES.length];
  return `linear-gradient(160deg, ${a} 0%, ${b} 100%)`;
}

/**
 * Deterministic gradient tile derived from a seed string. Used when
 * cover art is missing or fails to load.
 */
function FallbackTile({ seed }: { seed?: string } = {}) {
  const idx = seed ? seedHash(seed) % GRADIENT_PALETTES.length : 0;
  const [a, b] = GRADIENT_PALETTES[idx];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width="40%"
        height="40%"
        fill="rgba(255,255,255,0.85)"
      >
        <rect x="36" y="18" width="3.6" height="22" rx="1.2" />
        <rect x="20" y="22" width="3.6" height="22" rx="1.2" />
        <path d="M 23.6 18 L 39.6 14 L 39.6 19 L 23.6 23 Z" />
        <ellipse cx="20" cy="44" rx="6" ry="4.5" />
        <ellipse cx="36" cy="40" rx="6" ry="4.5" />
      </svg>
    </div>
  );
}

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/* =========================== Now Playing Bar =========================== */

function NowPlayingBar() {
  const {
    currentTrack,
    isPlaying,
    duration,
    position,
    volume,
    muted,
    shuffle,
    repeat,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMuted,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  const showing = currentTrack ?? null;

  return (
    <div
      className="shrink-0 flex items-center gap-4 px-4 h-[78px]"
      style={{
        borderTop: "1px solid var(--window-divider)",
        background: "var(--titlebar-bg)",
      }}
    >
      {/* Track info */}
      <div className="flex items-center gap-3 w-[28%] min-w-0">
        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
          <AlbumArt track={showing} />
        </div>
        <div className="min-w-0">
          {showing ? (
            <>
              <div
                className="text-[13px] font-medium truncate"
                style={{ color: "var(--window-text)" }}
              >
                {showing.title}
              </div>
              <div
                className="text-[12px] truncate"
                style={{ color: "var(--window-text-muted)" }}
              >
                {showing.artist}
              </div>
            </>
          ) : (
            <div
              className="text-[12px]"
              style={{ color: "var(--window-text-muted)" }}
            >
              nothing playing
            </div>
          )}
        </div>
      </div>

      {/* Center: transport + progress */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-center gap-3">
          <TransportButton
            onClick={toggleShuffle}
            active={shuffle}
            ariaLabel="Shuffle"
          >
            <ShuffleGlyph />
          </TransportButton>
          <TransportButton onClick={prev} ariaLabel="Previous">
            <PrevGlyph />
          </TransportButton>
          <button
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "var(--window-text)",
              color: "var(--window-bg)",
            }}
          >
            {isPlaying ? <PauseSymbol size={12} /> : <PlaySymbol size={12} />}
          </button>
          <TransportButton onClick={next} ariaLabel="Next">
            <NextGlyph />
          </TransportButton>
          <TransportButton
            onClick={cycleRepeat}
            active={repeat !== "off"}
            ariaLabel="Repeat"
          >
            <RepeatGlyph mode={repeat} />
          </TransportButton>
        </div>
        <div
          className="flex items-center gap-2 text-[10.5px] tabular-nums"
          style={{ color: "var(--window-text-muted)" }}
        >
          <span className="w-9 text-right">{formatTime(position)}</span>
          <ProgressBar
            position={position}
            duration={duration}
            onSeek={seek}
            disabled={!showing || isNaN(duration)}
          />
          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: volume */}
      <div className="flex items-center gap-2 w-[140px] shrink-0">
        <button
          onClick={toggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          style={{ color: "var(--window-text-muted)" }}
        >
          <VolumeGlyph muted={muted} level={volume} />
        </button>
        <VolumeSlider
          value={muted ? 0 : volume}
          onChange={(v) => {
            setVolume(v);
            if (muted && v > 0) toggleMuted();
          }}
        />
      </div>
    </div>
  );
}

function TransportButton({
  children,
  onClick,
  ariaLabel,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-7 h-7 rounded-full flex items-center justify-center"
      style={{
        color: active ? ACCENT : "var(--window-text-soft)",
      }}
    >
      {children}
    </button>
  );
}

/* ============================== Glyphs ============================== */

function PlaySymbol({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
      <path d="M 4 3 V 13 L 13 8 Z" />
    </svg>
  );
}

function PauseSymbol({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
      <rect x="4" y="3" width="3" height="10" rx="0.6" />
      <rect x="9" y="3" width="3" height="10" rx="0.6" />
    </svg>
  );
}

function PrevGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <rect x="3" y="3" width="2" height="10" rx="0.6" />
      <path d="M 14 3 L 14 13 L 6 8 Z" />
    </svg>
  );
}

function NextGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      <path d="M 2 3 L 2 13 L 10 8 Z" />
      <rect x="11" y="3" width="2" height="10" rx="0.6" />
    </svg>
  );
}

function ShuffleGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <path
        d="M 2 4 H 4.5 L 11 12 H 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 2 12 H 4.5 L 7 9.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 9 6.8 L 11 4 H 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 11 2 L 13.5 4 L 11 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 11 10 L 13.5 12 L 11 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function RepeatGlyph({ mode }: { mode: "off" | "all" | "one" }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <path
        d="M 4 5 H 11 a 2 2 0 0 1 2 2 V 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 6 3 L 4 5 L 6 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 12 11 H 5 a 2 2 0 0 1 -2 -2 V 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 10 13 L 12 11 L 10 9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {mode === "one" && (
        <text
          x="8"
          y="9.5"
          textAnchor="middle"
          fontSize="6"
          fontWeight="700"
          fill="currentColor"
        >
          1
        </text>
      )}
    </svg>
  );
}

function VolumeGlyph({ muted, level }: { muted: boolean; level: number }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M 4 9 H 8 L 13 4 V 20 L 8 15 H 4 Z"
        fill="currentColor"
      />
      {!muted && level > 33 && (
        <path
          d="M 16 10 Q 17.5 12 16 14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
      {!muted && level > 66 && (
        <path
          d="M 18.5 8 Q 21 12 18.5 16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
      {muted && (
        <line
          x1="16"
          y1="8"
          x2="22"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/* ============================== Sliders ============================== */

function ProgressBar({
  position,
  duration,
  onSeek,
  disabled,
}: {
  position: number;
  duration: number;
  onSeek: (s: number) => void;
  disabled?: boolean;
}) {
  const pct =
    duration > 0 && !isNaN(duration) ? (position / duration) * 100 : 0;
  return (
    <Slider
      value={pct}
      onChange={(p) => {
        if (duration > 0) onSeek((p / 100) * duration);
      }}
      disabled={disabled}
      filledColor="var(--window-text)"
    />
  );
}

function VolumeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Slider
      value={value}
      onChange={onChange}
      filledColor="var(--window-text-soft)"
    />
  );
}

function Slider({
  value,
  onChange,
  disabled,
  filledColor,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  filledColor: string;
}) {
  const updateFromX = (clientX: number, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    onChange(pct);
  };

  return (
    <div
      className="flex-1 h-1 relative rounded-full cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.14)",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
      onPointerDown={(e) => {
        const el = e.currentTarget;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        updateFromX(e.clientX, el);
        const onMove = (ev: PointerEvent) => updateFromX(ev.clientX, el);
        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${value}%`,
          background: filledColor,
        }}
      />
    </div>
  );
}
