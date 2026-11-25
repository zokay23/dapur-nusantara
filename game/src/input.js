// Dapur Nusantara — mouse and keyboard. Clicks are translated into the kitchen's
// verbs (take an ingredient, take food off a stove, serve, start the game), and the
// keyboard mirrors them: 1-8 for the bins, Space or Enter to serve, M to mute, P to
// pause. Nothing here draws; it only tells the kitchen what the player asked for.

import { INGREDIENTS } from './config.js';
import {
  binRects,
  drinkStationRect,
  gameOverButtonRect,
  plateItemPositions,
  plateRect,
  pointIn,
  serveButtonRect,
  stationRects,
  summaryButtonRect,
  titleButtonRect,
  topBarRects,
} from './layout.js';

export function installInput(canvas, kitchen, sfx, onFirstGesture) {
  function viewPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function handleClick(x, y) {
    sfx.unlock();
    onFirstGesture();
    const top = topBarRects();
    if (pointIn(top.mute, x, y)) {
      sfx.toggleMute();
      return;
    }
    if (pointIn(top.pause, x, y) && kitchen.screen === 'playing') {
      kitchen.paused = !kitchen.paused;
      return;
    }

    if (kitchen.screen === 'title') {
      if (pointIn(titleButtonRect(), x, y)) {
        kitchen.startGame();
        sfx.bell();
      }
      return;
    }
    if (kitchen.screen === 'daysummary') {
      if (pointIn(summaryButtonRect(), x, y)) {
        kitchen.nextDay();
        sfx.bell();
      }
      return;
    }
    if (kitchen.screen === 'gameover') {
      if (pointIn(gameOverButtonRect(), x, y)) {
        kitchen.startGame();
        sfx.bell();
      }
      return;
    }
    if (kitchen.screen !== 'playing' || kitchen.paused) return;

    // The bell serves the plate.
    if (pointIn(serveButtonRect(), x, y)) {
      const result = kitchen.serve();
      if (result === 'served') {
        sfx.ding();
        sfx.coins();
      } else if (result === 'wrong' || result === 'empty') {
        sfx.buzz();
      }
      return;
    }

    // A tap on a plated ingredient takes it back off.
    const spots = plateItemPositions(kitchen.plate.length);
    for (let i = 0; i < spots.length; i++) {
      const dx = x - spots[i].x;
      const dy = y - spots[i].y;
      if (dx * dx + dy * dy <= spots[i].r * spots[i].r) {
        kitchen.removeFromPlate(i);
        sfx.click();
        return;
      }
    }

    // A tap on a stove takes finished food off it.
    const stations = stationRects();
    for (let i = 0; i < stations.length; i++) {
      if (pointIn(stations[i], x, y)) {
        const result = kitchen.takeFromStation(i);
        if (result === 'plated') sfx.pop();
        else if (result === 'full' || result === 'busy') sfx.buzz();
        else if (result === 'cooking') sfx.click();
        return;
      }
    }

    // The drink tap is a shortcut for the Es Teh bin.
    if (pointIn(drinkStationRect(), x, y)) {
      const result = kitchen.takeIngredient('teh');
      if (result === 'plated') sfx.pop();
      else if (result === 'full') sfx.buzz();
      return;
    }

    // Ingredient bins along the counter.
    for (const bin of binRects()) {
      if (pointIn(bin, x, y)) {
        const result = kitchen.takeIngredient(bin.id);
        if (result === 'plated') sfx.pop();
        else if (result === 'cooking') sfx.sizzle();
        else if (result === 'full' || result === 'busy') sfx.buzz();
        return;
      }
    }
  }

  canvas.addEventListener('click', (event) => {
    const point = viewPoint(event);
    handleClick(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    sfx.unlock();
    onFirstGesture();
    const key = event.key.toLowerCase();
    if (key === 'm') {
      sfx.toggleMute();
      return;
    }
    if (key === 'p' && kitchen.screen === 'playing') {
      kitchen.paused = !kitchen.paused;
      return;
    }
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      if (kitchen.screen === 'title') {
        kitchen.startGame();
        sfx.bell();
      } else if (kitchen.screen === 'daysummary') {
        kitchen.nextDay();
        sfx.bell();
      } else if (kitchen.screen === 'gameover') {
        kitchen.startGame();
        sfx.bell();
      } else if (kitchen.screen === 'playing' && !kitchen.paused) {
        const result = kitchen.serve();
        if (result === 'served') {
          sfx.ding();
          sfx.coins();
        } else if (result === 'wrong' || result === 'empty') {
          sfx.buzz();
        }
      }
      return;
    }
    if (kitchen.screen !== 'playing' || kitchen.paused) return;
    for (const [id, def] of Object.entries(INGREDIENTS)) {
      if (def.key === key) {
        const result = kitchen.takeIngredient(id);
        if (result === 'plated') sfx.pop();
        else if (result === 'cooking') sfx.sizzle();
        else if (result === 'full' || result === 'busy') sfx.buzz();
        return;
      }
    }
  });
}
