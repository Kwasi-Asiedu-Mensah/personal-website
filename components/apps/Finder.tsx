"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRecents, relativeTime } from "@/lib/recents";
import { applicationsList, appByLabel } from "@/lib/app-config";
import { useSessionState } from "@/lib/sidebar-persistence";

/* ============================ App icons ============================ */

/**
 * Returns the configured icon component for an app name (display label),
 * or null if the name isn't a known app. Used by IconView/ListView to
 * render real app icons in the /Applications/ folder.
 */
function appIconFor(name: string): (() => ReactNode) | null {
  const app = appByLabel(name);
  return app ? app.Icon : null;
}

/* ============================ Filesystem ============================ */

type FsItem = {
  name: string;
  type: "folder" | "file";
  ext?: string;
  size?: string;
  modified?: string;
  children?: FsItem[];
};

const HOME_NAME = "kwasi";
const VIRTUAL_ROOT_NAME = "__virtual__";

const FILESYSTEM: FsItem = {
  name: HOME_NAME,
  type: "folder",
  modified: "Today",
  children: [
    {
      name: "Desktop",
      type: "folder",
      modified: "Today",
      children: [
        { name: "Screenshot 2026-05-06 at 11.40.png", type: "file", ext: "png", size: "1.4 MB", modified: "Today" },
        { name: "Screenshot 2026-04-30 at 23.04.png", type: "file", ext: "png", size: "2.1 MB", modified: "Yesterday" },
        { name: "server.py", type: "file", ext: "py", size: "10 KB", modified: "Last month" },
        { name: "scratch.md", type: "file", ext: "md", size: "2 KB", modified: "Today" },
        { name: "todo.md", type: "file", ext: "md", size: "1 KB", modified: "Today" },
      ],
    },
    {
      name: "Documents",
      type: "folder",
      modified: "Today",
      children: [
        { name: "Kwasi Asiedu-Mensah Curriculum Vitae.pdf", type: "file", ext: "pdf", size: "312 KB", modified: "Today" },
        { name: "Omni_Pitch_Deck.pptx", type: "file", ext: "pptx", size: "2.1 MB", modified: "Today" },
        { name: "Centient Pitch Deck.pptx", type: "file", ext: "pptx", size: "1.3 MB", modified: "Last month" },
        { name: "Centient B2B.docx", type: "file", ext: "docx", size: "28 KB", modified: "Last month" },
        { name: "BUSINESS PLAN - VIVRE.docx", type: "file", ext: "docx", size: "52 KB", modified: "2 months ago" },
        { name: "AEC VENTURE GRANT WORKPLAN - VIVRE.xlsx", type: "file", ext: "xlsx", size: "18 KB", modified: "2 months ago" },
        { name: "AWS Certified Solutions Architect - Associate certificate.pdf", type: "file", ext: "pdf", size: "148 KB", modified: "Last year" },
        { name: "AWS Certified Cloud Practitioner.pdf", type: "file", ext: "pdf", size: "112 KB", modified: "Last year" },
        { name: "Code of Conduct_Inpath Technologies.pdf", type: "file", ext: "pdf", size: "105 KB", modified: "3 months ago" },
      ],
    },
    {
      name: "Downloads",
      type: "folder",
      modified: "Today",
      children: [
        { name: "Babel - R.F. Kuang.epub", type: "file", ext: "epub", size: "1.4 MB", modified: "Today" },
        { name: "The God of Small Things - Arundhati Roy.epub", type: "file", ext: "epub", size: "892 KB", modified: "Today" },
        { name: "Normal People - Sally Rooney.pdf", type: "file", ext: "pdf", size: "1.1 MB", modified: "Yesterday" },
        { name: "Atomic Habits.pdf", type: "file", ext: "pdf", size: "5.8 MB", modified: "Last year" },
        { name: "Manly P Hall - Self Unfoldment.pdf", type: "file", ext: "pdf", size: "3.2 MB", modified: "Last month" },
        { name: "Games People Play - Eric Berne.epub", type: "file", ext: "epub", size: "268 KB", modified: "Last month" },
        { name: "Feeling is the Secret - Neville Goddard.pdf", type: "file", ext: "pdf", size: "54 KB", modified: "Last month" },
        { name: "Anatomy Trains - Myofascial Meridians.pdf", type: "file", ext: "pdf", size: "412 KB", modified: "2 months ago" },
        { name: "Prompt Engineering Guide.pdf", type: "file", ext: "pdf", size: "219 KB", modified: "Last month" },
        { name: "TCP.zip", type: "file", ext: "zip", size: "18 MB", modified: "Last month" },
      ],
    },
    {
      name: "Projects",
      type: "folder",
      modified: "Today",
      children: [
        {
          name: "omni",
          type: "folder",
          modified: "Today",
          children: [
            { name: "docker-compose.yml", type: "file", ext: "yml", size: "3 KB", modified: "Today" },
            { name: "README.md", type: "file", ext: "md", size: "4 KB", modified: "Today" },
            { name: "src", type: "folder", modified: "Today", children: [] },
            { name: "infra", type: "folder", modified: "Today", children: [] },
          ],
        },
        {
          name: "centient",
          type: "folder",
          modified: "Yesterday",
          children: [
            { name: "terraform", type: "folder", modified: "Yesterday", children: [] },
            { name: "services", type: "folder", modified: "Yesterday", children: [] },
            { name: "Makefile", type: "file", ext: "mk", size: "2 KB", modified: "Yesterday" },
          ],
        },
        {
          name: "personal-website",
          type: "folder",
          modified: "Today",
          children: [
            { name: "AGENTS.md", type: "file", ext: "md", size: "8 KB", modified: "Today" },
            { name: "CLAUDE.md", type: "file", ext: "md", size: "5 KB", modified: "Today" },
            { name: "docs", type: "folder", modified: "Today", children: [
              { name: "design-system.md", type: "file", ext: "md", size: "12 KB", modified: "Today" },
            ]},
            { name: "package.json", type: "file", ext: "json", size: "1.2 KB", modified: "Today" },
            { name: "next.config.mjs", type: "file", ext: "mjs", size: "1 KB", modified: "Today" },
            { name: "tailwind.config.ts", type: "file", ext: "ts", size: "2 KB", modified: "Today" },
            { name: "tsconfig.json", type: "file", ext: "json", size: "1 KB", modified: "Today" },
            { name: "components", type: "folder", modified: "Today", children: [
              { name: "Desktop.tsx", type: "file", ext: "tsx", size: "18 KB", modified: "Today" },
              { name: "Window.tsx", type: "file", ext: "tsx", size: "14 KB", modified: "Today" },
              { name: "Dock.tsx", type: "file", ext: "tsx", size: "8 KB", modified: "Today" },
              { name: "Menubar.tsx", type: "file", ext: "tsx", size: "6 KB", modified: "Today" },
              { name: "apps", type: "folder", modified: "Today", children: [] },
            ]},
            { name: "lib", type: "folder", modified: "Today", children: [
              { name: "notes-data.ts", type: "file", ext: "ts", size: "22 KB", modified: "Today" },
              { name: "app-config.ts", type: "file", ext: "ts", size: "9 KB", modified: "Today" },
              { name: "use-windows.ts", type: "file", ext: "ts", size: "7 KB", modified: "Today" },
            ]},
            { name: "public", type: "folder", modified: "Today", children: [] },
          ],
        },
        {
          name: "k8s-cluster",
          type: "folder",
          modified: "Last week",
          children: [
            { name: "manifests", type: "folder", modified: "Last week", children: [] },
            { name: "Makefile", type: "file", ext: "mk", size: "1 KB", modified: "Last week" },
          ],
        },
        { name: "dotfiles", type: "folder", modified: "Last month", children: [] },
      ],
    },
    { name: "Pictures", type: "folder", modified: "Last week", children: [] },
    { name: "Movies", type: "folder", modified: "Last month", children: [] },
    { name: "Music", type: "folder", modified: "Last month", children: [] },
  ],
};

