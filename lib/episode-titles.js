// lib/episode-titles.js — full, descriptive episode titles for the Arcade browser.
//
// The short `title` in lib/arcade-data.js (e.g. "Overthinking") is still used on the
// game covers. This map adds a longer, searchable title shown in the arcade browser
// and episode picker — e.g. the real podcast episode title. Add one line per episode.
// Anything not listed here simply falls back to the short title, so it's safe to fill
// these in gradually.
//
// Format:  <episode id>: "Full title text",
export const EPISODE_TITLES = {
   ep269: "Secret to Great Conversations",
   ep268: "Talking About Dreams & Goals",
   ep267: "Stop Thinking, Start Talking",
   ep263: "Real English Listening Practice",
   ep262: "How to Stay Positive Every Day",
   ep251: "How to Find Your Purpose",
   ep250: "Do We Still Trust Online Reviews?",
   ep249: "Communicate With Confidence",
   ep248: "Does True Love Exist Anymore?",
   ep247: "How Can We Calm Your Minds at Night?",
  // ep246: "Scared To Speak English?",
  // ep243: "...",
  // ep242: "...",
  // ep239: "...",
  // ep238: "...",
  // ep235: "...",
  // ep234: "...",
  // ep232: "...",
  // ep231: "...",
};

export function fullTitleFor(id, fallback) {
  return (id && EPISODE_TITLES[id]) || fallback || '';
}
