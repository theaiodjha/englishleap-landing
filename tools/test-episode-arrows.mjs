/* node tools/test-episode-arrows.mjs
 *
 * The in-game episode arrows must never sit on the board. Runs the page's real
 * placeArrows() against the board geometry the CSS actually produces, at a spread of
 * window widths.
 *
 * The bug this locks down: placeArrows clamped with Math.max(10, …), so when the board grew
 * to the full 1100px column there was no gutter left and the clamp pinned each pill 10px
 * from the window edge — which is INSIDE the board. Two things fix it, and both are checked
 * here: the arrow drops its label when the gutter is tight, and the page reserves a wider
 * side padding in the band where the column would otherwise fill the window.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const src = fs.readFileSync(path.join(ROOT, 'games', 'story-unlock', 'index.html'), 'utf8');
const block = [...src.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((x) => x[1]).find((x) => /function placeArrows/.test(x));
const body = block.slice(block.indexOf('function placeArrows'));
const fn = body.slice(0, body.indexOf('\n}') + 2);

const FULL = 96;      // measured pill with the "EP280" label
const ICON = 38;      // icon only

function run({ viewport, boardLeft, boardWidth }) {
  const boardRight = boardLeft + boardWidth;
  const mk = () => {
    const cls = new Set();
    return {
      style: {},
      classList: { add: (c) => cls.add(c), remove: (c) => cls.delete(c), has: (c) => cls.has(c) },
      get offsetWidth() { return cls.has('compact') ? ICON : FULL; },
      compact: () => cls.has('compact'),
    };
  };
  const p = mk(), n = mk();
  const el = { hidden: false, querySelector: (s) => (s === '.p' ? p : n) };
  new Function('$', 'document', 'innerWidth', 'innerHeight', 'BOARD_SEL', fn + '\nreturn placeArrows;')(
    () => el,
    { querySelector: () => ({ getBoundingClientRect: () => ({ top: 200, height: 400, left: boardLeft, right: boardRight }) }) },
    viewport, 900, '#board',
  )();
  const pLeft = parseInt(p.style.left, 10);
  const pRight = pLeft + p.offsetWidth;
  const nRight = parseInt(n.style.right, 10);
  const nLeft = viewport - nRight - n.offsetWidth;
  return {
    left: { from: pLeft, to: pRight, compact: p.compact(), overlaps: pRight > boardLeft },
    right: { from: nLeft, to: nLeft + n.offsetWidth, compact: n.compact(), overlaps: nLeft < boardRight },
  };
}

// board geometry as the CSS produces it: a 1100px column, with wider page padding in the
// band where the column would otherwise fill the window
const boardFor = (viewport) => {
  const pad = viewport >= 721 && viewport <= 1240 ? 64 : 18;
  const width = Math.min(1100 - 2 * pad, viewport - 2 * pad);
  return { viewport, boardLeft: Math.round((viewport - width) / 2), boardWidth: width };
};
const CASES = [1440, 1366, 1280, 1240, 1180, 1100, 1024, 900, 800, 721, 390]
  .map((v) => [`viewport ${v}`, boardFor(v)]);

let bad = 0;
for (const [label, geo] of CASES) {
  const r = run(geo);
  const phone = geo.viewport <= 720;
  const clash = !phone && (r.left.overlaps || r.right.overlaps);
  if (clash) bad++;
  const mode = (s) => (s.compact ? 'icon' : 'pill');
  console.log(
    `${clash ? 'FAIL ' : 'ok   '}${label.padEnd(32)} ` +
    `left ${mode(r.left)} [${r.left.from}..${r.left.to}] board starts ${geo.boardLeft} | ` +
    `right ${mode(r.right)} starts ${r.right.from}, board ends ${geo.boardLeft + geo.boardWidth}`,
  );
}
console.log(bad ? `\n${bad} geometry FAILED` : '\nno arrow sits on the board at any tested width');
process.exit(bad ? 1 : 0);
