// Dapur Nusantara — the hand-in program for make.fun's "Make the best cooking game".
// Node 22, standard library only. It takes the game/ and screenshots/ folders that sit
// beside this file and hands them in: everything is copied to the output directory and
// a dossier.json is written there with the vendored make.fun library, so the judge can
// read the game from one file. The run is deterministic: the same repository always
// produces the same bytes, because the copy preserves file contents and the dossier is
// built from those same bytes, in the same order, every time.
//
// Run it from the repository root:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader's container MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');

function countEntries(dir: string): number {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += 1;
    if (statSync(path).isDirectory()) total += countEntries(path);
  }
  return total;
}

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

if (!existsSync(gameDir)) fail('game/ is missing from the repository');
if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
if (!existsSync(shotsDir)) fail('screenshots/ is missing from the repository');

const shotFiles = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  fail(`expected 3 or 4 screenshots, found ${shotFiles.length}`);
}

mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, 'game'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The scorer's caps, from the competition's gate: game/ holds at most 993 files and
// directories and 48 MiB in all, each screenshot at most 256 KiB, and the dossier text
// at most 160 KiB. The checks below refuse a hand-in the scorer would refuse, so a
// broken build fails loudly here instead of silently on the server.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

const gameEntries = countEntries(join(outDir, 'game'));
console.log(`handed in ${gameEntries} game entries and ${shotFiles.length} screenshots`);
console.log(`dossier.json: ${dossier.length} bytes`);
