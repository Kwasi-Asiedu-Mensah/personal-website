"use client";

import { useEffect, useRef, useState } from "react";
import { useWallpaper } from "@/lib/wallpaper";

type Line = { kind: "cmd" | "out" | "info"; text: string };

const USER = "kwasi";
const HOST = "Kwasis-MacBook-Pro";
const HOME = `/Users/${USER}`;

// Fake filesystem — directory contents
const FS_DIRS: Record<string, string[]> = {
  [HOME]: [
    "Desktop",
    "Documents",
    "Downloads",
    "Projects",
    "Pictures",
    ".zshrc",
    ".gitconfig",
  ],
  [`${HOME}/Documents`]: ["resume.pdf", "runbook.md", "incidents.md"],
  [`${HOME}/Projects`]: [
    "k8s-cluster",
    "infra-as-code",
    "personal-website",
    "monitoring",
  ],
  [`${HOME}/Projects/k8s-cluster`]: [
    "manifests",
    "helm-charts",
    "Makefile",
    "README.md",
  ],
  [`${HOME}/Projects/infra-as-code`]: [
    "terraform",
    "ansible",
    "README.md",
  ],
  [`${HOME}/Desktop`]: [],
  [`${HOME}/Downloads`]: [],
  [`${HOME}/Pictures`]: [],
};

// Fake filesystem — file contents
const FS_FILES: Record<string, string> = {
  [`${HOME}/.zshrc`]: `# ~/.zshrc — kwasi
export EDITOR=nvim
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
alias k='kubectl'
alias gst='git status'
alias tf='terraform'
alias dc='docker compose'
eval "$(starship init zsh)"`,
  [`${HOME}/.gitconfig`]: `[user]
  name = Kwasi Asiedu-Mensah
  email = kwasi@example.com
[init]
  defaultBranch = main
[pull]
  rebase = true`,
  [`${HOME}/Documents/runbook.md`]: `# Runbook

1. Check service health: \`kubectl get pods -n prod\`
2. Tail logs: \`kubectl logs -f <pod> -n prod\`
3. If SLO breached: page on-call
4. Rollback: \`kubectl rollout undo deploy/<name> -n prod\``,
  [`${HOME}/Documents/incidents.md`]: `# Incidents
- 2026-04-22: brief outage on api gateway
- 2026-03-08: db connection pool exhausted`,
  [`${HOME}/Projects/k8s-cluster/README.md`]: `# k8s-cluster
Production Kubernetes manifests.

## Quick start
\`\`\`bash
make deploy
\`\`\``,
  [`${HOME}/Projects/k8s-cluster/Makefile`]: `.PHONY: deploy diff destroy

deploy:
\tkubectl apply -k manifests/

diff:
\tkubectl diff -k manifests/

destroy:
\tkubectl delete -k manifests/`,
  [`${HOME}/Projects/personal-website`]: `(directory)`,
  [`${HOME}/Documents/resume.pdf`]: `[binary file — would open in Preview]`,
};

const COMMANDS: [string, string][] = [
  ["help", "Show this help message"],
  ["clear", "Clear the terminal"],
  ["pwd", "Print working directory"],
  ["cd <dir>", "Change directory"],
  ["ls [dir]", "List directory contents"],
  ["cat <file>", "Display file contents"],
  ["open <file>", "Open file in TextEdit"],
  ["echo <text>", "Print text to terminal"],
  ["whoami", "Display current user"],
  ["hostname", "Display hostname"],
  ["date", "Display current date/time"],
  ["uptime", "Display system uptime"],
  ["history", "Show command history"],
  ["neofetch", "Display system info"],
  ["git <sub>", "Git commands (log, status, branch)"],
  ["curl <url>", "Transfer data from a server"],
  ["ping <host>", "Ping a host"],
  ["docker <sub>", "Docker commands (ps)"],
  ["kubectl <sub>", "Kubernetes commands (get pods/nodes)"],
  ["brew <sub>", "Homebrew commands (list, update)"],
];

function shortPath(p: string): string {
  if (p === HOME) return "~";
  if (p.startsWith(HOME + "/")) return "~" + p.slice(HOME.length);
  return p;
}

function resolvePath(arg: string, cwd: string): string {
  if (arg === "~") return HOME;
  if (arg.startsWith("~/")) return HOME + arg.slice(1);
  if (arg.startsWith("/")) return arg;
  if (arg === "..") {
    const parts = cwd.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/");
  }
  if (arg === ".") return cwd;
  return cwd === "/" ? "/" + arg : `${cwd}/${arg}`;
}

