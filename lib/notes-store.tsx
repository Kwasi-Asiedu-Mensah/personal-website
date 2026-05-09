"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notes as ownerNotesData, type Note } from "./notes-data";

/**
 * Owner notes are baked into the bundle (lib/notes-data.ts). User notes live
 * in localStorage so each visitor has their own copy. Pin overrides for owner
 * notes are persisted separately so the visitor can rearrange the sidebar
 * without touching the underlying data.
 */

export type DisplayNote =
  | (Note & { author: "owner" })
  | {
      id: string;
      emoji: string;
      title: string;
      daysAgo: number;
      preview: string;
      pinned?: boolean;
      author: "user";
      body: string;
      createdAt: number;
    };

type UserNote = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  createdAt: number;
  pinned?: boolean;
};

const USER_NOTES_KEY = "macos-desktop-user-notes-v1";
const OWNER_PIN_OVERRIDES_KEY = "macos-desktop-owner-pin-overrides-v1";

type NotesStoreContextValue = {
  ownerNotes: DisplayNote[];
  userNotes: DisplayNote[];
  allNotes: DisplayNote[];
  selectedId: string | null;
  selectedNote: DisplayNote | null;
  setSelectedId: (id: string) => void;
  createNote: () => string;
  updateUserNote: (id: string, patch: Partial<UserNote>) => void;
  deleteUserNote: (id: string) => boolean;
  deleteSelected: () => boolean;
  togglePinned: (id: string) => void;
};

const NotesStoreContext = createContext<NotesStoreContextValue | null>(null);

function userToDisplay(un: UserNote): DisplayNote {
  const daysAgo = Math.max(
    0,
    Math.floor((Date.now() - un.createdAt) / 86_400_000)
  );
  const previewSrc = (un.body || "").replace(/\s+/g, " ").trim();
  return {
    id: un.id,
    emoji: un.emoji || "👋",
    // Don't trim — preserve every space the user types so the editor input
    // can faithfully echo it back.
    title: un.title,
    daysAgo,
    preview: previewSrc.slice(0, 80),
    pinned: un.pinned,
    author: "user",
    body: un.body,
    createdAt: un.createdAt,
  };
}

export function NotesStoreProvider({ children }: { children: ReactNode }) {
  const [userNotesRaw, setUserNotesRaw] = useState<UserNote[]>([]);
  const [ownerPinOverrides, setOwnerPinOverrides] = useState<
    Record<string, boolean>
  >({});
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedIdInternal] = useState<string | null>(
    ownerNotesData[0]?.id ?? null
  );

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_NOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserNote[];
        if (Array.isArray(parsed)) setUserNotesRaw(parsed);
      }
    } catch {
      // ignore
    }
    try {
      const savedPins = localStorage.getItem(OWNER_PIN_OVERRIDES_KEY);
      if (savedPins) {
        const parsed = JSON.parse(savedPins) as Record<string, boolean>;
        if (parsed && typeof parsed === "object") setOwnerPinOverrides(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(USER_NOTES_KEY, JSON.stringify(userNotesRaw));
    } catch {
      // ignore
    }
  }, [userNotesRaw, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        OWNER_PIN_OVERRIDES_KEY,
        JSON.stringify(ownerPinOverrides)
      );
    } catch {
      // ignore
    }
  }, [ownerPinOverrides, hydrated]);

  const ownerNotes = useMemo<DisplayNote[]>(
    () =>
      ownerNotesData.map((n) => ({
        ...n,
        pinned:
          ownerPinOverrides[n.id] !== undefined
            ? ownerPinOverrides[n.id]
            : n.pinned,
        author: "owner" as const,
      })),
    [ownerPinOverrides]
  );

  const userNotes = useMemo<DisplayNote[]>(
    () => userNotesRaw.map(userToDisplay),
    [userNotesRaw]
  );

  // User notes go FIRST so newly-created notes show at the top of their
  // date group instead of sinking below the owner's notes.
  const allNotes = useMemo<DisplayNote[]>(
    () => [...userNotes, ...ownerNotes],
    [ownerNotes, userNotes]
  );

  const selectedNote = useMemo(
    () => allNotes.find((n) => n.id === selectedId) ?? null,
    [allNotes, selectedId]
  );

  const setSelectedId = useCallback((id: string) => {
    setSelectedIdInternal(id);
  }, []);

  const createNote = useCallback(() => {
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNote: UserNote = {
      id,
      emoji: "👋",
      title: "",
      body: "",
      createdAt: Date.now(),
    };
    setUserNotesRaw((prev) => [newNote, ...prev]);
    setSelectedIdInternal(id);
    return id;
  }, []);

  const updateUserNote = useCallback(
    (id: string, patch: Partial<UserNote>) => {
      setUserNotesRaw((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch } : n))
      );
    },
    []
  );

  const deleteUserNote = useCallback((id: string): boolean => {
    let deleted = false;
    setUserNotesRaw((prev) => {
      if (!prev.some((n) => n.id === id)) return prev;
      deleted = true;
      const remaining = prev.filter((n) => n.id !== id);
      // Move selection if needed
      setSelectedIdInternal((current) => {
        if (current !== id) return current;
        return remaining[0]?.id ?? ownerNotesData[0]?.id ?? null;
      });
      return remaining;
    });
    return deleted;
  }, []);

  const deleteSelected = useCallback((): boolean => {
    if (!selectedId) return false;
    return deleteUserNote(selectedId);
  }, [selectedId, deleteUserNote]);

  const togglePinned = useCallback((id: string) => {
    // Try user note first
    let touchedUser = false;
    setUserNotesRaw((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx === -1) return prev;
      touchedUser = true;
      const next = [...prev];
      next[idx] = { ...next[idx], pinned: !next[idx].pinned };
      return next;
    });
    if (touchedUser) return;
    // Otherwise toggle the owner pin override
    const ownerNote = ownerNotesData.find((n) => n.id === id);
    if (!ownerNote) return;
    setOwnerPinOverrides((prev) => {
      const current =
        prev[id] !== undefined ? prev[id] : !!ownerNote.pinned;
      return { ...prev, [id]: !current };
    });
  }, []);

  return (
    <NotesStoreContext.Provider
      value={{
        ownerNotes,
        userNotes,
        allNotes,
        selectedId,
        selectedNote,
        setSelectedId,
        createNote,
        updateUserNote,
        deleteUserNote,
        deleteSelected,
        togglePinned,
      }}
    >
      {children}
    </NotesStoreContext.Provider>
  );
}

export function useNotesStore() {
  const ctx = useContext(NotesStoreContext);
  if (!ctx)
    throw new Error("useNotesStore must be used inside NotesStoreProvider");
  return ctx;
}
