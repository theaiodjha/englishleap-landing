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
 *
 * Below 720px there is no gutter at ANY board size, so the pager stops being an overlay and
 * becomes a footer pager in the flow. The check there is different in kind: placeArrows must
 * leave no inline geometry and no .compact class behind — a rotation from landscape would
 * otherwise strand the phone pager wearing the desktop layout's position, and .compact would
 * hide the episode label, the only reason the footer pager beats the arrow it replaced.
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
  if (viewport <= 720) {
    const stuck = [['top/left/right on the previous arrow', p], ['… on the next arrow', n]]
      .filter(([, b]) => b.style.top || b.style.left || b.style.right || b.compact());
    return { phone: true, stuck: stuck.map(([side]) => side) };
  }
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
const CASES = [1440, 1366, 1280, 1240, 1180, 1100, 1024, 900, 800, 721, 720, 430, 390, 360]
  .map((v) => [`viewport ${v}`, boardFor(v)]);

let bad = 0;
for (const [label, geo] of CASES) {
  const r = run(geo);
  if (r.phone) {
    const clash = r.stuck.length > 0;
    if (clash) bad++;
    console.log(`${clash ? 'FAIL ' : 'ok   '}${label.padEnd(32)} footer pager in the flow — `
      + (clash ? 'STALE overlay geometry: ' + r.stuck.join('; ') : 'no inline geometry, label kept'));
    continue;
  }
  const clash = r.left.overlaps || r.right.overlaps;
  if (clash) bad++;
  const mode = (s) => (s.compact ? 'icon' : 'pill');
  console.log(
    `${clash ? 'FAIL ' : 'ok   '}${label.padEnd(32)} ` +
    `left ${mode(r.left)} [${r.left.from}..${r.left.to}] board starts ${geo.boardLeft} | ` +
    `right ${mode(r.right)} starts ${r.right.from}, board ends ${geo.boardLeft + geo.boardWidth}`,
  );
}
console.log(bad
  ? `\n${bad} geometry FAILED`
  : '\nno arrow sits on the board at any tested width, and the phone pager stays in the flow');
process.exit(bad ? 1 : 0);
