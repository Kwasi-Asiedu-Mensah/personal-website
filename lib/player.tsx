"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TRACKS, trackAudioUrl, type Track } from "./music-data";
import { useSystemState } from "./system-state";

/**
 * Global music playback state.
 *
 * One <audio> element lives inside the provider for the whole session —
 * methods on the context manipulate it. The Music app, the menubar Now
 * Playing card, and any future widgets all read from the same source of
 * truth.
 *
 * Volume is persisted in localStorage so it survives reloads. The queue
 * + current track are not persisted (matches the macOS Music app —
 * relaunch starts fresh).
 */

export type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  /** Active queue. May be a single track, a playlist, or all songs. */
  queue: Track[];
  currentIndex: number;
  currentTrack: Track | null;

  /** Playback state. */
  isPlaying: boolean;
  /** Total duration of the loaded track in seconds. NaN until metadata loads. */
  duration: number;
  /** Current playback position in seconds. */
  position: number;
  /** 0–100. */
  volume: number;
  /** Muted state — separate from volume so unmute restores. */
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;

  /** Start playback. Optionally swap in a new queue (and optional start index). */
  play: (queue?: Track[], startIndex?: number) => void;
  /**
   * Set the queue and current track without starting playback. Use for
   * deep links that select a song but want the user to press play.
   */
  load: (queue: Track[], startIndex?: number) => void;
  pause: () => void;
  /** Toggle play/pause without changing queue. */
  toggle: () => void;
  next: () => void;
  prev: () => void;
  /** Jump to a position in seconds. */
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMuted: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

