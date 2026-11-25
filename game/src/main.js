// Dapur Nusantara — the game loop and every screen. The kitchen holds the state;
// this module draws it: the top bar with the clock and coins, the order board, the
// stoves and the plate, the ingredient counter, and the title, day-summary and
// game-over screens. It also stages the fixed scenes the screenshots are taken from
// (?shot=cover, assembly, serve or title) so each picture shows the game at its best.

import { SoundBank } from './audio.js';
import { COLORS, DAY_SECONDS, INGREDIENTS, INGREDIENT_ORDER, RECIPES, VIEW_H, VIEW_W } from './config.js';
import { drawCustomer, drawDish, drawIngredient, drawPlate, drawStove, roundRect, softShadow } from './draw.js';
import { installInput } from './input.js';
import { Kitchen } from './kitchen.js';
import {
  binRects,
  drinkStationRect,
  gameOverButtonRect,
  plateItemPositions,
  plateRect,
  serveButtonRect,
  stationRects,
  summaryButtonRect,
  ticketRect,
  titleButtonRect,
  topBarRects,
} from './layout.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const sfx = new SoundBank();
const kitchen = new Kitchen(Math.random);
let shotMode = false;
let frozenTime = 0;

installInput(canvas, kitchen, sfx, () => {});

function text(str, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function pill(x, y, w, h, fill, stroke = null) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function heart(x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? COLORS.red : 'rgba(255,255,255,0.55)';
  ctx.fill();
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawBackground() {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLORS.wallShade;
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(i * 170, 0, 6, 200);
  }
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 200, VIEW_W, 278);
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 2;
  for (let y = 236; y < 478; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  for (let x = 0; x < VIEW_W; x += 92) {
    ctx.beginPath();
    ctx.moveTo(x, 200);
    ctx.lineTo(x - 24, 478);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.wood;
  ctx.fillRect(0, 470, VIEW_W, 14);
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(0, 480, VIEW_W, 4);
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 484, VIEW_W, 236);
}

function drawTopBar() {
  ctx.fillStyle = COLORS.teal;
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, 58, VIEW_W, 6);
  text('🍳 DAPUR NUSANTARA', 20, 32, 24, '#fff', 900);
  text(`HARI ${kitchen.day}`, 332, 32, 20, '#c8efe9', 800);
  for (let i = 0; i < 3; i++) {
    heart(428 + i * 32, 32, 26, i < kitchen.hearts);
  }

  const clock = kitchen.clockText();
  const urgent = kitchen.dayTimeLeft <= 30;
  pill(540, 12, 150, 40, urgent ? COLORS.red : 'rgba(0,0,0,0.25)');
  text(`⏱ ${clock}`, 615, 33, 22, '#fff', 900, 'center');
  const dayRatio = Math.max(0, kitchen.dayTimeLeft / DAY_SECONDS);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  roundRect(ctx, 550, 46, 130, 5, 2.5);
  ctx.fill();
  ctx.fillStyle = urgent ? '#ff8a7a' : COLORS.gold;
  roundRect(ctx, 550, 46, 130 * dayRatio, 5, 2.5);
  ctx.fill();

  pill(710, 12, 130, 40, 'rgba(0,0,0,0.25)');
  text(`🪙 ${kitchen.coins}`, 775, 33, 22, COLORS.gold, 900, 'center');
  text(`SKOR ${kitchen.score}`, 985, 32, 20, '#fff', 800, 'right');
  if (kitchen.combo >= 2) {
    pill(1000, 12, 88, 40, COLORS.gold);
    text(`🔥 x${kitchen.combo}`, 1044, 33, 20, '#7d4a1e', 900, 'center');
  }
  const top = topBarRects();
  pill(top.pause.x, top.pause.y, top.pause.w, top.pause.h, 'rgba(0,0,0,0.25)');
  text(kitchen.paused ? '▶' : 'II', top.pause.x + 26, top.pause.y + 22, 18, '#fff', 900, 'center');
  pill(top.mute.x, top.mute.y, top.mute.w, top.mute.h, 'rgba(0,0,0,0.25)');
  text(sfx.muted ? '🔇' : '🔊', top.mute.x + 26, top.mute.y + 22, 18, '#fff', 900, 'center');
}

