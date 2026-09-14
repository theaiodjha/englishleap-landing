/* node tools/test-progress-drawer.js
 *
 * Opening and CLOSING the KPI drawer. Written after the drawer turned out to have no
 * visible way out: re-clicking the tile worked, but nothing said so, and opening from a
 * chart column left the tile unable to close it at all.
 *
 * This drives wireKpi() against a stub DOM rather than checking markup, because the bug
 * was in the state handling, not the HTML.
 */
const fs = require('fs');
const path = require('path');

const page = fs.readFileSync(path.join(__dirname, '..', 'progress.html'), 'utf8');
const blocks = [...page.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((x) => x[1]);
const block = blocks.find((b) => /function\s+wireKpi\s*\(/.test(b));
if (!block) throw new Error('wireKpi() not found in progress.html');

function makeEl(extra = {}) {
  const el = {
    innerHTML: '', scrollHeight: 120, dataset: {}, attrs: {}, handlers: {},
    style: { _v: {}, setProperty(k, v) { this._v[k] = v; }, getPropertyValue(k) { return this._v[k] || ''; } },
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
                 contains(c) { return this._s.has(c); }, toggle(c, on) { on ? this.add(c) : this.remove(c); } },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); },
    fire(ev, arg) { (this.handlers[ev] || []).forEach((f) => f(arg || {})); },
    getBoundingClientRect: () => ({ left: 0, width: 100 }),
    scrollIntoView() {}, querySelector: () => null, querySelectorAll: () => [],
    closest: () => null,
  };
  return Object.assign(el, extra);
}

function boot() {
  const draw = makeEl();
  // the page assigns style.maxHeight directly (not setProperty), so the stub must too
  draw.style.maxHeight = '0px';
  const closeBtn = makeEl();
  const inner = makeEl({ querySelector: (sel) => (sel === '.kdraw-x' ? closeBtn : null) });

  const tiles = {
    recent: makeEl({ dataset: { go: 'recent', card: '' } }),
    weeks: makeEl({ dataset: { go: 'weeks', card: '' } }),
  };
  tiles.recent.setAttribute('aria-expanded', 'false');
  tiles.weeks.setAttribute('aria-expanded', 'false');
  const tileList = [tiles.recent, tiles.weeks];

  const keydown = [], resize = [];
  // the page defines its own `$` over document.querySelector, so the stub has to answer
  // the drawer ids too — not just the tiles
  global.document = {
    querySelector: (sel) => {
      if (sel === '#kdraw') return draw;
      if (sel === '#kdrawIn') return inner;
      // the resize handler asks for whichever tile is currently expanded, to re-aim the
      // connector after the KPI grid reflows
      if (sel.includes('aria-expanded="true"')) {
        return tileList.find((t) => t.getAttribute('aria-expanded') === 'true') || null;
      }
      return sel.includes('recent') ? tiles.recent : null;
    },
    querySelectorAll: (sel) => (sel.startsWith('.kpi button.k') ? tileList : []),
    getElementById: () => null,
    addEventListener: (ev, fn) => { if (ev === 'keydown') keydown.push(fn); },
  };
  // the page listens on the window for resize, exactly as wireFolds and placeArrows do
  global.addEventListener = (ev, fn) => { if (ev === 'resize') resize.push(fn); };
  global.REDUCED = true;
  global.esc = (x) => String(x == null ? '' : x);
  global.plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
  global.requestAnimationFrame = (f) => f(0);
  global.window = global;
  global.KPIBY = { recent: { e: 'M' }, weeks: { e: 'F' } };
  global.drawerHTML = () => '<div class="kdraw-head"><button class="kdraw-x"></button></div>';

  new Function(block.split('(async()=>{')[0] + '\nreturn { wireKpi };')().wireKpi({ recent: [], weeks: [], bars: [] });
  return { draw, inner, tiles, closeBtn, keydown, resize };
}

const isOpen = (b) => b.draw.style.maxHeight !== '0px';

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

// --- the close button ---------------------------------------------------------
let b = boot();
b.tiles.recent.fire('click');
ok('a tile opens the drawer', isOpen(b));
ok('...and the tile reads as expanded', b.tiles.recent.getAttribute('aria-expanded') === 'true');
b.closeBtn.fire('click');
ok('the close button shuts it', !isOpen(b));
ok('...and clears the tile state', b.tiles.recent.getAttribute('aria-expanded') === 'false');

// --- Escape -------------------------------------------------------------------
b = boot();
b.tiles.recent.fire('click');
b.keydown.forEach((f) => f({ key: 'Escape' }));
ok('Escape shuts it', !isOpen(b));

// --- the tile as a toggle -----------------------------------------------------
b = boot();
b.tiles.recent.fire('click');
b.tiles.recent.fire('click');
ok('the same tile again puts it away', !isOpen(b));

// --- switching between tiles must NOT close ------------------------------------
b = boot();
b.tiles.recent.fire('click');
b.tiles.weeks.fire('click');
ok('a different tile swaps the panel rather than closing', isOpen(b));
ok('...and moves the expanded state across',
  b.tiles.weeks.getAttribute('aria-expanded') === 'true'
  && b.tiles.recent.getAttribute('aria-expanded') === 'false');

// --- the chart path, which used to strand the panel ---------------------------
b = boot();
global.__openRecent('2026-08');
ok('a chart column opens the recordings panel', isOpen(b));
b.tiles.recent.fire('click');
ok('...and the Recordings tile can then close it', !isOpen(b),
  'this failed before: open held "recent:2026-08", the tile reported "recent"');

// --- rotation ------------------------------------------------------------------
// Both of the panel's numbers are measured once, when it opens. A rotation rewraps the
// content inside the old max-height (clipping it) and reflows the KPI grid from four
// columns to two, which moves the tile the connector points at.
b = boot();
b.tiles.recent.fire('click');
b.inner.style.setProperty('--cx', '999px');       // a stale value from before the rotation
b.resize.forEach((f) => f());
ok('a rotation releases the drawer height', b.draw.style.maxHeight === 'none',
  'a measured max-height clips the rewrapped panel');
ok('...and re-aims the connector at the open tile', b.inner.style.getPropertyValue('--cx') === '50px',
  'the KPI grid reflows 4 -> 2 columns at 760px');

b = boot();
b.resize.forEach((f) => f());
ok('a rotation with nothing open leaves the drawer shut', !isOpen(b));

// --- closing twice must not reopen or throw -----------------------------------
b = boot();
b.tiles.recent.fire('click');
b.closeBtn.fire('click');
b.keydown.forEach((f) => f({ key: 'Escape' }));
ok('closing an already-closed drawer is a no-op', !isOpen(b));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