const NOOP = () => {};
const PlayerContext = createContext<PlayerContextValue>({
  queue: [],
  currentIndex: -1,
  currentTrack: null,
  isPlaying: false,
  duration: NaN,
  position: 0,
  volume: 70,
  muted: false,
  shuffle: false,
  repeat: "off",
  play: NOOP,
  load: NOOP,
  pause: NOOP,
  toggle: NOOP,
  next: NOOP,
  prev: NOOP,
  seek: NOOP,
  setVolume: NOOP,
  toggleMuted: NOOP,
  toggleShuffle: NOOP,
  cycleRepeat: NOOP,
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  // The audio element lives for the lifetime of the provider. Using a ref
  // (instead of state) avoids re-creating it on every render.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Volume is the system-wide volume — Control Center and the Music
  // player share the same value so adjusting either responds in audio.
  const { volume, setVolume: setSystemVolume } = useSystemState();

  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(NaN);
  const [position, setPosition] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  /* ------------------------- Initial setup ------------------------ */

  // Create audio element once on mount. Volume + mute are applied by the
  // dedicated effect below; system-state already persists volume itself.
  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;
    return () => {
      a.pause();
      a.src = "";
      audioRef.current = null;
    };
  }, []);

  // Wire audio events to React state.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => setPosition(a.currentTime);
    const onDuration = () => setDuration(a.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Defer to next() — repeat-one short-circuits there.
      handleEnded();
    };
    const onError = () => {
      // Audio file likely 404'd. Stop playback so the UI doesn't lie.
      setIsPlaying(false);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDuration);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDuration);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
    // handleEnded is stable via ref pattern below; deps are intentionally
    // limited to mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume + muted to the element.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume / 100;
    a.muted = muted;
  }, [volume, muted]);

  /* ------------------------- Load track ------------------------ */

  // Whenever currentTrack changes, point the audio element at the new src.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!currentTrack) {
      a.pause();
      a.src = "";
      setPosition(0);
      setDuration(NaN);
      return;
    }
    a.src = trackAudioUrl(currentTrack);
    a.load();
    setPosition(0);
    setDuration(NaN);
  }, [currentTrack]);

  /* ------------------------- Playback actions ------------------ */

  /** Resolve the next index given queue + repeat + shuffle settings. */
  const computeNextIndex = useCallback(
    (from: number, direction: 1 | -1, treatAsManual: boolean): number => {
      if (queue.length === 0) return -1;
      // Manual next/prev with repeat="one" should still advance.
      if (!treatAsManual && repeat === "one") return from;
      if (shuffle) {
        if (queue.length === 1) return 0;
        let idx = from;
        while (idx === from) idx = Math.floor(Math.random() * queue.length);
        return idx;
      }
      const candidate = from + direction;
      if (candidate < 0) return repeat === "all" ? queue.length - 1 : 0;
      if (candidate >= queue.length)
        return repeat === "all" ? 0 : queue.length - 1;
      return candidate;
    },
    [queue, repeat, shuffle]
  );

  // Cache the latest values for use in event handlers (which can't read
  // fresh state directly).
  const latestRef = useRef({
    queue,
    currentIndex,
    repeat,
    shuffle,
    computeNextIndex,
  });
  useEffect(() => {
    latestRef.current = { queue, currentIndex, repeat, shuffle, computeNextIndex };
  });

  function handleEnded() {
    const { currentIndex: idx, repeat: r, computeNextIndex: cni } =
      latestRef.current;
    if (idx === -1) return;
    if (r === "one") {
      // Loop the same track.
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        void a.play();
      }
      return;
    }
    const nextIdx = cni(idx, 1, false);
    if (nextIdx === idx && r !== "all") {
      // End of queue — stop.
      setIsPlaying(false);
      const a = audioRef.current;
      if (a) a.pause();
      return;
    }
    setCurrentIndex(nextIdx);
    // Auto-play handled by the load effect below.
    requestAnimationFrame(() => {
      const a = audioRef.current;
      if (a) void a.play();
    });
  }

  const play = useCallback(
    (newQueue?: Track[], startIndex?: number) => {
      const a = audioRef.current;
      if (!a) return;
      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        setCurrentIndex(startIndex ?? 0);
        // Audio src will swap via the load effect; play after that fires.
        requestAnimationFrame(() => {
          const el = audioRef.current;
          if (el) void el.play();
        });
      } else {
        if (currentIndex === -1) {
          // Nothing loaded — start from the first item in the current queue.
          if (queue.length === 0) return;
          setCurrentIndex(0);
          requestAnimationFrame(() => {
            const el = audioRef.current;
            if (el) void el.play();
          });
        } else {
          void a.play();
        }
      }
    },
    [queue, currentIndex]
  );

  const load = useCallback((newQueue: Track[], startIndex?: number) => {
    if (newQueue.length === 0) return;
    setQueue(newQueue);
    setCurrentIndex(startIndex ?? 0);
    // The load effect on currentTrack swap will point the audio element at
    // the new src and call .load() on it. We deliberately do NOT call
    // play() here — the user can press play themselves.
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) play();
    else a.pause();
  }, [play]);

  const next = useCallback(() => {
    if (queue.length === 0 || currentIndex === -1) return;
    const idx = computeNextIndex(currentIndex, 1, true);
    setCurrentIndex(idx);
    requestAnimationFrame(() => {
      const a = audioRef.current;
      if (a) void a.play();
    });
  }, [queue, currentIndex, computeNextIndex]);

  const prev = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (queue.length === 0 || currentIndex === -1) return;
    // macOS-style: if more than 3 seconds in, restart current track first.
    if (a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    const idx = computeNextIndex(currentIndex, -1, true);
    setCurrentIndex(idx);
    requestAnimationFrame(() => {
      const el = audioRef.current;
      if (el) void el.play();
    });
  }, [queue, currentIndex, computeNextIndex]);

  const seek = useCallback((seconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (!isFinite(a.duration) || isNaN(a.duration)) return;
    a.currentTime = Math.max(0, Math.min(a.duration, seconds));
    setPosition(a.currentTime);
  }, []);

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(v)));
      setSystemVolume(clamped);
    },
    [setSystemVolume]
  );

  const toggleMuted = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => !s);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      duration,
      position,
      volume,
      muted,
      shuffle,
      repeat,
      play,
      load,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMuted,
      toggleShuffle,
      cycleRepeat,
    }),
    [
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      duration,
      position,
      volume,
      muted,
      shuffle,
      repeat,
      play,
      load,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleMuted,
      toggleShuffle,
      cycleRepeat,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
