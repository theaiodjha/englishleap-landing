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
      },
      {
        id: "ep231", ep: "EP231", title: "Maya's Tuesday", current: false, cover: "/covers/phrase-pairs-ep231.png",
        content: {
          intro: "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          pairs: [
            { word: "eventful",     meaning: "full of things happening",    color: "#f6479a" },
            { word: "turned out",   meaning: "ended up a certain way",      color: "#ff8a63" },
            { word: "ran into",     meaning: "met someone by chance",       color: "#8b6cff" },
            { word: "managed to",   meaning: "succeeded at something hard", color: "#1fc4b6" },
            { word: "worthwhile",   meaning: "worth the time and effort",   color: "#ffcd46" },
            { word: "look back on", meaning: "think about the past",        color: "#57e6c4" }
          ],
          keeper: "Yesterday is a story only you can tell."
        }
      }
    ]
  },
  {
    type: "listening-gap",
    name: "Listening Gap",
    access: "fluency",
    icon: "\uD83C\uDFA7",
    accent: "#ff8a63",
    tagline: "Listen to the sentence, then tap the phrase that fills the gap.",
    episodes: [
      {
        id: "ep232", ep: "EP232", title: "Manage Your Time", current: true, cover: "/covers/listening-gap-ep232.png",
        content: {
          intro: "Press play, listen, then tap the phrase that fits the gap.",
          rounds: [
            { text: "Don't let the whole morning slip away.",       phrase: "slip away",        color: "#f6479a" },
            { text: "Try not to put off the hardest task.",         phrase: "put off",          color: "#8b6cff" },
            { text: "She likes to make the most of small breaks.",  phrase: "make the most of", color: "#ff8a63" },
            { text: "A short list helps me stay on track.",         phrase: "stay on track",    color: "#1fc4b6" },
            { text: "I carve out time for English every day.",      phrase: "carve out time",   color: "#1ca8a2" },
            { text: "It's easy to get carried away on your phone.", phrase: "get carried away", color: "#57e6c4" }
          ],
          keeper: "Time management is about choosing better, not doing more."
        }
      },
      {
        id: "ep231", ep: "EP231", title: "Maya's Tuesday", current: false, cover: "/covers/listening-gap-ep231.png",
        content: {
          intro: "Press play, listen, then tap the phrase that fits the gap.",
          rounds: [
            { text: "It was a really eventful day.",               phrase: "eventful",     color: "#f6479a" },
            { text: "The day turned out better than expected.",    phrase: "turned out",   color: "#ff8a63" },
            { text: "She ran into an old friend on the way home.", phrase: "ran into",     color: "#8b6cff" },
            { text: "Somehow she managed to finish on time.",      phrase: "managed to",   color: "#1fc4b6" },
            { text: "It was a tiring but worthwhile day.",         phrase: "worthwhile",   color: "#ffcd46" },
            { text: "Now she can look back on it with a smile.",   phrase: "look back on", color: "#57e6c4" }
          ],
          keeper: "Yesterday is a story only you can tell."
        }
      }
    ]
  },
  {
    type: "story-unlock",
    name: "Story Unlock",
    access: "fluency",
    icon: "\uD83D\uDCD6",
    accent: "#8b6cff",
    tagline: "Place the phrases to unlock the episode's mini story \u2014 plus a bonus ending.",
    episodes: [
      {
        id: "ep232",
        ep: "EP232",
        title: "Manage Your Time",
        current: true,
        cover: "/covers/story-unlock-ep232.png",
        content: {
          intro: "Fill each gap with the right phrase to unlock the story.",
          phrases: [
            { word: "make the most of", color: "#ff8a63" },
            { word: "put off",          color: "#8b6cff" },
            { word: "carve out time",   color: "#1ca8a2" },
            { word: "slip away",        color: "#f6479a" },
            { word: "stay on track",    color: "#1fc4b6" },
            { word: "get carried away", color: "#57e6c4" }
          ],
          story: "Maya wanted to {make the most of} her Saturday morning. She decided not to {put off} her plans this time. First, she would {carve out time} for a quiet walk before the day could {slip away}. A short list on the table helped her {stay on track}. It was still easy to {get carried away}, but today, for once, she felt in control.",
          bonusEnding: "That evening, Maya looked at her finished list and smiled. For the first time in weeks, the morning had not slipped away from her \u2014 she had owned it. She made herself a small promise: next Saturday, the phone could wait a little longer.",
          keeper: "Time management is about choosing better, not doing more."
        }
      },
      {
        id: "ep231",
        ep: "EP231",
        title: "Maya's Tuesday",
        current: false,
        cover: "/covers/story-unlock-ep231.png",
        content: {
          intro: "Fill each gap with the right phrase to unlock the story.",
          phrases: [
            { word: "eventful",     color: "#f6479a" },
            { word: "ran into",     color: "#8b6cff" },
            { word: "turned out",   color: "#ff8a63" },
            { word: "managed to",   color: "#1fc4b6" },
            { word: "worthwhile",   color: "#ffcd46" },
            { word: "look back on", color: "#57e6c4" }
          ],
          story: "Tuesday turned more {eventful} than Maya expected. On the way to work, she {ran into} an old friend she had not seen for years. Their quick chat {turned out} to be the best part of her day. Even though she was busy, she {managed to} finish all her tasks on time. It was a tiring but {worthwhile} day \u2014 the kind she would {look back on} with a smile.",
          bonusEnding: "Late that night, Maya wrote a few lines in her journal. Some days feel ordinary while you live them, she wrote, and only later do you notice how much they held. She closed the book slowly, already a little curious about what Wednesday might bring.",
          keeper: "Yesterday is a story only you can tell."
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
