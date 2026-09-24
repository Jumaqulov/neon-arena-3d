/**
 * NEON ARENA — all site content, typed.
 * RULE: facts we don't know (prices, address, phone, hours, dates, prizes, hardware,
 * stats, counts) are ALWAYS bracket placeholders like "[NARX]". Render strings that may
 * contain them with <PhText text={…}/> (src/components/ui/Placeholder.tsx) so every
 * [TOKEN] becomes a styled placeholder chip. Never replace them with invented values.
 */

/* ------------------------------------------------------------------ */
/* Site / navigation                                                   */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: "/" | "/games" | "/tournaments" | "/profile";
}

export const NAV: readonly NavItem[] = [
  { label: "Bosh sahifa", href: "/" },
  { label: "O‘yinlar", href: "/games" },
  { label: "Turnirlar", href: "/tournaments" },
  { label: "Profil", href: "/profile" },
];

/** Primary CTA target on every page. */
export const BOOKING_HREF = "/#booking";
export const BOOKING_LABEL = "Joy band qilish";

export interface SocialLink {
  label: string;
  href: string;
}

export const SITE = {
  name: "NEON ARENA",
  tagline: "Kompyuter klub va kibersport arenasi.",
  description:
    "NEON ARENA — kuchli o‘yin kompyuterlari, pro darajadagi periferiya va klub turnirlari. Joyingni onlayn band qil.",
  city: "[SHAHAR]",
  address: "[MANZIL]",
  landmark: "[MO‘LJAL]",
  hours: "[ISH VAQTI]",
  phone: "[TELEFON]",
  year: "[YIL]",
  socials: [
    { label: "Telegram", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
  ] as readonly SocialLink[],
} as const;

/* ------------------------------------------------------------------ */
/* Home hero                                                           */
/* ------------------------------------------------------------------ */

export const HERO = {
  eyebrow: "Kompyuter klub · Kibersport arena · [SHAHAR]",
  titleLines: ["O‘yin —", "boshqa", "o‘lchamda"] as const, // last line is the lime one
  lead: "Kuchli o‘yin kompyuterlari, pro darajadagi periferiya va klub turnirlari. Joyingni onlayn — bir daqiqada band qil.",
  primaryCta: { label: "Joy band qilish", href: "#booking" },
  secondaryCta: { label: "Narxlar", href: "#prices" },
} as const;

export interface HudStat {
  label: string;
  value: string;
}

/** Floating HUD panels around the hero cube. */
export const HERO_HUD: readonly HudStat[] = [
  { label: "O‘yin kompyuterlari", value: "[SON] ta PC" },
  { label: "Monitor chastotasi", value: "[MONITOR Hz]" },
  { label: "Ish vaqti", value: "[ISH VAQTI]" },
  { label: "Videokarta", value: "[VIDEOKARTA]" },
  { label: "Zal holati", value: "Hozir bo‘sh: [SON] joy" },
];

/** Floating HUD panel B in the hero: value token + separate lime unit (as in the mockup). */
export const HERO_HZ_PANEL = { label: "Monitor chastotasi", value: "[CHASTOTA]", unit: "Hz" } as const;

/* ------------------------------------------------------------------ */
/* Zones & prices                                                      */
/* ------------------------------------------------------------------ */

export type ZoneId = "standart" | "vip" | "bootcamp" | "konsol";

export interface ZoneSpec {
  label: string;
  /** placeholder token, e.g. "[VIDEOKARTA]" */
  value: string;
  /** text after the value, e.g. " ta PC" */
  suffix?: string;
}

export interface Zone {
  id: ZoneId;
  /** "Z-01" … */
  idx: string;
  name: string;
  desc: string;
  specs: readonly ZoneSpec[];
  /** "[NARX]" */
  price: string;
  priceUnit: string;
}

export const ZONES: readonly Zone[] = [
  {
    id: "standart",
    idx: "Z-01",
    name: "Standart",
    desc: "Kundalik mashg‘ulot va reyting o‘yinlari uchun ishonchli joy.",
    specs: [
      { label: "Videokarta", value: "[VIDEOKARTA]" },
      { label: "Protsessor", value: "[PROTSESSOR]" },
      { label: "Monitor", value: "[MONITOR Hz]" },
    ],
    price: "[NARX]",
    priceUnit: "so‘m / soat",
  },
  {
    id: "vip",
    idx: "Z-02",
    name: "VIP",
    desc: "Kengroq joy, premium kreslo va eng kuchli konfiguratsiya.",
    specs: [
      { label: "Videokarta", value: "[VIDEOKARTA]" },
      { label: "Protsessor", value: "[PROTSESSOR]" },
      { label: "Monitor", value: "[MONITOR Hz]" },
    ],
    price: "[NARX]",
    priceUnit: "so‘m / soat",
  },
  {
    id: "bootcamp",
    idx: "Z-03",
    name: "Bootcamp",
    desc: "Jamoa xonasi: butun tarkib bitta stolda, bitta strategiya.",
    specs: [
      { label: "Kompyuterlar", value: "[SON]", suffix: " ta PC" },
      { label: "Videokarta", value: "[VIDEOKARTA]" },
      { label: "Monitor", value: "[MONITOR Hz]" },
    ],
    price: "[NARX]",
    priceUnit: "so‘m / soat",
  },
  {
    id: "konsol",
    idx: "Z-04",
    name: "Konsol",
    desc: "Katta ekran va geympadlar — do‘stlar bilan FC yoki MK1 uchun.",
    specs: [
      { label: "Konsol", value: "[KONSOL]" },
      { label: "Ekran", value: "[TELEVIZOR]" },
      { label: "Geympadlar", value: "[SON]", suffix: " ta" },
    ],
    price: "[NARX]",
    priceUnit: "so‘m / soat",
  },
];

export const ZONES_SECTION = {
  eyebrow: "01 / Zonalar va narxlar",
  title: "Har bir o‘yinchiga — o‘z zonasi",
  lead: "Narx soatbay hisoblanadi. Ko‘p o‘ynaydiganlar uchun — paketlar va oylik abonement.",
  bookLabel: "Band qilish",
} as const;

export interface PricePackage {
  name: string;
  price: string;
  unit: string;
}

export const PACKAGES = {
  eyebrow: "Paketlar",
  title: "Uzoq sessiyalar uchun",
  items: [
    { name: "[SOAT] soatlik paket", price: "[NARX]", unit: "so‘m" },
    { name: "Tungi paket [VAQT]", price: "[NARX]", unit: "so‘m" },
    { name: "Oylik abonement", price: "[NARX]", unit: "so‘m" },
  ] as readonly PricePackage[],
} as const;

export function getZone(id: ZoneId): Zone {
  const z = ZONES.find((x) => x.id === id);
  if (!z) throw new Error(`Unknown zone ${id}`);
  return z;
}

/* ------------------------------------------------------------------ */
/* Games                                                               */
/* ------------------------------------------------------------------ */

export type GameGenre = "Shuter" | "MOBA" | "Sport" | "Batl royal" | "Fayting";

/** Filter pills for the library ("all" → "Hammasi"). */
export const GENRES: readonly GameGenre[] = ["Shuter", "MOBA", "Sport", "Batl royal", "Fayting"];
export const ALL_LABEL = "Hammasi";

/** Motif key for our own typographic/geometric cover art (no real game art/logos). */
export type GameMotif =
  | "crosshair"
  | "lanes"
  | "reticle"
  | "rings"
  | "pitch"
  | "build"
  | "chevrons"
  | "slash";

export type GameSlug =
  | "counter-strike-2"
  | "dota-2"
  | "valorant"
  | "pubg"
  | "ea-sports-fc"
  | "fortnite"
  | "apex-legends"
  | "mortal-kombat-1";

export interface Game {
  slug: GameSlug;
  title: string;
  /** big cover monogram: "CS2", "D2", "VLR" … */
  abbr: string;
  genre: GameGenre;
  /** longer genre line used on covers, e.g. "Taktik shuter" */
  genreLabel: string;
  /** match format, e.g. "5v5" */
  format: string;
  /** short punchy line (Uzbek) */
  tagline: string;
  description: string;
  /** zones where the game is available */
  zones: readonly ZoneId[];
  motif: GameMotif;
  /** alternate covers use outlined monogram */
  outlined: boolean;
}

const PC_ZONES: readonly ZoneId[] = ["standart", "vip", "bootcamp"];

export const GAMES: readonly Game[] = [
  {
    slug: "counter-strike-2",
    title: "Counter-Strike 2",
    abbr: "CS2",
    genre: "Shuter",
    genreLabel: "Taktik shuter",
    format: "5v5",
    tagline: "Beshlikni yig‘ing. Qolgani — klubda.",
    description:
      "Counter-Strike 2 klub kompyuterlarida oldindan o‘rnatilgan va yangilab turiladi: kompyuterni yoqasiz — o‘yin tayyor. Beshlikni yig‘ing va Bootcamp xonasida jamoa bo‘lib yonma-yon o‘ynang, har raund taktikasini shu yerning o‘zida kelishib olasiz.",
    zones: PC_ZONES,
    motif: "crosshair",
    outlined: false,
  },
  {
    slug: "dota-2",
    title: "Dota 2",
    abbr: "D2",
    genre: "MOBA",
    genreLabel: "MOBA · strategiya",
    format: "5v5",
    tagline: "Beshta qahramon, uchta yo‘lak, bitta qaror.",
    description:
      "Dota 2 klub kompyuterlarida o‘rnatilgan va yangilab turiladi. Jamoangiz bilan Bootcamp xonasida bir stol atrofida o‘ynang — draft va strategiyani ovoz chiqarib kelishib olasiz.",
    zones: PC_ZONES,
    motif: "lanes",
    outlined: true,
  },
  {
    slug: "valorant",
    title: "Valorant",
    abbr: "VLR",
    genre: "Shuter",
    genreLabel: "Taktik shuter",
    format: "5v5",
    tagline: "Aniq nishon va to‘g‘ri qobiliyat — raund sizniki.",
    description:
      "Valorant klub kompyuterlarida o‘rnatilgan. Yuqori chastotali monitor va sozlangan periferiya bilan har bir o‘q va har bir qobiliyat o‘z vaqtida.",
    zones: PC_ZONES,
    motif: "reticle",
    outlined: false,
  },
  {
    slug: "pubg",
    title: "PUBG",
    abbr: "PUBG",
    genre: "Batl royal",
    genreLabel: "Batl royal",
    format: "Yakka · Juftlik · To‘rtlik",
    tagline: "Zona torayadi. Oxirgi bo‘lib qoling.",
    description:
      "PUBG klub kompyuterlarida o‘rnatilgan. Do‘stlaringiz bilan yonma-yon o‘tirib, squad bo‘lib tushing — xabarni ovoz bilan berasiz.",
    zones: PC_ZONES,
    motif: "rings",
    outlined: true,
  },
  {
    slug: "ea-sports-fc",
    title: "EA Sports FC",
    abbr: "FC",
    genre: "Sport",
    genreLabel: "Futbol simulyatori",
    format: "1v1",
    tagline: "Katta ekran, geympad va do‘stona derbi.",
    description:
      "EA Sports FC Konsol zonasida katta ekranda va kompyuterlarda o‘ynaladi. Do‘stingizni chaqiring — derbini shu yerda hal qilasiz.",
    zones: ["konsol", "standart", "vip"],
    motif: "pitch",
    outlined: false,
  },
  {
    slug: "fortnite",
    title: "Fortnite",
    abbr: "FN",
    genre: "Batl royal",
    genreLabel: "Batl royal · qurilish",
    format: "Yakka · Juftlik · To‘rtlik",
    tagline: "Qur, o‘q uz, g‘alaba qozon.",
    description:
      "Fortnite klub kompyuterlarida o‘rnatilgan. Tez qurish uchun sezgir klaviatura va sichqoncha tayyor.",
    zones: PC_ZONES,
    motif: "build",
    outlined: true,
  },
  {
    slug: "apex-legends",
    title: "Apex Legends",
    abbr: "APX",
    genre: "Batl royal",
    genreLabel: "Batl royal · jamoaviy",
    format: "Uchlik",
    tagline: "Uchlik bo‘lib tushing, chempion bo‘lib chiqing.",
    description:
      "Apex Legends klub kompyuterlarida o‘rnatilgan. Uchlikni yig‘ing va yonma-yon o‘ynang.",
    zones: PC_ZONES,
    motif: "chevrons",
    outlined: false,
  },
  {
    slug: "mortal-kombat-1",
    title: "Mortal Kombat 1",
    abbr: "MK1",
    genre: "Fayting",
    genreLabel: "Jang o‘yini",
    format: "1v1",
    tagline: "Bir ekran, ikki o‘yinchi, bitta g‘olib.",
    description:
      "Mortal Kombat 1 Konsol zonasida katta ekranda o‘ynaladi. Geympadni oling — hisob-kitob shu yerda.",
    zones: ["konsol"],
    motif: "slash",
    outlined: true,
  },
];

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export const GAMES_SECTION = {
  eyebrow: "02 / O‘yinlar",
  title: "O‘yinlar kutubxonasi",
  lead: "Eng ko‘p o‘ynaladigan o‘yinlar klub kompyuterlarida o‘rnatilgan. To‘liq ro‘yxat va talablar — o‘yinlar sahifasida.",
  allLabel: "Barchasi",
} as const;

/** Game page: "Klubda" tab feature plates (same for every game). */
export interface GameFeature {
  num: string;
  title: string;
  text: string;
  meta: string;
}

export const GAME_FEATURES: readonly GameFeature[] = [
  {
    num: "01",
    title: "Doim yangi versiya",
    text: "Yangilanishlarni o‘zimiz o‘rnatamiz. Siz kelasiz, kompyuterni yoqasiz va to‘g‘ri o‘yinga kirasiz — yuklanishni kutib o‘tirmaysiz.",
    meta: "So‘nggi yangilanish [SANA]",
  },
  {
    num: "02",
    title: "Sozlangan periferiya",
    text: "Sichqoncha, klaviatura va quloqchin o‘yin uchun tayyorlab qo‘yilgan. Sezgirlik va tugmalarni esa o‘zingizga moslab olasiz.",
    meta: "[SICHQONCHA] · [KLAVIATURA]",
  },
  {
    num: "03",
    title: "Jamoa uchun Bootcamp",
    text: "Butun jamoa bitta xonada, yonma-yon. Mashg‘ulot o‘yinlari va turnirga tayyorgarlik uchun alohida joy.",
    meta: "Sig‘imi [SON] o‘rin",
  },
];

/** Game page: "Talablar" tab table. */
export interface SpecRow {
  component: string;
  min: string;
  club: string;
}

export const GAME_SPECS: readonly SpecRow[] = [
  { component: "Protsessor", min: "[PROTSESSOR]", club: "[PROTSESSOR]" },
  { component: "Videokarta", min: "[VIDEOKARTA]", club: "[VIDEOKARTA]" },
  { component: "Operativ xotira", min: "[OPERATIV XOTIRA]", club: "[OPERATIV XOTIRA]" },
  { component: "Monitor", min: "[MONITOR Hz]", club: "[MONITOR Hz]" },
];

/** Game page quick facts next to the box. */
export const GAME_QUICK_FACTS: readonly HudStat[] = [
  { label: "Tavsiya etilgan FPS", value: "[FPS]" },
  { label: "Monitor", value: "[MONITOR Hz]" },
  { label: "Periferiya", value: "[SICHQONCHA], [KLAVIATURA]" },
];

export const GAME_TABS = [
  { id: "klub", num: "01", label: "Klubda" },
  { id: "talab", num: "02", label: "Talablar" },
  { id: "turnir", num: "03", label: "Turnirlar" },
] as const;

/* ------------------------------------------------------------------ */
/* Booking (home #booking)                                             */
/* ------------------------------------------------------------------ */

export interface Seat {
  /** "A1" … */
  id: string;
  zone: ZoneId;
  /** position on the 564×344 hall plan (px, top-left of a 48×48 seat) */
  x: number;
  y: number;
  /** SAMPLE occupancy for the demo */
  occupied: boolean;
}

const BUSY = new Set(["A2", "A5", "B3", "B6", "V1", "K2"]);

function buildSeats(): Seat[] {
  const list: Seat[] = [];
  const add = (id: string, zone: ZoneId, x: number, y: number) =>
    list.push({ id, zone, x, y, occupied: BUSY.has(id) });
  for (let i = 0; i < 6; i++) add(`A${i + 1}`, "standart", 36 + i * 60, 52);
  for (let i = 0; i < 6; i++) add(`B${i + 1}`, "standart", 36 + i * 60, 116);
  add("V1", "vip", 434, 52);
  add("V2", "vip", 490, 52);
  add("V3", "vip", 434, 116);
  add("V4", "vip", 490, 116);
  for (let i = 0; i < 5; i++) add(`J${i + 1}`, "bootcamp", 36 + i * 60, 244);
  for (let i = 0; i < 3; i++) add(`K${i + 1}`, "konsol", 368 + i * 60, 244);
  return list;
}

export const SEATS: readonly Seat[] = buildSeats();

export interface SeatArea {
  id: ZoneId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Hall plan is 564 × 344 (px units). */
export const HALL_SIZE = { w: 564, h: 344 } as const;

export const SEAT_AREAS: readonly SeatArea[] = [
  { id: "standart", label: "Standart", x: 20, y: 20, w: 384, h: 164 },
  { id: "vip", label: "VIP", x: 420, y: 20, w: 124, h: 164 },
  { id: "bootcamp", label: "Bootcamp", x: 20, y: 200, w: 316, h: 124 },
  { id: "konsol", label: "Konsol", x: 352, y: 200, w: 192, h: 124 },
];

export const BOOKING = {
  eyebrow: "03 / Onlayn bron",
  title: "Joyingni xaritadan tanla",
  lead: "Bo‘sh joyni bos, sana va vaqtni belgila. So‘rov administratorga boradi — u qo‘ng‘iroq qilib tasdiqlaydi.",
  mapTitle: "Zal sxemasi",
  legend: { free: "Bo‘sh", busy: "Band", selected: "Tanlangan" },
  viewLabel: "Yuqoridan ko‘rinish",
  entrance: "Resepshn · Kirish",
  sampleNote: "Namuna ma’lumot: band joylar misol uchun ko‘rsatilgan.",
  formEyebrow: "Bron tafsilotlari",
  formTitle: "Vaqt va joyni belgila",
  times: ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"] as readonly string[],
  defaultTime: "18:00",
  hours: { min: 1, max: 12, default: 2 },
  players: { min: 1, max: 5, default: 1 },
  /** pre-selected seat (initial state only; "Yangi bron" clears it) */
  defaultSeat: "A4",
  labels: {
    zone: "Zona",
    seat: "Joy",
    date: "Sana",
    time: "Boshlanish vaqti",
    dateTime: "Sana va vaqt",
    duration: "Davomiylik",
    players: "O‘yinchilar",
    selectedSeat: "Tanlangan joy",
  },
  units: { hours: "soat", players: "kishi" },
  steppers: {
    hoursDec: "Soatni kamaytirish",
    hoursInc: "Soatni oshirish",
    playersDec: "O‘yinchilar sonini kamaytirish",
    playersInc: "O‘yinchilar sonini oshirish",
  },
  noSeatTitle: "Joy tanlanmagan",
  noSeatText: "Xaritadan bo‘sh joyni bosing.",
  totalLabel: "Jami",
  totalValue: "[NARX] × {hours} soat",
  submit: "Band qilish",
  submitHint: "Administrator [TELEFON] orqali qo‘ng‘iroq qilib tasdiqlaydi.",
  submitDisabledHint: "Avval xaritadan bo‘sh joyni tanlang.",
  doneTitle: "Bron yuborildi",
  doneText: "So‘rovingiz qabul qilindi.",
  doneHint: "Administrator [TELEFON] orqali tasdiqlaydi.",
  newBooking: "Yangi bron",
  datePlaceholder: "[SANA]",
} as const;

/* ------------------------------------------------------------------ */
/* Tournaments                                                         */
/* ------------------------------------------------------------------ */

export type TournamentStatus = "jonli" | "kelayotgan" | "yakunlangan";

export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  jonli: "Jonli",
  kelayotgan: "Kelayotgan",
  yakunlangan: "Yakunlangan",
};

export interface Tournament {
  id: string;
  name: string;
  /** appended placeholder, e.g. "[SON]" for "NEON CUP #[SON]" ("" if none) */
  namePh: string;
  game: GameSlug;
  gameLabel: string;
  /** short code chip: "CS2", "VAL", "FC", "DOTA" */
  code: string;
  format: string;
  status: TournamentStatus;
  /** 0..1 — VISUAL registration bar only (no number shown; slots stay "[SON] / [SON]") */
  fill: number;
  date: string;
  time: string;
  prize: string;
  slots: string;
}

const T_PH = { date: "[SANA]", time: "[SOAT]", prize: "[SOVRIN]", slots: "[SON] / [SON]" } as const;

export const TOURNAMENTS: readonly Tournament[] = [
  { id: "c1", name: "NEON CUP #", namePh: "[SON]", game: "counter-strike-2", gameLabel: "Counter-Strike 2", code: "CS2", format: "5v5", status: "jonli", fill: 1, ...T_PH },
  { id: "c2", name: "Hafta kechasi kubogi", namePh: "", game: "valorant", gameLabel: "Valorant", code: "VAL", format: "5v5", status: "kelayotgan", fill: 0.62, ...T_PH },
  { id: "c3", name: "Duel ligasi", namePh: "", game: "ea-sports-fc", gameLabel: "EA Sports FC", code: "FC", format: "1v1", status: "kelayotgan", fill: 0.44, ...T_PH },
  { id: "c4", name: "Markaz dueli", namePh: "", game: "dota-2", gameLabel: "Dota 2", code: "DOTA", format: "1v1", status: "kelayotgan", fill: 0.81, ...T_PH },
  { id: "c5", name: "Tungi smena turniri", namePh: "", game: "counter-strike-2", gameLabel: "Counter-Strike 2", code: "CS2", format: "5v5", status: "yakunlangan", fill: 1, ...T_PH },
  { id: "c6", name: "Klub ligasi finali", namePh: "", game: "dota-2", gameLabel: "Dota 2", code: "DOTA", format: "5v5", status: "jonli", fill: 1, ...T_PH },
];

export const TOURNAMENT_GAME_FILTERS: ReadonlyArray<{ id: "all" | GameSlug; label: string }> = [
  { id: "all", label: "Hammasi" },
  { id: "counter-strike-2", label: "Counter-Strike 2" },
  { id: "dota-2", label: "Dota 2" },
  { id: "valorant", label: "Valorant" },
  { id: "ea-sports-fc", label: "EA Sports FC" },
];

export const TOURNAMENT_STATUS_FILTERS: ReadonlyArray<{ id: "all" | TournamentStatus; label: string }> = [
  { id: "all", label: "Hammasi" },
  { id: "kelayotgan", label: "Kelayotgan" },
  { id: "jonli", label: "Jonli" },
  { id: "yakunlangan", label: "Yakunlangan" },
];

export const TOURNAMENTS_PAGE = {
  eyebrow: "Mavsum [SON] · Klub ligasi",
  titleTop: "Turnirlar",
  titleBottom: "Arenada isbotla",
  lead: "Har hafta klubda turnir: beshlik bo‘lib yoki yakkama-yakka. Har bir g‘alaba mavsum reytingiga ball qo‘shadi — eng kuchlilar podiumga ko‘tariladi.",
  primaryCta: "Ro‘yxatdan o‘tish",
  secondaryCta: "Qoidalar",
  /** full rules document ("To‘liq qoidalar") — placeholder until the real URL exists */
  rulesHref: "#",
  /** live stream ("Kuzatish") — until the real stream URL exists it jumps to the hero's live strip */
  streamHref: "#jonli-efir",
  stats: [
    { label: "Haftalik turnir", value: "[SON]" },
    { label: "Ishtirokchilar", value: "[SON]" },
    { label: "Mavsum jamg‘armasi", value: "[SOVRIN]" },
  ] as readonly HudStat[],
  podiumTitle: "O‘tgan hafta podiumi",
  podiumDate: "[SANA]",
  live: {
    label: "Jonli efir",
    title: "NEON CUP # [SON] — Counter-Strike 2",
    score: "Hisob: [SON] : [SON]",
    next: "Keyingi o‘yin: [SOAT]",
    cta: "Kuzatish",
  },
  listEyebrow: "01 Turnirlar jadvali",
  listTitle: "Turnirlar ro‘yxati",
  listLead:
    "O‘yinni tanlang, holatni belgilang va jamoangiz uchun joyni oldindan band qiling. Jonli turnirlarni klub zalidan yoki efirdan kuzating.",
  resultCount: "Ko‘rsatilmoqda: {n} ta turnir",
  register: "Ro‘yxatdan o‘tish",
  registered: "Ro‘yxatdasiz",
  watch: "Kuzatish",
  results: "Natijalar",
  emptyTitle: "Bu saralash bo‘yicha turnir yo‘q",
  emptyText: "Boshqa o‘yin yoki holatni tanlang — yangi turnirlar har hafta e’lon qilinadi.",
  resetFilters: "Saralashni tozalash",
  cardLabels: { date: "Sana", time: "Vaqt", prize: "Sovrin", slots: "Joylar" },
} as const;

/** Home teaser for the next tournament. */
export const NEXT_TOURNAMENT = {
  eyebrow: "Keyingi turnir",
  name: "Neon Cup #",
  namePh: "[SON]",
  lead: "Jamoangni yig‘ib, ro‘yxatdan o‘t. Qoidalar va jadval — turnirlar sahifasida.",
  facts: [
    { label: "O‘yin", value: "Counter-Strike 2" },
    { label: "Format", value: "5v5" },
    { label: "Sana", value: "[SANA]" },
    { label: "Sovrin jamg‘armasi", value: "[SOVRIN]" },
  ] as readonly HudStat[],
  teams: "Jamoalar: [SON] / [SON] jamoa",
  allCta: "Barcha turnirlar",
  registerCta: "Ro‘yxatdan o‘tish",
} as const;

/** Final CTA on home. */
export const FINAL_CTA = {
  eyebrow: "Sening navbating",
  titleLines: ["Joying seni", "kutyapti."] as const,
  lead: "Band qil, kel va darhol o‘yinga kir.",
} as const;

/* ------------------------------------------------------------------ */
/* Leaderboard / podium / rules                                        */
/* ------------------------------------------------------------------ */

export type Trend = "up" | "down" | "same";

export const TREND_LABEL: Record<Trend, string> = {
  up: "Ko‘tarildi",
  down: "Tushdi",
  same: "O‘zgarmadi",
};

export interface LeaderRow {
  rank: number;
  handle: string;
  /** avatar initials, e.g. "G01" */
  initials: string;
  game: string;
  wins: string;
  points: string;
  trend: Trend;
  /** "[SON]" or "—" when unchanged */
  delta: string;
}

export type BoardId = "umumiy" | "cs2" | "dota";

function rows(list: ReadonlyArray<[string, string, Trend]>): LeaderRow[] {
  return list.map(([handle, game, trend], i) => ({
    rank: i + 1,
    handle,
    initials: `G${handle.slice(-2)}`,
    game,
    wins: "[SON]",
    points: "[BALL]",
    trend,
    delta: trend === "same" ? "—" : "[SON]",
  }));
}

export const LEADERBOARDS: Record<BoardId, { label: string; rows: readonly LeaderRow[] }> = {
  umumiy: {
    label: "Umumiy",
    rows: rows([
      ["Gamer_01", "Counter-Strike 2", "up"], ["Gamer_02", "Dota 2", "same"], ["Gamer_03", "Valorant", "up"],
      ["Gamer_04", "Counter-Strike 2", "down"], ["Gamer_05", "EA Sports FC", "up"], ["Gamer_06", "Dota 2", "down"],
      ["Gamer_07", "Valorant", "same"], ["Gamer_08", "Counter-Strike 2", "up"], ["Gamer_09", "Dota 2", "down"],
      ["Gamer_10", "EA Sports FC", "same"],
    ]),
  },
  cs2: {
    label: "CS2",
    rows: rows([
      ["Gamer_04", "Counter-Strike 2", "up"], ["Gamer_01", "Counter-Strike 2", "down"], ["Gamer_08", "Counter-Strike 2", "up"],
      ["Gamer_11", "Counter-Strike 2", "same"], ["Gamer_12", "Counter-Strike 2", "up"], ["Gamer_13", "Counter-Strike 2", "down"],
      ["Gamer_14", "Counter-Strike 2", "same"], ["Gamer_15", "Counter-Strike 2", "up"], ["Gamer_16", "Counter-Strike 2", "down"],
      ["Gamer_17", "Counter-Strike 2", "same"],
    ]),
  },
  dota: {
    label: "Dota 2",
    rows: rows([
      ["Gamer_02", "Dota 2", "same"], ["Gamer_06", "Dota 2", "up"], ["Gamer_09", "Dota 2", "up"],
      ["Gamer_18", "Dota 2", "down"], ["Gamer_19", "Dota 2", "same"], ["Gamer_20", "Dota 2", "up"],
      ["Gamer_21", "Dota 2", "down"], ["Gamer_22", "Dota 2", "same"], ["Gamer_23", "Dota 2", "up"],
      ["Gamer_24", "Dota 2", "down"],
    ]),
  },
};

export const BOARD_TABS: ReadonlyArray<{ id: BoardId; label: string }> = [
  { id: "umumiy", label: "Umumiy" },
  { id: "cs2", label: "CS2" },
  { id: "dota", label: "Dota 2" },
];

export const LEADERBOARD_SECTION = {
  eyebrow: "02 Mavsum [SON]",
  title: "Mavsum reytingi",
  updated: "Yangilangan: [SANA]",
  caption: "Mavsum reytingi: {board}, birinchi o‘nlik",
  columns: ["#", "O‘yinchi", "Asosiy o‘yin", "G‘alabalar", "Ball", "O‘zgarish"] as readonly string[],
  footnote: "Ball har turnir yakunidan so‘ng qayta hisoblanadi",
} as const;

export interface PodiumPlace {
  place: 1 | 2 | 3;
  handle: string;
  initials: string;
  points: string;
}

export const PODIUM: readonly PodiumPlace[] = [
  { place: 2, handle: "Gamer_02", initials: "G02", points: "[BALL]" },
  { place: 1, handle: "Gamer_01", initials: "G01", points: "[BALL]" },
  { place: 3, handle: "Gamer_03", initials: "G03", points: "[BALL]" },
];

export const POINT_RULES = {
  eyebrow: "Ball tizimi",
  title: "Ball qanday yig‘iladi",
  items: [
    { label: "Turnirda ishtirok", value: "+[BALL]" },
    { label: "Har bir g‘alaba", value: "+[BALL]" },
    { label: "Turnir g‘olibi", value: "+[BALL]" },
    { label: "O‘yinga kelmaslik", value: "−[BALL]" },
  ] as readonly HudStat[],
  note: "Mavsum yakuni — [SANA]. Yakuniy uchlik klub sovrinlarini oladi: [SOVRIN].",
} as const;

export interface HowStep {
  num: string;
  title: string;
  text: string;
}

export const HOW_IT_WORKS = {
  eyebrow: "03 Qoidalar",
  title: "Qanday ishtirok etish",
  lead: "Uch qadam — va siz turnir jadvalidasiz. Ro‘yxatdan shu sahifada yoki klub administratorida o‘tish mumkin.",
  steps: [
    { num: "01", title: "Profil oching", text: "Saytda yoki klub administratorida — ball va natijalar shu profilga yoziladi." },
    { num: "02", title: "Jamoa tuzing yoki yakka qatnashing", text: "5v5 uchun beshlikni yig‘ing, 1v1 turnirlarga esa bir o‘zingiz yoziling." },
    { num: "03", title: "Arenada o‘ynang", text: "Belgilangan vaqtda klubga keling — joyingiz tayyor, natija esa reytingga tushadi." },
  ] as readonly HowStep[],
  stepLabel: "Qadam",
  footnote: "Kechikish, texnik uzilish va nizoli holatlar bo‘yicha tartib — alohida hujjatda.",
  rulesCta: "To‘liq qoidalar",
} as const;

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export type AchievementIcon = "trophy" | "moon" | "shield" | "clock" | "headset" | "lock";

export interface Achievement {
  id: string;
  name: string;
  /** unlock condition (may contain placeholders) */
  cond: string;
  unlocked: boolean;
  icon: AchievementIcon;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first", name: "Birinchi g‘alaba", cond: "Klub turnirida birinchi g‘alabangizni qo‘lga kiriting.", unlocked: true, icon: "trophy" },
  { id: "wolf", name: "Tungi bo‘ri", cond: "Yarim tundan keyin boshlangan seansni oxirigacha o‘ynang.", unlocked: true, icon: "moon" },
  { id: "captain", name: "Jamoa sardori", cond: "Jamoa tuzing va uni turnirga sardor sifatida yozdiring.", unlocked: true, icon: "shield" },
  { id: "hours", name: "Marafonchi", cond: "Klub kompyuterlarida jami [SOAT] soat o‘ynang.", unlocked: true, icon: "clock" },
  { id: "champ", name: "Klub chempioni", cond: "Klub chempionatida birinchi o‘rinni egallang.", unlocked: false, icon: "lock" },
  { id: "streak", name: "G‘alaba seriyasi", cond: "Turnir o‘yinlarida ketma-ket [SON] marta g‘alaba qozoning.", unlocked: false, icon: "lock" },
  { id: "bootcamp", name: "Bootcamp", cond: "Bootcamp zonasida jamoangiz bilan mashg‘ulot o‘tkazing.", unlocked: true, icon: "headset" },
  { id: "loyal", name: "Sadoqatli a’zo", cond: "Klub a’zoligini [SON] oy uzluksiz saqlang.", unlocked: false, icon: "lock" },
];

export interface BookingHistoryRow {
  date: string;
  zone: string;
  seat: string;
  duration: string;
  price: string;
}

export const PROFILE = {
  handle: "Gamer_01",
  tier: "VIP a’zo",
  tierBadge: "VIP A’ZO",
  tierShort: "VIP",
  memberNo: "[RAQAM]",
  memberSince: "[SANA]",
  breadcrumb: "A’zo profili / VIP a’zo",
  lead: "Arenadagi yo‘lingiz bir joyda: bronlar, g‘alabalar va bonus ballar.",
  card: {
    label: "A’zolik kartasi",
    qr: "[QR KOD]",
    qrHint: "Kirishda skanerlang",
    backText: "Klubga kelganda kartani administratorga ko‘rsating.",
    backFooter: "NEON ARENA · A’ZOLIK KARTASI",
    flipLabel: "Kartani aylantirish",
    tiltHint: "Sichqoncha bilan qiyalating",
  },
  level: { label: "Daraja", value: "[DARAJA]" },
  rank: { label: "Reytingdagi o‘rin", value: "[O‘RIN]" },
  xp: { label: "Tajriba (XP)", value: "[XP] / [XP]", left: "Keyingi darajagacha [XP] XP qoldi" },
  stats: [
    { label: "O‘ynagan soatlar", value: "[SOAT]" },
    { label: "Turnirlar", value: "[SON]" },
    { label: "G‘alabalar", value: "[SON]" },
    { label: "Bonus ball", value: "[BALL]" },
  ] as readonly HudStat[],
  actions: { book: "Joy band qilish", edit: "Profilni tahrirlash" },
  cabinet: {
    eyebrow: "Kabinet",
    title: "Mening arenam",
    lead: "Bronlarni boshqaring, yutuqlarni yig‘ing, profilni o‘zingizga moslang.",
  },
  tabs: [
    { id: "bookings", num: "01", label: "Bronlar" },
    { id: "achievements", num: "02", label: "Yutuqlar" },
    { id: "settings", num: "03", label: "Sozlamalar" },
  ] as const,
  upcoming: {
    title: "Kelayotgan bron",
    statusOk: "Tasdiqlangan",
    statusCancelled: "Bekor qilingan",
    zone: "VIP zona",
    seat: "[JOY]",
    owner: "Joy [JOY] · bron egasi Gamer_01",
    date: "[SANA]",
    start: "[VAQT]",
    duration: "[SOAT] soat",
    countdown: "[VAQT] qoldi",
    number: "Bron № [RAQAM]",
    change: "Vaqtni o‘zgartirish",
    cancel: "Bekor qilish",
    cancelAsk: "Rostdan bekor qilasizmi?",
    cancelHint: "Joy boshqa gamerlar uchun ochiladi.",
    yes: "Ha",
    no: "Yo‘q",
    cancelled: "Bron bekor qilindi. Joy boshqa gamerlar uchun ochildi.",
    newBooking: "Yangi joy band qilish",
  },
  history: {
    eyebrow: "O‘yin tarixi",
    title: "Oxirgi seanslar",
    columns: ["Sana", "Zona", "Joy", "Davomiylik", "To‘lov"] as readonly string[],
    rows: [
      { date: "[SANA]", zone: "VIP", seat: "[JOY]", duration: "[SOAT] soat", price: "[NARX]" },
      { date: "[SANA]", zone: "Standart", seat: "[JOY]", duration: "[SOAT] soat", price: "[NARX]" },
      { date: "[SANA]", zone: "Bootcamp", seat: "[JOY]", duration: "[SOAT] soat", price: "[NARX]" },
      { date: "[SANA]", zone: "VIP", seat: "[JOY]", duration: "[SOAT] soat", price: "[NARX]" },
      { date: "[SANA]", zone: "Standart", seat: "[JOY]", duration: "[SOAT] soat", price: "[NARX]" },
    ] as readonly BookingHistoryRow[],
  },
  achievementsSection: {
    title: "Yutuqlar to‘plami",
    lead: "Tangani bosing — orqa tomonida uni ochish sharti yozilgan.",
    count: "Ochilgan [SON] / 8",
    condLabel: "Shart",
    unlocked: "Ochilgan",
    locked: "Qulflangan",
  },
  settings: {
    title: "Profil sozlamalari",
    lead: "Nikingiz kartada va turnir jadvalida ko‘rinadi. Telefon raqami bron tasdig‘i uchun kerak.",
    nickLabel: "Nik",
    nickHint: "Kartada va reytingda ko‘rinadi.",
    phoneLabel: "Telefon",
    phoneHint: "Bron tasdig‘i shu raqamga yuboriladi.",
    gameLabel: "Sevimli o‘yin",
    notifyLabel: "Turnir haqida xabarnomalar",
    notifyHint: "Ro‘yxatdan o‘tish ochilganda va o‘yiningizdan oldin eslatamiz.",
    on: "Yoqilgan",
    off: "O‘chirilgan",
    save: "Saqlash",
    saved: "Saqlandi — o‘zgarishlar profilingizga qo‘llandi.",
  },
  membership: {
    title: "A’zolik",
    tier: "VIP a’zo",
    validLabel: "Amal qilish muddati",
    valid: "[SANA]",
    levelLabel: "Joriy daraja",
    level: "[DARAJA]",
    bonusLabel: "Bonus ball",
    bonus: "[BALL]",
    cta: "Tariflarni ko‘rish",
  },
  favorites: {
    eyebrow: "Sevimlilar",
    title: "Sevimli o‘yinlar",
    lead: "Eng ko‘p vaqt o‘tkazgan o‘yinlaringiz. Bosing — o‘yin sahifasi ochiladi.",
    all: "Barcha o‘yinlar",
    played: "[SOAT] soat o‘ynalgan",
    games: ["counter-strike-2", "dota-2", "valorant"] as readonly GameSlug[],
  },
  defaultFavoriteGame: "counter-strike-2" as GameSlug,
} as const;