function plateNeedsDone(ticket) {
  const counts = {};
  for (const id of kitchen.plate) counts[id] = (counts[id] || 0) + 1;
  return ticket.needs.map((id) => {
    const done = (counts[id] || 0) > 0;
    if (done) counts[id] -= 1;
    return done;
  });
}

function drawTickets() {
  for (let i = 0; i < kitchen.tickets.length; i++) {
    const ticket = kitchen.tickets[i];
    const rect = ticketRect(i);
    const match = kitchen.plate.length > 0 && kitchen.plateMatches(ticket);
    softShadow(ctx, rect.x + rect.w / 2, rect.y + rect.h, rect.w / 2, 8);
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fillStyle = COLORS.ticket;
    ctx.fill();
    ctx.strokeStyle = match ? COLORS.gold : COLORS.ticketEdge;
    ctx.lineWidth = match ? 4 : 2;
    ctx.stroke();
    drawCustomer(ctx, ticket.variant, ticket.patience / ticket.patienceMax < 0.25 ? 'worried' : 'neutral', rect.x + 34, rect.y + 38, 26);
    text(ticket.name, rect.x + 70, rect.y + 26, 19, COLORS.ink, 900);
    pill(rect.x + rect.w - 62, rect.y + 10, 52, 26, COLORS.gold);
    text(`+${ticket.coins}`, rect.x + rect.w - 36, rect.y + 24, 15, '#7d4a1e', 900, 'center');
    const done = plateNeedsDone(ticket);
    ticket.needs.forEach((id, j) => {
      const ix = rect.x + 86 + j * 44;
      const iy = rect.y + 66;
      drawIngredient(ctx, id, ix, iy, 17);
      if (done[j]) {
        ctx.fillStyle = 'rgba(88,179,104,0.9)';
        ctx.beginPath();
        ctx.arc(ix + 12, iy + 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ix + 6, iy + 12);
        ctx.lineTo(ix + 11, iy + 17);
        ctx.lineTo(ix + 19, iy + 7);
        ctx.stroke();
      }
    });
    const ratio = Math.max(0, ticket.patience / ticket.patienceMax);
    roundRect(ctx, rect.x + 14, rect.y + rect.h - 18, rect.w - 28, 9, 4.5);
    ctx.fillStyle = 'rgba(58,36,21,0.15)';
    ctx.fill();
    roundRect(ctx, rect.x + 14, rect.y + rect.h - 18, (rect.w - 28) * ratio, 9, 4.5);
    ctx.fillStyle = kitchen.patienceColor(ticket);
    ctx.fill();
    if (match) {
      pill(rect.x + rect.w - 78, rect.y + rect.h - 44, 66, 24, '#58b368');
      text('SIAP!', rect.x + rect.w - 45, rect.y + rect.h - 31, 14, '#fff', 900, 'center');
    }
  }
  if (kitchen.tickets.length === 0 && kitchen.screen === 'playing') {
    text('Pelanggan berikutnya segera datang…', 640, 130, 20, COLORS.inkSoft, 700, 'center');
  }
}

function drawStations() {
  const rects = stationRects();
  text('KOMPOR', rects[0].x, 216, 15, '#fff', 900);
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const prog = kitchen.stationProgress(i);
    drawStove(ctx, rect.x, rect.y, rect.w, rect.h, !!prog, prog ? prog.ratio : null);
    if (prog) {
      drawIngredient(ctx, prog.ingredient, rect.x + rect.w / 2, rect.y + rect.h * 0.42, 26);
      if (prog.done) {
        const pulse = 1 + Math.sin(frozenTime * 6 + i) * 0.08;
        ctx.save();
        ctx.translate(rect.x + rect.w / 2, rect.y + rect.h * 0.42);
        ctx.scale(pulse, pulse);
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        pill(rect.x + rect.w / 2 - 32, rect.y + rect.h - 8, 64, 22, '#58b368');
        text('SIAP!', rect.x + rect.w / 2, rect.y + rect.h + 3, 13, '#fff', 900, 'center');
      } else {
        text('memasak…', rect.x + rect.w / 2, rect.y + rect.h + 12, 13, '#fff', 700, 'center');
      }
    } else {
      text('kosong', rect.x + rect.w / 2, rect.y + rect.h / 2 + 8, 14, 'rgba(255,255,255,0.6)', 700, 'center');
    }
  }
}

