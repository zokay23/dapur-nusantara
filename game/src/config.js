// Dapur Nusantara — every number that tunes the game lives here: the canvas size, the
// layout of the kitchen, the ingredients, and the recipes customers order. Nothing in
// this file draws or updates; the other modules read it.

export const VIEW_W = 1280;
export const VIEW_H = 720;

// The top bar, the order board, the kitchen floor and the ingredient counter, in pixels.
export const LAYOUT = {
  topBarH: 64,
  boardY: 72,
  boardH: 118,
  kitchenY: 200,
  kitchenH: 268,
  counterY: 478,
  counterH: 232,
};

// How long one working day lasts, and how many hearts a run starts with.
export const DAY_SECONDS = 150;
export const START_HEARTS = 3;

// An ingredient: what it is called, what it looks like on the plate, whether it must
// be cooked first (and for how long, in seconds), and which station cooks it.
export const INGREDIENTS = {
  nasi: { name: 'Nasi', key: '1', cooks: false, cookSeconds: 0, color: '#fff8e7', dark: '#e8d9b0' },
  mie: { name: 'Mie', key: '2', cooks: true, cookSeconds: 3.0, color: '#ffd34d', dark: '#e0a92e' },
  ayam: { name: 'Ayam', key: '3', cooks: true, cookSeconds: 4.0, color: '#c97b3d', dark: '#9a5424' },
  telur: { name: 'Telur', key: '4', cooks: true, cookSeconds: 2.5, color: '#fff3c4', dark: '#f2b705' },
  sayur: { name: 'Sayur', key: '5', cooks: false, cookSeconds: 0, color: '#58b368', dark: '#2e7d32' },
  sambal: { name: 'Sambal', key: '6', cooks: false, cookSeconds: 0, color: '#e23b2e', dark: '#a31f14' },
  kerupuk: { name: 'Kerupuk', key: '7', cooks: false, cookSeconds: 0, color: '#ffb3c1', dark: '#e07f92' },
  teh: { name: 'Es Teh', key: '8', cooks: false, cookSeconds: 0, color: '#d98e32', dark: '#8a5a12' },
};

export const INGREDIENT_ORDER = ['nasi', 'mie', 'ayam', 'telur', 'sayur', 'sambal', 'kerupuk', 'teh'];

// A recipe: the dish customers ask for, the ingredients on its plate (in serving order),
// what it pays, and how long its customer waits before walking out.
export const RECIPES = {
  nasiGoreng: {
    name: 'Nasi Goreng',
    needs: ['nasi', 'telur', 'sayur', 'sambal'],
    coins: 12,
    patience: 42,
    blurb: 'Nasi + telur + sayur + sambal',
  },
  mieAyam: {
    name: 'Mie Ayam',
    needs: ['mie', 'ayam', 'sayur'],
    coins: 14,
    patience: 45,
    blurb: 'Mie + ayam + sayur',
  },
  sateAyam: {
    name: 'Sate Ayam',
    needs: ['ayam', 'ayam', 'sambal', 'kerupuk'],
    coins: 16,
    patience: 48,
    blurb: 'Ayam x2 + sambal + kerupuk',
  },
  gadoGado: {
    name: 'Gado-Gado',
    needs: ['sayur', 'telur', 'kerupuk', 'sambal'],
    coins: 12,
    patience: 40,
    blurb: 'Sayur + telur + sambal',
  },
  esTeh: {
    name: 'Es Teh',
    needs: ['teh'],
    coins: 6,
    patience: 30,
    blurb: 'Es teh manis, cepat saji',
  },
};

export const RECIPE_ORDER = ['nasiGoreng', 'mieAyam', 'sateAyam', 'gadoGado', 'esTeh'];

// The kitchen's palette: warm cream walls, terracotta tiles, wood counters, teal glass.
export const COLORS = {
  wall: '#ffe9c4',
  wallShade: '#f7d9a0',
  floor: '#e8a56b',
  floorLine: '#d18a4e',
  wood: '#a5672f',
  woodDark: '#7d4a1e',
  woodLight: '#c98a4b',
  counterTop: '#f3e2c2',
  teal: '#0e7c7b',
  tealDark: '#095e5d',
  tealLight: '#3aa99e',
  red: '#e23b2e',
  gold: '#f2b705',
  cream: '#fff8e7',
  ink: '#3a2415',
  inkSoft: '#6b4a2f',
  ticket: '#fffdf5',
  ticketEdge: '#e0c896',
  plate: '#ffffff',
  plateRim: '#dfe8f0',
  shadow: 'rgba(58, 36, 21, 0.25)',
};

export const STATIONS = 3;
export const MAX_TICKETS = 4;
export const COMBO_CAP = 8;