/* ============================ Virtual folders ============================ */

const VIRTUAL_FOLDERS: Record<string, FsItem> = {
  recents: {
    name: "Recents",
    type: "folder",
    // Children populated at runtime from the recents store inside the Finder component.
    children: [],
  },
  applications: {
    name: "Applications",
    type: "folder",
    // Children populated from the app registry — see `applicationsList()` in
    // lib/app-config.ts. We compute lazily so adding a new app is a
    // single-file change.
    children: applicationsList().map((app) => ({
      name: app.label,
      type: "file" as const,
      ext: "app",
      modified: "Today",
    })),
  },
  trash: {
    name: "Trash",
    type: "folder",
    children: [
      { name: "Zoom.pkg", type: "file", ext: "pkg", size: "40 MB", modified: "Last month" },
      { name: "Screenshot 2025-12-14.png", type: "file", ext: "png", size: "1.2 MB", modified: "Last month" },
      { name: "Draft.docx", type: "file", ext: "docx", size: "18 KB", modified: "Last month" },
      { name: "node_modules-backup.zip", type: "file", ext: "zip", size: "186 MB", modified: "Last month" },
      { name: "old-scripts", type: "folder", modified: "2 months ago", children: [] },
    ],
  },
};

function getItemAtPath(path: string[]): FsItem | null {
  if (path[0] === VIRTUAL_ROOT_NAME) {
    return path.length >= 2 ? (VIRTUAL_FOLDERS[path[1]] ?? null) : null;
  }
  if (path[0] !== HOME_NAME) return null;
  let node: FsItem = FILESYSTEM;
  for (let i = 1; i < path.length; i++) {
    const child = node.children?.find((c) => c.name === path[i]);
    if (!child) return null;
    node = child;
  }
  return node;
}

