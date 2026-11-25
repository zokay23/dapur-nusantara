// Dapur Nusantara — the kitchen itself: the orders on the board, the stoves, the plate
// being assembled, the coins and the clock. This module knows nothing about drawing or
// input; main.js renders what it holds, input.js calls its verbs.

import {
  COLORS,
  COMBO_CAP,
  DAY_SECONDS,
  INGREDIENTS,
  MAX_TICKETS,
  RECIPES,
  RECIPE_ORDER,
  START_HEARTS,
  STATIONS,
} from './config.js';

let nextTicketId = 1;

function randomRecipe(rng) {
  return RECIPE_ORDER[Math.floor(rng() * RECIPE_ORDER.length)];
}

function makeTicket(day, rng, now) {
  const recipeId = randomRecipe(rng);
  const recipe = RECIPES[recipeId];
  const impatience = Math.max(0.72, 1 - (day - 1) * 0.07);
  return {
    id: nextTicketId++,
    recipeId,
    name: recipe.name,
    needs: [...recipe.needs],
    coins: recipe.coins,
    variant: Math.floor(rng() * 5),
    patience: recipe.patience * impatience,
    patienceMax: recipe.patience * impatience,
    bornAt: now,
    doneAt: null,
    doneKind: null,
    wobble: 0,
  };
}

