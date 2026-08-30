// Silence ONE harmless, noisy Node warning: DEP0169 (`url.parse()`).
//
// It is not emitted by our code — we use the WHATWG URL API (`new URL`,
// `URLSearchParams`) everywhere. It comes from Vercel's Node request adapter,
// which still calls the legacy `url.parse()` when it builds `req.query` from
// the request URL. On Node 22 that prints a DEP0169 line to stderr, which
// Vercel's log viewer surfaces next to the invocation and makes a healthy
// 200 response look like an error.
//
// We intercept process.emitWarning and drop ONLY that specific warning, so
// every other (genuine) deprecation or warning still surfaces normally.
// Importing this module for its side effect at the top of an API route
// installs the filter once, at cold start, before any request is handled.

const original = process.emitWarning.bind(process);

process.emitWarning = function (warning, ...args) {
  try {
    const opts = args[0] && typeof args[0] === "object" ? args[0] : null;
    const code = opts ? opts.code : args[1];
    const msg = typeof warning === "string" ? warning : (warning && warning.message) || "";
    if (code === "DEP0169" || msg.includes("url.parse()")) return; // Vercel adapter noise
  } catch {
    /* never let the filter itself break warning emission */
  }
  return original(warning, ...args);
};
