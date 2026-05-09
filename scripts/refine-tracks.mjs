#!/usr/bin/env node
/**
 * Second pass at iTunes for the songs the original `build-library.mjs`
 * either missed or matched to the wrong track. Each entry uses a more
 * specific query (often pulling in album name or featured artists) plus
 * one or more fallbacks so a near-miss still finds something.
 *
 * Run from the project root:
 *   node scripts/refine-tracks.mjs
 *
 * Output: `scripts/refine-tracks.json`. We'll integrate from there.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "refine-tracks.json");

const SONGS = [
  // ── 4 wrong matches (asked to redo) ──
  // "Beg You" (Vybz Kartel) → got "It Bend Like Banana" last time
  {
    search: "Beg You A Fuck Vybz Kartel Remastered",
    fallbacks: [
      "Vybz Kartel Beg You Remastered",
      "Beg You Vybz Kartel single",
    ],
  },
  // "Ranger" (Joey B feat. Darkovibes) → got "My Size" last time
  {
    search: "Ranger Joey B Darryl Darkovibes",
    fallbacks: ["Joey B Ranger Darryl album", "Ranger Joey B feat Darkovibes"],
  },
  // "Delay" (Tibu) → got "Smile" by Magnom last time
  {
    search: "Tibu Delay single",
    fallbacks: ["Delay Tibu Worldwide", "Tibu Delay 2018"],
  },
  // "Devil Knocking" (Kwesi Arthur) → got "Nobody" last time
  {
    search: "Devil Knocking Kwesi Arthur Live from Nkrumah Krom",
    fallbacks: [
      "Kwesi Arthur Devil Knocking",
      "Devil Knocking Kwesi Arthur EP",
    ],
  },

  // ── 7 no-matches (retrying, in case you want them) ──
  // Put Am On God — AratheJay
  {
    search: "Put Am On God AratheJay",
    fallbacks: ["AratheJay Put Am On God", "Put Am On God Ara The Jay"],
  },
  // GOLD — BROCKHAMPTON (definitely on iTunes, query just whiffed)
  {
    search: "Brockhampton Gold Saturation",
    fallbacks: ["Brockhampton Gold", "Gold Brockhampton Kevin Abstract"],
  },
  // Yaw Ming — La Même Gang
  {
    search: "Yaw Ming La Meme Tape",
    fallbacks: ["Yaw Ming Spacely La Meme Gang", "Yaw Ming KwakuBs"],
  },
  // Kemor Ame — La Même Gang
  {
    search: "Kemor Ame La Meme Tape Linksters",
    fallbacks: ["Kemor Ame Darkovibes RJZ", "Kemor Ame La Meme Gang"],
  },
  // Shade — KwakuBs
  {
    search: "Shade KwakuBs Darkovibes ABU",
    fallbacks: ["KwakuBs Shade single", "Shade KwakuBs feat ABU"],
  },
  // What's Going On — Marvin Gaye (definitely on iTunes)
  {
    search: "Marvin Gaye Whats Going On",
    fallbacks: [
      "Whats Going On Marvin Gaye 1971",
      "What's Going On Marvin Gaye album",
    ],
  },
  // Drive — Black Coffee (probably feat. David Guetta + Delilah Montagu)
  {
    search: "Black Coffee Drive Subconsciously David Guetta Delilah Montagu",
    fallbacks: [
      "Drive Black Coffee David Guetta Delilah",
      "Black Coffee Drive 2021",
    ],
  },
];

/* ============================== Helpers ============================== */

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function upscaleArt(url) {
  if (!url) return "";
  return url.replace(/\d+x\d+bb/, "600x600bb");
}

async function searchOnce(term) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term
  )}&entity=song&limit=3`; // fetch top 3 — helps spot near-misses
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`iTunes API error ${res.status} for "${term}"`);
  }
  const data = await res.json();
  return data.results ?? [];
}

async function searchWithFallbacks(entry) {
  const queries = [entry.search, ...(entry.fallbacks ?? [])];
  for (const q of queries) {
    try {
      const results = await searchOnce(q);
      if (results.length > 0) {
        // Take the top result — the higher limit was just for our debug
        // visibility. If you want to inspect alternates, look at the
        // _candidates array in the output JSON.
        return { result: results[0], query: q, candidates: results };
      }
    } catch (e) {
      console.warn(`  ! "${q}" failed: ${e.message}`);
    }
  }
  return null;
}

/* ================================ Main ================================ */

async function main() {
  console.log(`Refining ${SONGS.length} tracks via iTunes...\n`);

  const out = [];
  const seenIds = new Set();

  for (let i = 0; i < SONGS.length; i++) {
    const entry = SONGS[i];
    const num = String(i + 1).padStart(2, "0");
    process.stdout.write(`[${num}/${SONGS.length}] ${entry.search} ... `);

    const found = await searchWithFallbacks(entry);
    if (!found) {
      console.log("✗ no match");
      out.push({ search: entry.search, error: "no-match" });
      continue;
    }
    const r = found.result;

    let id = slugify(r.trackName);
    if (seenIds.has(id)) id = slugify(`${r.trackName}-${r.artistName}`);
    let n = 2;
    while (seenIds.has(id)) {
      id = `${slugify(r.trackName)}-${n++}`;
    }
    seenIds.add(id);

    const track = {
      id,
      title: r.trackName,
      artist: r.artistName,
      album: r.collectionName,
      duration: Math.round((r.trackTimeMillis ?? 0) / 1000) || undefined,
      albumArt: upscaleArt(r.artworkUrl100),
      previewUrl: r.previewUrl ?? "",
      _debug: {
        query: found.query,
        search: entry.search,
        // Top 3 candidates so you can sanity-check before integration.
        _candidates: found.candidates.map((c) => ({
          name: c.trackName,
          artist: c.artistName,
          album: c.collectionName,
        })),
      },
    };
    out.push(track);
    console.log(`✓ ${r.trackName} — ${r.artistName}`);

    await new Promise((res) => setTimeout(res, 200));
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2), "utf8");

  const ok = out.filter((t) => !t.error).length;
  const failed = out.length - ok;
  console.log(
    `\n✓ Wrote ${ok} tracks to ${path.relative(process.cwd(), OUTPUT_PATH)}`
  );
  if (failed) {
    console.log(
      `! ${failed} track(s) failed — see entries with "error" in the JSON.`
    );
  }
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