function drawDrinkStation() {
  const rect = drinkStationRect();
  text('MINUMAN', rect.x, 216, 15, '#fff', 900);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = '#fffdf5';
  ctx.fill();
  ctx.strokeStyle = COLORS.ticketEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  drawIngredient(ctx, 'teh', rect.x + 42, rect.y + 54, 32);
  text('ES TEH', rect.x + 114, rect.y + 44, 18, COLORS.ink, 900, 'center');
  text('ketuk = sajikan', rect.x + 114, rect.y + 72, 13, COLORS.inkSoft, 700, 'center');
}

function drawPlateArea() {
  const plate = plateRect();
  text('PIRING SAJI', plate.x + plate.w / 2, 216, 15, '#fff', 900, 'center');
  const shake = kitchen.shakePlate > 0 ? Math.sin(kitchen.now * 40) * 6 * kitchen.shakePlate : 0;
  ctx.save();
  ctx.translate(shake, 0);
  drawPlate(ctx, plate.x + plate.w / 2, plate.y + plate.h / 2 + 10, 104);
  const spots = plateItemPositions(kitchen.plate.length);
  kitchen.plate.forEach((id, i) => {
    drawIngredient(ctx, id, spots[i].x, spots[i].y, 32);
  });
  ctx.restore();
  if (kitchen.plate.length === 0) {
    text('Rakit hidangan di sini', plate.x + plate.w / 2, plate.y + plate.h / 2 + 10, 16, 'rgba(58,36,21,0.45)', 700, 'center');
  }
  const serve = serveButtonRect();
  const match = kitchen.matchingTicket();
  const ready = kitchen.plate.length > 0 && match;
  const glow = ready ? 1 + Math.sin(frozenTime * 5) * 0.06 : 1;
  ctx.save();
  ctx.translate(serve.x + serve.w / 2, serve.y + serve.h / 2);
  ctx.scale(glow, glow);
  ctx.translate(-(serve.x + serve.w / 2), -(serve.y + serve.h / 2));
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 16);
  ctx.fillStyle = ready ? COLORS.gold : kitchen.plate.length > 0 ? '#c98a4b' : '#b9a488';
  ctx.fill();
  ctx.strokeStyle = ready ? '#fff' : 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#7d4a1e';
  ctx.beginPath();
  ctx.arc(serve.x + serve.w / 2, serve.y + 34, 22, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(serve.x + serve.w / 2 - 30, serve.y + 32, 60, 8);
  ctx.fillStyle = '#7d4a1e';
  ctx.beginPath();
  ctx.arc(serve.x + serve.w / 2, serve.y + 48, 5, 0, Math.PI * 2);
  ctx.fill();
  text('🔔 SAJIKAN', serve.x + serve.w / 2, serve.y + 74, 20, '#fff', 900, 'center');
  text('Spasi / Enter', serve.x + serve.w / 2, serve.y + 112, 12, '#fff', 700, 'center');
  if (kitchen.serveFlash > 0) {
    ctx.fillStyle = `rgba(242, 183, 5, ${kitchen.serveFlash * 0.25})`;
    ctx.fillRect(0, 200, VIEW_W, 278);
  }
}