export default function Terminal() {
  const { current: wallpaper } = useWallpaper();
  const [cwd, setCwd] = useState(HOME);
  const [lines, setLines] = useState<Line[]>([
    { kind: "info", text: "Type 'help' for available commands" },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const promptText = `${USER}@${HOST} ${shortPath(cwd)} %`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [lines]);

  const exec = (raw: string) => {
    const trimmed = raw.trim();
    const echoed: Line = { kind: "cmd", text: `${promptText} ${raw}` };

    if (!trimmed) {
      setLines((ls) => [...ls, echoed]);
      return;
    }

    setHistory((h) => [...h, trimmed]);

    const [cmd, ...args] = trimmed.split(/\s+/);

    let output: string | null = null;
    let doClear = false;

    switch (cmd) {
      case "help":
        output =
          "Available commands:\n" +
          COMMANDS.map(([c, d]) => `  ${c.padEnd(15)} - ${d}`).join("\n");
        break;
      case "clear":
        doClear = true;
        break;
      case "pwd":
        output = cwd;
        break;
      case "cd": {
        const arg = args[0] || "~";
        const target = resolvePath(arg, cwd);
        if (target in FS_DIRS) setCwd(target);
        else output = `cd: no such file or directory: ${arg}`;
        break;
      }
      case "ls": {
        const target = args[0] ? resolvePath(args[0], cwd) : cwd;
        if (target in FS_DIRS) {
          const items = FS_DIRS[target];
          output = items.length > 0 ? items.join("  ") : "";
        } else if (target in FS_FILES) {
          output = args[0] ?? target;
        } else {
          output = `ls: cannot access '${args[0] ?? target}': No such file or directory`;
        }
        break;
      }
      case "cat": {
        if (!args[0]) {
          output = "usage: cat <file>";
          break;
        }
        const target = resolvePath(args[0], cwd);
        if (target in FS_FILES) output = FS_FILES[target];
        else if (target in FS_DIRS) output = `cat: ${args[0]}: Is a directory`;
        else output = `cat: ${args[0]}: No such file or directory`;
        break;
      }
      case "open": {
        if (!args[0]) {
          output = "usage: open <file>";
          break;
        }
        output = `Opening ${args[0]}…`;
        break;
      }
      case "echo":
        output = args.join(" ");
        break;
      case "whoami":
        output = USER;
        break;
      case "hostname":
        output = `${HOST}.local`;
        break;
      case "date":
        output = new Date().toString();
        break;
      case "uptime": {
        const t = new Date().toLocaleTimeString([], { hour12: false });
        output = `${t} up 14 days, 4:23, 1 user, load averages: 1.32 1.42 1.51`;
        break;
      }
      case "history":
        output = history.length
          ? history.map((h, i) => `  ${i + 1}  ${h}`).join("\n")
          : "(no history yet)";
        break;
      case "neofetch":
        output = neofetch(wallpaper.label, wallpaper.subtitle);
        break;
      case "curl":
        if (args[0] === "wttr.in" || args[0]?.includes("wttr")) {
          output = `Weather report: Accra

     \\ /     Sunny
      .-.     +30(31) °C
   ― (   ) ―  → 12 km/h
      \`-'     10 km
     / \\     0.0 mm`;
        } else if (args[0]?.startsWith("http") || args[0]?.startsWith("https")) {
          output = `curl: (6) Could not resolve host: ${args[0]}\n(network access is simulated)`;
        } else if (!args[0]) {
          output = `curl: try 'curl wttr.in' for weather`;
        } else {
          output = `curl: (6) Could not resolve host: ${args[0]}`;
        }
        break;

      case "git": {
        const sub = args[0];
        if (sub === "log") {
          output = `commit a3f9c12 (HEAD -> main, origin/main)
Author: Kwasi Asiedu-Mensah <kwasiasiedumensah@gmail.com>
Date:   ${new Date().toDateString()}

    refactor: clean up weather component state management

commit 8d1e047
Author: Kwasi Asiedu-Mensah <kwasiasiedumensah@gmail.com>
Date:   Thu May 7 22:14:09 2026 +0000

    feat: add spotlight search

commit f2c3b81
Author: Kwasi Asiedu-Mensah <kwasiasiedumensah@gmail.com>
Date:   Wed May 6 19:32:41 2026 +0000

    feat: weather app — animated scene effects

commit 9a0e514
Author: Kwasi Asiedu-Mensah <kwasiasiedumensah@gmail.com>
Date:   Tue May 5 11:05:22 2026 +0000

    polish: window minimize animation + dock bounce`;
        } else if (sub === "status") {
          output = `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`;
        } else if (sub === "branch") {
          output = `* main\n  feat/omni-v2\n  chore/deps-update`;
        } else if (sub === "diff") {
          output = `(working tree clean)`;
        } else {
          output = `git: '${sub ?? ""}' — try git log, git status, git branch`;
        }
        break;
      }

      case "ping": {
        const host = args[0] || "localhost";
        output = `PING ${host}: 56 data bytes
64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.412 ms
64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.388 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.401 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
round-trip min/avg/max = 0.388/0.400/0.412 ms`;
        break;
      }

      case "python":
      case "python3":
        if (args[0]) {
          output = `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
        } else {
          output = `Python 3.12.3 (main, Apr 15 2024, 00:00:00)\nType "help", "copyright", "credits" or "license" for more information.\n>>> `;
        }
        break;

      case "node":
        output = `Welcome to Node.js v20.11.0.\nType ".help" for more information.\n> `;
        break;

      case "kubectl":
        if (args[0] === "get" && args[1] === "pods") {
          output = `NAME                          READY   STATUS    RESTARTS   AGE
api-6d9f8b7c4-xk2pq           1/1     Running   0          3d
worker-7b4c9f6d5-mn8rs         1/1     Running   0          3d
redis-0                        1/1     Running   0          7d
postgres-0                     1/1     Running   0          7d`;
        } else if (args[0] === "get" && args[1] === "nodes") {
          output = `NAME          STATUS   ROLES           AGE   VERSION
prod-node-1   Ready    control-plane   14d   v1.29.2
prod-node-2   Ready    worker          14d   v1.29.2
prod-node-3   Ready    worker          14d   v1.29.2`;
        } else {
          output = `kubectl: try 'kubectl get pods' or 'kubectl get nodes'`;
        }
        break;

      case "terraform":
        if (args[0] === "plan") {
          output = `Refreshing Terraform state in-memory prior to plan...\n\nNo changes. Infrastructure is up-to-date.\n\nThis means that Terraform did not detect any differences between your\nconfiguration and the real infrastructure.`;
        } else {
          output = `Terraform v1.7.4\nUsage: terraform [global options] <subcommand> [args]`;
        }
        break;

      case "docker":
        if (args[0] === "ps") {
          output = `CONTAINER ID   IMAGE          COMMAND                  CREATED       STATUS       PORTS                    NAMES
a3f9c1289b2e   api:latest     "node dist/index.js"     3 days ago    Up 3 days    0.0.0.0:3000->3000/tcp   omni_api_1
8d1e0471c3a4   postgres:16    "docker-entrypoint.s…"   7 days ago    Up 7 days    5432/tcp                 omni_db_1
f2c3b815e9d1   redis:7        "docker-entrypoint.s…"   7 days ago    Up 7 days    6379/tcp                 omni_redis_1`;
        } else {
          output = `Docker version 25.0.3\nUsage: docker [OPTIONS] COMMAND`;
        }
        break;

      case "ssh":
        output = `ssh: connect to host ${args[0] || "remote"} port 22: Connection refused\n(this is a simulated terminal)`;
        break;

      case "brew":
        if (args[0] === "list") {
          output = `awscli       gh           kubectl      node         terraform\nbun          git          neovim       python@3.12  tmux\ndocker       k9s          nvm          ripgrep      zsh`;
        } else if (args[0] === "update") {
          output = `Already up-to-date.`;
        } else {
          output = `Homebrew 4.2.10\nUsage: brew [command] [--verbose|-v] [options] [formula]`;
        }
        break;

      default:
        output = `zsh: command not found: ${cmd}`;
    }

    if (doClear) {
      setLines([]);
    } else if (output !== null) {
      setLines((ls) => [...ls, echoed, { kind: "out", text: output! }]);
    } else {
      setLines((ls) => [...ls, echoed]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(input);
      setInput("");
      setHistoryIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx =
        historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx < 0) return;
      const idx = historyIdx + 1;
      if (idx >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto cursor-text"
      style={{
        background: "#0a0a0a",
        color: "#e8e8e8",
        fontFamily:
          '"SF Mono", "JetBrains Mono", "Menlo", ui-monospace, monospace',
        fontSize: "13px",
        padding: "14px 16px",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.55,
            color: line.kind === "info" ? "#8a8a8a" : "#e8e8e8",
          }}
        >
          {line.text}
        </div>
      ))}
      <div className="flex" style={{ lineHeight: 1.55 }}>
        <span style={{ whiteSpace: "pre", color: "#e8e8e8" }}>
          {promptText}{" "}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent outline-none border-none caret-white"
          style={{
            color: "#e8e8e8",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="terminal input"
        />
      </div>
    </div>
  );
}

function neofetch(osLabel: string, osVersion: string) {
  return `\
                    'c.          ${USER}@${HOST}
                 ,xNMM.          -----------------
               .OMMMMo            OS:       macOS ${osLabel} ${osVersion}
               OMMM0,             Host:     MacBook Pro (M3, 2024)
     .;loddo:' loolloddol;.       Kernel:   Darwin 25.0.0
   cKMMMMMMMMMMNWMMMMMMMMMM0:     Uptime:   14 days, 4 hours
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.     Shell:    zsh 5.9
 XMMMMMMMMMMMMMMMMMMMMMMMX.       Terminal: iTerm.app
;MMMMMMMMMMMMMMMMMMMMMMMM:        CPU:      Apple M3
:MMMMMMMMMMMMMMMMMMMMMMMM:        Memory:   24 GB
.MMMMMMMMMMMMMMMMMMMMMMMMX.       Disk:     412 GB / 1 TB
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.     Editor:   nvim
 .XMMMMMMMMMMMMMMMMMMMMMMMMMMk    Stack:    kubectl, terraform, aws
  .XMMMMMMMMMMMMMMMMMMMMMMMMK.
    kMMMMMMMMMMMMMMMMMMMMMMd
     ;KMMMMMMMWXXWMMMMMMMk.
       .cooc,.    .,coo:.`;
}
