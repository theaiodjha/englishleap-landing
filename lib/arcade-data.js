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
    walkthrough: "/assets/walkthroughs/clue-room-walkthrough.mp4",  // YouTube ID or self-hosted video path
    episodes: [
      {
        id: "ep235",
        ep: "EP235",
        title: "Family",
        current: true,
        cover: "/covers/clue-room-ep235.png",
        content: {
          intro:
            "Family is warm and complicated at once. Tap the glowing objects to uncover the five phrases, then put the feeling into words.",
          clues: [
            { id: "home",      word: "upbringing",       color: "#f6479a", emoji: "\uD83C\uDFE0", geo: "box",    clue: "The way you were raised as a child.",                example: "My upbringing taught me to respect others.",             position: [-3.6, 1.5, -0.4] },
            { id: "puzzle",    word: "belonging",        color: "#8b6cff", emoji: "\uD83E\uDDE9", geo: "sphere", clue: "The feeling of being accepted somewhere.",           example: "My family gives me a sense of belonging.",               position: [-2.1, -0.2, 1.3] },
            { id: "hourglass", word: "generational gap", color: "#ff8a63", emoji: "\u23F3",        geo: "torus",  clue: "How older and younger people see life differently.", example: "We disagree sometimes because of the generational gap.", position: [2.1, -0.2, 1.3] },
            { id: "scales",    word: "obligation",       color: "#1fc4b6", emoji: "\u2696",        geo: "octa",   clue: "Something you feel you must do out of duty.",        example: "Family obligations can feel heavy sometimes.",           position: [3.6, 1.5, -0.4] },
            { id: "dove",      word: "make amends",      color: "#ffcd46", emoji: "\uD83D\uDD4A", geo: "dodeca", clue: "Fix things after an argument or hurt.",              example: "I called my brother to make amends.",                    position: [0, 2.7, -1.7] }
          ],
          puzzle: {
            segments: [
              "My ",
              " shaped who I am, and my family still gives me a sense of ",
              ". There is a ",
              " between my parents and me, and the weight of ",
              " can feel heavy \u2014 but after an argument, I'd rather ",
              " than stay silent."
            ],
            answers: ["upbringing", "belonging", "generational gap", "obligation", "make amends"],
            keeper: "In family, it's more important to make amends than to win every argument."
          }
        }
      },
      {
        id: "ep234",
        ep: "EP234",
        title: "Morning Routine",
        current: false,
        cover: "/covers/clue-room-ep234.png",
        content: {
          intro:
            "A calm morning, built one small habit at a time. Tap the glowing objects to uncover the six phrases, then put the routine into words.",
          clues: [
            { id: "leaf",   word: "scattered",  color: "#f6479a", emoji: "\uD83C\uDF43", geo: "ico",    clue: "Unfocused; all over the place.",           example: "Before my routine, I felt scattered every morning.", position: [-3.6, 1.5, -0.4] },
            { id: "cup",    word: "ritual",     color: "#8b6cff", emoji: "\u2615",        geo: "box",    clue: "A small action you repeat with meaning.",  example: "A cup of tea became my morning ritual.",            position: [-2.1, -0.2, 1.3] },
            { id: "brick",  word: "foundation", color: "#ff8a63", emoji: "\uD83E\uDDF1", geo: "sphere", clue: "The base that everything is built on.",    example: "A calm start is the foundation of my day.",         position: [2.1, -0.2, 1.3] },
            { id: "seed",   word: "cultivate",  color: "#1fc4b6", emoji: "\uD83C\uDF31", geo: "torus",  clue: "To grow something slowly, with care.",     example: "You cultivate discipline one small day at a time.", position: [3.6, 1.5, -0.4] },
            { id: "anchor", word: "anchor",     color: "#1ca8a2", emoji: "\u2693",        geo: "octa",   clue: "Something that keeps you steady.",         example: "My morning practice is my anchor.",                 position: [0, 2.7, -1.7] },
            { id: "brain",  word: "rewire",     color: "#57e6c4", emoji: "\uD83E\uDDE0", geo: "dodeca", clue: "Change a habit by building a new pattern.", example: "Little by little, you rewire your brain.",          position: [0, -0.1, 2.1] }
          ],
          puzzle: {
            segments: [
              "I used to feel ",
              " in the morning, but a small ",
              " gave my day a better ",
              ". I slowly learned to ",
              " discipline, and now practice is my ",
              " \u2014 little by little, it began to ",
              " how I learn."
            ],
            answers: ["scattered", "ritual", "foundation", "cultivate", "anchor", "rewire"],
            keeper: "Real discipline isn't never falling \u2014 it's learning how to come back."
          }
        }
      },
      {
        id: "ep232",
        ep: "EP232",
        title: "Manage Your Time",
        current: false,
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
    walkthrough: "",  // unlisted YouTube video ID for the How-to-play popup
    episodes: [
      {
        id: "ep235", ep: "EP235", title: "Family", current: true, cover: "/covers/phrase-pairs-ep235.png",
        content: {
          intro: "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          pairs: [
            { word: "upbringing",       meaning: "the way you were raised as a child",      color: "#f6479a" },
            { word: "belonging",        meaning: "the feeling of being accepted somewhere", color: "#8b6cff" },
            { word: "generational gap", meaning: "how older and younger people differ",     color: "#ff8a63" },
            { word: "obligation",       meaning: "something you feel you must do",          color: "#1fc4b6" },
            { word: "make amends",      meaning: "fix things after an argument",            color: "#ffcd46" }
          ],
          keeper: "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        id: "ep234", ep: "EP234", title: "Morning Routine", current: false, cover: "/covers/phrase-pairs-ep234.png",
        content: {
          intro: "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          pairs: [
            { word: "scattered",  meaning: "unfocused and all over the place", color: "#f6479a" },
            { word: "ritual",     meaning: "a small action you repeat",        color: "#8b6cff" },
            { word: "foundation", meaning: "the base everything is built on",  color: "#ff8a63" },
            { word: "cultivate",  meaning: "grow something slowly, with care", color: "#1fc4b6" },
            { word: "anchor",     meaning: "something that keeps you steady",  color: "#1ca8a2" },
            { word: "rewire",     meaning: "build a new habit pattern",        color: "#57e6c4" }
          ],
          keeper: "Real discipline isn't never falling \u2014 it's learning how to come back."
        }
      },
      {
        id: "ep232",
        ep: "EP232",
        title: "Manage Your Time",
        current: false,
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
    walkthrough: "",  // unlisted YouTube video ID for the How-to-play popup
    episodes: [
      {
        id: "ep235", ep: "EP235", title: "Family", current: true, cover: "/covers/listening-gap-ep235.png",
        content: {
          intro: "Press play, listen, then tap the phrase that fits the gap.",
          rounds: [
            { text: "My upbringing shaped the person I am today.",            phrase: "upbringing",       color: "#f6479a" },
            { text: "My family gives me a sense of belonging.",               phrase: "belonging",        color: "#8b6cff" },
            { text: "Sometimes we disagree because of the generational gap.", phrase: "generational gap", color: "#ff8a63" },
            { text: "I feel a strong sense of obligation to my family.",      phrase: "obligation",       color: "#1fc4b6" },
            { text: "I called my brother to make amends.",                    phrase: "make amends",      color: "#ffcd46" }
          ],
          keeper: "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        id: "ep234", ep: "EP234", title: "Morning Routine", current: false, cover: "/covers/listening-gap-ep234.png",
        content: {
          intro: "Press play, listen, then tap the phrase that fits the gap.",
          rounds: [
            { text: "Before my routine, I felt scattered every morning.", phrase: "scattered",  color: "#f6479a" },
            { text: "A cup of tea became my morning ritual.",             phrase: "ritual",     color: "#8b6cff" },
            { text: "A calm start is the foundation of my day.",          phrase: "foundation", color: "#ff8a63" },
            { text: "You cultivate discipline one small day at a time.",  phrase: "cultivate",  color: "#1fc4b6" },
            { text: "My morning English practice is my anchor.",          phrase: "anchor",     color: "#1ca8a2" },
            { text: "Little by little, you rewire your brain.",           phrase: "rewire",     color: "#57e6c4" }
          ],
          keeper: "Real discipline isn't never falling \u2014 it's learning how to come back."
        }
      },
      {
        id: "ep232", ep: "EP232", title: "Manage Your Time", current: false, cover: "/covers/listening-gap-ep232.png",
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
    walkthrough: "",  // unlisted YouTube video ID for the How-to-play popup
    episodes: [
      {
        id: "ep235",
        ep: "EP235",
        title: "Family",
        current: true,
        cover: "/covers/story-unlock-ep235.png",
        content: {
          intro: "Fill each gap with the right phrase to unlock the story.",
          phrases: [
            { word: "belonging",        color: "#8b6cff" },
            { word: "upbringing",       color: "#f6479a" },
            { word: "obligation",       color: "#1fc4b6" },
            { word: "generational gap", color: "#ff8a63" },
            { word: "make amends",      color: "#ffcd46" }
          ],
          story: "My {upbringing} taught me respect and quiet care. Even now, my family gives me a sense of {belonging} that I can't find anywhere else. We don't always agree \u2014 there's a real {generational gap} between my parents and me \u2014 and sometimes family {obligation} feels heavy, even when it comes from love. But I've learned that after an argument, it's better to {make amends} than to hold on to the silence.",
          bonusEnding: "Family was never meant to be simple. It can be warm and complicated in the same breath. But when you choose to come back gently \u2014 with one honest message \u2014 you remind someone that they still matter to you.",
          keeper: "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        id: "ep234",
        ep: "EP234",
        title: "Morning Routine",
        current: false,
        cover: "/covers/story-unlock-ep234.png",
        content: {
          intro: "Fill each gap with the right phrase to unlock the story.",
          phrases: [
            { word: "ritual",     color: "#8b6cff" },
            { word: "scattered",  color: "#f6479a" },
            { word: "anchor",     color: "#1ca8a2" },
            { word: "foundation", color: "#ff8a63" },
            { word: "cultivate",  color: "#1fc4b6" },
            { word: "rewire",     color: "#57e6c4" }
          ],
          story: "I used to feel {scattered} every morning, with no real plan. Then I built one small {ritual} \u2014 a few quiet minutes with English \u2014 and it gave my day a better {foundation}. Slowly, I began to {cultivate} discipline without forcing it. Now that habit is my {anchor} when life gets busy, and little by little it continues to {rewire} the way I learn.",
          bonusEnding: "Some mornings still feel messy, and that's okay. Discipline was never about being perfect \u2014 it was about coming back. One small sentence, one calm minute, and the day begins again.",
          keeper: "Real discipline isn't never falling \u2014 it's learning how to come back."
        }
      },
      {
        id: "ep232",
        ep: "EP232",
        title: "Manage Your Time",
        current: false,
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