function drawCounter() {
  text('BAHAN DI COUNTER — klik atau tekan 1–8', 16, 500, 16, COLORS.ink, 900);
  const bins = binRects();
  for (const bin of bins) {
    const def = INGREDIENTS[bin.id];
    softShadow(ctx, bin.x + bin.w / 2, bin.y + bin.h, bin.w / 2, 8);
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 14);
    ctx.fillStyle = COLORS.counterTop;
    ctx.fill();
    ctx.strokeStyle = COLORS.wood;
    ctx.lineWidth = 3;
    ctx.stroke();
    drawIngredient(ctx, bin.id, bin.x + bin.w / 2, bin.y + 62, 38);
    text(def.name, bin.x + bin.w / 2, bin.y + 122, 18, COLORS.ink, 900, 'center');
    text(def.cooks ? `masak ${def.cookSeconds} dtk` : 'siap saji', bin.x + bin.w / 2, bin.y + 144, 13, COLORS.inkSoft, 700, 'center');
    ctx.fillStyle = COLORS.teal;
    ctx.beginPath();
    ctx.arc(bin.x + 18, bin.y + 18, 14, 0, Math.PI * 2);
    ctx.fill();
    text(def.key, bin.x + 18, bin.y + 19, 15, '#fff', 900, 'center');
  }
}

function drawToast() {
  if (!kitchen.toast || kitchen.now > kitchen.toastUntil) return;
  ctx.font = '700 19px "Trebuchet MS", "Segoe UI", Verdana, sans-serif';
  const w = ctx.measureText(kitchen.toast).width + 44;
  pill(640 - w / 2, 448, w, 40, 'rgba(58,36,21,0.88)');
  text(kitchen.toast, 640, 469, 19, '#fff', 700, 'center');
}

function drawCoinBursts() {
  for (const burst of kitchen.coinBursts) {
    const age = kitchen.now - burst.born;
    const y = 250 - age * 55;
    const alpha = Math.max(0, 1 - age / 1.1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(855, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7d4a1e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#7d4a1e';
    ctx.font = '900 13px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Rp', 855, y + 1);
    ctx.font = '900 26px "Trebuchet MS", "Segoe UI", Verdana, sans-serif';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#7d4a1e';
    ctx.strokeText(`+${burst.amount} koin!`, 925, y);
    ctx.fillStyle = '#fff';
    ctx.fillText(`+${burst.amount} koin!`, 925, y);
    ctx.globalAlpha = 1;
  }
}

function bigButton(rect, label, sub = null) {
  softShadow(ctx, rect.x + rect.w / 2, rect.y + rect.h, rect.w / 2, 10);
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 16);
  ctx.fillStyle = COLORS.gold;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(label, rect.x + rect.w / 2, rect.y + rect.h / 2 - (sub ? 10 : 0), 26, '#7d4a1e', 900, 'center');
  if (sub) text(sub, rect.x + rect.w / 2, rect.y + rect.h / 2 + 20, 14, '#7d4a1e', 700, 'center');
}

function drawTitleScreen() {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = COLORS.teal;
  ctx.fillRect(0, 0, VIEW_W, 200);
  ctx.fillStyle = COLORS.tealDark;
  ctx.fillRect(0, 194, VIEW_W, 8);
  text('🍳 DAPUR NUSANTARA', 640, 84, 64, '#fff', 900, 'center');
  text('Warung kilat — masak cepat, sajikan tepat!', 640, 146, 24, '#c8efe9', 700, 'center');
  text('Pelanggan datang dengan pesanan. Rakit hidangannya di piring, sajikan sebelum mereka pergi!', 640, 240, 20, COLORS.ink, 700, 'center');
  const cards = [
    { id: 'nasiGoreng', x: 90 },
    { id: 'mieAyam', x: 300 },
    { id: 'sateAyam', x: 510 },
    { id: 'gadoGado', x: 720 },
    { id: 'esTeh', x: 930 },
  ];
  for (const card of cards) {
    const recipe = RECIPES[card.id];
    roundRect(ctx, card.x, 280, 190, 190, 14);
    ctx.fillStyle = '#fffdf5';
    ctx.fill();
    ctx.strokeStyle = COLORS.ticketEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawDish(ctx, card.id, card.x + 95, 350, 52);
    text(recipe.name, card.x + 95, 420, 18, COLORS.ink, 900, 'center');
    text(recipe.blurb, card.x + 95, 444, 13, COLORS.inkSoft, 700, 'center');
    pill(card.x + 62, 456, 66, 24, COLORS.gold);
    text(`🪙 ${recipe.coins}`, card.x + 95, 469, 14, '#7d4a1e', 900, 'center');
  }
  bigButton(titleButtonRect(), '▶  MULAI MASAK', 'atau tekan Spasi');
  text('Klik bahan di counter (1–8)  •  Spasi = sajikan  •  M = suara  •  P = jeda', 640, 628, 16, COLORS.inkSoft, 700, 'center');
  text('3 hati • 1 hari = 150 detik • combo menaikkan bayaran', 640, 656, 16, COLORS.inkSoft, 700, 'center');
}

