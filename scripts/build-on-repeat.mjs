#!/usr/bin/env node
/**
 * Fetches iTunes metadata (preview URL, album art, duration, canonical
 * title/artist/album) for every song in the on-repeat list below and
 * writes the resolved data to `scripts/on-repeat-tracks.json`.
 *
 * Run from the project root:
 *   node scripts/build-on-repeat.mjs
 *
 * Once it completes, the output JSON gets consumed to update both
 * `lib/music-data.ts` (TRACKS + the on-repeat playlist) and the
 * on-repeat note in `lib/notes-data.ts`.
 *
 * Why a script and not a runtime API call: the iTunes Search API isn't
 * on the Cowork sandbox's network allowlist, but your local machine has
 * unrestricted internet, so this runs fine on you.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "on-repeat-tracks.json");

/**
 * Each entry becomes one track. `search` is the iTunes search query,
 * `note` is a freeform comment carried through to the output (handy for
 * tracking why something was picked, e.g. "from Clarity of Mind album").
 */
const SONGS = [
  { search: "Popstar Black Sherif" },
  { search: "e85 Don Toliver" },
  { search: "Secondhand Don Toliver Rema" },
  // Asake — the user wrote "M$Ney". Try the literal first, then fall
  // back to a popular Asake track if iTunes can't find it.
  { search: "M$Ney Asake", fallbacks: ["Money Asake", "Asake hits"] },
  { search: "iplan Dlala Thukzin Zaba Sykes" },
  { search: "Bengicela Mawhoo Jazzwrld" },
  { search: "uValo Jazzwrld Thukuthela Dlala Thukzin" },
  { search: "isaka 6am Ciza Jazzwrld" },
  { search: "all my money Kashcoming" },
  { search: "hello hello Kashcoming Mavo" },
  { search: "tumo weto Mavo" },
  { search: "Nakupenda TxC Davido Scotts Maphuma" },
  { search: "3x Jim Legxacy Dave" },
  { search: "Rick Owens Ufo361 Ken Carson" },
  { search: "flight's booked Drake" },
  { search: "Holier Showbiz Olli P Odeal" },
  // Omah Lay — Clarity of Mind album, fav: "Coping Mechanism"
  { search: "Coping Mechanism Omah Lay" },
  { search: "Levels BigxthaPlug" },
  { search: "Pearls Sade" },
  { search: "narco Blasterjaxx Timmy Trumpet" },
  { search: "Hay Lupita Lomiiel" },
  { search: "Ama Gear Dlala Thukzin Funky Qla" },
  { search: "Lagos Seyi Vibes" },
  // Clipse — Let God Sort Em Out album, three favs
  { search: "Ace Trumpets Clipse" },
  { search: "F.I.C.O. Clipse Pusha T" },
  { search: "So Far Ahead Clipse" },
];

/* ============================== Helpers ============================== */

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function upscaleArt(url) {
  if (!url) return "";
  // iTunes art URLs end in 100x100bb; upgrade to 600x600bb for crispness.
  return url.replace(/\d+x\d+bb/, "600x600bb");
}

async function searchOnce(term) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term
  )}&entity=song&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`iTunes API error ${res.status} for "${term}"`);
  }
  const data = await res.json();
  return data.results?.[0] ?? null;
}

async function searchWithFallbacks(entry) {
  const queries = [entry.search, ...(entry.fallbacks ?? [])];
  for (const q of queries) {
    try {
      const r = await searchOnce(q);
      if (r) return { result: r, query: q };
    } catch (e) {
      console.warn(`  ! "${q}" failed: ${e.message}`);
    }
  }
  return null;
}

/* ================================ Main ================================ */

async function main() {
  console.log(`Fetching ${SONGS.length} tracks from iTunes...\n`);

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

    // Stable id from title; if collision, append artist slug.
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
      // Echo back so we can debug what query produced this track.
      _debug: { query: found.query, search: entry.search },
    };
    out.push(track);
    console.log(`✓ ${r.trackName} — ${r.artistName}`);

    // Be polite — iTunes API doesn't publish a rate limit but it's
    // shared. 200ms between calls keeps things gentle.
    await new Promise((res) => setTimeout(res, 200));
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2), "utf8");

  const ok = out.filter((t) => !t.error).length;
  const failed = out.length - ok;
  console.log(`\n✓ Wrote ${ok} tracks to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  if (failed) {
    console.log(`! ${failed} track(s) failed — see entries with "error" in the JSON.`);
  }
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
