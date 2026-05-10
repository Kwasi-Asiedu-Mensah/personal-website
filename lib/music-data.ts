/**
 * Music library — the manifest you edit.
 *
 * Two ways to source a track:
 *   1. **URL preview** (default): set `previewUrl` to a full URL of the
 *      audio file. Apple's iTunes audio previews work great for this —
 *      they're CORS-friendly, ~30s, and the album-art URL pattern is
 *      consistent. Most tracks here use that approach.
 *   2. **Local file**: drop the MP3 at `/public/music/<file>.mp3` and
 *      set `file` (without extension) on the track. Drop the cover at
 *      `/public/music/art/<file>.png` (also without extension) and set
 *      `albumArt` to that path, OR leave `albumArt` empty for a
 *      gradient fallback.
 *
 * Both modes can coexist in the same playlist. Player resolves the
 * audio source via `trackAudioUrl()` below.
 */

export type Track = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  /** Optional. Filled in by the audio element's `loadedmetadata` event if absent. */
  duration?: number;
  /** Full URL to album art (recommended) OR a local path under /public. */
  albumArt?: string;
  /**
   * Full URL to the audio (e.g. an iTunes preview). Takes precedence over
   * `file` when both are set.
   */
  previewUrl?: string;
  /** Filename basename for local MP3s (no extension, no folder). */
  file?: string;
};

export type Playlist = {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  /** Optional cover image override. If absent, falls back to first track's art. */
  coverArt?: string;
  /** Track ids in playlist order. */
  trackIds: string[];
};

/* ============================== Tracks =============================== */

/**
 * Track manifest. Each entry's iTunes preview was fetched via
 * `scripts/build-library.mjs` — re-run that script to add more tracks.
 */
