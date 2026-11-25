// Dapur Nusantara — where everything on screen sits, in one place. main.js draws at
// these rectangles and input.js hit-tests against them, so a button is always exactly
// where it looks. All coordinates are in the 1280x720 view space.

import { INGREDIENT_ORDER, LAYOUT, MAX_TICKETS, STATIONS } from './config.js';

export function topBarRects() {
  return {
    mute: { x: 1160, y: 12, w: 52, h: 40 },
    pause: { x: 1100, y: 12, w: 52, h: 40 },
  };
}

export function ticketRect(index) {
  const gap = 12;
  const w = (1280 - 32 - gap * (MAX_TICKETS - 1)) / MAX_TICKETS;
  return { x: 16 + index * (w + gap), y: LAYOUT.boardY, w, h: LAYOUT.boardH };
}

export function stationRects() {
  const rects = [];
  const w = 150;
  const h = 108;
  const gap = 18;
  const x0 = 60;
  const y = LAYOUT.kitchenY + 24;
  for (let i = 0; i < STATIONS; i++) {
    rects.push({ x: x0 + i * (w + gap), y, w, h });
  }
  return rects;
}

// The big plate in the middle of the kitchen, and the bell button beside it.
export function plateRect() {
  return { x: 560, y: LAYOUT.kitchenY + 8, w: 240, h: 240 };
}

export function serveButtonRect() {
  return { x: 830, y: LAYOUT.kitchenY + 60, w: 190, h: 96 };
}

export function drinkStationRect() {
  return { x: 1050, y: LAYOUT.kitchenY + 24, w: 170, h: 108 };
}

// One ingredient bin per ingredient, in a row along the counter.
export function binRects() {
  const rects = [];
  const n = INGREDIENT_ORDER.length;
  const gap = 10;
  const w = (1280 - 32 - gap * (n - 1)) / n;
  const y = LAYOUT.counterY + 30;
  const h = 158;
  for (let i = 0; i < n; i++) {
    rects.push({ x: 16 + i * (w + gap), y, w, h, id: INGREDIENT_ORDER[i] });
  }
  return rects;
}

// Where each ingredient on the plate is drawn, so a tap on one removes it.
export function plateItemPositions(count) {
  const plate = plateRect();
  const cx = plate.x + plate.w / 2;
  const cy = plate.y + plate.h / 2;
  const spots = [
    { dx: 0, dy: -8 },
    { dx: -52, dy: 18 },
    { dx: 52, dy: 18 },
    { dx: -30, dy: -48 },
    { dx: 34, dy: -46 },
  ];
  return spots.slice(0, count).map((s) => ({ x: cx + s.dx, y: cy + s.dy, r: 34 }));
}

export function titleButtonRect() {
  return { x: 490, y: 520, w: 300, h: 72 };
}

export function summaryButtonRect() {
  return { x: 490, y: 520, w: 300, h: 72 };
}

export function gameOverButtonRect() {
  return { x: 490, y: 520, w: 300, h: 72 };
}

export function pointIn(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