/* ============================== Finder ============================== */

export default function Finder({
  onOpenFile,
  onOpenApp,
  jumpTo,
}: {
  onOpenFile?: (name: string) => void;
  onOpenApp?: (name: string) => void;
  /** External nav request — e.g. dock trash icon → navigate to Trash folder. */
  jumpTo?: { sidebarId: string; nonce: number } | null;
}) {
  // View state persists across minimize via sessionStorage; clears on close.
  const [path, setPath] = useSessionState<string[]>("finder", "path", [
    HOME_NAME,
    "Documents",
  ]);
  const [history, setHistory] = useSessionState<string[][]>(
    "finder",
    "history",
    [[HOME_NAME, "Documents"]]
  );
  const [historyIndex, setHistoryIndex] = useSessionState<number>(
    "finder",
    "historyIndex",
    0
  );
  const [view, setView] = useSessionState<"icon" | "list">(
    "finder",
    "view",
    "icon"
  );
  const [search, setSearch] = useSessionState<string>("finder", "search", "");
  const [sidebarId, setSidebarId] = useSessionState<string>(
    "finder",
    "sidebarId",
    "documents"
  );
  // Selected item is intentionally NOT persisted — it's transient.
  const [selected, setSelected] = useState<string | null>(null);
  const { recents } = useRecents();

  const currentFolder = getItemAtPath(path);
  const isRecentsView =
    path[0] === VIRTUAL_ROOT_NAME && path[1] === "recents";

  const items = useMemo<FsItem[]>(() => {
    if (isRecentsView) {
      if (recents.length === 0) return [];
      return recents.map((r) => {
        const ext = (r.name.includes(".") ? r.name.split(".").pop() : "") || undefined;
        return {
          name: r.name,
          type: "file" as const,
          ext,
          modified: relativeTime(r.openedAt),
        };
      });
    }
    return currentFolder?.children ?? [];
  }, [isRecentsView, recents, currentFolder]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  // Open the selected item when Enter is pressed.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !selected) return;
      const item = filtered.find((i) => i.name === selected);
      if (!item) return;
      if (item.type === "folder") {
        enterFolder(item.name);
      } else if (item.ext === "app") {
        onOpenApp?.(item.name);
      } else {
        onOpenFile?.(item.name);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, filtered]);

  const navigate = (newPath: string[]) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newPath];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setPath(newPath);
    setSelected(null);
  };

  const enterFolder = (name: string) => navigate([...path, name]);
  const navigateToBreadcrumb = (index: number) =>
    navigate(path.slice(0, index + 1));

  const openItem = (item: FsItem) => {
    if (item.type === "folder") {
      enterFolder(item.name);
      return;
    }
    if (item.ext === "app") {
      onOpenApp?.(item.name);
      return;
    }
    onOpenFile?.(item.name);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const i = historyIndex - 1;
      setHistoryIndex(i);
      setPath(history[i]);
      setSelected(null);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const i = historyIndex + 1;
      setHistoryIndex(i);
      setPath(history[i]);
      setSelected(null);
    }
  };

  const SIDEBAR_TARGETS: Record<string, string[]> = {
    recents: [VIRTUAL_ROOT_NAME, "recents"],
    applications: [VIRTUAL_ROOT_NAME, "applications"],
    desktop: [HOME_NAME, "Desktop"],
    documents: [HOME_NAME, "Documents"],
    downloads: [HOME_NAME, "Downloads"],
    projects: [HOME_NAME, "Projects"],
    trash: [VIRTUAL_ROOT_NAME, "trash"],
  };

  const navigateToSidebar = (id: string) => {
    setSidebarId(id);
    const target = SIDEBAR_TARGETS[id];
    if (target) navigate(target);
  };

  // External nav requests (e.g. dock trash icon). The nonce changes each
  // time so we re-navigate even if the user re-clicks the same target.
  useEffect(() => {
    if (!jumpTo) return;
    navigateToSidebar(jumpTo.sidebarId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo?.nonce]);

  return (
    <div
      className="flex h-full w-full"
      style={{ background: "var(--window-bg)" }}
    >
      <FinderSidebar selectedId={sidebarId} onSelect={navigateToSidebar} />

      <main className="flex-1 min-w-0 flex flex-col">
        <Toolbar
          path={path}
          title={currentFolder?.name ?? path[path.length - 1]}
          view={view}
          onViewChange={setView}
          search={search}
          onSearchChange={setSearch}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
          onBack={goBack}
          onForward={goForward}
        />

        <div
          className="flex-1 overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          {view === "icon" ? (
            <IconView
              items={filtered}
              selected={selected}
              onSelect={setSelected}
              onOpen={openItem}
              hasSearch={search.trim().length > 0}
            />
          ) : (
            <ListView
              items={filtered}
              selected={selected}
              onSelect={setSelected}
              onOpen={openItem}
              hasSearch={search.trim().length > 0}
            />
          )}
        </div>

        <PathBar
          path={path}
          virtualLabel={
            path[0] === VIRTUAL_ROOT_NAME ? (currentFolder?.name ?? null) : null
          }
          count={items.length}
          onCrumbClick={navigateToBreadcrumb}
        />
      </main>
    </div>
  );
}