export const TRACKS: Track[] = [
  // ───────── on-repeat keepers (heavy rotation, also referenced by the
  // on-repeat note) ─────────
  {
    id: "popstar",
    title: "PopStar",
    artist: "Black Sherif",
    album: "PopStar - Single",
    duration: 157,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5a/78/a1/5a78a145-432c-9578-d3a9-6f8892127625/199316527261_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2a/31/e4/2a31e4d8-7429-5522-04fa-50be927424a0/mzaf_16012250714024460748.plus.aac.p.m4a",
  },
  {
    id: "gratitude",
    title: "Gratitude",
    artist: "Asake",
    album: "M$NEY",
    duration: 170,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/31/e4/eb/31e4ebf4-97bd-c193-59c7-1b72ed7ab53a/ticket.wlorjbae.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9f/05/52/9f0552e5-8d75-cb72-f6bd-098ef8441cf2/mzaf_214968037439787785.plus.aac.p.m4a",
  },
  {
    id: "iplan-feat-zaba-sykes",
    title: "iPlan (feat. Zaba & Sykes)",
    artist: "Dlala Thukzin",
    album: "Permanent Music 3",
    duration: 411,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/93/22/1a/93221a4b-8d8a-cedd-3c1e-48184704b7e2/6009553432638_Cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/b1/94/f6/b194f61e-c242-3576-9431-733357ce3e88/mzaf_3539961985164016889.plus.aac.p.m4a",
  },
  {
    id: "bengicela-feat-jazzwrld",
    title: "Bengicela (feat. JAZZWRLD)",
    artist: "MaWhoo, GL_Ceejay & Thukuthela",
    album: "Bengicela (feat. JAZZWRLD) - Single",
    duration: 358,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/68/90/0f/68900fca-16c6-5786-ed8c-8b6f3a694192/766214681045.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8d/4c/82/8d4c826b-eec4-566c-64fa-8ef5deea332c/mzaf_12333403197927753537.plus.aac.p.m4a",
  },
  {
    id: "uvalo-feat-dlala-thukzin",
    title: "uValo (feat. Dlala Thukzin)",
    artist: "JAZZWRLD, Thukuthela & Babalwa M",
    album: "uValo (feat. Dlala Thukzin) - Single",
    duration: 368,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8e/2e/83/8e2e837f-9e88-3f1d-a633-308f094079e1/199316151831_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6f/1e/2f/6f1e2f1d-812e-e67e-630a-8486556e4a0f/mzaf_16169032118500984350.plus.aac.p.m4a",
  },
  {
    id: "isaka-6am",
    title: "Isaka (6am)",
    artist: "Ciza, JAZZWRLD & Thukuthela",
    album: "Isaka (6am) - Single",
    duration: 350,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/18/7b/01/187b015a-cb82-a96e-4c76-d8c7e8810860/199350154188.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e9/71/40/e97140f3-e434-d21a-27d9-d7594eab09fe/mzaf_2034448601243832979.plus.aac.p.m4a",
  },
  {
    id: "all-my-money",
    title: "All My Money",
    artist: "Kashcoming",
    album: "More Kashcoming, Vol. 2 - EP",
    duration: 176,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4a/76/f2/4a76f2bc-8352-1e88-0000-7a5d8d129aa1/198704036873_Cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/64/df/50/64df5011-70b2-ffbc-b54b-171ad9fdf25d/mzaf_18181069658762787942.plus.aac.p.m4a",
  },
  {
    id: "hello-hello",
    title: "Hello Hello",
    artist: "Kashcoming & Mavo",
    album: "Hello Hello - Single",
    duration: 156,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e5/ff/5d/e5ff5d75-b852-7839-9606-077b80328060/198704703416_Cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/25/af/4525af73-c4e9-b04e-9d8b-5ac548f51036/mzaf_17778490746709535529.plus.aac.p.m4a",
  },
  {
    id: "tumo-weto",
    title: "Tumo Weto",
    artist: "Mavo",
    album: "Ukanigbe",
    duration: 169,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/92/68/8d/92688d24-7e61-a51a-8b94-7cdd28396e90/0.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/07/93/09/0793093d-b19b-e691-bae4-ced1875ad974/mzaf_11153866798219803007.plus.aac.p.m4a",
  },
  {
    id: "coping-mechanism",
    title: "COPING MECHANISM",
    artist: "OMAH LAY & ELMAH",
    album: "CLARITY OF MIND",
    duration: 169,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/ba/a2/f5baa24e-d8bf-5fd0-96d6-6c9ce110f4d3/093624824176.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1e/dc/ad/1edcad80-f730-6605-ae0a-438090548e09/mzaf_1822984479506147206.plus.aac.p.m4a",
  },
  {
    id: "pearls",
    title: "Pearls",
    artist: "Sade",
    album: "Love Deluxe",
    duration: 273,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/18/c8/d7/18c8d7bc-8491-09e6-df0d-6e0a83ead680/mzi.wsikzifg.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/30/0d/61/300d6101-c0c5-73b9-9371-703aea39768d/mzaf_10580549982165026105.plus.aac.p.m4a",
  },
  {
    id: "hay-lupita",
    title: "HAY LUPITA",
    artist: "Lomiiel",
    album: "HAY LUPITA - Single",
    duration: 106,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dc/05/b8/dc05b8b0-6e7a-ae70-523b-1b3c3fe297f7/198470540758_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/aa/2a/a7/aa2aa7d5-8c71-cccc-13f3-7421821532b4/mzaf_17899649960417947349.plus.aac.p.m4a",
  },
  {
    id: "ama-gear-feat-mk-productions",
    title: "Ama Gear (feat. MK Productions)",
    artist: "Dlala Thukzin, Funky Qla & Zee Nxumalo",
    album: "031 Studio Camp - Single",
    duration: 425,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/33/3d/55333dd8-6555-8316-093e-55762d5fdcfb/6009553443887_Cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3d/62/ee/3d62ee5e-4cc3-9f0d-fd2a-663a645ce0c1/mzaf_14680392374681353971.plus.aac.p.m4a",
  },
  {
    id: "ace-trumpets",
    title: "Ace Trumpets",
    artist: "Clipse, Pusha T & Malice",
    album: "Let God Sort Em Out",
    duration: 154,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3b/a4/97/3ba497f7-a590-6e1a-01ae-7f34169018ed/1625.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9d/bb/91/9dbb919b-52b3-689d-7c92-55813e0481e6/mzaf_2498981526127007892.plus.aac.p.m4a",
  },
  {
    id: "f-i-c-o",
    title: "F.I.C.O.",
    artist: "Clipse, Stove God Cooks, Pusha T & Malice",
    album: "Let God Sort Em Out",
    duration: 202,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3b/a4/97/3ba497f7-a590-6e1a-01ae-7f34169018ed/1625.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2a/13/22/2a132294-5a63-95a4-ad6f-c5d4e5c52b8e/mzaf_6956982800666733283.plus.aac.p.m4a",
  },
  {
    id: "so-far-ahead",
    title: "So Far Ahead",
    artist: "Clipse, Pharrell Williams, Pusha T & Malice",
    album: "Let God Sort Em Out",
    duration: 202,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3b/a4/97/3ba497f7-a590-6e1a-01ae-7f34169018ed/1625.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/80/26/0a/80260a38-06bf-b372-087f-ab72b44d6346/mzaf_13753551253534937124.plus.aac.p.m4a",
  },

  // ───────── new on-repeat additions (AratheJay) ─────────
  {
    id: "zion",
    title: "Zion",
    artist: "AratheJay",
    album: "The Odyssey",
    duration: 175,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/b0/bd/e2b0bde9-1130-75d6-2ee3-e080e7f8a64a/199538955651.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/58/3b/1e/583b1e87-4cea-695a-bd78-0066355b3e03/mzaf_9217654270632273663.plus.aac.p.m4a",
  },
  {
    id: "ara-no-dey-sleep",
    title: "Ara No Dey Sleep",
    artist: "AratheJay",
    album: "The Odyssey",
    duration: 192,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/b0/bd/e2b0bde9-1130-75d6-2ee3-e080e7f8a64a/199538955651.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/e1/3c/4be13c94-3f15-c2cc-73a9-6c743efe8e87/mzaf_7029756274193460351.plus.aac.p.m4a",
  },

  // ───────── all-time / favorites ─────────
  {
    id: "gone-girl",
    title: "Gone Girl",
    artist: "Obongjayar & Sarz",
    album: "Sweetness - EP",
    duration: 254,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/77/49/24/7749247a-8579-29c9-81c5-cefa5df23779/196292113969.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a4/00/2b/a4002bdc-d8c6-f45e-547d-105205f95123/mzaf_13801715977932529026.plus.aac.p.m4a",
  },
  {
    id: "welcome-home",
    title: "Welcome Home",
    artist: "Osibisa",
    album: "Sunshine Day - The Pye/Bronze Anthology",
    duration: 255,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/9a/ec/78/9aec785d-9ee6-0434-3a71-a13547b21d74/5414939925061.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/b8/b3/c0/b8b3c091-554a-35df-ee7f-42b91486d456/mzaf_18369198927707130018.plus.aac.p.m4a",
  },
  {
    id: "fun",
    title: "FUN",
    artist: "Rema",
    album: "FUN - Single",
    duration: 189,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/54/40/4b/54404b26-54a2-3b3c-3dcd-1b60c67605f5/25UM1IM20648.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/aa/e3/47/aae34760-cffb-0ac4-30a2-6cabe06fee63/mzaf_2185599351128826358.plus.aac.p.m4a",
  },
  {
    id: "the-morning-live",
    title: "The Morning (Live)",
    artist: "The Weeknd",
    album: "Live At SoFi Stadium",
    duration: 200,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/03/2d/c1/032dc13a-dce4-672a-b501-d16d3b31be07/23UMGIM20988.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8b/95/dd/8b95ddea-b54d-b081-8bde-7ea8b73fa072/mzaf_10723066349386508326.plus.aac.p.m4a",
  },
  {
    id: "obra-feat-mac-m",
    title: "Obra (feat. Mac M)",
    artist: "DarkoVibes",
    album: "Obra (feat. Mac M) - Single",
    duration: 244,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b2/68/67/b268679c-95a6-de45-35b3-26a54f83b3f9/766214665076.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/82/53/f8/8253f8a5-144e-2c0b-29bc-e693e65944a5/mzaf_6468879000990296041.plus.aac.p.m4a",
  },
  {
    id: "tonight",
    title: "Tonight",
    artist: "Nonso Amadi",
    album: "Tonight - Single",
    duration: 237,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1b/d1/87/1bd187cf-b5d8-ca32-0a34-3b279ea37b33/5054960019669_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b3/11/a6/b311a63b-9eb3-ddf1-9134-3c1eb7530b63/mzaf_12596094618678932732.plus.aac.p.m4a",
  },
  {
    id: "plastic-100-c",
    title: "Plastic 100°C",
    artist: "Sampha",
    album: "Process",
    duration: 316,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/95/8d/ed/958ded66-ec58-2347-caa3-dfa2c0e417e1/889030015860.png/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/dd/fe/c9/ddfec95e-3754-ee3d-2036-262d165aa848/mzaf_6166519756992547263.plus.aac.p.m4a",
  },
  {
    id: "yosemite",
    title: "YOSEMITE",
    artist: "Travis Scott",
    album: "ASTROWORLD",
    duration: 150,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/30/66/90/306690d4-2a29-402e-e406-6b319ce7731a/886447227169.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/d9/8d/e8/d98de86e-b1e8-4262-1741-695c9c4c2d75/mzaf_8199446383486090854.plus.aac.p.m4a",
  },
  {
    id: "sunshine",
    title: "Sunshine",
    artist: "Joey B",
    album: "Darryl",
    duration: 135,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/ee/2e/f9/ee2ef933-4af8-83ba-d064-20401fd83f6e/cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/06/07/7d/06077d3f-c837-772a-c2b1-a09822987746/mzaf_15423081998379118089.plus.aac.p.m4a",
  },
  {
    id: "pch",
    title: "PCH",
    artist: "Jaden",
    album: "CTV2",
    duration: 351,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ed/72/c3/ed72c390-33d2-fa17-9c82-d2475e01bf50/CTV2-artwork.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/75/b2/1f/75b21f17-75aa-975a-1b12-44292c6c7a84/mzaf_1529053728645723274.plus.aac.p.m4a",
  },
  {
    id: "kora-sings",
    title: "Kora Sings",
    artist: "Sampha",
    album: "Process",
    duration: 258,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/95/8d/ed/958ded66-ec58-2347-caa3-dfa2c0e417e1/889030015860.png/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/68/7d/a2/687da27f-9aba-05d0-9706-cfb68e780359/mzaf_4981779018777806895.plus.aac.p.m4a",
  },
  {
    id: "take-care-feat-rihanna",
    title: "Take Care (feat. Rihanna)",
    artist: "Drake",
    album: "Take Care (Deluxe Version)",
    duration: 277,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/d2/53/62/d2536245-b94c-b3fd-7168-9512f655f6d4/00602527899091.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/41/ad/df/41addf10-dff4-06f6-9109-fd24959cba0f/mzaf_3571059677903912007.plus.aac.p.m4a",
  },
  {
    id: "slime-you-out-feat-sza",
    title: "Slime You Out (feat. SZA)",
    artist: "Drake",
    album: "For All The Dogs",
    duration: 310,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/fa/9e/e6/fa9ee672-0880-2b5b-a69d-981e8fcb807e/23UM1IM09863.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7a/31/4d/7a314d17-abf6-d322-e04c-f04aa9f13a9c/mzaf_8166785415651777298.plus.aac.p.m4a",
  },
  {
    id: "xscape",
    title: "XSCAPE",
    artist: "Don Toliver",
    album: "Life of a DON",
    duration: 156,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/05/3d/b1053d96-a026-324e-9322-decf3836ac1f/075679766335.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/fc/b6/3b/fcb63b9e-2f18-3253-7c0e-30341980194b/mzaf_1557324327214418975.plus.aac.p.m4a",
  },
  {
    id: "better-now",
    title: "Better Now",
    artist: "Post Malone",
    album: "beerbongs & bentleys",
    duration: 231,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/55/9f/fb/559ffb75-3c00-abd6-7b1f-8b6b1518b173/18UMGIM22101.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a1/2a/06/a12a0675-58e5-c404-5f55-64f0b7058f42/mzaf_4757445611632570860.plus.aac.p.m4a",
  },
  {
    id: "adorn",
    title: "Adorn",
    artist: "Miguel",
    album: "Kaleidoscope Dream",
    duration: 193,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a1/56/ac/a156acb2-068e-a616-3e56-86ca656c14ce/886443632943.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/13/51/661351bf-a3a1-3c96-4c66-04cd3144a19a/mzaf_13243965223855913867.plus.aac.p.m4a",
  },
  {
    id: "wake-me-up",
    title: "Wake Me Up",
    artist: "Avicii",
    album: "True",
    duration: 250,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/18/5b/1e/185b1ef5-5d97-19d8-aebf-8e29e41874ef/13UAAIM59255.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/1e/60/681e601f-e1f2-4ebb-37de-adf00bdf57b6/mzaf_8266263075137964740.plus.aac.p.m4a",
  },
  {
    id: "let-her-go-acoustic",
    title: "Let Her Go (feat. Ed Sheeran) [Anniversary Edition Acoustic]",
    artist: "Passenger",
    album: "All The Little Lights (Anniversary Edition)",
    duration: 256,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1f/82/52/1f8252d9-d3f1-3deb-2989-58155494ede4/067003148856.png/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/72/cb/f6/72cbf6f1-f42f-83e3-f16b-8c396e5bc40e/mzaf_10236295888113702894.plus.aac.p.m4a",
  },
  {
    id: "sky-walker-feat-travis-scott",
    title: "Sky Walker (feat. Travis Scott)",
    artist: "Miguel",
    album: "War & Leisure",
    duration: 259,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/26/56/cd/2656cd50-73a3-998f-2204-9342b805f517/886446846255.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ed/d9/63/edd96313-326d-b9fc-7113-fb28598bb097/mzaf_2685631611705947754.plus.aac.p.m4a",
  },
  {
    id: "beautiful",
    title: "Beautiful",
    artist: "Bazzi",
    album: "COSMIC",
    duration: 178,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/7c/98/07/7c98072e-e826-d77c-e829-daa87f5706b9/075679874580.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/6b/db/c36bdb4b-34da-80fb-9950-1f5b62e53cca/mzaf_12210567977961127566.plus.aac.p.m4a",
  },
  {
    id: "pretty-little-fears-feat-j-cole",
    title: "Pretty Little Fears (feat. J. Cole)",
    artist: "6LACK",
    album: "East Atlanta Love Letter",
    duration: 240,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/91/da/16/91da164f-f447-115a-a88f-514927f8416e/18UMGIM53418.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a7/23/56/a72356a3-40a1-68b4-f45d-01eaf3bba082/mzaf_7680742769854719757.plus.aac.p.m4a",
  },
  {
    id: "butterfly-effect",
    title: "BUTTERFLY EFFECT",
    artist: "Travis Scott",
    album: "ASTROWORLD",
    duration: 191,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/30/66/90/306690d4-2a29-402e-e406-6b319ce7731a/886447227169.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/50/de/cf/50decf79-548e-cb82-d9c3-389b805f3d99/mzaf_12127657751890989044.plus.aac.p.m4a",
  },
  {
    id: "when-the-party-s-over",
    title: "when the party's over",
    artist: "Billie Eilish",
    album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
    duration: 196,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/19UMGIM05028.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2a/ba/44/2aba4410-ba71-89ce-e075-10120409c31c/mzaf_16887001963655152332.plus.aac.p.m4a",
  },
  {
    id: "after-hours",
    title: "After Hours",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 361,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/54/2b/61/542b6133-80f7-f30f-4dcf-059490db9d84/mzaf_1539067797902127760.plus.aac.p.m4a",
  },
  {
    id: "john-redcorn",
    title: "John Redcorn",
    artist: "SiR",
    album: "Chasing Summer",
    duration: 188,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/dc/aa/a8/dcaaa87d-8d60-d431-b203-f285cfa3d26c/886447892336_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/81/73/56/81735676-e90a-f3e6-81a7-793879dca38d/mzaf_12576928093647000312.plus.aac.p.m4a",
  },
  {
    id: "barefoot-in-the-park-feat-rosalia",
    title: "Barefoot in the Park (feat. ROSALÍA)",
    artist: "James Blake",
    album: "Assume Form",
    duration: 211,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/00/41/be00414f-e15d-a689-fe2b-89b156cc66e0/00602577391231.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/8e/86/2c/8e862c7c-2a33-6bf9-3c73-10cd8fac8d07/mzaf_599047564549022718.plus.aac.p.m4a",
  },
  {
    id: "six-paths",
    title: "Six Paths",
    artist: "Dave",
    album: "Six Paths - EP",
    duration: 223,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c5/9e/30/c59e3000-c357-dc1c-04ff-671312e4f4f7/5055831997574_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ff/e2/89/ffe289c1-d90b-808d-b735-7e19effa760c/mzaf_7561724447167010603.plus.aac.p.m4a",
  },
  {
    id: "niagara-falls",
    title: "Niagara Falls",
    artist: "The Weeknd",
    album: "Hurry Up Tomorrow",
    duration: 277,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/13/fd/a3/13fda38d-fc63-ddc3-1cf2-c09251adc532/25UMGIM09489.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f9/5d/90/f95d90db-d1e5-d518-e162-ce3e43b3c985/mzaf_13394827744360005478.plus.aac.p.m4a",
  },
  {
    id: "homecoming-feat-chris-martin",
    title: "Homecoming (feat. Chris Martin)",
    artist: "Kanye West",
    album: "Graduation",
    duration: 204,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/39/25/2d/39252d65-2d50-b991-0962-f7a98a761271/00602517483507.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a0/b6/ac/a0b6ac24-9509-19e7-85a7-0be507d17c02/mzaf_5643812388289006313.plus.aac.p.m4a",
  },
  {
    id: "good-morning",
    title: "Good Morning",
    artist: "Kanye West",
    album: "Graduation",
    duration: 195,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/39/25/2d/39252d65-2d50-b991-0962-f7a98a761271/00602517483507.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/cb/09/59/cb0959cd-fcc5-66a3-c293-ed58a7ad9c43/mzaf_7396332483720740039.plus.aac.p.m4a",
  },
  {
    id: "runaway-feat-pusha-t",
    title: "Runaway (feat. Pusha T)",
    artist: "Kanye West & Pusha T",
    album: "My Beautiful Dark Twisted Fantasy (Deluxe Edition)",
    duration: 548,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/37/da/7c/37da7cc5-2b6f-9bb8-30ba-8a8c3be3e16a/00602527584973.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/40/eb/e4/40ebe4ff-4fc7-bf69-3ce1-2cf8da97fc94/mzaf_98592928812732269.plus.aac.p.m4a",
  },
  {
    id: "monster",
    title: "Monster (feat. JAŸ-Z, Rick Ross, Nicki Minaj & Bon Iver)",
    artist: "Kanye West, JAŸ-Z, Rick Ross, Nicki Minaj & Bon Iver",
    album: "My Beautiful Dark Twisted Fantasy (Deluxe Edition)",
    duration: 379,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/37/da/7c/37da7cc5-2b6f-9bb8-30ba-8a8c3be3e16a/00602527584973.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/40/92/fc/4092fce7-d6be-69e2-4e16-a1fd64426c88/mzaf_8948386197541827675.plus.aac.p.m4a",
  },
  {
    id: "slow-dancing-in-the-dark",
    title: "SLOW DANCING IN THE DARK",
    artist: "Joji",
    album: "BALLADS 1",
    duration: 209,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7b/63/fd/7b63fdf0-31a7-ed7c-0449-ca3df4aec9dc/190296925382.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/cd/d2/1b/cdd21b71-a732-c5f7-3369-5b05ebdd8522/mzaf_9663238902315843917.plus.aac.p.m4a",
  },
  {
    id: "hand-of-god-outro",
    title: "Hand of God (Outro)",
    artist: "Jon Bellion",
    album: "The Human Condition",
    duration: 338,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ad/44/ea/ad44ea8b-af34-6628-8a86-65fa33c3ff82/16UMGIM28172.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/59/19/4b591966-a0fe-02bb-b2f2-59ad93757aef/mzaf_11074847438872180573.plus.aac.p.m4a",
  },
  {
    id: "money-trees-feat-jay-rock",
    title: "Money Trees (feat. Jay Rock)",
    artist: "Kendrick Lamar",
    album: "good kid, m.A.A.d city (Deluxe Version)",
    duration: 387,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/36/86/ec/3686ec99-dec4-0a01-8b74-2d8a9a0263a7/12UMGIM52988.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/be/7f/2f/be7f2fe2-41dd-6b9a-4957-a10ac5c62989/mzaf_17460900856492630846.plus.aac.p.m4a",
  },
  {
    id: "remember",
    title: "Remember",
    artist: "Asake",
    album: "Work Of Art",
    duration: 182,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cc/23/83/cc2383d9-eecc-f974-5f5b-d445c583acdb/197342233958_cover.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ae/d1/f5/aed1f575-1624-1414-b4b0-666e4eb1e4cf/mzaf_16514113868838400487.plus.aac.p.m4a",
  },

  {
    id: "adventure-of-a-lifetime",
    title: "Adventure of a Lifetime",
    artist: "Coldplay",
    album: "A Head Full of Dreams",
    duration: 264,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c8/0a/6d/c80a6df9-e55a-fb83-0311-f4776984ac67/mzm.lasidxkv.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/b9/78/7b/b9787b6d-2bcc-6fd7-231f-9e79b91d988e/mzaf_13866407877410073156.plus.aac.p.m4a",
  },
  {
    id: "i-want-you-back",
    title: "I Want You Back",
    artist: "Jackson 5",
    album: "Diana Ross Presents the Jackson 5",
    duration: 181,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/dc/5d/6d/dc5d6d8e-61dc-401b-80a6-c2a745fe048a/08UMGIM28826.rgb.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/51/c5/27/51c527f5-c9fd-8fc7-175b-53c365c13664/mzaf_7763659600534750503.plus.aac.p.m4a",
  },
  {
    id: "billie-jean",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 294,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/dc/bc/8a/dcbc8a3e-4ce1-c00d-cc02-eda2212053c7/mzaf_8347559338388601510.plus.aac.p.m4a",
  },

  // ───────── diversifiers (broader palette) ─────────
  {
    id: "self-control",
    title: "Self Control",
    artist: "Frank Ocean",
    album: "Blonde",
    duration: 250,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/45/68/bb4568f3-68cd-619d-fbcb-4e179916545d/BlondCover-Final.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ba/cc/4d/bacc4dda-b762-0c0a-5ef0-6c2fad1bdb5c/mzaf_8909701195572310967.plus.aac.p.m4a",
  },
  {
    id: "un-verano-sin-ti",
    title: "Un Verano Sin Ti",
    artist: "Bad Bunny",
    album: "Un Verano Sin Ti",
    duration: 148,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3e/04/eb/3e04ebf6-370f-f59d-ec84-2c2643db92f1/196626945068.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/29/21/aa/2921aa77-0a9b-4771-a6e9-2db85f177444/mzaf_11940520242658716528.plus.aac.p.m4a",
  },
  {
    id: "malamente",
    title: "MALAMENTE (Cap.1: Augurio)",
    artist: "ROSALÍA",
    album: "EL MAL QUERER",
    duration: 150,
    albumArt:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2c/55/e1/2c55e13f-15d8-1c7c-1826-c5fa55deaa8f/886447217139.jpg/600x600bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/46/56/69/46566970-f20e-553c-6db4-ce4934b49aa6/mzaf_16288982831865165666.plus.aac.p.m4a",
  },
];