function drawDaySummary() {
  const s = kitchen.daySummary;
  ctx.fillStyle = 'rgba(58,36,21,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  roundRect(ctx, 340, 130, 600, 440, 20);
  ctx.fillStyle = '#fffdf5';
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 4;
  ctx.stroke();
  text(`🎉 HARI ${s.day} SELESAI!`, 640, 190, 40, COLORS.ink, 900, 'center');
  const rows = [
    ['Pesanan disajikan', `${s.served}`],
    ['Pelanggan pergi', `${s.missed}`],
    ['Koin hari ini', `🪙 ${s.earned}`],
    ['Combo terbaik', `🔥 x${s.bestCombo}`],
    ['Total skor', `${kitchen.score}`],
  ];
  rows.forEach((row, i) => {
    text(row[0], 420, 250 + i * 42, 22, COLORS.inkSoft, 700);
    text(row[1], 860, 250 + i * 42, 22, COLORS.ink, 900, 'right');
  });
  bigButton(summaryButtonRect(), `▶  HARI ${s.day + 1}`, 'pelanggan makin cepat!');
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(58,36,21,0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  roundRect(ctx, 340, 130, 600, 440, 20);
  ctx.fillStyle = '#fffdf5';
  ctx.fill();
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 4;
  ctx.stroke();
  text('😖 WARUNG TUTUP!', 640, 190, 40, COLORS.red, 900, 'center');
  text('Terlalu banyak pelanggan pergi kecewa.', 640, 236, 20, COLORS.inkSoft, 700, 'center');
  const rows = [
    ['Hari tercapai', `${kitchen.day}`],
    ['Pesanan disajikan', `${kitchen.servedToday}`],
    ['Total koin', `🪙 ${kitchen.coins}`],
    ['Skor akhir', `${kitchen.score}`],
  ];
  rows.forEach((row, i) => {
    text(row[0], 420, 292 + i * 42, 22, COLORS.inkSoft, 700);
    text(row[1], 860, 292 + i * 42, 22, COLORS.ink, 900, 'right');
  });
  bigButton(gameOverButtonRect(), '↻  MAIN LAGI', 'atau tekan Spasi');
}

function drawPaused() {
  ctx.fillStyle = 'rgba(58,36,21,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text('⏸ JEDA', 640, 340, 56, '#fff', 900, 'center');
  text('Tekan P atau tombol jeda untuk lanjut', 640, 400, 20, '#fff', 700, 'center');
}

function render() {
  if (kitchen.screen === 'title') {
    drawTitleScreen();
    return;
  }
  drawBackground();
  drawTopBar();
  drawTickets();
  drawStations();
  drawDrinkStation();
  drawPlateArea();
  drawCounter();
  drawToast();
  drawCoinBursts();
  if (kitchen.screen === 'daysummary') drawDaySummary();
  if (kitchen.screen === 'gameover') drawGameOver();
  if (kitchen.paused && kitchen.screen === 'playing') drawPaused();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  frozenTime = now / 1000;
  if (!shotMode) kitchen.update(dt);
  render();
  requestAnimationFrame(loop);
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  shotMode = true;
  applyShot(kitchen, shot, Number(params.get('seed') || 7));
  render();
} else {
  requestAnimationFrame(loop);
}

window.__game = { kitchen, sfx };
