// Dapur Nusantara — all the art is drawn here with canvas paths: no images, no fonts
// from the network. Every ingredient, dish and customer face is a small function that
// draws itself at a centre point and a size, so the counter, the plate and the tickets
// all share the same pictures.

import { COLORS } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function softShadow(ctx, x, y, w, h) {
  ctx.fillStyle = COLORS.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
}

function bowl(ctx, x, y, r, rimColor, bodyColor) {
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rimColor;
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.05, r * 1.08, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function grain(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.55, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

// One ingredient icon, drawn at (cx, cy) with radius r. Every icon reads at a glance
// even when it is shrunk onto a ticket, so each has one strong shape and one accent.
export function drawIngredient(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'nasi') {
    bowl(ctx, 0, r * 0.28, r * 0.92, '#3a6ea5', '#2f5d8f');
    ctx.fillStyle = '#fff8e7';
    circle(ctx, 0, -r * 0.12, r * 0.62);
    ctx.fill();
    ctx.fillStyle = '#f3e3bd';
    grain(ctx, -r * 0.28, -r * 0.2, r * 0.14, '#f3e3bd');
    grain(ctx, r * 0.22, -r * 0.3, r * 0.13, '#f3e3bd');
    grain(ctx, r * 0.05, -r * 0.02, r * 0.14, '#f3e3bd');
    grain(ctx, -r * 0.05, -r * 0.38, r * 0.12, '#fffdf2');
    ctx.fillStyle = '#58b368';
    ctx.beginPath();
    ctx.ellipse(r * 0.3, -r * 0.12, r * 0.16, r * 0.08, 0.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'mie') {
    bowl(ctx, 0, r * 0.28, r * 0.92, '#c94f2e', '#a83e22');
    ctx.strokeStyle = '#e0a92e';
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc((i - 1) * r * 0.3, -r * 0.08 + i * r * 0.1, r * 0.34, Math.PI * 0.15, Math.PI * 1.15);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ffd34d';
    ctx.lineWidth = r * 0.1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc((i - 1) * r * 0.3, -r * 0.1 + i * r * 0.1, r * 0.26, Math.PI * 0.2, Math.PI * 1.1);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8a5a12';
    ctx.lineWidth = r * 0.09;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.85);
    ctx.lineTo(r * 0.62, r * 0.35);
    ctx.moveTo(r * 0.48, -r * 0.8);
    ctx.lineTo(r * 0.8, r * 0.32);
    ctx.stroke();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#9a5424';
    ctx.beginPath();
    ctx.ellipse(-r * 0.08, r * 0.05, r * 0.62, r * 0.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c97b3d';
    ctx.beginPath();
    ctx.ellipse(-r * 0.14, -r * 0.02, r * 0.5, r * 0.4, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7d3c14';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.28);
    ctx.lineTo(r * 0.05, r * 0.12);
    ctx.moveTo(-r * 0.2, -r * 0.38);
    ctx.lineTo(r * 0.18, r * 0.02);
    ctx.stroke();
    ctx.strokeStyle = '#f3e2c2';
    ctx.lineWidth = r * 0.14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.32, r * 0.32);
    ctx.lineTo(r * 0.72, r * 0.72);
    ctx.stroke();
    ctx.fillStyle = '#fff8e7';
    circle(ctx, r * 0.78, r * 0.78, r * 0.16);
    ctx.fill();
    circle(ctx, r * 0.62, r * 0.9, r * 0.13);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffdf2';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.78, r * 0.62, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fdf3d0';
    ctx.beginPath();
    ctx.ellipse(r * 0.1, r * 0.18, r * 0.6, r * 0.44, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b705';
    circle(ctx, r * 0.05, r * 0.02, r * 0.38);
    ctx.fill();
    ctx.fillStyle = '#ffcf3d';
    circle(ctx, -r * 0.06, -r * 0.08, r * 0.2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, -r * 0.1, -r * 0.14, r * 0.09);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.34, r * 0.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#58b368';
    ctx.beginPath();
    ctx.ellipse(r * 0.05, -r * 0.18, r * 0.36, r * 0.52, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7ed491';
    ctx.beginPath();
    ctx.ellipse(r * 0.32, r * 0.05, r * 0.3, r * 0.44, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2701d';
    circle(ctx, -r * 0.3, r * 0.42, r * 0.26);
    ctx.fill();
    circle(ctx, r * 0.28, r * 0.48, r * 0.26);
    ctx.fill();
    ctx.fillStyle = '#f7a44a';
    circle(ctx, -r * 0.3, r * 0.42, r * 0.13);
    ctx.fill();
    circle(ctx, r * 0.28, r * 0.48, r * 0.13);
    ctx.fill();
  } else if (id === 'sambal') {
    bowl(ctx, 0, r * 0.3, r * 0.85, '#7d1f14', '#5e150c');
    ctx.fillStyle = '#e23b2e';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.08, r * 0.68, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c22a1e';
    circle(ctx, -r * 0.25, -r * 0.1, r * 0.14);
    ctx.fill();
    circle(ctx, r * 0.3, -r * 0.16, r * 0.12);
    ctx.fill();
    ctx.strokeStyle = '#d92038';
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.55);
    ctx.quadraticCurveTo(r * 0.1, -r * 0.85, r * 0.55, -r * 0.45);
    ctx.stroke();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.45);
    ctx.lineTo(r * 0.72, -r * 0.62);
    ctx.stroke();
  } else if (id === 'kerupuk') {
    const cracker = (dx, dy, rot, c1, c2) => {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(rot);
      ctx.fillStyle = c1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        circle(ctx, Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.24);
        ctx.fill();
      }
      circle(ctx, 0, 0, r * 0.58);
      ctx.fill();
      ctx.fillStyle = c2;
      circle(ctx, 0, 0, r * 0.3);
      ctx.fill();
      ctx.restore();
    };
    cracker(-r * 0.3, r * 0.25, -0.4, '#ffb3c1', '#e07f92');
    cracker(r * 0.32, r * 0.28, 0.5, '#ffd9a0', '#f2a65e');
    cracker(0, -r * 0.28, 0, '#fff3c4', '#f2c94c');
  } else if (id === 'teh') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.7);
    ctx.lineTo(r * 0.55, -r * 0.7);
    ctx.lineTo(r * 0.38, r * 0.75);
    ctx.lineTo(-r * 0.38, r * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d98e32';
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, -r * 0.5);
    ctx.lineTo(r * 0.48, -r * 0.5);
    ctx.lineTo(r * 0.36, r * 0.62);
    ctx.lineTo(-r * 0.36, r * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b96f1e';
    ctx.fillRect(-r * 0.44, -r * 0.2, r * 0.88, r * 0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(-r * 0.28, -r * 0.34, r * 0.22, r * 0.22);
    ctx.fillRect(r * 0.05, -r * 0.05, r * 0.2, r * 0.2);
    ctx.strokeStyle = '#e23b2e';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.moveTo(r * 0.18, -r * 0.95);
    ctx.lineTo(r * 0.05, -r * 0.1);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.moveTo(r * 0.18, -r * 0.95);
    ctx.lineTo(r * 0.13, -r * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}

// A finished dish, drawn as it sits on a plate: the plate's food, not the plate itself.
export function drawDish(ctx, recipeId, cx, cy, r) {
  if (recipeId === 'esTeh') {
    drawIngredient(ctx, 'teh', cx, cy, r * 0.95);
    return;
  }
  if (recipeId === 'nasiGoreng') {
    drawIngredient(ctx, 'nasi', cx, cy + r * 0.1, r * 0.95);
    drawIngredient(ctx, 'telur', cx + r * 0.55, cy - r * 0.55, r * 0.5);
    drawIngredient(ctx, 'sayur', cx - r * 0.55, cy - r * 0.5, r * 0.45);
    drawIngredient(ctx, 'sambal', cx + r * 0.5, cy + r * 0.5, r * 0.42);
    return;
  }
  if (recipeId === 'mieAyam') {
    drawIngredient(ctx, 'mie', cx, cy + r * 0.08, r * 0.95);
    drawIngredient(ctx, 'ayam', cx + r * 0.5, cy - r * 0.55, r * 0.52);
    drawIngredient(ctx, 'sayur', cx - r * 0.55, cy - r * 0.45, r * 0.45);
    return;
  }
  if (recipeId === 'sateAyam') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#8a5a12';
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.35);
    ctx.lineTo(r * 0.7, -r * 0.55);
    ctx.moveTo(-r * 0.7, r * 0.1);
    ctx.lineTo(r * 0.7, -r * 0.1);
    ctx.moveTo(-r * 0.7, r * 0.55);
    ctx.lineTo(r * 0.7, r * 0.35);
    ctx.stroke();
    ctx.restore();
    drawIngredient(ctx, 'ayam', cx - r * 0.35, cy - r * 0.4, r * 0.5);
    drawIngredient(ctx, 'ayam', cx + r * 0.1, cy - r * 0.05, r * 0.5);
    drawIngredient(ctx, 'ayam', cx - r * 0.2, cy + r * 0.4, r * 0.5);
    drawIngredient(ctx, 'sambal', cx + r * 0.62, cy + r * 0.5, r * 0.42);
    drawIngredient(ctx, 'kerupuk', cx - r * 0.62, cy + r * 0.5, r * 0.4);
    return;
  }
  if (recipeId === 'gadoGado') {
    drawIngredient(ctx, 'sayur', cx, cy + r * 0.05, r * 0.9);
    drawIngredient(ctx, 'telur', cx + r * 0.5, cy - r * 0.5, r * 0.5);
    drawIngredient(ctx, 'kerupuk', cx - r * 0.55, cy - r * 0.45, r * 0.45);
    drawIngredient(ctx, 'sambal', cx + r * 0.55, cy + r * 0.45, r * 0.42);
  }
}

// An empty serving plate with a rim, at (cx, cy) with radius r.
export function drawPlate(ctx, cx, cy, r) {
  softShadow(ctx, cx, cy + r * 0.12, r * 1.05, r * 0.22);
  ctx.fillStyle = COLORS.plateRim;
  circle(ctx, cx, cy, r);
  ctx.fill();
  ctx.fillStyle = COLORS.plate;
  circle(ctx, cx, cy, r * 0.86);
  ctx.fill();
  ctx.strokeStyle = '#c9d6e2';
  ctx.lineWidth = 2;
  circle(ctx, cx, cy, r * 0.62);
  ctx.stroke();
}

// A customer face: variant picks skin, hair and a hat; mood picks the mouth.
export function drawCustomer(ctx, variant, mood, cx, cy, r) {
  const skins = ['#f7c99b', '#e8a06a', '#c98a5a', '#f2b98a', '#8a5a3b'];
  const hairs = ['#2b2118', '#5a3a1a', '#8a8a8a', '#3a2415', '#1a1a1a'];
  const skin = skins[variant % skins.length];
  const hair = hairs[variant % hairs.length];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = skin;
  circle(ctx, 0, 0, r);
  ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -r * 0.15, r * 0.98, Math.PI * 1.02, Math.PI * 1.98);
  ctx.closePath();
  ctx.fill();
  if (variant % 3 === 1) {
    ctx.fillStyle = '#e23b2e';
    ctx.fillRect(-r * 0.95, -r * 0.95, r * 1.9, r * 0.3);
    ctx.fillStyle = '#f2b705';
    circle(ctx, 0, -r * 0.8, r * 0.14);
    ctx.fill();
  } else if (variant % 3 === 2) {
    ctx.fillStyle = '#0e7c7b';
    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.75, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-r * 0.75, -r * 0.62, r * 1.5, r * 0.22);
  }
  ctx.fillStyle = '#2b2118';
  circle(ctx, -r * 0.36, -r * 0.05, r * 0.09);
  ctx.fill();
  circle(ctx, r * 0.36, -r * 0.05, r * 0.09);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  circle(ctx, -r * 0.44, r * 0.28, r * 0.14);
  ctx.fill();
  circle(ctx, r * 0.44, r * 0.28, r * 0.14);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = r * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') {
    ctx.arc(0, r * 0.3, r * 0.38, Math.PI * 0.15, Math.PI * 0.85);
  } else if (mood === 'angry') {
    ctx.arc(0, r * 0.72, r * 0.34, Math.PI * 1.15, Math.PI * 1.85);
  } else if (mood === 'worried') {
    ctx.arc(0, r * 0.45, r * 0.22, Math.PI * 1.1, Math.PI * 1.9);
  } else {
    ctx.moveTo(-r * 0.2, r * 0.48);
    ctx.lineTo(r * 0.2, r * 0.48);
  }
  ctx.stroke();
  if (mood === 'angry') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.35);
    ctx.lineTo(-r * 0.2, -r * 0.22);
    ctx.moveTo(r * 0.55, -r * 0.35);
    ctx.lineTo(r * 0.2, -r * 0.22);
    ctx.stroke();
  }
  ctx.restore();
}

// A wok on a stove burner, with flames when it is cooking.
export function drawStove(ctx, x, y, w, h, cooking, progress) {
  ctx.fillStyle = '#3a3a3a';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#555';
  circle(ctx, x + w / 2, y + h * 0.42, w * 0.3);
  ctx.fill();
  if (cooking) {
    ctx.fillStyle = '#ff9d2e';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.28, y + h * 0.62);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.05, x + w * 0.72, y + h * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.38, y + h * 0.62);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.28, x + w * 0.62, y + h * 0.62);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.42, w * 0.26, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  if (cooking && progress != null) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.42, w * 0.34, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.42, w * 0.34, -Math.PI / 2 + progress * Math.PI * 2, Math.PI * 1.5);
    ctx.stroke();
  }
}
