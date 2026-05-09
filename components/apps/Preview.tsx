"use client";

import { useFilePreview } from "@/lib/file-preview";
import type { FileContent, Slide } from "@/lib/file-contents";

export default function Preview() {
  const { openedFile } = useFilePreview();

  if (!openedFile) {
    return (
      <div
        className="flex-1 flex items-center justify-center h-full"
        style={{
          background: "var(--window-bg)",
          color: "var(--window-text-muted)",
        }}
      >
        <div className="text-center">
          <div className="text-[14px]">No file open</div>
          <div className="text-[12px] mt-1 opacity-70">
            Open a file in Finder to preview it here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--window-bg)" }}
    >
      <div className="flex-1 overflow-auto">
        <PreviewBody file={openedFile.name} content={openedFile.content} />
      </div>
    </div>
  );
}

function PreviewBody({
  file,
  content,
}: {
  file: string;
  content: FileContent;
}) {
  if (content.kind === "markdown") {
    return <MarkdownView body={content.body} />;
  }
  if (content.kind === "code" || content.kind === "text") {
    return <CodeView body={content.body} language={content.language} />;
  }
  if (content.kind === "image") {
    return <ImageView svgBody={content.svgBody} caption={content.caption} />;
  }
  if (content.kind === "pdf") {
    return <PdfView pages={content.pages} />;
  }
  if (content.kind === "slides") {
    return <SlideView slides={content.slides} />;
  }
  return <BinaryPlaceholder body={content.body} />;
}

/* ============================ Markdown view ============================ */

function MarkdownView({ body }: { body: string }) {
  const blocks = parseMarkdown(body);
  return (
    <div
      className="px-10 py-8 max-w-[760px] mx-auto"
      style={{ color: "var(--window-text)" }}
    >
      {blocks.map((b, i) => (
        <MdBlock key={i} block={b} />
      ))}
    </div>
  );
}

type MdBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; lang?: string; body: string };

function parseMarkdown(src: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const lines = src.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // code fence
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || undefined;
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", lang, body: buf.join("\n") });
      continue;
    }

    // headings
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4) });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2) });
      i++;
      continue;
    }

    // list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // ordered list — fold into list block
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // paragraph or blank
    if (line.trim() === "") {
      i++;
      continue;
    }
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].startsWith("```")
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") });
  }
  return blocks;
}

function MdBlock({ block }: { block: MdBlock }) {
  if (block.type === "h1")
    return (
      <h1 className="text-[26px] font-bold mb-3 mt-1 tracking-tight">
        {block.text}
      </h1>
    );
  if (block.type === "h2")
    return (
      <h2 className="text-[19px] font-semibold mb-2 mt-6 tracking-tight">
        {block.text}
      </h2>
    );
  if (block.type === "h3")
    return (
      <h3 className="text-[15px] font-semibold mb-1.5 mt-4">{block.text}</h3>
    );
  if (block.type === "paragraph")
    return (
      <p
        className="text-[14px] leading-relaxed mb-3"
        style={{ color: "var(--window-text-soft)" }}
      >
        <Inline text={block.text} />
      </p>
    );
  if (block.type === "list")
    return (
      <ul
        className="text-[14px] leading-relaxed mb-3 pl-5 list-disc space-y-1"
        style={{ color: "var(--window-text-soft)" }}
      >
        {block.items.map((it, i) => (
          <li key={i}>
            <Inline text={it} />
          </li>
        ))}
      </ul>
    );
  if (block.type === "code")
    return <CodeView body={block.body} language={block.lang} />;
  return null;
}

/* Inline parser for `code` and **bold** (lightweight). */
function Inline({ text }: { text: string }) {
  const parts: ReactNodePart[] = [];
  let buf = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "`") {
      if (buf) {
        parts.push({ kind: "text", value: buf });
        buf = "";
      }
      const end = text.indexOf("`", i + 1);
      if (end === -1) {
        buf += c;
        i++;
        continue;
      }
      parts.push({ kind: "code", value: text.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    if (c === "*" && text[i + 1] === "*") {
      if (buf) {
        parts.push({ kind: "text", value: buf });
        buf = "";
      }
      const end = text.indexOf("**", i + 2);
      if (end === -1) {
        buf += c;
        i++;
        continue;
      }
      parts.push({ kind: "bold", value: text.slice(i + 2, end) });
      i = end + 2;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf) parts.push({ kind: "text", value: buf });
  return (
    <>
      {parts.map((p, idx) => {
        if (p.kind === "code")
          return (
            <code
              key={idx}
              className="px-1 py-[1px] rounded text-[12.5px]"
              style={{
                background: "var(--searchbar-bg)",
                fontFamily:
                  '"SF Mono", "JetBrains Mono", Menlo, ui-monospace, monospace',
              }}
            >
              {p.value}
            </code>
          );
        if (p.kind === "bold")
          return (
            <strong key={idx} className="font-semibold">
              {p.value}
            </strong>
          );
        return <span key={idx}>{p.value}</span>;
      })}
    </>
  );
}

type ReactNodePart =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "bold"; value: string };

/* ============================ Code view ============================ */

function CodeView({ body, language }: { body: string; language?: string }) {
  return (
    <pre
      className="px-6 py-5 text-[12.5px] leading-relaxed overflow-auto m-0"
      style={{
        fontFamily:
          '"SF Mono", "JetBrains Mono", Menlo, ui-monospace, monospace',
        color: "var(--window-text)",
        background: "var(--window-bg)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {language && (
        <div
          className="text-[10px] uppercase tracking-wide mb-2 opacity-50"
          style={{ color: "var(--window-text-muted)" }}
        >
          {language}
        </div>
      )}
      {body}
    </pre>
  );
}

/* ============================ Placeholders ============================ */

function ImageView({
  svgBody,
  caption,
}: {
  svgBody: string;
  caption?: string;
}) {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center px-6 py-6 gap-3"
      style={{ background: "#0f0f0f" }}
    >
      <div
        className="rounded-md shadow-2xl overflow-hidden [&>svg]:block [&>svg]:w-full [&>svg]:h-full"
        style={{
          width: "min(100%, 900px)",
          aspectRatio: "8 / 5",
        }}
        dangerouslySetInnerHTML={{ __html: svgBody }}
      />
      {caption && (
        <div className="text-[12px] text-white/55">{caption}</div>
      )}
    </div>
  );
}

