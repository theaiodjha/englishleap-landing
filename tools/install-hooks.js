// node tools/install-hooks.js
//
// Copies tools/hooks/* into .git/hooks/. Run it once per clone.
//
// .git/hooks is not part of the repository, so a hook committed here does not install
// itself — which is exactly how this project ended up believing it had a pre-push audit
// that was never running. Keeping the source in tools/hooks/ means the hook is reviewed
// and versioned like everything else; this script is the one manual step.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'tools', 'hooks');
const DST = path.join(ROOT, '.git', 'hooks');

if (!fs.existsSync(DST)) {
  console.error('No .git/hooks here — run this from inside the repository.');
  process.exit(1);
}

let n = 0;
for (const name of fs.readdirSync(SRC)) {
  const from = path.join(SRC, name), to = path.join(DST, name);
  const body = fs.readFileSync(from);
  const had = fs.existsSync(to);
  if (had && !fs.readFileSync(to).equals(body)) {
    fs.copyFileSync(to, to + '.backup');
    console.log(`  kept your existing ${name} as ${name}.backup`);
  }
  fs.writeFileSync(to, body);
  try { fs.chmodSync(to, 0o755); } catch { /* Windows has no execute bit; git bash runs it anyway */ }
  console.log(`  ${had ? 'updated' : 'installed'} .git/hooks/${name}`);
  n++;
}
console.log(`\n${n} hook${n === 1 ? '' : 's'} in place. Bypass one push with: git push --no-verify`);