export class Kitchen {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.screen = 'title';
    this.day = 1;
    this.coins = 0;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.hearts = START_HEARTS;
    this.dayTimeLeft = DAY_SECONDS;
    this.tickets = [];
    this.plate = [];
    this.stations = Array.from({ length: STATIONS }, () => ({ ingredient: null, doneAt: 0 }));
    this.spawnIn = 1.2;
    this.servedToday = 0;
    this.missedToday = 0;
    this.earnedToday = 0;
    this.toast = null;
    this.toastUntil = 0;
    this.serveFlash = 0;
    this.coinBursts = [];
    this.now = 0;
    this.paused = false;
    this.daySummary = null;
    this.shakePlate = 0;
  }

  startDay() {
    this.screen = 'playing';
    this.dayTimeLeft = DAY_SECONDS;
    this.tickets = [];
    this.plate = [];
    this.stations = Array.from({ length: STATIONS }, () => ({ ingredient: null, doneAt: 0 }));
    this.spawnIn = 0.8;
    this.servedToday = 0;
    this.missedToday = 0;
    this.earnedToday = 0;
    this.daySummary = null;
    this.paused = false;
  }

  startGame() {
    this.reset();
    this.startDay();
  }

  showToast(text, seconds = 1.6) {
    this.toast = text;
    this.toastUntil = this.now + seconds;
  }

  freeStation() {
    return this.stations.findIndex((s) => s.ingredient === null);
  }

  // The player asks for an ingredient. Ready ones go straight on the plate; ones that
  // need cooking take a free stove first and are plated from there when they are done.
  takeIngredient(id) {
    if (this.screen !== 'playing' || this.paused) return false;
    const def = INGREDIENTS[id];
    if (!def) return false;
    if (this.plate.length >= 5) {
      this.showToast('Piring penuh! Sajikan dulu.');
      return 'full';
    }
    if (!def.cooks) {
      this.plate.push(id);
      return 'plated';
    }
    const slot = this.freeStation();
    if (slot === -1) {
      this.showToast('Kompor penuh! Tunggu masakan matang.');
      return 'busy';
    }
    this.stations[slot] = { ingredient: id, doneAt: this.now + def.cookSeconds };
    return 'cooking';
  }

  // Click a stove: a finished dish comes off it and onto the plate.
  takeFromStation(slot) {
    if (this.screen !== 'playing' || this.paused) return false;
    const station = this.stations[slot];
    if (!station || !station.ingredient) return false;
    if (this.now < station.doneAt) return 'cooking';
    if (this.plate.length >= 5) {
      this.showToast('Piring penuh! Sajikan dulu.');
      return 'full';
    }
    const id = station.ingredient;
    this.stations[slot] = { ingredient: null, doneAt: 0 };
    this.plate.push(id);
    return 'plated';
  }

  // Take one ingredient back off the plate (a tap on it removes it).
  removeFromPlate(index) {
    if (this.screen !== 'playing' || this.paused) return false;
    if (index < 0 || index >= this.plate.length) return false;
    this.plate.splice(index, 1);
    return true;
  }

  clearPlate() {
    this.plate = [];
  }

  // Does the plate hold exactly the ticket's recipe, in any order?
  plateMatches(ticket) {
    if (this.plate.length !== ticket.needs.length) return false;
    const have = [...this.plate].sort();
    const want = [...ticket.needs].sort();
    return have.every((item, i) => item === want[i]);
  }

  matchingTicket() {
    return this.tickets.find((t) => this.plateMatches(t)) ?? null;
  }

  // Ring the bell: serve the plate to the ticket it matches, or buzz and shake.
  serve() {
    if (this.screen !== 'playing' || this.paused) return false;
    if (this.plate.length === 0) {
      this.showToast('Piring kosong — rakit hidangan dulu!');
      return 'empty';
    }
    const ticket = this.matchingTicket();
    if (!ticket) {
      this.combo = 0;
      this.shakePlate = 0.35;
      this.showToast('Bukan pesanan itu! Cek papan order.');
      return 'wrong';
    }
    const timeBonus = Math.round((ticket.patience / ticket.patienceMax) * 4);
    const multiplier = 1 + Math.min(this.combo, COMBO_CAP) * 0.1;
    const earned = Math.round((ticket.coins + timeBonus) * multiplier);
    this.coins += earned;
    this.earnedToday += earned;
    this.score += earned * 10;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.servedToday += 1;
    ticket.doneAt = this.now;
    ticket.doneKind = 'served';
    ticket.earned = earned;
    this.tickets = this.tickets.filter((t) => t.id !== ticket.id);
    this.plate = [];
    this.serveFlash = 0.5;
    this.coinBursts.push({ x: 640, y: 300, born: this.now, amount: earned });
    return 'served';
  }

  update(dt) {
    if (this.screen !== 'playing' || this.paused) return;
    this.now += dt;
    this.dayTimeLeft -= dt;
    if (this.serveFlash > 0) this.serveFlash -= dt;
    if (this.shakePlate > 0) this.shakePlate -= dt;
    this.coinBursts = this.coinBursts.filter((b) => this.now - b.born < 1.1);

    // Tickets lose patience; an empty one walks out and costs a heart.
    for (const ticket of [...this.tickets]) {
      ticket.patience -= dt;
      if (ticket.patience <= 0) {
        this.tickets = this.tickets.filter((t) => t.id !== ticket.id);
        this.missedToday += 1;
        this.hearts -= 1;
        this.combo = 0;
        this.showToast(`${ticket.name}: pelanggan pergi! -1 hati`);
        if (this.hearts <= 0) {
          this.screen = 'gameover';
          return;
        }
      }
    }

    // New customers arrive faster as the days go on, up to four at the board.
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.tickets.length < MAX_TICKETS) {
      this.tickets.push(makeTicket(this.day, this.rng, this.now));
      const gap = Math.max(4.5, 11 - this.day * 1.1);
      this.spawnIn = gap * (0.75 + this.rng() * 0.5);
    }

    if (this.dayTimeLeft <= 0) {
      this.dayTimeLeft = 0;
      this.daySummary = {
        day: this.day,
        served: this.servedToday,
        missed: this.missedToday,
        earned: this.earnedToday,
        bestCombo: this.bestCombo,
      };
      this.screen = 'daysummary';
    }
  }

  nextDay() {
    this.day += 1;
    this.startDay();
  }

  // Seconds left on the day clock, for the HUD.
  clockText() {
    const total = Math.max(0, Math.ceil(this.dayTimeLeft));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  // The colour of a ticket's patience bar: green while calm, red when it is about to go.
  patienceColor(ticket) {
    const ratio = ticket.patience / ticket.patienceMax;
    if (ratio > 0.5) return '#58b368';
    if (ratio > 0.25) return '#f2b705';
    return '#e23b2e';
  }

  stationProgress(slot) {
    const station = this.stations[slot];
    if (!station.ingredient) return null;
    const def = INGREDIENTS[station.ingredient];
    const total = def.cookSeconds;
    const left = Math.max(0, station.doneAt - this.now);
    return { done: left <= 0, ratio: 1 - left / total, ingredient: station.ingredient };
  }
}

export { COLORS };