/* ============================== Sidebar ============================== */

type SidebarIconKind =
  | "recents"
  | "applications"
  | "desktop"
  | "documents"
  | "downloads"
  | "projects"
  | "trash";

const SIDEBAR_ITEMS: {
  id: string;
  label: string;
  iconKind: SidebarIconKind;
}[] = [
  { id: "recents", label: "Recents", iconKind: "recents" },
  { id: "applications", label: "Applications", iconKind: "applications" },
  { id: "desktop", label: "Desktop", iconKind: "desktop" },
  { id: "documents", label: "Documents", iconKind: "documents" },
  { id: "downloads", label: "Downloads", iconKind: "downloads" },
  { id: "projects", label: "Projects", iconKind: "projects" },
  { id: "trash", label: "Trash", iconKind: "trash" },
];

const SIDEBAR_TAGS: { id: string; label: string; color: string }[] = [
  { id: "tag-red", label: "Red", color: "#ff453a" },
  { id: "tag-orange", label: "Orange", color: "#ff9f0a" },
  { id: "tag-yellow", label: "Yellow", color: "#ffd60a" },
  { id: "tag-green", label: "Green", color: "#30d158" },
  { id: "tag-blue", label: "Blue", color: "#0a84ff" },
  { id: "tag-purple", label: "Purple", color: "#bf5af2" },
  { id: "tag-gray", label: "Gray", color: "#8e8e93" },
];