/* ============================= Playlists ============================= */

export const PLAYLISTS: Playlist[] = [
  {
    id: "on-repeat",
    name: "On Repeat",
    emoji: "🎧",
    description: "what i'm playing right now",
    // The on-repeat note in lib/notes-data.ts links into specific tracks
    // via [label](music:<trackId>), so update both sides if you change
    // the ids here.
    trackIds: [
      "zion",
      "ara-no-dey-sleep",
      "popstar",
      "gratitude",
      "iplan-feat-zaba-sykes",
      "bengicela-feat-jazzwrld",
      "uvalo-feat-dlala-thukzin",
      "isaka-6am",
      "all-my-money",
      "hello-hello",
      "tumo-weto",
      "coping-mechanism",
      "hay-lupita",
      "ama-gear-feat-mk-productions",
      "ace-trumpets",
      "f-i-c-o",
      "so-far-ahead",
    ],
  },
  {
    id: "favorites",
    name: "Favorites",
    emoji: "🪐",
    description: "all-time. the canon.",
    trackIds: [
      "pearls",
      "iplan-feat-zaba-sykes",
      "gone-girl",
      "welcome-home",
      "fun",
      "the-morning-live",
      "obra-feat-mac-m",
      "tonight",
      "plastic-100-c",
      "yosemite",
      "sunshine",
      "pch",
      "kora-sings",
      "take-care-feat-rihanna",
      "slime-you-out-feat-sza",
      "xscape",
      "better-now",
      "adorn",
      "wake-me-up",
      "let-her-go-acoustic",
      "sky-walker-feat-travis-scott",
      "beautiful",
      "pretty-little-fears-feat-j-cole",
      "butterfly-effect",
      "when-the-party-s-over",
      "after-hours",
      "john-redcorn",
      "barefoot-in-the-park-feat-rosalia",
      "six-paths",
      "niagara-falls",
      "homecoming-feat-chris-martin",
      "good-morning",
      "runaway-feat-pusha-t",
      "monster",
      "slow-dancing-in-the-dark",
      "hand-of-god-outro",
      "money-trees-feat-jay-rock",
      "remember",
      "self-control",
      "un-verano-sin-ti",
      "malamente",
      "adventure-of-a-lifetime",
      "i-want-you-back",
      "billie-jean",
    ],
  },
  {
    id: "the-motherland",
    name: "The Motherland",
    emoji: "🌍",
    description: "gh, naija, the diaspora",
    trackIds: [
      "popstar",
      "all-my-money",
      "hello-hello",
      "tumo-weto",
      "obra-feat-mac-m",
      "sunshine",
      "welcome-home",
      "zion",
      "ara-no-dey-sleep",
      "fun",
      "gratitude",
      "remember",
      "gone-girl",
      "tonight",
    ],
  },
  {
    id: "3-step",
    name: "3 Step",
    emoji: "🪘",
    description: "south africa is having a moment",
    trackIds: [
      "iplan-feat-zaba-sykes",
      "bengicela-feat-jazzwrld",
      "uvalo-feat-dlala-thukzin",
      "isaka-6am",
      "ama-gear-feat-mk-productions",
    ],
  },
  {
    id: "slow-burns",
    name: "Slow Burns",
    emoji: "🌙",
    description: "for late nights",
    trackIds: [
      "pearls",
      "the-morning-live",
      "adorn",
      "pretty-little-fears-feat-j-cole",
      "john-redcorn",
      "slow-dancing-in-the-dark",
      "barefoot-in-the-park-feat-rosalia",
      "when-the-party-s-over",
      "self-control",
      "niagara-falls",
      "after-hours",
      "coping-mechanism",
      "plastic-100-c",
      "kora-sings",
    ],
  },
  {
    id: "the-rap-canon",
    name: "The Rap Canon",
    emoji: "🎤",
    description: "the ones that defined the era",
    trackIds: [
      "take-care-feat-rihanna",
      "slime-you-out-feat-sza",
      "xscape",
      "yosemite",
      "butterfly-effect",
      "runaway-feat-pusha-t",
      "monster",
      "homecoming-feat-chris-martin",
      "good-morning",
      "money-trees-feat-jay-rock",
      "ace-trumpets",
      "f-i-c-o",
      "so-far-ahead",
      "six-paths",
      "pch",
      "better-now",
    ],
  },
];

