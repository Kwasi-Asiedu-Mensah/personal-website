#!/usr/bin/env node
/**
 * Fetches iTunes metadata for the curated library — the new on-repeat
 * AratheJay set plus the all-time / favorites picks plus a few
 * diversifiers (Frank Ocean, Tame Impala, Bad Bunny, Rosalía, Marvin
 * Gaye, Black Coffee). Writes results to `scripts/library-tracks.json`.
 *
 * Run from the project root:
 *   node scripts/build-library.mjs
 *
 * Songs already integrated by the previous on-repeat run (popstar,
 * iplan, the Clipse trio, etc.) are NOT re-fetched here — those entries
 * live in lib/music-data.ts already and stay intact.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "library-tracks.json");

const SONGS = [
  // ───────── on repeat ─────────
  { search: "Zion AratheJay" },
  { search: "Ara No Dey Sleep AratheJay" },
  { search: "Put Am On God AratheJay" },

  // ───────── all-time picks (your list, curated) ─────────
  { search: "Gone Girl 4:14 Obongjayar Sarz" },
  { search: "Beg You Vybz Kartel" },
  { search: "Welcome Home Osibisa" },
  { search: "FUN Rema" },
  { search: "The Morning Weeknd House of Balloons" },
  { search: "Obra DarkoVibes Mac M" },
  { search: "Ranger Joey B Darkovibes" },
  { search: "Tonight Nonso Amadi" },
  { search: "Plastic 100 Sampha Process" },
  { search: "5 Percent Tint Travis Scott Astroworld", fallbacks: ["5% TINT Travis Scott"] },
  { search: "Sunshine Joey B Darryl" },
  { search: "PCH Jaden CTV2" },
  { search: "Kora Sings Sampha Process" },
  { search: "Marvins Room Drake Take Care" },
  { search: "Slime You Out Drake SZA" },
  { search: "XSCAPE Don Toliver Life of a DON" },
  { search: "Better Now Post Malone beerbongs bentleys" },
  { search: "Adorn Miguel Kaleidoscope Dream" },
  { search: "Wake Me Up Avicii True" },
  { search: "Let Her Go Acoustic Passenger" },
  { search: "Sky Walker Miguel Travis Scott" },
  { search: "GOLD BROCKHAMPTON SATURATION" },
  { search: "Devil Knocking Kwesi Arthur Nkrumah Krom" },
  { search: "Yaw Ming La Meme Gang Spacely KwakuBs" },
  { search: "Beautiful Bazzi Cosmic" },
  { search: "Pretty Little Fears 6LACK J Cole" },
  { search: "Delay Tibu" },
  { search: "Butterfly Effect Travis Scott" },
  { search: "when the partys over Billie Eilish" },
  { search: "Faith The Weeknd After Hours" },
  { search: "John Redcorn SiR Chasing Summer" },
  { search: "Barefoot in the Park James Blake Rosalia" },
  { search: "Kemor Ame La Meme Gang" },
  { search: "Six Paths Dave" },
  { search: "Shade KwakuBs DarkoVibes ABU" },
  { search: "Niagara Falls Weeknd Hurry Up Tomorrow" },
  { search: "Homecoming Kanye West Chris Martin Graduation" },
  { search: "Good Morning Kanye West Graduation" },
  { search: "Runaway Kanye West Pusha T MBDTF" },
  { search: "Monster Kanye West Jay Z Nicki Minaj" },
  { search: "Slow Dancing in the Dark Joji Ballads 1" },
  { search: "Hand of God Outro Jon Bellion Human Condition" },
  { search: "Money Trees Kendrick Lamar Jay Rock" },
  { search: "Remember Asake Work of Art" },

  // ───────── diversifiers (Claude's picks, to broaden the palette) ─────────
  { search: "Self Control Frank Ocean Blonde" },
  { search: "The Less I Know the Better Tame Impala Currents" },
  { search: "Titi Me Pregunto Bad Bunny Un Verano Sin Ti" },
  { search: "MALAMENTE Rosalia El Mal Querer" },
  { search: "Whats Going On Marvin Gaye" },
  { search: "Drive Black Coffee Pieces of Me David Guetta" },
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
      _debug: { query: found.query, search: entry.search },
    };
    out.push(track);
    console.log(`✓ ${r.trackName} — ${r.artistName}`);

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