function FinderSidebar({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside
      className="w-[200px] shrink-0 flex flex-col py-2 overflow-y-auto"
      style={{
        background: "var(--searchbar-bg)",
        borderRight: "1px solid var(--window-divider)",
      }}
    >
      <ul className="px-1 space-y-0.5 pt-1">
        {SIDEBAR_ITEMS.map((it) => (
          <li key={it.id}>
            <SidebarRow
              label={it.label}
              icon={<SidebarGlyph kind={it.iconKind} />}
              selected={selectedId === it.id}
              onClick={() => onSelect(it.id)}
            />
          </li>
        ))}
      </ul>

      <div
        className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-wide uppercase"
        style={{ color: "var(--section-label)" }}
      >
        Tags
      </div>
      <ul className="px-1 space-y-0.5">
        {SIDEBAR_TAGS.map((t) => (
          <li key={t.id}>
            <SidebarRow
              label={t.label}
              icon={
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ background: t.color }}
                />
              }
              selected={selectedId === t.id}
              onClick={() => onSelect(t.id)}
            />
          </li>
        ))}
      </ul>
    </aside>
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
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors"
      style={{
        background: selected ? "rgba(120,120,128,0.20)" : "transparent",
        color: selected ? "#0a84ff" : "var(--window-text-soft)",
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
  );
}