/* ============================== Helpers ============================== */

/** Resolve a track's playable audio URL. Prefers `previewUrl`, falls back to local. */
export function trackAudioUrl(track: Track): string {
  if (track.previewUrl) return track.previewUrl;
  if (track.file) return `/music/${track.file}.mp3`;
  return "";
}

/** Resolve a track's cover-art URL. Returns null if neither is set. */
export function trackArtUrl(track: Track): string | null {
  if (track.albumArt) return track.albumArt;
  if (track.file) return `/music/art/${track.file}.png`;
  return null;
}

/** Look up a track by id. Returns null if missing. */
export function getTrack(id: string): Track | null {
  return TRACKS.find((t) => t.id === id) ?? null;
}

/** Resolve a playlist into its tracks (skipping any unknown ids). */
export function getPlaylistTracks(playlist: Playlist): Track[] {
  return playlist.trackIds
    .map((id) => getTrack(id))
    .filter((t): t is Track => t !== null);
}

/** Group tracks by album, preserving manifest order within each album. */
export function tracksByAlbum(): { album: string; tracks: Track[] }[] {
  const map = new Map<string, Track[]>();
  for (const t of TRACKS) {
    const key = t.album ?? "Singles";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries()).map(([album, tracks]) => ({
    album,
    tracks,
  }));
}

/** Group tracks by artist, preserving manifest order within each artist. */
export function tracksByArtist(): { artist: string; tracks: Track[] }[] {
  const map = new Map<string, Track[]>();
  for (const t of TRACKS) {
    const key = t.artist;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries()).map(([artist, tracks]) => ({
    artist,
    tracks,
  }));
}

/** Format seconds as `M:SS`. NaN-safe (returns `--:--` for unknown). */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}