function PdfView({ pages }: { pages: { title?: string; body: string }[] }) {
  return (
    <div
      className="w-full h-full overflow-auto px-8 py-8 flex flex-col items-center gap-6"
      style={{ background: "#2a2a2a" }}
    >
      {pages.map((page, i) => (
        <div
          key={i}
          className="w-full max-w-[640px] rounded-sm shadow-xl"
          style={{
            background: "#fdfdfd",
            color: "#1a1a1a",
            padding: "56px 64px",
            minHeight: "780px",
            fontFamily:
              '"Times New Roman", "Iowan Old Style", Georgia, serif',
          }}
        >
          {page.title && (
            <div
              className="text-[24px] font-bold tracking-tight mb-1"
              style={{ color: "#1a1a1a" }}
            >
              {page.title}
            </div>
          )}
          <PdfPageBody body={page.body} />
        </div>
      ))}
    </div>
  );
}

function PdfPageBody({ body }: { body: string }) {
  // Reuse the markdown parser/renderer but force serif-style spacing
  const blocks = parseMarkdown(body);
  return (
    <div className="text-[14px] leading-[1.6]" style={{ color: "#1a1a1a" }}>
      {blocks.map((b, i) => (
        <PdfBlock key={i} block={b} />
      ))}
    </div>
  );
}

function PdfBlock({ block }: { block: MdBlock }) {
  if (block.type === "h1")
    return (
      <h1
        className="text-[20px] font-bold mt-3 mb-2"
        style={{ color: "#1a1a1a" }}
      >
        {block.text}
      </h1>
    );
  if (block.type === "h2")
    return (
      <h2
        className="text-[16px] font-bold mt-5 mb-2 border-b pb-1"
        style={{ color: "#1a1a1a", borderColor: "#cfcfcf" }}
      >
        {block.text}
      </h2>
    );
  if (block.type === "h3")
    return (
      <h3
        className="text-[14px] font-bold mt-4 mb-1"
        style={{ color: "#1a1a1a" }}
      >
        {block.text}
      </h3>
    );
  if (block.type === "paragraph")
    return (
      <p className="my-2" style={{ color: "#1a1a1a" }}>
        <Inline text={block.text} />
      </p>
    );
  if (block.type === "list")
    return (
      <ul className="my-2 pl-5 list-disc space-y-1" style={{ color: "#1a1a1a" }}>
        {block.items.map((it, i) => (
          <li key={i}>
            <Inline text={it} />
          </li>
        ))}
      </ul>
    );
  if (block.type === "code")
    return (
      <pre
        className="my-2 px-3 py-2 rounded text-[12.5px]"
        style={{
          background: "#f3f3f3",
          fontFamily:
            '"SF Mono", "JetBrains Mono", Menlo, ui-monospace, monospace',
          color: "#1a1a1a",
        }}
      >
        {block.body}
      </pre>
    );
  return null;
}

function SlideView({ slides }: { slides: Slide[] }) {
  return (
    <div
      className="w-full h-full overflow-auto py-8 px-8 flex flex-col items-center gap-6"
      style={{ background: "#1c1c1e" }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className="w-full max-w-[800px] rounded-xl overflow-hidden shadow-2xl flex-shrink-0"
          style={{ aspectRatio: "16 / 9" }}
        >
          {slide.isTitleSlide ? (
            <div
              className="w-full h-full flex flex-col items-center justify-center px-16 text-center"
              style={{
                background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0c29 100%)",
              }}
            >
              <div
                className="text-[36px] font-bold tracking-tight leading-tight text-white mb-4"
              >
                {slide.title}
              </div>
              {slide.subtitle && (
                <div className="text-[18px] text-white/60">{slide.subtitle}</div>
              )}
            </div>
          ) : (
            <div
              className="w-full h-full flex flex-col px-12 pt-10 pb-8"
              style={{ background: "#ffffff" }}
            >
              <div
                className="text-[24px] font-bold tracking-tight text-[#1a1a1a] pb-4 mb-5 border-b-2 border-[#0a72e0]"
              >
                {slide.title}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {slide.bullets && slide.bullets.length > 0 && (
                  <ul className="space-y-3">
                    {slide.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-3 text-[15px] text-[#1a1a1a]">
                        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: "#0a72e0" }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {slide.body && (
                  <p className="text-[15px] text-[#333] leading-relaxed">{slide.body}</p>
                )}
              </div>
              <div className="text-right text-[11px] text-gray-300">{i + 1}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BinaryPlaceholder({ body }: { body: string }) {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center gap-3 px-8"
      style={{ color: "var(--window-text-muted)" }}
    >
      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
        <rect
          x="10"
          y="6"
          width="44"
          height="52"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <line
          x1="20"
          y1="20"
          x2="44"
          y2="20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="30"
          x2="44"
          y2="30"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="40"
          x2="36"
          y2="40"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <div className="text-[13px]" style={{ color: "var(--window-text)" }}>
        {body}
      </div>
      <div className="text-[12px] opacity-70">
        This file type can&rsquo;t be previewed.
      </div>
    </div>
  );
}
