// lib/arcade-data.js — the Practice Arcade catalogue.
// Mirrors the ARCHIVE pattern in api/list.js: one entry per game type, each
// holding episodes. Trial members see only episodes flagged `current`; paid
// members see all. The game engine reads `content` generically, so adding an
// episode is a data edit — no engine changes. Add a new game type by adding a
// block here and a folder under /games/<type>/.

export const ARCADE = [
  {
    type: "clue-room",
    name: "Clue Room",
    access: "free",
    icon: "\uD83D\uDD0D",
    accent: "#8b6cff",
    tagline: "Step into the room, tap the glowing objects, and solve the sentence.",
    episodes: [
      {
        id: "ep232",
        ep: "EP232",
        title: "Manage Your Time",
        current: true,
        cover: "/covers/clue-room-ep232.png",
        content: {
          intro:
            "Sam's morning kept slipping away. Tap the glowing objects to uncover the six phrases, then put the day back on track.",
          clues: [
            { id: "hourglass", word: "slip away",        color: "#f6479a", emoji: "\u23F3", geo: "ico",    clue: "Pass by unnoticed; be quietly lost.",        example: "A whole morning can slip away if you're not careful.", position: [-3.6, 1.5, -0.4] },
            { id: "snooze",    word: "put off",          color: "#8b6cff", emoji: "\u23F0", geo: "box",    clue: "Delay or postpone something.",               example: "It's tempting to put off the hardest task.",          position: [-2.1, -0.2, 1.3] },
            { id: "sun",       word: "make the most of", color: "#ff8a63", emoji: "\u2600", geo: "sphere", clue: "Use to best advantage.",                     example: "She learned to make the most of small pockets of time.", position: [2.1, -0.2, 1.3] },
            { id: "target",    word: "stay on track",    color: "#1fc4b6", emoji: "\uD83C\uDFAF", geo: "torus", clue: "Keep moving toward a goal.",            example: "A simple list helps you stay on track.",              position: [3.6, 1.5, -0.4] },
            { id: "calendar",  word: "carve out time",   color: "#1ca8a2", emoji: "\uD83D\uDCC6", geo: "octa", clue: "Deliberately set time aside.",          example: "He carved out time for deep work each morning.",      position: [0, 2.7, -1.7] },
            { id: "phone",     word: "get carried away", color: "#57e6c4", emoji: "\uD83D\uDCF1", geo: "dodeca", clue: "Lose control of how long you spend.",  example: "It's easy to get carried away scrolling.",            position: [0, -0.1, 2.1] }
          ],
          puzzle: {
            segments: [
              "I used to let mornings ",
              " and ",
              " the big tasks, but once I learned to ",
              " and ",
              ", I could ",
              " each day and not ",
              " by distractions."
            ],
            answers: ["slip away", "put off", "carve out time", "stay on track", "make the most of", "get carried away"],
            keeper: "Time management is about choosing better, not doing more."
          }
        }
      },
      {
        id: "ep231",
        ep: "EP231",
        title: "Maya's Tuesday",
        current: false,
        cover: "/covers/clue-room-ep231.png",
        content: {
          intro:
            "Maya had a fuller-than-usual Tuesday. Tap the glowing objects to uncover the six phrases that tell the story.",
          clues: [
            { id: "calendar",  word: "eventful",     color: "#f6479a", emoji: "\uD83D\uDCC5", geo: "box",    clue: "Full of things happening.",                 example: "It was a really eventful Tuesday — so much happened.", position: [-3.6, 1.5, -0.4] },
            { id: "note",      word: "turned out",   color: "#ff8a63", emoji: "\uD83D\uDCDD", geo: "cone",   clue: "Ended up a certain way, often a surprise.", example: "The day turned out better than she expected.",       position: [-2.1, -0.2, 1.3] },
            { id: "photo",     word: "ran into",     color: "#8b6cff", emoji: "\uD83D\uDDBC", geo: "torus",  clue: "Met someone by chance.",                    example: "On the way home, she ran into an old friend.",       position: [2.1, -0.2, 1.3] },
            { id: "checklist", word: "managed to",   color: "#1fc4b6", emoji: "\u2705",        geo: "octa",   clue: "Succeeded in doing something difficult.",   example: "Somehow she managed to finish everything on time.",  position: [3.6, 1.5, -0.4] },
            { id: "sunset",    word: "worthwhile",   color: "#ffcd46", emoji: "\uD83C\uDF05", geo: "sphere", clue: "Worth the time and effort.",                example: "Tiring, yes — but a worthwhile day.",                position: [0, 2.7, -1.7] },
            { id: "memorybox", word: "look back on", color: "#57e6c4", emoji: "\uD83D\uDCE6", geo: "dodeca", clue: "Think about something in the past.",        example: "Now she can look back on it with a smile.",          position: [0, -0.1, 2.1] }
          ],
          puzzle: {
            segments: [
              "When I ",
              " that ",
              " Tuesday, I ",
              " an old friend and still ",
              " finish everything — it ",
              " to be a ",
              " day."
            ],
            answers: ["look back on", "eventful", "ran into", "managed to", "turned out", "worthwhile"],
            keeper: "Yesterday is a story only you can tell."
          }
        }
      }
    ]
  },
  {
    type: "phrase-pairs",
    name: "Phrase Pairs",
    access: "transcript",
    icon: "\uD83C\uDCCF",
    accent: "#1fc4b6",
    tagline: "Flip the cards, match each phrase to its meaning \u2014 and hear it on every match.",
    episodes: [
      {
        id: "ep232",
        ep: "EP232",
        title: "Manage Your Time",
        current: true,
        cover: "/covers/phrase-pairs-ep232.png",
        content: {
          intro: "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          pairs: [
            { word: "slip away",        meaning: "pass by without you noticing",   color: "#f6479a" },
            { word: "put off",          meaning: "delay something you should do",   color: "#8b6cff" },
            { word: "make the most of", meaning: "use your time or chance well",    color: "#ff8a63" },
            { word: "stay on track",    meaning: "keep following the plan",         color: "#1fc4b6" },
            { word: "carve out time",   meaning: "set time aside on purpose",       color: "#1ca8a2" },
            { word: "get carried away", meaning: "spend more time than you meant",  color: "#57e6c4" }
          ],
          keeper: "Time management is about choosing better, not doing more."
        }
      }
    ]
  }
  // To add the slot-machine type later:
  // { type:'sentence-machine', name:'Sentence Machine', icon:'🎰', accent:'#ff8a63',
  //   tagline:'Pull the lever, spin the reel, build the sentence.', episodes:[ ... ] }
];

export function findGame(type, ep) {
  const gt = ARCADE.find((g) => g.type === type);
  const e = gt ? gt.episodes.find((x) => x.id === ep) : null;
  return { gt, e };
}
