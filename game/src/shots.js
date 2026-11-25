// Dapur Nusantara — the fixed scenes the screenshots are taken from. Each shot stages
// the kitchen into one readable moment (a busy board, a dish mid-assembly, a serve
// landing, the title screen) and freezes it, so the picture is the same every time it
// is taken. The game itself is unchanged: these states are all reachable by playing.

import { RECIPES } from './config.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stageTicket(recipeId, patienceRatio, variant) {
  const recipe = RECIPES[recipeId];
  return {
    id: 100 + Math.floor(Math.random() * 900),
    recipeId,
    name: recipe.name,
    needs: [...recipe.needs],
    coins: recipe.coins,
    variant,
    patience: recipe.patience * patienceRatio,
    patienceMax: recipe.patience,
    bornAt: 0,
    doneAt: null,
    doneKind: null,
    wobble: 0,
  };
}

function basePlaying(kitchen, day, clockLeft, coins, score, combo) {
  kitchen.screen = 'playing';
  kitchen.day = day;
  kitchen.dayTimeLeft = clockLeft;
  kitchen.coins = coins;
  kitchen.score = score;
  kitchen.combo = combo;
  kitchen.bestCombo = combo;
  kitchen.hearts = 3;
  kitchen.plate = [];
  kitchen.stations = [
    { ingredient: null, doneAt: 0 },
    { ingredient: null, doneAt: 0 },
    { ingredient: null, doneAt: 0 },
  ];
  kitchen.tickets = [];
  kitchen.toast = null;
  kitchen.serveFlash = 0;
  kitchen.coinBursts = [];
  kitchen.now = 100;
  kitchen.paused = false;
}

export function applyShot(kitchen, name, seed = 7) {
  const rng = mulberry32(seed);
  void rng;
  if (name === 'title') {
    kitchen.reset();
    kitchen.screen = 'title';
    return;
  }
  if (name === 'cover') {
    basePlaying(kitchen, 1, 107, 86, 1240, 3);
    kitchen.tickets = [
      stageTicket('mieAyam', 0.72, 1),
      stageTicket('nasiGoreng', 0.45, 3),
      stageTicket('sateAyam', 0.85, 0),
    ];
    kitchen.stations = [
      { ingredient: 'ayam', doneAt: 100 + 2.0 },
      { ingredient: 'telur', doneAt: 99.0 },
      { ingredient: null, doneAt: 0 },
    ];
    kitchen.plate = ['mie', 'ayam', 'sayur'];
    kitchen.coinBursts = [{ x: 640, y: 300, born: 99.7, amount: 18 }];
    return;
  }
  if (name === 'assembly') {
    basePlaying(kitchen, 1, 125, 34, 480, 1);
    kitchen.tickets = [
      stageTicket('nasiGoreng', 0.6, 2),
      stageTicket('mieAyam', 0.8, 4),
    ];
    kitchen.stations = [
      { ingredient: 'telur', doneAt: 100 + 1.0 },
      { ingredient: null, doneAt: 0 },
      { ingredient: null, doneAt: 0 },
    ];
    kitchen.plate = ['nasi', 'telur'];
    kitchen.toast = 'Nasi goreng: tinggal sayur + sambal!';
    kitchen.toastUntil = 101.6;
    return;
  }
  if (name === 'serve') {
    basePlaying(kitchen, 2, 72, 104, 1520, 4);
    kitchen.tickets = [
      stageTicket('gadoGado', 0.55, 0),
      stageTicket('esTeh', 0.9, 2),
    ];
    kitchen.stations = [
      { ingredient: 'mie', doneAt: 100 + 2.1 },
      { ingredient: null, doneAt: 0 },
      { ingredient: null, doneAt: 0 },
    ];
    kitchen.plate = [];
    kitchen.serveFlash = 0.4;
    kitchen.coinBursts = [{ x: 640, y: 300, born: 99.9, amount: 22 }];
    return;
  }
  basePlaying(kitchen, 1, 120, 0, 0, 0);
}