function SidebarGlyph({ kind }: { kind: SidebarIconKind }) {
  const svgProps = {
    viewBox: "0 0 16 16",
    className: "w-4 h-4",
    fill: "none" as const,
  };

  if (kind === "recents")
    return (
      <svg {...svgProps}>
        <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M 8 4.5 L 8 8 L 10.5 9.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );

  if (kind === "applications")
    return (
      <svg {...svgProps}>
        <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
      </svg>
    );

  if (kind === "desktop")
    return (
      <svg {...svgProps}>
        <rect
          x="1.5"
          y="3"
          width="13"
          height="8"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <line
          x1="6"
          y1="13.5"
          x2="10"
          y2="13.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="11"
          x2="8"
          y2="13.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );

  if (kind === "documents")
    return (
      <svg {...svgProps}>
        <path
          d="M 3.5 2 H 9.2 L 13 5.6 V 13 a 1 1 0 0 1 -1 1 H 4 a 1 1 0 0 1 -1 -1 V 3 a 1 1 0 0 1 0.5 -1 Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M 9 2 V 6 H 13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );

  if (kind === "downloads")
    return (
      <svg {...svgProps}>
        <path
          d="M 8 2 V 10.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M 5 7.5 L 8 10.5 L 11 7.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 3 13.5 H 13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );

  if (kind === "projects")
    return (
      <svg {...svgProps}>
        <path
          d="M 6 4 L 2 8 L 6 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 10 4 L 14 8 L 10 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  // trash
  return (
    <svg {...svgProps}>
      <path
        d="M 2.5 4.5 H 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 4.5 4.5 V 13 a 1 1 0 0 0 1 1 H 10.5 a 1 1 0 0 0 1 -1 V 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M 6 4.5 V 3.5 a 1 1 0 0 1 1 -1 H 9 a 1 1 0 0 1 1 1 V 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="6.7"
        y1="7"
        x2="6.7"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <line
        x1="9.3"
        y1="7"
        x2="9.3"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================== Toolbar ============================== */

function Toolbar({
  path,
  title,
  view,
  onViewChange,
  search,
  onSearchChange,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
}: {
  path: string[];
  title: string;
  view: "icon" | "list";
  onViewChange: (v: "icon" | "list") => void;
  search: string;
  onSearchChange: (s: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <div
      className="flex items-center gap-1 px-3 h-11 shrink-0"
      style={{
        borderBottom: "1px solid var(--window-divider)",
        background: "var(--titlebar-bg)",
      }}
    >
      <ArrowButton dir="back" onClick={onBack} disabled={!canGoBack} />
      <ArrowButton dir="forward" onClick={onForward} disabled={!canGoForward} />

      <div className="w-2" />

      <ViewSwitcher view={view} onChange={onViewChange} />

      <div className="flex-1" />

      <div
        className="text-[13px] font-semibold flex items-center gap-1.5"
        style={{ color: "var(--window-text)" }}
      >
        <FolderGlyphSmall />
        {title}
      </div>

      <div className="flex-1" />

      <div
        className="flex items-center gap-2 px-2.5 h-7 rounded-md w-[180px]"
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
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-[var(--window-text-faint)]"
          style={{ color: "var(--window-text)" }}
        />
      </div>
    </div>
  );
}

function ArrowButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "back" | "forward";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
      style={{ color: "var(--window-text)" }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--row-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
        {dir === "back" ? (
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

function ViewSwitcher({
  view,
  onChange,
}: {
  view: "icon" | "list";
  onChange: (v: "icon" | "list") => void;
}) {
  return (
    <div
      className="flex rounded-md overflow-hidden"
      style={{ border: "1px solid var(--window-border)" }}
    >
      <ViewButton
        active={view === "icon"}
        onClick={() => onChange("icon")}
        ariaLabel="Icon view"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1" y="1" width="5" height="5" rx="1" />
          <rect x="8" y="1" width="5" height="5" rx="1" />
          <rect x="1" y="8" width="5" height="5" rx="1" />
          <rect x="8" y="8" width="5" height="5" rx="1" />
        </svg>
      </ViewButton>
      <ViewButton
        active={view === "list"}
        onClick={() => onChange("list")}
        ariaLabel="List view"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="2" height="2" rx="0.4" fill="currentColor" />
          <rect x="5" y="2.4" width="8" height="1.2" rx="0.4" fill="currentColor" />
          <rect x="1" y="6" width="2" height="2" rx="0.4" fill="currentColor" />
          <rect x="5" y="6.4" width="8" height="1.2" rx="0.4" fill="currentColor" />
          <rect x="1" y="10" width="2" height="2" rx="0.4" fill="currentColor" />
          <rect x="5" y="10.4" width="8" height="1.2" rx="0.4" fill="currentColor" />
        </svg>
      </ViewButton>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center transition-colors"
      style={{
        background: active ? "var(--row-active)" : "transparent",
        color: active ? "var(--window-text)" : "var(--window-text-muted)",
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
      {children}
    </button>
  );
}

/* ============================ File Icons ============================ */

function FolderGlyphLarge() {
  return (
    <svg viewBox="0 0 100 80" className="w-16 h-12">
      <defs>
        <linearGradient id="finder-folder-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7AC3FF" />
          <stop offset="100%" stopColor="#3380E0" />
        </linearGradient>
        <linearGradient id="finder-folder-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5DAEF0" />
          <stop offset="100%" stopColor="#1F6AD0" />
        </linearGradient>
      </defs>
      <path
        d="M 6 18 Q 6 10 14 10 L 38 10 Q 41 10 43 12 L 47 16 Q 49 18 52 18 L 88 18 Q 94 18 94 24 L 94 64 Q 94 70 88 70 L 12 70 Q 6 70 6 64 Z"
        fill="url(#finder-folder-back)"
      />
      <path
        d="M 6 22 Q 6 20 8 20 L 92 20 Q 94 20 94 22 L 94 64 Q 94 70 88 70 L 12 70 Q 6 70 6 64 Z"
        fill="url(#finder-folder-front)"
      />
    </svg>
  );
}

function FolderGlyphSmall() {
  return (
    <svg viewBox="0 0 100 80" className="w-4 h-4">
      <path
        d="M 6 18 Q 6 10 14 10 L 38 10 Q 41 10 43 12 L 47 16 Q 49 18 52 18 L 88 18 Q 94 18 94 24 L 94 64 Q 94 70 88 70 L 12 70 Q 6 70 6 64 Z"
        fill="#3380E0"
      />
      <path
        d="M 6 22 Q 6 20 8 20 L 92 20 Q 94 20 94 22 L 94 64 Q 94 70 88 70 L 12 70 Q 6 70 6 64 Z"
        fill="#1F6AD0"
      />
    </svg>
  );
}

const EXT_COLORS: Record<string, string> = {
  pdf: "#e74c3c",
  md: "#5a5a5a",
  json: "#f4b942",
  zip: "#a67c52",
  mk: "#5a5a5a",
  fig: "#a259ff",
  app: "#0a84ff",
  png: "#5b9aff",
  jpg: "#5b9aff",
  jpeg: "#5b9aff",
};

function FileGlyphLarge({ ext }: { ext?: string }) {
  const bg = EXT_COLORS[ext ?? ""] ?? "#9ca3af";
  return (
    <svg viewBox="0 0 100 120" className="w-12 h-14">
      <path
        d="M 12 6 Q 12 2 16 2 L 70 2 L 92 24 L 92 114 Q 92 118 88 118 L 16 118 Q 12 118 12 114 Z"
        fill="white"
        stroke="#d4d4d8"
        strokeWidth="1.5"
      />
      <path d="M 70 2 L 92 24 L 70 24 Z" fill="#e5e5ea" />
      <rect x="22" y="62" width="56" height="22" rx="4" fill={bg} />
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="white"
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        {(ext ?? "FILE").toUpperCase()}
      </text>
    </svg>
  );
}

function FileGlyphSmall({ ext }: { ext?: string }) {
  const bg = EXT_COLORS[ext ?? ""] ?? "#9ca3af";
  return (
    <svg viewBox="0 0 100 120" className="w-4 h-4">
      <path
        d="M 12 6 Q 12 2 16 2 L 70 2 L 92 24 L 92 114 Q 92 118 88 118 L 16 118 Q 12 118 12 114 Z"
        fill="white"
        stroke="#d4d4d8"
        strokeWidth="2"
      />
      <path d="M 70 2 L 92 24 L 70 24 Z" fill="#e5e5ea" />
      <rect x="22" y="62" width="56" height="22" rx="5" fill={bg} />
    </svg>
  );
}

/* =============================== Views =============================== */

function IconView({
  items,
  selected,
  onSelect,
  onOpen,
  hasSearch = false,
}: {
  items: FsItem[];
  selected: string | null;
  onSelect: (name: string) => void;
  onOpen: (item: FsItem) => void;
  hasSearch?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center text-[13px]"
        style={{ color: "var(--window-text-muted)" }}
      >
        {hasSearch ? "No items match your search." : "Folder is empty."}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-2 gap-y-4 p-6">
      {items.map((item) => {
        const isSel = selected === item.name;
        return (
          <button
            key={item.name}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.name);
            }}
            onDoubleClick={() => onOpen(item)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg outline-none"
          >
            <div className="h-16 flex items-center justify-center">
              {item.type === "folder" ? (
                <FolderGlyphLarge />
              ) : (() => {
                const Icon = appIconFor(item.name);
                if (Icon) return <div className="w-14 h-14"><Icon /></div>;
                return <FileGlyphLarge ext={item.ext} />;
              })()}
            </div>
            <span
              className="text-[12px] text-center px-1.5 py-0.5 rounded max-w-full truncate"
              style={{
                background: isSel ? "#3478f6" : "transparent",
                color: isSel ? "white" : "var(--window-text)",
              }}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ListView({
  items,
  selected,
  onSelect,
  onOpen,
  hasSearch = false,
}: {
  items: FsItem[];
  selected: string | null;
  onSelect: (name: string) => void;
  onOpen: (item: FsItem) => void;
  hasSearch?: boolean;
}) {
  return (
    <div>
      <div
        className="flex items-center px-3 py-1.5 text-[11px] font-medium sticky top-0"
        style={{
          color: "var(--window-text-muted)",
          borderBottom: "1px solid var(--window-divider)",
          background: "var(--window-bg)",
        }}
      >
        <div className="flex-1 flex items-center gap-2 px-2">Name</div>
        <div className="w-32">Date Modified</div>
        <div className="w-20 text-right">Size</div>
        <div className="w-24 pl-4">Kind</div>
      </div>
      {items.length === 0 && (
        <div
          className="py-12 flex items-center justify-center text-[13px]"
          style={{ color: "var(--window-text-muted)" }}
        >
          {hasSearch ? "No items match your search." : "Folder is empty."}
        </div>
      )}
      {items.map((item) => {
        const isSel = selected === item.name;
        const muted = isSel
          ? "rgba(255,255,255,0.85)"
          : "var(--window-text-muted)";
        return (
          <div
            key={item.name}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.name);
            }}
            onDoubleClick={() => onOpen(item)}
            className="flex items-center px-3 py-1.5 cursor-default text-[13px]"
            style={{
              background: isSel ? "#3478f6" : "transparent",
              color: isSel ? "white" : "var(--window-text)",
            }}
          >
            <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
              <span className="w-4 h-4 inline-flex shrink-0">
                {item.type === "folder" ? (
                  <FolderGlyphSmall />
                ) : (() => {
                  const Icon = appIconFor(item.name);
                  if (Icon) return <Icon />;
                  return <FileGlyphSmall ext={item.ext} />;
                })()}
              </span>
              <span className="truncate">{item.name}</span>
            </div>
            <div className="w-32 text-[12px]" style={{ color: muted }}>
              {item.modified ?? "—"}
            </div>
            <div
              className="w-20 text-right text-[12px]"
              style={{ color: muted }}
            >
              {item.size ?? "—"}
            </div>
            <div className="w-24 pl-4 text-[12px]" style={{ color: muted }}>
              {item.type === "folder"
                ? "Folder"
                : item.ext === "app"
                  ? "Application"
                  : (item.ext?.toUpperCase() ?? "Document")}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================== Path Bar ============================== */

function PathBar({
  path,
  virtualLabel,
  count,
  onCrumbClick,
}: {
  path: string[];
  virtualLabel: string | null;
  count: number;
  onCrumbClick: (index: number) => void;
}) {
  const isVirtual = path[0] === VIRTUAL_ROOT_NAME;
  return (
    <div
      className="flex items-center justify-between px-3 h-7 shrink-0 text-[11px] gap-3"
      style={{
        borderTop: "1px solid var(--window-divider)",
        color: "var(--window-text-muted)",
        background: "var(--titlebar-bg)",
      }}
    >
      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
        {isVirtual ? (
          <>
            <Crumb label="Macintosh HD" />
            <CrumbSep />
            <span className="truncate" style={{ color: "inherit" }}>
              {virtualLabel ?? path[1]}
            </span>
          </>
        ) : (
          <>
            <Crumb label="Macintosh HD" />
            <CrumbSep />
            <Crumb label="Users" />
            {path.map((p, i) => (
              <Fragment key={i}>
                <CrumbSep />
                <button
                  onClick={() => onCrumbClick(i)}
                  className="hover:underline truncate"
                  style={{ color: "inherit" }}
                >
                  {p}
                </button>
              </Fragment>
            ))}
          </>
        )}
      </div>
      <div className="shrink-0">
        {count} item{count !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function Crumb({ label }: { label: string }) {
  return <span className="truncate">{label}</span>;
}

function CrumbSep() {
  return <span className="opacity-50">›</span>;
}
