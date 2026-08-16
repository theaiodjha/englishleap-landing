// lib/arcade-data.js — the Practice Arcade catalogue.
// Mirrors the ARCHIVE pattern in api/list.js: one entry per game type, each
// holding episodes. Trial members see only episodes flagged `current`; paid
// members see all. The game engine reads `content` generically, so adding an
// episode is a data edit — no engine changes. Add a new game type by adding a
// block here and a folder under /games/<type>/.

export const ARCADE = [
  {
    "type": "clue-room",
    "name": "Clue Room",
    "access": "free",
    "icon": "🔍",
    "accent": "#8b6cff",
    "tagline": "Step into the room, tap the glowing objects, and solve the sentence.",
    "walkthrough": "/assets/walkthroughs/clue-room-walkthrough.mp4",
    "episodes": [
      {
        "id": "ep267",
        "ep": "EP267",
        "title": "Overthinking",
        "current": true,
        "cover": "/covers/clue-room-ep267.png",
        "content": {
          "intro": "Why is speaking English so hard when your thoughts are fine? Tap the glowing objects to uncover six words for speaking more naturally, without overthinking, then use them in your own sentence.",
          "clues": [
            {
              "id": "ponder",
              "word": "second-guess",
              "color": "#f6479a",
              "emoji": "🤔",
              "geo": "ico",
              "clue": "To keep doubting a decision, or wonder if you should have done it differently.",
              "example": "I knew what I wanted to say, but I kept second-guessing myself.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "flush",
              "word": "self-conscious",
              "color": "#8b6cff",
              "emoji": "😳",
              "geo": "box",
              "clue": "Feeling nervously aware of yourself and how others see you.",
              "example": "I felt self-conscious around people whose English sounded effortless.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "speak",
              "word": "articulate",
              "color": "#ff8a63",
              "emoji": "🗣️",
              "geo": "sphere",
              "clue": "Able to express your ideas and meaning clearly.",
              "example": "Being articulate isn't about fancy words — it's about being clear.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "spark",
              "word": "spontaneous",
              "color": "#1fc4b6",
              "emoji": "✨",
              "geo": "torus",
              "clue": "Happening naturally, without planning it first.",
              "example": "A good conversation is spontaneous, not scripted.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "paw",
              "word": "instinctive",
              "color": "#1ca8a2",
              "emoji": "🐾",
              "geo": "octa",
              "clue": "Automatic and natural, without needing to think.",
              "example": "After lots of practice, the words became instinctive.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "ice",
              "word": "composure",
              "color": "#57e6c4",
              "emoji": "🧊",
              "geo": "dodeca",
              "clue": "The ability to stay calm and in control under pressure.",
              "example": "I kept my composure and finished the sentence.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "When I speak English, I try not to ",
              " every word or feel too ",
              ". I focus on being ",
              " rather than perfect. Real talk is ",
              ", so I let my replies feel ",
              ", and when I get stuck, I keep my ",
              " and carry on."
            ],
            "answers": [
              "second-guess",
              "self-conscious",
              "articulate",
              "spontaneous",
              "instinctive",
              "composure"
            ],
            "keeper": "Fluency isn't never getting stuck — it's staying in the conversation anyway."
          }
        }
      },
      {
        "id": "ep263",
        "ep": "EP263",
        "title": "Awkward Talks",
        "current": false,
        "cover": "/covers/clue-room-ep263.png",
        "content": {
          "intro": "Conversations get awkward sometimes — and that's okay. Tap the glowing objects to uncover six words for handling tricky, everyday conversation moments, then use them in your own sentence.",
          "clues": [
            {
              "id": "cringe",
              "word": "awkward",
              "color": "#f6479a",
              "emoji": "😬",
              "geo": "ico",
              "clue": "Uncomfortable or slightly embarrassing, especially in a social moment.",
              "example": "There was an awkward silence.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "speak",
              "word": "clarify",
              "color": "#8b6cff",
              "emoji": "💬",
              "geo": "box",
              "clue": "To make something clearer or easier to understand.",
              "example": "Could you clarify what you mean by 'later'?",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "sand",
              "word": "hesitate",
              "color": "#ff8a63",
              "emoji": "⏳",
              "geo": "sphere",
              "clue": "To pause because you're unsure what to say or do.",
              "example": "I hesitated before answering.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "tie",
              "word": "appropriate",
              "color": "#1fc4b6",
              "emoji": "👔",
              "geo": "torus",
              "clue": "Suitable or right for a particular situation.",
              "example": "That joke isn't appropriate for work.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "quest",
              "word": "misunderstanding",
              "color": "#1ca8a2",
              "emoji": "❓",
              "geo": "octa",
              "clue": "When people understand something in different or wrong ways.",
              "example": "There was a misunderstanding about the time.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "hug",
              "word": "reassure",
              "color": "#57e6c4",
              "emoji": "🤗",
              "geo": "dodeca",
              "clue": "To help someone feel less worried or uncertain.",
              "example": "She reassured me that everything was fine.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "When a chat turns ",
              ", I try to ",
              " instead of guessing, and I no longer ",
              " to ask. I pick words that feel ",
              " for the moment, and if there's a ",
              ", I calmly ",
              " the other person that we're okay."
            ],
            "answers": [
              "awkward",
              "clarify",
              "hesitate",
              "appropriate",
              "misunderstanding",
              "reassure"
            ],
            "keeper": "Real conversation is messy — it doesn't wait for the perfect sentence."
          }
        }
      },
      {
        "id": "ep262",
        "ep": "EP262",
        "title": "Stay Positive",
        "current": false,
        "cover": "/covers/clue-room-ep262.png",
        "content": {
          "intro": "How do you stay positive on an ordinary, imperfect day? Tap the glowing objects to uncover six words for realistic, everyday positivity, then use them in your own sentence.",
          "clues": [
            {
              "id": "calm",
              "word": "composure",
              "color": "#f6479a",
              "emoji": "🧘",
              "geo": "ico",
              "clue": "The ability to stay calm and in control of your emotions.",
              "example": "I took a slow breath and tried to regain my composure.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "lens",
              "word": "magnify",
              "color": "#8b6cff",
              "emoji": "🔍",
              "geo": "box",
              "clue": "To make something appear bigger than it really is.",
              "example": "When I'm tired, I magnify small problems.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "down",
              "word": "deflated",
              "color": "#ff8a63",
              "emoji": "😞",
              "geo": "sphere",
              "clue": "Suddenly feeling less confident, hopeful, or excited.",
              "example": "I felt completely deflated after the rejection.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "tea",
              "word": "contentment",
              "color": "#1fc4b6",
              "emoji": "🍵",
              "geo": "torus",
              "clue": "A quiet feeling of happiness and satisfaction.",
              "example": "I felt a sense of contentment sitting quietly by the window.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "lizard",
              "word": "adaptability",
              "color": "#1ca8a2",
              "emoji": "🦎",
              "geo": "octa",
              "clue": "The ability to change your approach when the situation changes.",
              "example": "Adaptability helped me find a better way to reach my goal.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "hands",
              "word": "acknowledge",
              "color": "#57e6c4",
              "emoji": "🤲",
              "geo": "dodeca",
              "clue": "To recognise and accept that a feeling is there.",
              "example": "I can acknowledge how I feel without letting it control my next step.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "On a hard day, I try to keep my ",
              " instead of letting my mind ",
              " every small problem. When I feel ",
              ", I look for a little ",
              " in something ordinary. A bit of ",
              " helps me change my plan, and I simply ",
              " how I feel without letting it run the day."
            ],
            "answers": [
              "composure",
              "magnify",
              "deflated",
              "contentment",
              "adaptability",
              "acknowledge"
            ],
            "keeper": "Staying positive means meeting an imperfect day without deciding everything's terrible."
          }
        }
      },
      {
        "id": "ep251",
        "ep": "EP251",
        "title": "Purpose",
        "current": false,
        "cover": "/covers/clue-room-ep251.png",
        "content": {
          "intro": "How do you find your purpose? Tap the glowing objects to uncover six words for thinking about purpose as a direction, not pressure, then use them in your own sentence.",
          "clues": [
            {
              "id": "compass",
              "word": "direction",
              "color": "#f6479a",
              "emoji": "🧭",
              "geo": "ico",
              "clue": "The path you are following, or the way you are moving.",
              "example": "I don't need a final goal, just a clear direction.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "heart",
              "word": "meaningful",
              "color": "#8b6cff",
              "emoji": "💛",
              "geo": "box",
              "clue": "Something that feels important or valuable to you.",
              "example": "I want work that feels meaningful.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "web",
              "word": "stagnant",
              "color": "#ff8a63",
              "emoji": "🕸️",
              "geo": "sphere",
              "clue": "Stuck — not moving, growing, or changing.",
              "example": "My routine felt stagnant, so I made a change.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "target",
              "word": "alignment",
              "color": "#1fc4b6",
              "emoji": "🎯",
              "geo": "torus",
              "clue": "When different parts of your life match or support each other.",
              "example": "My job and my values are finally in alignment.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "flower",
              "word": "fulfilling",
              "color": "#1ca8a2",
              "emoji": "🌻",
              "geo": "octa",
              "clue": "Giving a deep feeling of satisfaction.",
              "example": "Helping others is deeply fulfilling.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "bell",
              "word": "calling",
              "color": "#57e6c4",
              "emoji": "🔔",
              "geo": "dodeca",
              "clue": "A strong feeling that a certain path is right for you.",
              "example": "Teaching felt like her true calling.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I stopped chasing one perfect goal and chose a ",
              " instead. I look for work that feels ",
              ", because a life that stays ",
              " slowly drains me. When my days are in ",
              " with my values, everything feels more ",
              " — and little by little, that path starts to feel like a ",
              "."
            ],
            "answers": [
              "direction",
              "meaningful",
              "stagnant",
              "alignment",
              "fulfilling",
              "calling"
            ],
            "keeper": "Purpose isn't one perfect answer — it's a direction that grows with you."
          }
        }
      },
      {
        "id": "ep250",
        "ep": "EP250",
        "title": "Online Reviews",
        "current": false,
        "cover": "/covers/clue-room-ep250.png",
        "content": {
          "intro": "Do we still trust online reviews? Tap the glowing objects to uncover six words for reading reviews with sharper, calmer judgement, then use them in your own sentence.",
          "clues": [
            {
              "id": "brow",
              "word": "skeptical",
              "color": "#f6479a",
              "emoji": "🤨",
              "geo": "ico",
              "clue": "Not easily believing something without proof.",
              "example": "I'm skeptical of reviews that sound too perfect.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "money",
              "word": "incentivized",
              "color": "#8b6cff",
              "emoji": "💰",
              "geo": "box",
              "clue": "Encouraged to do something by a reward or discount.",
              "example": "Some shops leave incentivized reviews for a coupon.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "medal",
              "word": "credibility",
              "color": "#ff8a63",
              "emoji": "🏅",
              "geo": "sphere",
              "clue": "How believable or trustworthy something is.",
              "example": "Fake reviews damage a brand's credibility.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "scale",
              "word": "biased",
              "color": "#1fc4b6",
              "emoji": "⚖️",
              "geo": "torus",
              "clue": "Not neutral or not fully fair.",
              "example": "A paid review is usually biased.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "check",
              "word": "authentic",
              "color": "#1ca8a2",
              "emoji": "✅",
              "geo": "octa",
              "clue": "Real and genuine.",
              "example": "I look for authentic reviews with real photos.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "masks",
              "word": "manipulate",
              "color": "#57e6c4",
              "emoji": "🎭",
              "geo": "dodeca",
              "clue": "To control or influence something in a dishonest way.",
              "example": "Review farms can manipulate a product's rating.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I've grown ",
              " of five-star ratings, because many are ",
              " with discounts. A brand's ",
              " drops when its reviews feel ",
              ". I look for ",
              " voices — real photos, real complaints — because paid farms can ",
              " the whole pattern."
            ],
            "answers": [
              "skeptical",
              "incentivized",
              "credibility",
              "biased",
              "authentic",
              "manipulate"
            ],
            "keeper": "Trust the pattern, not a single five-star review."
          }
        }
      },
      {
        "id": "ep249",
        "ep": "EP249",
        "title": "Confidence",
        "current": false,
        "cover": "/covers/clue-room-ep249.png",
        "content": {
          "intro": "Afraid to speak? Tap the glowing objects to uncover six words for communicating with calm confidence, then use them in your own sentence.",
          "clues": [
            {
              "id": "gem",
              "word": "clarity",
              "color": "#f6479a",
              "emoji": "💎",
              "geo": "ico",
              "clue": "Being easy to understand.",
              "example": "Speak with clarity, not speed.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "calm",
              "word": "composed",
              "color": "#8b6cff",
              "emoji": "😌",
              "geo": "box",
              "clue": "Calm and in control, especially in a hard moment.",
              "example": "She stayed composed during the tough question.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "zoom",
              "word": "clarify",
              "color": "#ff8a63",
              "emoji": "🔎",
              "geo": "sphere",
              "clue": "To make something clearer, or check that you understood.",
              "example": "Just to clarify, do you mean Friday?",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "pause",
              "word": "hesitate",
              "color": "#1fc4b6",
              "emoji": "⏸️",
              "geo": "torus",
              "clue": "To pause because you feel unsure or nervous.",
              "example": "Don't hesitate — ask the question.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "ring",
              "word": "recover",
              "color": "#1ca8a2",
              "emoji": "🛟",
              "geo": "octa",
              "clue": "To get back on track after a mistake or a pause.",
              "example": "I lost my word, but I recovered quickly.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "low",
              "word": "self-doubt",
              "color": "#57e6c4",
              "emoji": "😔",
              "geo": "dodeca",
              "clue": "A lack of confidence in yourself.",
              "example": "Self-doubt made me stay quiet in meetings.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "When I speak, I aim for ",
              " and try to stay ",
              ". If I lose the room, I ",
              " instead of pretending. I no longer ",
              " in silence; I pause, then ",
              ", and I don't let ",
              " decide how I continue."
            ],
            "answers": [
              "clarity",
              "composed",
              "clarify",
              "hesitate",
              "recover",
              "self-doubt"
            ],
            "keeper": "Confidence isn't speaking fast — it's speaking clearly."
          }
        }
      },
      {
        "id": "ep248",
        "ep": "EP248",
        "title": "Modern Love",
        "current": false,
        "cover": "/covers/clue-room-ep248.png",
        "content": {
          "intro": "Does true love still exist? Tap the glowing objects to uncover six words for talking about modern love and connection, then use them in your own sentence.",
          "clues": [
            {
              "id": "heart",
              "word": "vulnerability",
              "color": "#f6479a",
              "emoji": "💗",
              "geo": "ico",
              "clue": "Being open about your real feelings, even when it feels risky.",
              "example": "Real closeness starts with a little vulnerability.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "fit",
              "word": "compatibility",
              "color": "#8b6cff",
              "emoji": "🧩",
              "geo": "box",
              "clue": "Whether two people truly fit — values, communication, and future plans.",
              "example": "We have chemistry, but I'm not sure about our compatibility.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "trash",
              "word": "disposable",
              "color": "#ff8a63",
              "emoji": "🗑️",
              "geo": "sphere",
              "clue": "Something used once and then thrown away.",
              "example": "Modern dating can make people feel disposable.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "both",
              "word": "reciprocity",
              "color": "#1fc4b6",
              "emoji": "🤝",
              "geo": "torus",
              "clue": "When effort and care go both ways.",
              "example": "A good relationship needs reciprocity.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "broken",
              "word": "disillusioned",
              "color": "#1ca8a2",
              "emoji": "💔",
              "geo": "octa",
              "clue": "Disappointed because something wasn't as good or true as you believed.",
              "example": "After months of dating apps, she felt disillusioned.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "ghost",
              "word": "ghosting",
              "color": "#57e6c4",
              "emoji": "👻",
              "geo": "dodeca",
              "clue": "Suddenly disappearing from someone with no explanation.",
              "example": "He stopped replying — classic ghosting.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "Real closeness needs ",
              " and true ",
              ", not a love that feels ",
              ". When there's no ",
              ", people grow ",
              ", and some simply vanish — ",
              " instead of talking."
            ],
            "answers": [
              "vulnerability",
              "compatibility",
              "disposable",
              "reciprocity",
              "disillusioned",
              "ghosting"
            ],
            "keeper": "Real love isn't just chemistry — it's honesty and effort, both ways."
          }
        }
      },
      {
        "id": "ep247",
        "ep": "EP247",
        "title": "Calm Nights",
        "current": false,
        "cover": "/covers/clue-room-ep247.png",
        "content": {
          "intro": "When the day ends, the mind sometimes speeds up. Tap the glowing objects to uncover six gentle words for calming your mind at night, then use them in your own sentence.",
          "clues": [
            {
              "id": "thought",
              "word": "racing thoughts",
              "color": "#f6479a",
              "emoji": "💭",
              "geo": "ico",
              "clue": "Fast, uncontrollable thoughts that won't slow down, often at night.",
              "example": "I couldn't sleep because I had racing thoughts.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "brain",
              "word": "brain dump",
              "color": "#8b6cff",
              "emoji": "🧠",
              "geo": "box",
              "clue": "Writing down everything in your mind so your brain doesn't have to hold it all.",
              "example": "I did a brain dump before bed.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "anxious",
              "word": "anxiety",
              "color": "#ff8a63",
              "emoji": "😰",
              "geo": "sphere",
              "clue": "A strong worried or nervous feeling.",
              "example": "My anxiety gets worse when I'm trying to sleep.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "hug",
              "word": "reassuring",
              "color": "#1fc4b6",
              "emoji": "🤗",
              "geo": "torus",
              "clue": "Making someone feel less worried or less alone.",
              "example": "It was reassuring to know other people feel this way too.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "phone",
              "word": "doom-scrolling",
              "color": "#1ca8a2",
              "emoji": "📱",
              "geo": "octa",
              "clue": "Scrolling through negative or stressful content for a long time.",
              "example": "I stayed up late doom-scrolling.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "bolt",
              "word": "wired",
              "color": "#57e6c4",
              "emoji": "⚡",
              "geo": "dodeca",
              "clue": "Very awake, active, or full of nervous energy.",
              "example": "I was exhausted, but I still felt wired.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "At night, my ",
              " kept me awake, so I tried a ",
              " to ease the ",
              " I was feeling. It was ",
              " to know others struggle too. I stopped ",
              " in bed, because the screen left me too ",
              " to sleep."
            ],
            "answers": [
              "racing thoughts",
              "brain dump",
              "anxiety",
              "reassuring",
              "doom-scrolling",
              "wired"
            ],
            "keeper": "Calming your mind isn't about perfection — it's about noticing what helps."
          }
        }
      },
      {
        "id": "ep246",
        "ep": "EP246",
        "title": "Speaking",
        "current": false,
        "cover": "/covers/clue-room-ep246.png",
        "content": {
          "intro": "Speaking a new language can feel scary — but the right words make it lighter. Tap the glowing objects to uncover six words for speaking with more calm, then use them in your own sentence.",
          "clues": [
            {
              "id": "crystal",
              "word": "anticipate",
              "color": "#f6479a",
              "emoji": "🔮",
              "geo": "ico",
              "clue": "To expect something before it happens.",
              "example": "Don't anticipate failure before you even try.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "flushed",
              "word": "self-conscious",
              "color": "#8b6cff",
              "emoji": "😳",
              "geo": "box",
              "clue": "Too aware of yourself — your voice, your accent, your mistakes.",
              "example": "I feel self-conscious when I speak in meetings.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "crossed",
              "word": "misinterpret",
              "color": "#ff8a63",
              "emoji": "🔀",
              "geo": "sphere",
              "clue": "To understand something in the wrong way.",
              "example": "I misinterpreted his silence and thought he was angry.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "woozy",
              "word": "stumble over words",
              "color": "#1fc4b6",
              "emoji": "🥴",
              "geo": "torus",
              "clue": "When your words come out unevenly, with stops, slips, or little mistakes.",
              "example": "I stumbled over my words during the presentation.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "piece",
              "word": "chunk",
              "color": "#1ca8a2",
              "emoji": "🧩",
              "geo": "octa",
              "clue": "A small piece of language — a short, easy phrase.",
              "example": "I don't need one long sentence; I can speak in chunks.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "wrench",
              "word": "repair phrase",
              "color": "#57e6c4",
              "emoji": "🔧",
              "geo": "dodeca",
              "clue": "A small sentence that keeps a conversation going when something goes wrong.",
              "example": "I can use a repair phrase and keep the conversation moving.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "When I speak English, I try not to ",
              " failure or feel too ",
              ". If someone frowns, I no longer ",
              " it as anger. Even when I ",
              ", I break my ideas into each small ",
              ", and a simple ",
              " keeps the conversation moving."
            ],
            "answers": [
              "anticipate",
              "self-conscious",
              "misinterpret",
              "stumble over words",
              "chunk",
              "repair phrase"
            ],
            "keeper": "It's not about sounding perfect. It's about staying in the conversation."
          }
        }
      },
      {
        "id": "ep243",
        "ep": "EP243",
        "title": "Change",
        "current": false,
        "cover": "/covers/clue-room-ep243.png",
        "content": {
          "intro": "Real change happens slowly, inside normal life — and it starts with the right words. Tap the glowing objects to uncover the six words, then build them into your own sentence.",
          "clues": [
            {
              "id": "muscle",
              "word": "willpower",
              "color": "#f6479a",
              "emoji": "💪",
              "geo": "ico",
              "clue": "The mental strength to control yourself and keep going when something is hard.",
              "example": "My willpower is weak around chocolate cake.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "compass",
              "word": "strategy",
              "color": "#8b6cff",
              "emoji": "🧭",
              "geo": "box",
              "clue": "A clear plan or method for reaching a goal.",
              "example": "My strategy is to start with ten minutes a day.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "block",
              "word": "barrier",
              "color": "#ff8a63",
              "emoji": "🚧",
              "geo": "sphere",
              "clue": "Something that blocks you or makes progress difficult.",
              "example": "Fear is my biggest barrier when I try to speak.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "bolt",
              "word": "impulsivity",
              "color": "#1fc4b6",
              "emoji": "⚡",
              "geo": "torus",
              "clue": "Acting quickly because you want something now, without thinking about the result.",
              "example": "I'm trying to control my impulsivity when I shop.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "sloth",
              "word": "procrastination",
              "color": "#1ca8a2",
              "emoji": "🦥",
              "geo": "octa",
              "clue": "Delaying something important even though you know you should do it.",
              "example": "Procrastination is stopping me from improving.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "hands",
              "word": "accountability",
              "color": "#57e6c4",
              "emoji": "🤝",
              "geo": "dodeca",
              "clue": "Being responsible for what you said you would do.",
              "example": "The group gives me accountability.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I used to rely only on ",
              ", but a small ",
              " works better. When fear became a ",
              ", I started tiny. I learned to slow my ",
              ", beat my ",
              " with a first step, and let a friend give me the ",
              " to keep going."
            ],
            "answers": [
              "willpower",
              "strategy",
              "barrier",
              "impulsivity",
              "procrastination",
              "accountability"
            ],
            "keeper": "Change isn't one big moment — it's many small designs."
          }
        }
      },
      {
        "id": "ep242",
        "ep": "EP242",
        "title": "Climate",
        "current": false,
        "cover": "/covers/clue-room-ep242.png",
        "content": {
          "intro": "Climate change feels big — but the words to talk about it can be calm and clear. Tap the glowing objects to uncover the six words, then put them into your own sentence.",
          "clues": [
            {
              "id": "seedling",
              "word": "sustainable",
              "color": "#f6479a",
              "emoji": "🌱",
              "geo": "ico",
              "clue": "Able to continue for a long time without causing too much harm.",
              "example": "I need a sustainable routine, not a perfect one.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "recycle",
              "word": "eco-friendly",
              "color": "#8b6cff",
              "emoji": "♻️",
              "geo": "box",
              "clue": "Less harmful to the environment.",
              "example": "This shop uses eco-friendly packaging.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "foot",
              "word": "carbon footprint",
              "color": "#ff8a63",
              "emoji": "👣",
              "geo": "sphere",
              "clue": "The amount of carbon pollution your life or actions create.",
              "example": "I'm trying to reduce my carbon footprint.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "globe",
              "word": "environmental impact",
              "color": "#1fc4b6",
              "emoji": "🌍",
              "geo": "torus",
              "clue": "The effect something has on nature, air, water, land, or climate.",
              "example": "Fast fashion can have a serious environmental impact.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "cart",
              "word": "overconsumption",
              "color": "#1ca8a2",
              "emoji": "🛒",
              "geo": "octa",
              "clue": "Buying or using more than we really need.",
              "example": "Overconsumption creates a lot of unnecessary waste.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "butterfly",
              "word": "biodiversity",
              "color": "#57e6c4",
              "emoji": "🦋",
              "geo": "dodeca",
              "clue": "The variety of plants, animals, and living things in an area.",
              "example": "This forest has rich biodiversity.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I'm trying to live in a more ",
              " way by making ",
              " choices that lower my ",
              ". Once you understand your ",
              ", it's easier to avoid ",
              " and protect the ",
              " around us."
            ],
            "answers": [
              "sustainable",
              "eco-friendly",
              "carbon footprint",
              "environmental impact",
              "overconsumption",
              "biodiversity"
            ],
            "keeper": "Understand your impact, and make wiser choices where you can."
          }
        }
      },
      {
        "id": "ep239",
        "ep": "EP239",
        "title": "Workday",
        "current": false,
        "cover": "/covers/clue-room-ep239.png",
        "content": {
          "intro": "A workday rarely stays simple — one email becomes three tasks. Tap the glowing objects to uncover the six words, then describe the day in your own words.",
          "clues": [
            {
              "id": "inbox",
              "word": "workload",
              "color": "#f6479a",
              "emoji": "📥",
              "geo": "ico",
              "clue": "The amount of work you have.",
              "example": "I had a heavy workload this week.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "clock",
              "word": "deadline",
              "color": "#8b6cff",
              "emoji": "⏰",
              "geo": "box",
              "clue": "The date or time when something must be finished.",
              "example": "The deadline is coming up on Friday.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "people",
              "word": "colleague",
              "color": "#ff8a63",
              "emoji": "👥",
              "geo": "sphere",
              "clue": "Someone you work with.",
              "example": "My colleague helped me solve a problem.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "check",
              "word": "productive",
              "color": "#1fc4b6",
              "emoji": "✅",
              "geo": "torus",
              "clue": "Getting useful work done — not just being busy.",
              "example": "I had a productive morning.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "phone",
              "word": "distracted",
              "color": "#1ca8a2",
              "emoji": "📱",
              "geo": "octa",
              "clue": "Unable to focus because something pulls your attention away.",
              "example": "I felt distracted by my phone.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "box",
              "word": "wrap up",
              "color": "#57e6c4",
              "emoji": "📦",
              "geo": "dodeca",
              "clue": "To finish something, like a task or your workday.",
              "example": "I need to wrap up my work for the day.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "My ",
              " felt heavy and the ",
              " was getting close, but a kind ",
              " helped me stay ",
              ". I still got ",
              " in the afternoon, yet I managed to ",
              " the main task before going home."
            ],
            "answers": [
              "workload",
              "deadline",
              "colleague",
              "productive",
              "distracted",
              "wrap up"
            ],
            "keeper": "Don't confuse activity with progress."
          }
        }
      },
      {
        "id": "ep238",
        "ep": "EP238",
        "title": "Exercise",
        "current": false,
        "cover": "/covers/clue-room-ep238.png",
        "content": {
          "intro": "Exercise isn't about looking perfect — it's about feeling more alive in your body. Tap the glowing objects to uncover the six words, then put the feeling into words.",
          "clues": [
            {
              "id": "chair",
              "word": "sedentary",
              "color": "#f6479a",
              "emoji": "🪑",
              "geo": "ico",
              "clue": "Sitting a lot and not moving much.",
              "example": "I have a sedentary job, so I walk every evening.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "battery",
              "word": "endurance",
              "color": "#8b6cff",
              "emoji": "🔋",
              "geo": "box",
              "clue": "The ability to keep going for a long time.",
              "example": "Walking every day helped me build endurance.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "fire",
              "word": "exertion",
              "color": "#ff8a63",
              "emoji": "🔥",
              "geo": "sphere",
              "clue": "Physical effort — when your body works hard.",
              "example": "I felt a lot of exertion after climbing the stairs.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "cartwheel",
              "word": "mobility",
              "color": "#1fc4b6",
              "emoji": "🤸",
              "geo": "torus",
              "clue": "How easily your body can move.",
              "example": "Stretching helps improve my mobility.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "mountain",
              "word": "plateau",
              "color": "#1ca8a2",
              "emoji": "⛰",
              "geo": "octa",
              "clue": "When progress stops or becomes very slow.",
              "example": "After weeks of training, I hit a plateau.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "hotface",
              "word": "overdo",
              "color": "#57e6c4",
              "emoji": "🥵",
              "geo": "dodeca",
              "clue": "To do too much.",
              "example": "Don't overdo it — start slowly.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I used to live a ",
              " life, but I slowly built my ",
              " with short daily walks. A little ",
              " each day improved my ",
              ", and even when my progress hit a ",
              ", I kept moving gently instead of trying to ",
              " it."
            ],
            "answers": [
              "sedentary",
              "endurance",
              "exertion",
              "mobility",
              "plateau",
              "overdo"
            ],
            "keeper": "The best exercise isn't the perfect one — it's the one you'll actually repeat."
          }
        }
      },
      {
        "id": "ep235",
        "ep": "EP235",
        "title": "Family",
        "current": false,
        "cover": "/covers/clue-room-ep235.png",
        "content": {
          "intro": "Family is warm and complicated at once. Tap the glowing objects to uncover the five phrases, then put the feeling into words.",
          "clues": [
            {
              "id": "home",
              "word": "upbringing",
              "color": "#f6479a",
              "emoji": "🏠",
              "geo": "box",
              "clue": "The way you were raised as a child.",
              "example": "My upbringing taught me to respect others.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "puzzle",
              "word": "belonging",
              "color": "#8b6cff",
              "emoji": "🧩",
              "geo": "sphere",
              "clue": "The feeling of being accepted somewhere.",
              "example": "My family gives me a sense of belonging.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "hourglass",
              "word": "generational gap",
              "color": "#ff8a63",
              "emoji": "⏳",
              "geo": "torus",
              "clue": "How older and younger people see life differently.",
              "example": "We disagree sometimes because of the generational gap.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "scales",
              "word": "obligation",
              "color": "#1fc4b6",
              "emoji": "⚖",
              "geo": "octa",
              "clue": "Something you feel you must do out of duty.",
              "example": "Family obligations can feel heavy sometimes.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "dove",
              "word": "make amends",
              "color": "#ffcd46",
              "emoji": "🕊",
              "geo": "dodeca",
              "clue": "Fix things after an argument or hurt.",
              "example": "I called my brother to make amends.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "My ",
              " shaped who I am, and my family still gives me a sense of ",
              ". There is a ",
              " between my parents and me, and the weight of ",
              " can feel heavy — but after an argument, I'd rather ",
              " than stay silent."
            ],
            "answers": [
              "upbringing",
              "belonging",
              "generational gap",
              "obligation",
              "make amends"
            ],
            "keeper": "In family, it's more important to make amends than to win every argument."
          }
        }
      },
      {
        "id": "ep234",
        "ep": "EP234",
        "title": "Morning Routine",
        "current": false,
        "cover": "/covers/clue-room-ep234.png",
        "content": {
          "intro": "A calm morning, built one small habit at a time. Tap the glowing objects to uncover the six phrases, then put the routine into words.",
          "clues": [
            {
              "id": "leaf",
              "word": "scattered",
              "color": "#f6479a",
              "emoji": "🍃",
              "geo": "ico",
              "clue": "Unfocused; all over the place.",
              "example": "Before my routine, I felt scattered every morning.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "cup",
              "word": "ritual",
              "color": "#8b6cff",
              "emoji": "☕",
              "geo": "box",
              "clue": "A small action you repeat with meaning.",
              "example": "A cup of tea became my morning ritual.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "brick",
              "word": "foundation",
              "color": "#ff8a63",
              "emoji": "🧱",
              "geo": "sphere",
              "clue": "The base that everything is built on.",
              "example": "A calm start is the foundation of my day.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "seed",
              "word": "cultivate",
              "color": "#1fc4b6",
              "emoji": "🌱",
              "geo": "torus",
              "clue": "To grow something slowly, with care.",
              "example": "You cultivate discipline one small day at a time.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "anchor",
              "word": "anchor",
              "color": "#1ca8a2",
              "emoji": "⚓",
              "geo": "octa",
              "clue": "Something that keeps you steady.",
              "example": "My morning practice is my anchor.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "brain",
              "word": "rewire",
              "color": "#57e6c4",
              "emoji": "🧠",
              "geo": "dodeca",
              "clue": "Change a habit by building a new pattern.",
              "example": "Little by little, you rewire your brain.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I used to feel ",
              " in the morning, but a small ",
              " gave my day a better ",
              ". I slowly learned to ",
              " discipline, and now practice is my ",
              " — little by little, it began to ",
              " how I learn."
            ],
            "answers": [
              "scattered",
              "ritual",
              "foundation",
              "cultivate",
              "anchor",
              "rewire"
            ],
            "keeper": "Real discipline isn't never falling — it's learning how to come back."
          }
        }
      },
      {
        "id": "ep232",
        "ep": "EP232",
        "title": "Manage Your Time",
        "current": false,
        "cover": "/covers/clue-room-ep232.png",
        "content": {
          "intro": "Sam's morning kept slipping away. Tap the glowing objects to uncover the six phrases, then put the day back on track.",
          "clues": [
            {
              "id": "hourglass",
              "word": "slip away",
              "color": "#f6479a",
              "emoji": "⏳",
              "geo": "ico",
              "clue": "Pass by unnoticed; be quietly lost.",
              "example": "A whole morning can slip away if you're not careful.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "snooze",
              "word": "put off",
              "color": "#8b6cff",
              "emoji": "⏰",
              "geo": "box",
              "clue": "Delay or postpone something.",
              "example": "It's tempting to put off the hardest task.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "sun",
              "word": "make the most of",
              "color": "#ff8a63",
              "emoji": "☀",
              "geo": "sphere",
              "clue": "Use to best advantage.",
              "example": "She learned to make the most of small pockets of time.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "target",
              "word": "stay on track",
              "color": "#1fc4b6",
              "emoji": "🎯",
              "geo": "torus",
              "clue": "Keep moving toward a goal.",
              "example": "A simple list helps you stay on track.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "calendar",
              "word": "carve out time",
              "color": "#1ca8a2",
              "emoji": "📆",
              "geo": "octa",
              "clue": "Deliberately set time aside.",
              "example": "He carved out time for deep work each morning.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "phone",
              "word": "get carried away",
              "color": "#57e6c4",
              "emoji": "📱",
              "geo": "dodeca",
              "clue": "Lose control of how long you spend.",
              "example": "It's easy to get carried away scrolling.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "I used to let mornings ",
              " and ",
              " the big tasks, but once I learned to ",
              " and ",
              ", I could ",
              " each day and not ",
              " by distractions."
            ],
            "answers": [
              "slip away",
              "put off",
              "carve out time",
              "stay on track",
              "make the most of",
              "get carried away"
            ],
            "keeper": "Time management is about choosing better, not doing more."
          }
        }
      },
      {
        "id": "ep231",
        "ep": "EP231",
        "title": "Maya's Tuesday",
        "current": false,
        "cover": "/covers/clue-room-ep231.png",
        "content": {
          "intro": "Maya had a fuller-than-usual Tuesday. Tap the glowing objects to uncover the six phrases that tell the story.",
          "clues": [
            {
              "id": "calendar",
              "word": "eventful",
              "color": "#f6479a",
              "emoji": "📅",
              "geo": "box",
              "clue": "Full of things happening.",
              "example": "It was a really eventful Tuesday — so much happened.",
              "position": [
                -3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "note",
              "word": "turned out",
              "color": "#ff8a63",
              "emoji": "📝",
              "geo": "cone",
              "clue": "Ended up a certain way, often a surprise.",
              "example": "The day turned out better than she expected.",
              "position": [
                -2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "photo",
              "word": "ran into",
              "color": "#8b6cff",
              "emoji": "🖼",
              "geo": "torus",
              "clue": "Met someone by chance.",
              "example": "On the way home, she ran into an old friend.",
              "position": [
                2.1,
                -0.2,
                1.3
              ]
            },
            {
              "id": "checklist",
              "word": "managed to",
              "color": "#1fc4b6",
              "emoji": "✅",
              "geo": "octa",
              "clue": "Succeeded in doing something difficult.",
              "example": "Somehow she managed to finish everything on time.",
              "position": [
                3.6,
                1.5,
                -0.4
              ]
            },
            {
              "id": "sunset",
              "word": "worthwhile",
              "color": "#ffcd46",
              "emoji": "🌅",
              "geo": "sphere",
              "clue": "Worth the time and effort.",
              "example": "Tiring, yes — but a worthwhile day.",
              "position": [
                0,
                2.7,
                -1.7
              ]
            },
            {
              "id": "memorybox",
              "word": "look back on",
              "color": "#57e6c4",
              "emoji": "📦",
              "geo": "dodeca",
              "clue": "Think about something in the past.",
              "example": "Now she can look back on it with a smile.",
              "position": [
                0,
                -0.1,
                2.1
              ]
            }
          ],
          "puzzle": {
            "segments": [
              "When I ",
              " that ",
              " Tuesday, I ",
              " an old friend and still ",
              " finish everything — it ",
              " to be a ",
              " day."
            ],
            "answers": [
              "look back on",
              "eventful",
              "ran into",
              "managed to",
              "turned out",
              "worthwhile"
            ],
            "keeper": "Yesterday is a story only you can tell."
          }
        }
      }
    ]
  },
  {
    "type": "phrase-pairs",
    "name": "Phrase Pairs",
    "access": "transcript",
    "icon": "🃏",
    "accent": "#1fc4b6",
    "tagline": "Flip the cards, match each phrase to its meaning — and hear it on every match.",
    "walkthrough": "/assets/walkthroughs/phrase-pairs-walkthrough.mp4",
    "episodes": [
      {
        "id": "ep267",
        "ep": "EP267",
        "title": "Overthinking",
        "current": true,
        "cover": "/covers/phrase-pairs-ep267.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "second-guess",
              "meaning": "to keep doubting your decision",
              "color": "#f6479a"
            },
            {
              "word": "self-conscious",
              "meaning": "nervously aware of yourself",
              "color": "#8b6cff"
            },
            {
              "word": "articulate",
              "meaning": "able to express ideas clearly",
              "color": "#ff8a63"
            },
            {
              "word": "spontaneous",
              "meaning": "natural and unplanned",
              "color": "#1fc4b6"
            },
            {
              "word": "instinctive",
              "meaning": "automatic, without thinking",
              "color": "#1ca8a2"
            },
            {
              "word": "composure",
              "meaning": "staying calm under pressure",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Fluency isn't never getting stuck — it's staying in the conversation anyway."
        }
      },
      {
        "id": "ep263",
        "ep": "EP263",
        "title": "Awkward Talks",
        "current": false,
        "cover": "/covers/phrase-pairs-ep263.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "awkward",
              "meaning": "uncomfortable or embarrassing",
              "color": "#f6479a"
            },
            {
              "word": "clarify",
              "meaning": "to make something clearer",
              "color": "#8b6cff"
            },
            {
              "word": "hesitate",
              "meaning": "to pause because you're unsure",
              "color": "#ff8a63"
            },
            {
              "word": "appropriate",
              "meaning": "suitable for the situation",
              "color": "#1fc4b6"
            },
            {
              "word": "misunderstanding",
              "meaning": "understanding it the wrong way",
              "color": "#1ca8a2"
            },
            {
              "word": "reassure",
              "meaning": "to help someone worry less",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real conversation is messy — it doesn't wait for the perfect sentence."
        }
      },
      {
        "id": "ep262",
        "ep": "EP262",
        "title": "Stay Positive",
        "current": false,
        "cover": "/covers/phrase-pairs-ep262.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "composure",
              "meaning": "staying calm and in control",
              "color": "#f6479a"
            },
            {
              "word": "magnify",
              "meaning": "making something seem bigger",
              "color": "#8b6cff"
            },
            {
              "word": "deflated",
              "meaning": "suddenly feeling low or hopeless",
              "color": "#ff8a63"
            },
            {
              "word": "contentment",
              "meaning": "a quiet, settled happiness",
              "color": "#1fc4b6"
            },
            {
              "word": "adaptability",
              "meaning": "changing your approach when things change",
              "color": "#1ca8a2"
            },
            {
              "word": "acknowledge",
              "meaning": "to notice and accept a feeling",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Staying positive means meeting an imperfect day without deciding everything's terrible."
        }
      },
      {
        "id": "ep251",
        "ep": "EP251",
        "title": "Purpose",
        "current": false,
        "cover": "/covers/phrase-pairs-ep251.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "direction",
              "meaning": "the path you are following",
              "color": "#f6479a"
            },
            {
              "word": "meaningful",
              "meaning": "important or valuable to you",
              "color": "#8b6cff"
            },
            {
              "word": "stagnant",
              "meaning": "stuck and not growing",
              "color": "#ff8a63"
            },
            {
              "word": "alignment",
              "meaning": "parts of life supporting each other",
              "color": "#1fc4b6"
            },
            {
              "word": "fulfilling",
              "meaning": "giving deep satisfaction",
              "color": "#1ca8a2"
            },
            {
              "word": "calling",
              "meaning": "a path that feels truly right",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Purpose isn't one perfect answer — it's a direction that grows with you."
        }
      },
      {
        "id": "ep250",
        "ep": "EP250",
        "title": "Online Reviews",
        "current": false,
        "cover": "/covers/phrase-pairs-ep250.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "skeptical",
              "meaning": "not easily believing without proof",
              "color": "#f6479a"
            },
            {
              "word": "incentivized",
              "meaning": "encouraged by a reward",
              "color": "#8b6cff"
            },
            {
              "word": "credibility",
              "meaning": "how trustworthy something is",
              "color": "#ff8a63"
            },
            {
              "word": "biased",
              "meaning": "not neutral or fair",
              "color": "#1fc4b6"
            },
            {
              "word": "authentic",
              "meaning": "real and genuine",
              "color": "#1ca8a2"
            },
            {
              "word": "manipulate",
              "meaning": "to influence in a dishonest way",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Trust the pattern, not a single five-star review."
        }
      },
      {
        "id": "ep249",
        "ep": "EP249",
        "title": "Confidence",
        "current": false,
        "cover": "/covers/phrase-pairs-ep249.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "clarity",
              "meaning": "being easy to understand",
              "color": "#f6479a"
            },
            {
              "word": "composed",
              "meaning": "calm and in control",
              "color": "#8b6cff"
            },
            {
              "word": "clarify",
              "meaning": "to make something clearer",
              "color": "#ff8a63"
            },
            {
              "word": "hesitate",
              "meaning": "to pause because you're unsure",
              "color": "#1fc4b6"
            },
            {
              "word": "recover",
              "meaning": "to get back on track",
              "color": "#1ca8a2"
            },
            {
              "word": "self-doubt",
              "meaning": "a lack of confidence in yourself",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Confidence isn't speaking fast — it's speaking clearly."
        }
      },
      {
        "id": "ep248",
        "ep": "EP248",
        "title": "Modern Love",
        "current": false,
        "cover": "/covers/phrase-pairs-ep248.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "vulnerability",
              "meaning": "being open about your real feelings",
              "color": "#f6479a"
            },
            {
              "word": "compatibility",
              "meaning": "whether two people truly fit",
              "color": "#8b6cff"
            },
            {
              "word": "disposable",
              "meaning": "used once and then thrown away",
              "color": "#ff8a63"
            },
            {
              "word": "reciprocity",
              "meaning": "when effort goes both ways",
              "color": "#1fc4b6"
            },
            {
              "word": "disillusioned",
              "meaning": "disappointed after losing belief",
              "color": "#1ca8a2"
            },
            {
              "word": "ghosting",
              "meaning": "disappearing with no explanation",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real love isn't just chemistry — it's honesty and effort, both ways."
        }
      },
      {
        "id": "ep247",
        "ep": "EP247",
        "title": "Calm Nights",
        "current": false,
        "cover": "/covers/phrase-pairs-ep247.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "racing thoughts",
              "meaning": "fast thoughts that won't slow down",
              "color": "#f6479a"
            },
            {
              "word": "brain dump",
              "meaning": "writing everything in your mind down",
              "color": "#8b6cff"
            },
            {
              "word": "anxiety",
              "meaning": "a strong worried or nervous feeling",
              "color": "#ff8a63"
            },
            {
              "word": "reassuring",
              "meaning": "making someone feel less worried",
              "color": "#1fc4b6"
            },
            {
              "word": "doom-scrolling",
              "meaning": "scrolling bad news for too long",
              "color": "#1ca8a2"
            },
            {
              "word": "wired",
              "meaning": "very awake and full of nervous energy",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Calming your mind isn't about perfection — it's about noticing what helps."
        }
      },
      {
        "id": "ep246",
        "ep": "EP246",
        "title": "Speaking",
        "current": false,
        "cover": "/covers/phrase-pairs-ep246.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "anticipate",
              "meaning": "to expect something before it happens",
              "color": "#f6479a"
            },
            {
              "word": "self-conscious",
              "meaning": "too aware of yourself when speaking",
              "color": "#8b6cff"
            },
            {
              "word": "misinterpret",
              "meaning": "to understand something the wrong way",
              "color": "#ff8a63"
            },
            {
              "word": "stumble over words",
              "meaning": "to speak unevenly, with slips or stops",
              "color": "#1fc4b6"
            },
            {
              "word": "chunk",
              "meaning": "a small, easy piece of language",
              "color": "#1ca8a2"
            },
            {
              "word": "repair phrase",
              "meaning": "a line that keeps a conversation going",
              "color": "#57e6c4"
            }
          ],
          "keeper": "It's not about sounding perfect. It's about staying in the conversation."
        }
      },
      {
        "id": "ep243",
        "ep": "EP243",
        "title": "Change",
        "current": false,
        "cover": "/covers/phrase-pairs-ep243.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "willpower",
              "meaning": "the strength to keep going when it's hard",
              "color": "#f6479a"
            },
            {
              "word": "strategy",
              "meaning": "a clear plan for reaching a goal",
              "color": "#8b6cff"
            },
            {
              "word": "barrier",
              "meaning": "something that blocks your progress",
              "color": "#ff8a63"
            },
            {
              "word": "impulsivity",
              "meaning": "acting now without thinking ahead",
              "color": "#1fc4b6"
            },
            {
              "word": "procrastination",
              "meaning": "delaying something you should do",
              "color": "#1ca8a2"
            },
            {
              "word": "accountability",
              "meaning": "being responsible for what you said",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Change isn't one big moment — it's many small designs."
        }
      },
      {
        "id": "ep242",
        "ep": "EP242",
        "title": "Climate",
        "current": false,
        "cover": "/covers/phrase-pairs-ep242.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "sustainable",
              "meaning": "able to continue without too much harm",
              "color": "#f6479a"
            },
            {
              "word": "eco-friendly",
              "meaning": "less harmful to the environment",
              "color": "#8b6cff"
            },
            {
              "word": "carbon footprint",
              "meaning": "the carbon pollution your life creates",
              "color": "#ff8a63"
            },
            {
              "word": "environmental impact",
              "meaning": "the effect something has on nature",
              "color": "#1fc4b6"
            },
            {
              "word": "overconsumption",
              "meaning": "buying more than we really need",
              "color": "#1ca8a2"
            },
            {
              "word": "biodiversity",
              "meaning": "the variety of living things in an area",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Understand your impact, and make wiser choices where you can."
        }
      },
      {
        "id": "ep239",
        "ep": "EP239",
        "title": "Workday",
        "current": false,
        "cover": "/covers/phrase-pairs-ep239.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "workload",
              "meaning": "the amount of work you have",
              "color": "#f6479a"
            },
            {
              "word": "deadline",
              "meaning": "the date when something must be finished",
              "color": "#8b6cff"
            },
            {
              "word": "colleague",
              "meaning": "someone you work with",
              "color": "#ff8a63"
            },
            {
              "word": "productive",
              "meaning": "getting useful work done, not just busy",
              "color": "#1fc4b6"
            },
            {
              "word": "distracted",
              "meaning": "unable to focus on your work",
              "color": "#1ca8a2"
            },
            {
              "word": "wrap up",
              "meaning": "to finish a task or your workday",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Don't confuse activity with progress."
        }
      },
      {
        "id": "ep238",
        "ep": "EP238",
        "title": "Exercise",
        "current": false,
        "cover": "/covers/phrase-pairs-ep238.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "sedentary",
              "meaning": "sitting a lot and not moving much",
              "color": "#f6479a"
            },
            {
              "word": "endurance",
              "meaning": "the ability to keep going for a long time",
              "color": "#8b6cff"
            },
            {
              "word": "exertion",
              "meaning": "physical effort",
              "color": "#ff8a63"
            },
            {
              "word": "mobility",
              "meaning": "how easily your body can move",
              "color": "#1fc4b6"
            },
            {
              "word": "plateau",
              "meaning": "when progress stops or slows down",
              "color": "#1ca8a2"
            },
            {
              "word": "overdo",
              "meaning": "to do too much",
              "color": "#57e6c4"
            }
          ],
          "keeper": "The best exercise isn't the perfect one — it's the one you'll actually repeat."
        }
      },
      {
        "id": "ep235",
        "ep": "EP235",
        "title": "Family",
        "current": false,
        "cover": "/covers/phrase-pairs-ep235.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "upbringing",
              "meaning": "the way you were raised as a child",
              "color": "#f6479a"
            },
            {
              "word": "belonging",
              "meaning": "the feeling of being accepted somewhere",
              "color": "#8b6cff"
            },
            {
              "word": "generational gap",
              "meaning": "how older and younger people differ",
              "color": "#ff8a63"
            },
            {
              "word": "obligation",
              "meaning": "something you feel you must do",
              "color": "#1fc4b6"
            },
            {
              "word": "make amends",
              "meaning": "fix things after an argument",
              "color": "#ffcd46"
            }
          ],
          "keeper": "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        "id": "ep234",
        "ep": "EP234",
        "title": "Morning Routine",
        "current": false,
        "cover": "/covers/phrase-pairs-ep234.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "scattered",
              "meaning": "unfocused and all over the place",
              "color": "#f6479a"
            },
            {
              "word": "ritual",
              "meaning": "a small action you repeat",
              "color": "#8b6cff"
            },
            {
              "word": "foundation",
              "meaning": "the base everything is built on",
              "color": "#ff8a63"
            },
            {
              "word": "cultivate",
              "meaning": "grow something slowly, with care",
              "color": "#1fc4b6"
            },
            {
              "word": "anchor",
              "meaning": "something that keeps you steady",
              "color": "#1ca8a2"
            },
            {
              "word": "rewire",
              "meaning": "build a new habit pattern",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real discipline isn't never falling — it's learning how to come back."
        }
      },
      {
        "id": "ep232",
        "ep": "EP232",
        "title": "Manage Your Time",
        "current": false,
        "cover": "/covers/phrase-pairs-ep232.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "slip away",
              "meaning": "pass by without you noticing",
              "color": "#f6479a"
            },
            {
              "word": "put off",
              "meaning": "delay something you should do",
              "color": "#8b6cff"
            },
            {
              "word": "make the most of",
              "meaning": "use your time or chance well",
              "color": "#ff8a63"
            },
            {
              "word": "stay on track",
              "meaning": "keep following the plan",
              "color": "#1fc4b6"
            },
            {
              "word": "carve out time",
              "meaning": "set time aside on purpose",
              "color": "#1ca8a2"
            },
            {
              "word": "get carried away",
              "meaning": "spend more time than you meant",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Time management is about choosing better, not doing more."
        }
      },
      {
        "id": "ep231",
        "ep": "EP231",
        "title": "Maya's Tuesday",
        "current": false,
        "cover": "/covers/phrase-pairs-ep231.png",
        "content": {
          "intro": "Match each phrase to its meaning. Every match speaks the phrase aloud.",
          "pairs": [
            {
              "word": "eventful",
              "meaning": "full of things happening",
              "color": "#f6479a"
            },
            {
              "word": "turned out",
              "meaning": "ended up a certain way",
              "color": "#ff8a63"
            },
            {
              "word": "ran into",
              "meaning": "met someone by chance",
              "color": "#8b6cff"
            },
            {
              "word": "managed to",
              "meaning": "succeeded at something hard",
              "color": "#1fc4b6"
            },
            {
              "word": "worthwhile",
              "meaning": "worth the time and effort",
              "color": "#ffcd46"
            },
            {
              "word": "look back on",
              "meaning": "think about the past",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Yesterday is a story only you can tell."
        }
      }
    ]
  },
  {
    "type": "listening-gap",
    "name": "Listening Gap",
    "access": "fluency",
    "icon": "🎧",
    "accent": "#ff8a63",
    "tagline": "Listen to the sentence, then tap the phrase that fills the gap.",
    "walkthrough": "/assets/walkthroughs/listening-gap-walkthrough.mp4",
    "episodes": [
      {
        "id": "ep267",
        "ep": "EP267",
        "title": "Overthinking",
        "current": true,
        "cover": "/covers/listening-gap-ep267.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I try not to second-guess every word.",
              "phrase": "second-guess",
              "color": "#f6479a"
            },
            {
              "text": "I feel self-conscious when I speak in meetings.",
              "phrase": "self-conscious",
              "color": "#8b6cff"
            },
            {
              "text": "I want to be articulate, not perfect.",
              "phrase": "articulate",
              "color": "#ff8a63"
            },
            {
              "text": "A real conversation is spontaneous and relaxed.",
              "phrase": "spontaneous",
              "color": "#1fc4b6"
            },
            {
              "text": "With practice, speaking becomes instinctive.",
              "phrase": "instinctive",
              "color": "#1ca8a2"
            },
            {
              "text": "I kept my composure and finished the sentence.",
              "phrase": "composure",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Fluency isn't never getting stuck — it's staying in the conversation anyway."
        }
      },
      {
        "id": "ep263",
        "ep": "EP263",
        "title": "Awkward Talks",
        "current": false,
        "cover": "/covers/listening-gap-ep263.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "There was an awkward silence at dinner.",
              "phrase": "awkward",
              "color": "#f6479a"
            },
            {
              "text": "Could you clarify what you mean by later?",
              "phrase": "clarify",
              "color": "#8b6cff"
            },
            {
              "text": "I try not to hesitate before I answer.",
              "phrase": "hesitate",
              "color": "#ff8a63"
            },
            {
              "text": "That joke isn't appropriate for work.",
              "phrase": "appropriate",
              "color": "#1fc4b6"
            },
            {
              "text": "There was a misunderstanding about the time.",
              "phrase": "misunderstanding",
              "color": "#1ca8a2"
            },
            {
              "text": "I just want to reassure you that it’s fine.",
              "phrase": "reassure",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real conversation is messy — it doesn't wait for the perfect sentence."
        }
      },
      {
        "id": "ep262",
        "ep": "EP262",
        "title": "Stay Positive",
        "current": false,
        "cover": "/covers/listening-gap-ep262.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I took a slow breath and regained my composure.",
              "phrase": "composure",
              "color": "#f6479a"
            },
            {
              "text": "When I'm tired, I magnify small problems.",
              "phrase": "magnify",
              "color": "#8b6cff"
            },
            {
              "text": "I felt completely deflated after the rejection.",
              "phrase": "deflated",
              "color": "#ff8a63"
            },
            {
              "text": "I found contentment in a simple daily routine.",
              "phrase": "contentment",
              "color": "#1fc4b6"
            },
            {
              "text": "Adaptability helped me reach my goal.",
              "phrase": "adaptability",
              "color": "#1ca8a2"
            },
            {
              "text": "I acknowledge how I feel without hiding it.",
              "phrase": "acknowledge",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Staying positive means meeting an imperfect day without deciding everything's terrible."
        }
      },
      {
        "id": "ep251",
        "ep": "EP251",
        "title": "Purpose",
        "current": false,
        "cover": "/covers/listening-gap-ep251.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I don't need a final goal, just a direction.",
              "phrase": "direction",
              "color": "#f6479a"
            },
            {
              "text": "I want work that feels meaningful.",
              "phrase": "meaningful",
              "color": "#8b6cff"
            },
            {
              "text": "My routine felt stagnant, so I changed it.",
              "phrase": "stagnant",
              "color": "#ff8a63"
            },
            {
              "text": "My job and values are finally in alignment.",
              "phrase": "alignment",
              "color": "#1fc4b6"
            },
            {
              "text": "Helping others is deeply fulfilling.",
              "phrase": "fulfilling",
              "color": "#1ca8a2"
            },
            {
              "text": "Teaching felt like her true calling.",
              "phrase": "calling",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Purpose isn't one perfect answer — it's a direction that grows with you."
        }
      },
      {
        "id": "ep250",
        "ep": "EP250",
        "title": "Online Reviews",
        "current": false,
        "cover": "/covers/listening-gap-ep250.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I’m skeptical of reviews that sound too perfect.",
              "phrase": "skeptical",
              "color": "#f6479a"
            },
            {
              "text": "Some shops leave incentivized reviews for a discount.",
              "phrase": "incentivized",
              "color": "#8b6cff"
            },
            {
              "text": "Fake reviews damage a brand's credibility.",
              "phrase": "credibility",
              "color": "#ff8a63"
            },
            {
              "text": "A paid review is usually biased.",
              "phrase": "biased",
              "color": "#1fc4b6"
            },
            {
              "text": "I trust authentic reviews with real photos.",
              "phrase": "authentic",
              "color": "#1ca8a2"
            },
            {
              "text": "Review farms can manipulate a product's rating.",
              "phrase": "manipulate",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Trust the pattern, not a single five-star review."
        }
      },
      {
        "id": "ep249",
        "ep": "EP249",
        "title": "Confidence",
        "current": false,
        "cover": "/covers/listening-gap-ep249.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I try to speak with clarity, not speed.",
              "phrase": "clarity",
              "color": "#f6479a"
            },
            {
              "text": "She stayed composed during a hard question.",
              "phrase": "composed",
              "color": "#8b6cff"
            },
            {
              "text": "Just to clarify, do you mean Friday?",
              "phrase": "clarify",
              "color": "#ff8a63"
            },
            {
              "text": "Don’t hesitate to ask your question.",
              "phrase": "hesitate",
              "color": "#1fc4b6"
            },
            {
              "text": "I lost my word but chose to recover quickly.",
              "phrase": "recover",
              "color": "#1ca8a2"
            },
            {
              "text": "Self-doubt kept me quiet in meetings.",
              "phrase": "self-doubt",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Confidence isn't speaking fast — it's speaking clearly."
        }
      },
      {
        "id": "ep248",
        "ep": "EP248",
        "title": "Modern Love",
        "current": false,
        "cover": "/covers/listening-gap-ep248.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "Real closeness begins with a little vulnerability.",
              "phrase": "vulnerability",
              "color": "#f6479a"
            },
            {
              "text": "We have chemistry, but I question our compatibility.",
              "phrase": "compatibility",
              "color": "#8b6cff"
            },
            {
              "text": "Modern dating can make people feel disposable.",
              "phrase": "disposable",
              "color": "#ff8a63"
            },
            {
              "text": "A healthy relationship needs reciprocity.",
              "phrase": "reciprocity",
              "color": "#1fc4b6"
            },
            {
              "text": "After months of apps, she felt disillusioned.",
              "phrase": "disillusioned",
              "color": "#1ca8a2"
            },
            {
              "text": "He stopped replying, which felt like ghosting.",
              "phrase": "ghosting",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real love isn't just chemistry — it's honesty and effort, both ways."
        }
      },
      {
        "id": "ep247",
        "ep": "EP247",
        "title": "Calm Nights",
        "current": false,
        "cover": "/covers/listening-gap-ep247.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I couldn't sleep because of my racing thoughts.",
              "phrase": "racing thoughts",
              "color": "#f6479a"
            },
            {
              "text": "I did a brain dump before going to bed.",
              "phrase": "brain dump",
              "color": "#8b6cff"
            },
            {
              "text": "My anxiety gets worse when I try to sleep.",
              "phrase": "anxiety",
              "color": "#ff8a63"
            },
            {
              "text": "It was reassuring to hear I'm not alone.",
              "phrase": "reassuring",
              "color": "#1fc4b6"
            },
            {
              "text": "I stayed up too late doom-scrolling in bed.",
              "phrase": "doom-scrolling",
              "color": "#1ca8a2"
            },
            {
              "text": "I was exhausted, but I still felt wired.",
              "phrase": "wired",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Calming your mind isn't about perfection — it's about noticing what helps."
        }
      },
      {
        "id": "ep246",
        "ep": "EP246",
        "title": "Speaking",
        "current": false,
        "cover": "/covers/listening-gap-ep246.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I try not to anticipate failure before I speak.",
              "phrase": "anticipate",
              "color": "#f6479a"
            },
            {
              "text": "I feel self-conscious when I speak in meetings.",
              "phrase": "self-conscious",
              "color": "#8b6cff"
            },
            {
              "text": "I often misinterpret his silence as anger.",
              "phrase": "misinterpret",
              "color": "#ff8a63"
            },
            {
              "text": "I sometimes stumble over words when I'm nervous.",
              "phrase": "stumble over words",
              "color": "#1fc4b6"
            },
            {
              "text": "I can speak in one small chunk at a time.",
              "phrase": "chunk",
              "color": "#1ca8a2"
            },
            {
              "text": "I use a repair phrase to keep talking.",
              "phrase": "repair phrase",
              "color": "#57e6c4"
            }
          ],
          "keeper": "It's not about sounding perfect. It's about staying in the conversation."
        }
      },
      {
        "id": "ep243",
        "ep": "EP243",
        "title": "Change",
        "current": false,
        "cover": "/covers/listening-gap-ep243.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "My willpower is weak around chocolate cake.",
              "phrase": "willpower",
              "color": "#f6479a"
            },
            {
              "text": "My strategy is to start with ten minutes a day.",
              "phrase": "strategy",
              "color": "#8b6cff"
            },
            {
              "text": "Fear is my biggest barrier when I speak.",
              "phrase": "barrier",
              "color": "#ff8a63"
            },
            {
              "text": "I'm trying to control my impulsivity when I shop.",
              "phrase": "impulsivity",
              "color": "#1fc4b6"
            },
            {
              "text": "Procrastination is stopping me from improving.",
              "phrase": "procrastination",
              "color": "#1ca8a2"
            },
            {
              "text": "The group gives me real accountability.",
              "phrase": "accountability",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Change isn't one big moment — it's many small designs."
        }
      },
      {
        "id": "ep242",
        "ep": "EP242",
        "title": "Climate",
        "current": false,
        "cover": "/covers/listening-gap-ep242.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "I'm trying to build a more sustainable routine.",
              "phrase": "sustainable",
              "color": "#f6479a"
            },
            {
              "text": "This shop uses eco-friendly packaging.",
              "phrase": "eco-friendly",
              "color": "#8b6cff"
            },
            {
              "text": "I'm trying to reduce my carbon footprint.",
              "phrase": "carbon footprint",
              "color": "#ff8a63"
            },
            {
              "text": "Fast fashion can have a real environmental impact.",
              "phrase": "environmental impact",
              "color": "#1fc4b6"
            },
            {
              "text": "Overconsumption creates a lot of unnecessary waste.",
              "phrase": "overconsumption",
              "color": "#1ca8a2"
            },
            {
              "text": "This forest has rich biodiversity.",
              "phrase": "biodiversity",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Understand your impact, and make wiser choices where you can."
        }
      },
      {
        "id": "ep239",
        "ep": "EP239",
        "title": "Workday",
        "current": false,
        "cover": "/covers/listening-gap-ep239.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "By lunchtime my workload felt much heavier.",
              "phrase": "workload",
              "color": "#f6479a"
            },
            {
              "text": "The deadline is coming up this Friday.",
              "phrase": "deadline",
              "color": "#8b6cff"
            },
            {
              "text": "My colleague helped me find the file.",
              "phrase": "colleague",
              "color": "#ff8a63"
            },
            {
              "text": "I had a productive morning and finished early.",
              "phrase": "productive",
              "color": "#1fc4b6"
            },
            {
              "text": "I felt distracted by my phone all afternoon.",
              "phrase": "distracted",
              "color": "#1ca8a2"
            },
            {
              "text": "Let's wrap up the meeting for today.",
              "phrase": "wrap up",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Don't confuse activity with progress."
        }
      },
      {
        "id": "ep238",
        "ep": "EP238",
        "title": "Exercise",
        "current": false,
        "cover": "/covers/listening-gap-ep238.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "My lifestyle has become a bit too sedentary.",
              "phrase": "sedentary",
              "color": "#f6479a"
            },
            {
              "text": "Walking every day helped me build endurance.",
              "phrase": "endurance",
              "color": "#8b6cff"
            },
            {
              "text": "I felt a lot of exertion after the climb.",
              "phrase": "exertion",
              "color": "#ff8a63"
            },
            {
              "text": "Daily stretching really improves my mobility.",
              "phrase": "mobility",
              "color": "#1fc4b6"
            },
            {
              "text": "After weeks of training, I hit a plateau.",
              "phrase": "plateau",
              "color": "#1ca8a2"
            },
            {
              "text": "Don't overdo it on your first day back.",
              "phrase": "overdo",
              "color": "#57e6c4"
            }
          ],
          "keeper": "The best exercise isn't the perfect one — it's the one you'll actually repeat."
        }
      },
      {
        "id": "ep235",
        "ep": "EP235",
        "title": "Family",
        "current": false,
        "cover": "/covers/listening-gap-ep235.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "My upbringing shaped the person I am today.",
              "phrase": "upbringing",
              "color": "#f6479a"
            },
            {
              "text": "My family gives me a sense of belonging.",
              "phrase": "belonging",
              "color": "#8b6cff"
            },
            {
              "text": "Sometimes we disagree because of the generational gap.",
              "phrase": "generational gap",
              "color": "#ff8a63"
            },
            {
              "text": "I feel a strong sense of obligation to my family.",
              "phrase": "obligation",
              "color": "#1fc4b6"
            },
            {
              "text": "I called my brother to make amends.",
              "phrase": "make amends",
              "color": "#ffcd46"
            }
          ],
          "keeper": "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        "id": "ep234",
        "ep": "EP234",
        "title": "Morning Routine",
        "current": false,
        "cover": "/covers/listening-gap-ep234.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "Before my routine, I felt scattered every morning.",
              "phrase": "scattered",
              "color": "#f6479a"
            },
            {
              "text": "A cup of tea became my morning ritual.",
              "phrase": "ritual",
              "color": "#8b6cff"
            },
            {
              "text": "A calm start is the foundation of my day.",
              "phrase": "foundation",
              "color": "#ff8a63"
            },
            {
              "text": "You cultivate discipline one small day at a time.",
              "phrase": "cultivate",
              "color": "#1fc4b6"
            },
            {
              "text": "My morning English practice is my anchor.",
              "phrase": "anchor",
              "color": "#1ca8a2"
            },
            {
              "text": "Little by little, you rewire your brain.",
              "phrase": "rewire",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real discipline isn't never falling — it's learning how to come back."
        }
      },
      {
        "id": "ep232",
        "ep": "EP232",
        "title": "Manage Your Time",
        "current": false,
        "cover": "/covers/listening-gap-ep232.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "Don't let the whole morning slip away.",
              "phrase": "slip away",
              "color": "#f6479a"
            },
            {
              "text": "Try not to put off the hardest task.",
              "phrase": "put off",
              "color": "#8b6cff"
            },
            {
              "text": "She likes to make the most of small breaks.",
              "phrase": "make the most of",
              "color": "#ff8a63"
            },
            {
              "text": "A short list helps me stay on track.",
              "phrase": "stay on track",
              "color": "#1fc4b6"
            },
            {
              "text": "I carve out time for English every day.",
              "phrase": "carve out time",
              "color": "#1ca8a2"
            },
            {
              "text": "It's easy to get carried away on your phone.",
              "phrase": "get carried away",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Time management is about choosing better, not doing more."
        }
      },
      {
        "id": "ep231",
        "ep": "EP231",
        "title": "Maya's Tuesday",
        "current": false,
        "cover": "/covers/listening-gap-ep231.png",
        "content": {
          "intro": "Press play, listen, then tap the phrase that fits the gap.",
          "rounds": [
            {
              "text": "It was a really eventful day.",
              "phrase": "eventful",
              "color": "#f6479a"
            },
            {
              "text": "The day turned out better than expected.",
              "phrase": "turned out",
              "color": "#ff8a63"
            },
            {
              "text": "She ran into an old friend on the way home.",
              "phrase": "ran into",
              "color": "#8b6cff"
            },
            {
              "text": "Somehow she managed to finish on time.",
              "phrase": "managed to",
              "color": "#1fc4b6"
            },
            {
              "text": "It was a tiring but worthwhile day.",
              "phrase": "worthwhile",
              "color": "#ffcd46"
            },
            {
              "text": "Now she can look back on it with a smile.",
              "phrase": "look back on",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Yesterday is a story only you can tell."
        }
      }
    ]
  },
  {
    "type": "story-unlock",
    "name": "Story Unlock",
    "access": "fluency",
    "icon": "📖",
    "accent": "#8b6cff",
    "tagline": "Place the phrases to unlock the episode's mini story — plus a bonus ending.",
    "walkthrough": "/assets/walkthroughs/story-unlock-walkthrough.mp4",
    "episodes": [
      {
        "id": "ep267",
        "ep": "EP267",
        "title": "Overthinking",
        "current": true,
        "cover": "/covers/story-unlock-ep267.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "second-guess",
              "color": "#f6479a"
            },
            {
              "word": "self-conscious",
              "color": "#8b6cff"
            },
            {
              "word": "articulate",
              "color": "#ff8a63"
            },
            {
              "word": "spontaneous",
              "color": "#1fc4b6"
            },
            {
              "word": "instinctive",
              "color": "#1ca8a2"
            },
            {
              "word": "composure",
              "color": "#57e6c4"
            }
          ],
          "story": "For years, my English lived only in my head. Out loud, I would {second-guess} every word and feel painfully {self-conscious} about my accent. I thought fluency meant sounding perfect. Slowly, I learned it doesn't. It means being {articulate} — clear, not fancy. It means letting conversation be {spontaneous} instead of scripted, and trusting replies that feel {instinctive} rather than rehearsed. And on the hard days, when a word disappears, it means keeping my {composure} and staying in the conversation anyway.",
          "bonusEnding": "You will still forget words sometimes — even fluent speakers do. The goal was never a flawless sentence. It was to let your English represent the real you: clear, natural, and calm enough to keep going. Stay in the conversation, and the fluency follows.",
          "keeper": "Fluency isn't never getting stuck — it's staying in the conversation anyway."
        }
      },
      {
        "id": "ep263",
        "ep": "EP263",
        "title": "Awkward Talks",
        "current": false,
        "cover": "/covers/story-unlock-ep263.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "awkward",
              "color": "#f6479a"
            },
            {
              "word": "clarify",
              "color": "#8b6cff"
            },
            {
              "word": "hesitate",
              "color": "#ff8a63"
            },
            {
              "word": "appropriate",
              "color": "#1fc4b6"
            },
            {
              "word": "misunderstanding",
              "color": "#1ca8a2"
            },
            {
              "word": "reassure",
              "color": "#57e6c4"
            }
          ],
          "story": "Small talk used to terrify me. One badly timed joke, and the whole room would feel {awkward}. I'd freeze, {hesitate}, and let the silence stretch. Slowly, I learned a few gentle moves. When I'm not sure what someone means, I ask them to {clarify} instead of guessing. I try to choose words that feel {appropriate} for the person and the place. And when a small {misunderstanding} pops up — a wrong time, a misread tone — I don't panic. I simply {reassure} the other person that we're fine, and we move on.",
          "bonusEnding": "Real conversation was never meant to be perfect. People pause, misread, and start sentences again — that's normal. You don't have to say the flawless thing; you just have to stay present, clarify when you're lost, and reassure people along the way. Messy and human beats polished and silent.",
          "keeper": "Real conversation is messy — it doesn't wait for the perfect sentence."
        }
      },
      {
        "id": "ep262",
        "ep": "EP262",
        "title": "Stay Positive",
        "current": false,
        "cover": "/covers/story-unlock-ep262.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "composure",
              "color": "#f6479a"
            },
            {
              "word": "magnify",
              "color": "#8b6cff"
            },
            {
              "word": "deflated",
              "color": "#ff8a63"
            },
            {
              "word": "contentment",
              "color": "#1fc4b6"
            },
            {
              "word": "adaptability",
              "color": "#1ca8a2"
            },
            {
              "word": "acknowledge",
              "color": "#57e6c4"
            }
          ],
          "story": "Some mornings, everything feels heavy before the day even begins. I used to let one bad email {magnify} into a ruined day. Now I try something gentler. First, I take a breath and hold onto my {composure}. When a setback leaves me {deflated}, I don't pretend to be thrilled — I simply {acknowledge} the feeling and let it pass. Then I look for a small piece of {contentment}: a warm drink, a quiet window, an ordinary moment. And when my plan falls apart, a little {adaptability} helps me find another way forward.",
          "bonusEnding": "Staying positive was never about forcing a smile or pretending everything is fine. It's about meeting an imperfect day honestly — noticing what you feel, then choosing one small step toward calmer, clearer, or kinder. You don't have to feel great; you just have to keep moving, gently.",
          "keeper": "Staying positive means meeting an imperfect day without deciding everything's terrible."
        }
      },
      {
        "id": "ep251",
        "ep": "EP251",
        "title": "Purpose",
        "current": false,
        "cover": "/covers/story-unlock-ep251.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "direction",
              "color": "#f6479a"
            },
            {
              "word": "meaningful",
              "color": "#8b6cff"
            },
            {
              "word": "stagnant",
              "color": "#ff8a63"
            },
            {
              "word": "alignment",
              "color": "#1fc4b6"
            },
            {
              "word": "fulfilling",
              "color": "#1ca8a2"
            },
            {
              "word": "calling",
              "color": "#57e6c4"
            }
          ],
          "story": "For years I thought I needed one perfect purpose, and the pressure left me frozen. Then a mentor offered a gentler idea: choose a {direction}, not a final answer. So I started doing small things that felt {meaningful}, and noticing when my routine turned {stagnant}. Slowly, I moved my work into {alignment} with what I actually value. The days became more {fulfilling}, and although I still don't have it all figured out, this path is beginning to feel like a quiet {calling}.",
          "bonusEnding": "You don't have to find your purpose in one dramatic moment. Pick a direction that feels a little more meaningful than yesterday, keep your life in alignment with your values, and let it grow. Purpose is rarely a lightning bolt — more often, it's a path you notice only after you've walked it a while.",
          "keeper": "Purpose isn't one perfect answer — it's a direction that grows with you."
        }
      },
      {
        "id": "ep250",
        "ep": "EP250",
        "title": "Online Reviews",
        "current": false,
        "cover": "/covers/story-unlock-ep250.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "skeptical",
              "color": "#f6479a"
            },
            {
              "word": "incentivized",
              "color": "#8b6cff"
            },
            {
              "word": "credibility",
              "color": "#ff8a63"
            },
            {
              "word": "biased",
              "color": "#1fc4b6"
            },
            {
              "word": "authentic",
              "color": "#1ca8a2"
            },
            {
              "word": "manipulate",
              "color": "#57e6c4"
            }
          ],
          "story": "I used to believe every five-star rating, until I got burned by a product that didn't match its glowing page. Now I'm more {skeptical}. I've learned that many reviews are {incentivized} — written for a discount or a free sample — which quietly lowers a seller's {credibility}. When the comments all sound the same, they feel {biased}. So I hunt for {authentic} voices: messy photos, honest complaints, ordinary language. Because these days, whole review farms can {manipulate} not just one rating, but the entire pattern.",
          "bonusEnding": "None of this means reviews are useless. It means reading them with open eyes — noticing patterns, ignoring the extremes, and trusting real voices over perfect ones. A little healthy skepticism keeps you from being fooled, without turning you into a cynic.",
          "keeper": "Trust the pattern, not a single five-star review."
        }
      },
      {
        "id": "ep249",
        "ep": "EP249",
        "title": "Confidence",
        "current": false,
        "cover": "/covers/story-unlock-ep249.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "clarity",
              "color": "#f6479a"
            },
            {
              "word": "composed",
              "color": "#8b6cff"
            },
            {
              "word": "clarify",
              "color": "#ff8a63"
            },
            {
              "word": "hesitate",
              "color": "#1fc4b6"
            },
            {
              "word": "recover",
              "color": "#1ca8a2"
            },
            {
              "word": "self-doubt",
              "color": "#57e6c4"
            }
          ],
          "story": "I used to dread speaking in meetings. The moment eyes turned to me, {self-doubt} took over and I would {hesitate}, hoping someone else would talk. Then a mentor reframed it. Confidence, she said, isn't speed — it's {clarity}. When I don't understand, I {clarify} instead of nodding along. When I lose my thread, I pause and {recover} calmly. And even when my heart races, I can still look {composed} on the outside — which slowly makes me feel it on the inside.",
          "bonusEnding": "You will still feel nervous sometimes — that never fully disappears. But you don't need to speak perfectly or quickly. Aim for clarity, clarify when you're unsure, and recover gently when you slip. That is what real confidence sounds like.",
          "keeper": "Confidence isn't speaking fast — it's speaking clearly."
        }
      },
      {
        "id": "ep248",
        "ep": "EP248",
        "title": "Modern Love",
        "current": false,
        "cover": "/covers/story-unlock-ep248.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "vulnerability",
              "color": "#f6479a"
            },
            {
              "word": "compatibility",
              "color": "#8b6cff"
            },
            {
              "word": "disposable",
              "color": "#ff8a63"
            },
            {
              "word": "reciprocity",
              "color": "#1fc4b6"
            },
            {
              "word": "disillusioned",
              "color": "#1ca8a2"
            },
            {
              "word": "ghosting",
              "color": "#57e6c4"
            }
          ],
          "story": "For a while, I wondered if true love still existed. Dating apps made everything feel fast and {disposable}, and after enough let-downs I grew {disillusioned}. The hardest part was {ghosting} — people vanishing with no explanation. But slowly I learned what actually matters: the courage of {vulnerability}, real {compatibility} beyond a first spark, and {reciprocity}, where two people give and care in equal measure.",
          "bonusEnding": "True love didn't turn out to be a perfect match or a constant spark. It was two people being honest, showing up, and choosing each other again and again — even on the ordinary days.",
          "keeper": "Real love isn't just chemistry — it's honesty and effort, both ways."
        }
      },
      {
        "id": "ep247",
        "ep": "EP247",
        "title": "Calm Nights",
        "current": false,
        "cover": "/covers/story-unlock-ep247.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "racing thoughts",
              "color": "#f6479a"
            },
            {
              "word": "brain dump",
              "color": "#8b6cff"
            },
            {
              "word": "anxiety",
              "color": "#ff8a63"
            },
            {
              "word": "reassuring",
              "color": "#1fc4b6"
            },
            {
              "word": "doom-scrolling",
              "color": "#1ca8a2"
            },
            {
              "word": "wired",
              "color": "#57e6c4"
            }
          ],
          "story": "Most nights, the moment my head hits the pillow, my {racing thoughts} begin — every worry, every task, every awkward memory. For a while, {anxiety} made this even worse, and I would lie there feeling completely {wired}. Then I tried two small things. First, a {brain dump}: I write everything down so my mind doesn't have to hold it. Second, I stopped {doom-scrolling} the news in bed. What helped most, though, was something simple and {reassuring} — learning that almost everyone's mind does this at night.",
          "bonusEnding": "None of this is a cure, and some nights will still be hard. But you don't need a perfect routine. Try one small thing — a brain dump, a screen-free hour, a slow breath — and notice what helps your mind feel safe enough to rest.",
          "keeper": "Calming your mind isn't about perfection — it's about noticing what helps."
        }
      },
      {
        "id": "ep246",
        "ep": "EP246",
        "title": "Speaking",
        "current": false,
        "cover": "/covers/story-unlock-ep246.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "anticipate",
              "color": "#f6479a"
            },
            {
              "word": "self-conscious",
              "color": "#8b6cff"
            },
            {
              "word": "misinterpret",
              "color": "#ff8a63"
            },
            {
              "word": "stumble over words",
              "color": "#1fc4b6"
            },
            {
              "word": "chunk",
              "color": "#1ca8a2"
            },
            {
              "word": "repair phrase",
              "color": "#57e6c4"
            }
          ],
          "story": "For a long time, speaking English scared me. Before every conversation, I would {anticipate} disaster and feel painfully {self-conscious} about my accent. If a listener paused, I would {misinterpret} it as judgement. And when I did {stumble over words}, I wanted to disappear. Then a teacher gave me two gifts: speak in one small {chunk} at a time, and keep a {repair phrase} ready for when a word slips away. Suddenly, speaking felt lighter — not perfect, but possible.",
          "bonusEnding": "You will still have nervous days — everyone does. But you don't need flawless grammar or a perfect accent to be understood. Break it into chunks, keep a repair phrase close, and remember that the goal was never to sound perfect. It was to stay in the conversation.",
          "keeper": "It's not about sounding perfect. It's about staying in the conversation."
        }
      },
      {
        "id": "ep243",
        "ep": "EP243",
        "title": "Change",
        "current": false,
        "cover": "/covers/story-unlock-ep243.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "willpower",
              "color": "#f6479a"
            },
            {
              "word": "strategy",
              "color": "#8b6cff"
            },
            {
              "word": "barrier",
              "color": "#ff8a63"
            },
            {
              "word": "impulsivity",
              "color": "#1fc4b6"
            },
            {
              "word": "procrastination",
              "color": "#1ca8a2"
            },
            {
              "word": "accountability",
              "color": "#57e6c4"
            }
          ],
          "story": "For years I thought changing my life needed huge {willpower} — one perfect Sunday-night plan. It never lasted. What finally worked was a small {strategy}: ten quiet minutes a day. When fear became a {barrier}, I started alone and kept it tiny. I learned to notice my {impulsivity} instead of fighting it, and to beat {procrastination} with one clear first step. And when I told a friend my plan, that {accountability} kept me going on the days I wanted to quit.",
          "bonusEnding": "Change was never one big moment. It was many small designs, repeated on ordinary days. You don't need to become a new person overnight — just take the next small step, and let “better” be enough for today.",
          "keeper": "Change isn't one big moment — it's many small designs."
        }
      },
      {
        "id": "ep242",
        "ep": "EP242",
        "title": "Climate",
        "current": false,
        "cover": "/covers/story-unlock-ep242.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "sustainable",
              "color": "#f6479a"
            },
            {
              "word": "eco-friendly",
              "color": "#8b6cff"
            },
            {
              "word": "carbon footprint",
              "color": "#ff8a63"
            },
            {
              "word": "environmental impact",
              "color": "#1fc4b6"
            },
            {
              "word": "overconsumption",
              "color": "#1ca8a2"
            },
            {
              "word": "biodiversity",
              "color": "#57e6c4"
            }
          ],
          "story": "I used to feel guilty about climate change, until I learned to keep it calm and practical. Now I try to live in a more {sustainable} way — small habits I can actually keep. I look for {eco-friendly} choices when they're realistic, and I think about my {carbon footprint} before I travel or buy something new. Understanding my {environmental impact} helped more than guilt ever did. I try to avoid {overconsumption} by using what I already have, and I've started to care about the {biodiversity} that quietly keeps our world alive.",
          "bonusEnding": "None of this has to be perfect. A reusable bottle forgotten on the counter doesn't make you a bad person. Guilt can make you notice; shame just makes you give up. Understand your impact, make the wiser choice where you can, and let “better” be enough for today.",
          "keeper": "Understand your impact, and make wiser choices where you can."
        }
      },
      {
        "id": "ep239",
        "ep": "EP239",
        "title": "Workday",
        "current": false,
        "cover": "/covers/story-unlock-ep239.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "workload",
              "color": "#f6479a"
            },
            {
              "word": "deadline",
              "color": "#8b6cff"
            },
            {
              "word": "colleague",
              "color": "#ff8a63"
            },
            {
              "word": "productive",
              "color": "#1fc4b6"
            },
            {
              "word": "distracted",
              "color": "#1ca8a2"
            },
            {
              "word": "wrap up",
              "color": "#57e6c4"
            }
          ],
          "story": "My morning started calm, but by noon my {workload} had grown into a long list. With a {deadline} getting closer, I could feel the pressure building. Luckily, a {colleague} noticed I was struggling and helped me find a missing file. After that I felt {productive} and finished the report I had been avoiding. The afternoon was harder — I kept getting {distracted} by messages and my own thoughts — but I still managed to {wrap up} the most important task before I went home.",
          "bonusEnding": "When someone asks how work was, you don't need a perfect answer. You can say it was busy but you managed, or that you felt distracted yet still finished what mattered. A workday is only part of your day — do your best with the energy you have, then let the rest wait until tomorrow.",
          "keeper": "Don't confuse activity with progress."
        }
      },
      {
        "id": "ep238",
        "ep": "EP238",
        "title": "Exercise",
        "current": false,
        "cover": "/covers/story-unlock-ep238.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "sedentary",
              "color": "#f6479a"
            },
            {
              "word": "endurance",
              "color": "#8b6cff"
            },
            {
              "word": "exertion",
              "color": "#ff8a63"
            },
            {
              "word": "mobility",
              "color": "#1fc4b6"
            },
            {
              "word": "plateau",
              "color": "#1ca8a2"
            },
            {
              "word": "overdo",
              "color": "#57e6c4"
            }
          ],
          "story": "For years I had a {sedentary} routine — desk, car, sofa, repeat. So I started small, and a ten-minute walk slowly built my {endurance}. A little {exertion} each day felt good, and gentle stretching gave me back some {mobility} I thought I had lost. Progress wasn't always fast; some weeks I hit a {plateau} and saw almost no change. But I learned not to {overdo} it — a normal walk still counts, and showing up gently is what keeps me going.",
          "bonusEnding": "Movement was never meant to be punishment. Some days you walk far; some days you just stretch for five minutes — and both count. The goal isn't a perfect body. It's a habit your body can trust, built from many small promises kept.",
          "keeper": "The best exercise isn't the perfect one — it's the one you'll actually repeat."
        }
      },
      {
        "id": "ep235",
        "ep": "EP235",
        "title": "Family",
        "current": false,
        "cover": "/covers/story-unlock-ep235.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "belonging",
              "color": "#8b6cff"
            },
            {
              "word": "upbringing",
              "color": "#f6479a"
            },
            {
              "word": "obligation",
              "color": "#1fc4b6"
            },
            {
              "word": "generational gap",
              "color": "#ff8a63"
            },
            {
              "word": "make amends",
              "color": "#ffcd46"
            }
          ],
          "story": "My {upbringing} taught me respect and quiet care. Even now, my family gives me a sense of {belonging} that I can't find anywhere else. We don't always agree — there's a real {generational gap} between my parents and me — and sometimes family {obligation} feels heavy, even when it comes from love. But I've learned that after an argument, it's better to {make amends} than to hold on to the silence.",
          "bonusEnding": "Family was never meant to be simple. It can be warm and complicated in the same breath. But when you choose to come back gently — with one honest message — you remind someone that they still matter to you.",
          "keeper": "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        "id": "ep234",
        "ep": "EP234",
        "title": "Morning Routine",
        "current": false,
        "cover": "/covers/story-unlock-ep234.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "ritual",
              "color": "#8b6cff"
            },
            {
              "word": "scattered",
              "color": "#f6479a"
            },
            {
              "word": "anchor",
              "color": "#1ca8a2"
            },
            {
              "word": "foundation",
              "color": "#ff8a63"
            },
            {
              "word": "cultivate",
              "color": "#1fc4b6"
            },
            {
              "word": "rewire",
              "color": "#57e6c4"
            }
          ],
          "story": "I used to feel {scattered} every morning, with no real plan. Then I built one small {ritual} — a few quiet minutes with English — and it gave my day a better {foundation}. Slowly, I began to {cultivate} discipline without forcing it. Now that habit is my {anchor} when life gets busy, and little by little it continues to {rewire} the way I learn.",
          "bonusEnding": "Some mornings still feel messy, and that's okay. Discipline was never about being perfect — it was about coming back. One small sentence, one calm minute, and the day begins again.",
          "keeper": "Real discipline isn't never falling — it's learning how to come back."
        }
      },
      {
        "id": "ep232",
        "ep": "EP232",
        "title": "Manage Your Time",
        "current": false,
        "cover": "/covers/story-unlock-ep232.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "make the most of",
              "color": "#ff8a63"
            },
            {
              "word": "put off",
              "color": "#8b6cff"
            },
            {
              "word": "carve out time",
              "color": "#1ca8a2"
            },
            {
              "word": "slip away",
              "color": "#f6479a"
            },
            {
              "word": "stay on track",
              "color": "#1fc4b6"
            },
            {
              "word": "get carried away",
              "color": "#57e6c4"
            }
          ],
          "story": "Maya wanted to {make the most of} her Saturday morning. She decided not to {put off} her plans this time. First, she would {carve out time} for a quiet walk before the day could {slip away}. A short list on the table helped her {stay on track}. It was still easy to {get carried away}, but today, for once, she felt in control.",
          "bonusEnding": "That evening, Maya looked at her finished list and smiled. For the first time in weeks, the morning had not slipped away from her — she had owned it. She made herself a small promise: next Saturday, the phone could wait a little longer.",
          "keeper": "Time management is about choosing better, not doing more."
        }
      },
      {
        "id": "ep231",
        "ep": "EP231",
        "title": "Maya's Tuesday",
        "current": false,
        "cover": "/covers/story-unlock-ep231.png",
        "content": {
          "intro": "Fill each gap with the right phrase to unlock the story.",
          "phrases": [
            {
              "word": "eventful",
              "color": "#f6479a"
            },
            {
              "word": "ran into",
              "color": "#8b6cff"
            },
            {
              "word": "turned out",
              "color": "#ff8a63"
            },
            {
              "word": "managed to",
              "color": "#1fc4b6"
            },
            {
              "word": "worthwhile",
              "color": "#ffcd46"
            },
            {
              "word": "look back on",
              "color": "#57e6c4"
            }
          ],
          "story": "Tuesday turned more {eventful} than Maya expected. On the way to work, she {ran into} an old friend she had not seen for years. Their quick chat {turned out} to be the best part of her day. Even though she was busy, she {managed to} finish all her tasks on time. It was a tiring but {worthwhile} day — the kind she would {look back on} with a smile.",
          "bonusEnding": "Late that night, Maya wrote a few lines in her journal. Some days feel ordinary while you live them, she wrote, and only later do you notice how much they held. She closed the book slowly, already a little curious about what Wednesday might bring.",
          "keeper": "Yesterday is a story only you can tell."
        }
      }
    ]
  },
  {
    "type": "sentence-builder",
    "name": "Sentence Builder",
    "access": "fluency",
    "icon": "🔤",
    "accent": "#1fc4b6",
    "tagline": "Tap the words into the right order to build the sentence — then hear it.",
    "walkthrough": "/assets/walkthroughs/sentence-builder-walkthrough.mp4",
    "episodes": [
      {
        "id": "ep267",
        "ep": "EP267",
        "title": "Overthinking",
        "current": true,
        "cover": "/covers/sentence-builder-ep267.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I try not to second-guess every word.",
              "phrase": "second-guess",
              "color": "#f6479a"
            },
            {
              "text": "I feel self-conscious when I speak in meetings.",
              "phrase": "self-conscious",
              "color": "#8b6cff"
            },
            {
              "text": "I want to be articulate, not perfect.",
              "phrase": "articulate",
              "color": "#ff8a63"
            },
            {
              "text": "A real conversation is spontaneous and relaxed.",
              "phrase": "spontaneous",
              "color": "#1fc4b6"
            },
            {
              "text": "With practice, speaking becomes instinctive.",
              "phrase": "instinctive",
              "color": "#1ca8a2"
            },
            {
              "text": "I kept my composure and finished the sentence.",
              "phrase": "composure",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Fluency isn't never getting stuck — it's staying in the conversation anyway."
        }
      },
      {
        "id": "ep263",
        "ep": "EP263",
        "title": "Awkward Talks",
        "current": false,
        "cover": "/covers/sentence-builder-ep263.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "There was an awkward silence at dinner.",
              "phrase": "awkward",
              "color": "#f6479a"
            },
            {
              "text": "Could you clarify what you mean by later?",
              "phrase": "clarify",
              "color": "#8b6cff"
            },
            {
              "text": "I try not to hesitate before I answer.",
              "phrase": "hesitate",
              "color": "#ff8a63"
            },
            {
              "text": "That joke isn't appropriate for work.",
              "phrase": "appropriate",
              "color": "#1fc4b6"
            },
            {
              "text": "There was a misunderstanding about the time.",
              "phrase": "misunderstanding",
              "color": "#1ca8a2"
            },
            {
              "text": "I just want to reassure you that it’s fine.",
              "phrase": "reassure",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real conversation is messy — it doesn't wait for the perfect sentence."
        }
      },
      {
        "id": "ep262",
        "ep": "EP262",
        "title": "Stay Positive",
        "current": false,
        "cover": "/covers/sentence-builder-ep262.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I took a slow breath and regained my composure.",
              "phrase": "composure",
              "color": "#f6479a"
            },
            {
              "text": "When I'm tired, I magnify small problems.",
              "phrase": "magnify",
              "color": "#8b6cff"
            },
            {
              "text": "I felt completely deflated after the rejection.",
              "phrase": "deflated",
              "color": "#ff8a63"
            },
            {
              "text": "I found contentment in a simple daily routine.",
              "phrase": "contentment",
              "color": "#1fc4b6"
            },
            {
              "text": "Adaptability helped me reach my goal.",
              "phrase": "adaptability",
              "color": "#1ca8a2"
            },
            {
              "text": "I acknowledge how I feel without hiding it.",
              "phrase": "acknowledge",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Staying positive means meeting an imperfect day without deciding everything's terrible."
        }
      },
      {
        "id": "ep251",
        "ep": "EP251",
        "title": "Purpose",
        "current": false,
        "cover": "/covers/sentence-builder-ep251.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I don't need a final goal, just a direction.",
              "phrase": "direction",
              "color": "#f6479a"
            },
            {
              "text": "I want work that feels meaningful.",
              "phrase": "meaningful",
              "color": "#8b6cff"
            },
            {
              "text": "My routine felt stagnant, so I changed it.",
              "phrase": "stagnant",
              "color": "#ff8a63"
            },
            {
              "text": "My job and values are finally in alignment.",
              "phrase": "alignment",
              "color": "#1fc4b6"
            },
            {
              "text": "Helping others is deeply fulfilling.",
              "phrase": "fulfilling",
              "color": "#1ca8a2"
            },
            {
              "text": "Teaching felt like her true calling.",
              "phrase": "calling",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Purpose isn't one perfect answer — it's a direction that grows with you."
        }
      },
      {
        "id": "ep250",
        "ep": "EP250",
        "title": "Online Reviews",
        "current": false,
        "cover": "/covers/sentence-builder-ep250.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I’m skeptical of reviews that sound too perfect.",
              "phrase": "skeptical",
              "color": "#f6479a"
            },
            {
              "text": "Some shops leave incentivized reviews for a discount.",
              "phrase": "incentivized",
              "color": "#8b6cff"
            },
            {
              "text": "Fake reviews damage a brand's credibility.",
              "phrase": "credibility",
              "color": "#ff8a63"
            },
            {
              "text": "A paid review is usually biased.",
              "phrase": "biased",
              "color": "#1fc4b6"
            },
            {
              "text": "I trust authentic reviews with real photos.",
              "phrase": "authentic",
              "color": "#1ca8a2"
            },
            {
              "text": "Review farms can manipulate a product's rating.",
              "phrase": "manipulate",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Trust the pattern, not a single five-star review."
        }
      },
      {
        "id": "ep249",
        "ep": "EP249",
        "title": "Confidence",
        "current": false,
        "cover": "/covers/sentence-builder-ep249.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I try to speak with clarity, not speed.",
              "phrase": "clarity",
              "color": "#f6479a"
            },
            {
              "text": "She stayed composed during a hard question.",
              "phrase": "composed",
              "color": "#8b6cff"
            },
            {
              "text": "Just to clarify, do you mean Friday?",
              "phrase": "clarify",
              "color": "#ff8a63"
            },
            {
              "text": "Don’t hesitate to ask your question.",
              "phrase": "hesitate",
              "color": "#1fc4b6"
            },
            {
              "text": "I lost my word but chose to recover quickly.",
              "phrase": "recover",
              "color": "#1ca8a2"
            },
            {
              "text": "Self-doubt kept me quiet in meetings.",
              "phrase": "self-doubt",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Confidence isn't speaking fast — it's speaking clearly."
        }
      },
      {
        "id": "ep248",
        "ep": "EP248",
        "title": "Modern Love",
        "current": false,
        "cover": "/covers/sentence-builder-ep248.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "Real closeness begins with a little vulnerability.",
              "phrase": "vulnerability",
              "color": "#f6479a"
            },
            {
              "text": "We have chemistry, but I question our compatibility.",
              "phrase": "compatibility",
              "color": "#8b6cff"
            },
            {
              "text": "Modern dating can make people feel disposable.",
              "phrase": "disposable",
              "color": "#ff8a63"
            },
            {
              "text": "A healthy relationship needs reciprocity.",
              "phrase": "reciprocity",
              "color": "#1fc4b6"
            },
            {
              "text": "After months of apps, she felt disillusioned.",
              "phrase": "disillusioned",
              "color": "#1ca8a2"
            },
            {
              "text": "He stopped replying, which felt like ghosting.",
              "phrase": "ghosting",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real love isn't just chemistry — it's honesty and effort, both ways."
        }
      },
      {
        "id": "ep247",
        "ep": "EP247",
        "title": "Calm Nights",
        "current": false,
        "cover": "/covers/sentence-builder-ep247.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I couldn't sleep because of my racing thoughts.",
              "phrase": "racing thoughts",
              "color": "#f6479a"
            },
            {
              "text": "I did a brain dump before going to bed.",
              "phrase": "brain dump",
              "color": "#8b6cff"
            },
            {
              "text": "My anxiety gets worse when I try to sleep.",
              "phrase": "anxiety",
              "color": "#ff8a63"
            },
            {
              "text": "It was reassuring to hear I'm not alone.",
              "phrase": "reassuring",
              "color": "#1fc4b6"
            },
            {
              "text": "I stayed up too late doom-scrolling in bed.",
              "phrase": "doom-scrolling",
              "color": "#1ca8a2"
            },
            {
              "text": "I was exhausted, but I still felt wired.",
              "phrase": "wired",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Calming your mind isn't about perfection — it's about noticing what helps."
        }
      },
      {
        "id": "ep246",
        "ep": "EP246",
        "title": "Speaking",
        "current": false,
        "cover": "/covers/sentence-builder-ep246.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I try not to anticipate failure before I speak.",
              "phrase": "anticipate",
              "color": "#f6479a"
            },
            {
              "text": "I feel self-conscious when I speak in meetings.",
              "phrase": "self-conscious",
              "color": "#8b6cff"
            },
            {
              "text": "I often misinterpret his silence as anger.",
              "phrase": "misinterpret",
              "color": "#ff8a63"
            },
            {
              "text": "I sometimes stumble over words when I'm nervous.",
              "phrase": "stumble over words",
              "color": "#1fc4b6"
            },
            {
              "text": "I can speak in one small chunk at a time.",
              "phrase": "chunk",
              "color": "#1ca8a2"
            },
            {
              "text": "I use a repair phrase to keep talking.",
              "phrase": "repair phrase",
              "color": "#57e6c4"
            }
          ],
          "keeper": "It's not about sounding perfect. It's about staying in the conversation."
        }
      },
      {
        "id": "ep243",
        "ep": "EP243",
        "title": "Change",
        "current": false,
        "cover": "/covers/sentence-builder-ep243.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "My willpower is weak around chocolate cake.",
              "phrase": "willpower",
              "color": "#f6479a"
            },
            {
              "text": "My strategy is to start with ten minutes a day.",
              "phrase": "strategy",
              "color": "#8b6cff"
            },
            {
              "text": "Fear is my biggest barrier when I speak.",
              "phrase": "barrier",
              "color": "#ff8a63"
            },
            {
              "text": "I'm trying to control my impulsivity when I shop.",
              "phrase": "impulsivity",
              "color": "#1fc4b6"
            },
            {
              "text": "Procrastination is stopping me from improving.",
              "phrase": "procrastination",
              "color": "#1ca8a2"
            },
            {
              "text": "The group gives me real accountability.",
              "phrase": "accountability",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Change isn't one big moment — it's many small designs."
        }
      },
      {
        "id": "ep242",
        "ep": "EP242",
        "title": "Climate",
        "current": false,
        "cover": "/covers/sentence-builder-ep242.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "I'm trying to build a more sustainable routine.",
              "phrase": "sustainable",
              "color": "#f6479a"
            },
            {
              "text": "This shop uses eco-friendly packaging.",
              "phrase": "eco-friendly",
              "color": "#8b6cff"
            },
            {
              "text": "I'm trying to reduce my carbon footprint.",
              "phrase": "carbon footprint",
              "color": "#ff8a63"
            },
            {
              "text": "Fast fashion can have a real environmental impact.",
              "phrase": "environmental impact",
              "color": "#1fc4b6"
            },
            {
              "text": "Overconsumption creates a lot of unnecessary waste.",
              "phrase": "overconsumption",
              "color": "#1ca8a2"
            },
            {
              "text": "This forest has rich biodiversity.",
              "phrase": "biodiversity",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Understand your impact, and make wiser choices where you can."
        }
      },
      {
        "id": "ep239",
        "ep": "EP239",
        "title": "Workday",
        "current": false,
        "cover": "/covers/sentence-builder-ep239.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "By lunchtime my workload felt much heavier.",
              "phrase": "workload",
              "color": "#f6479a"
            },
            {
              "text": "The deadline is coming up this Friday.",
              "phrase": "deadline",
              "color": "#8b6cff"
            },
            {
              "text": "My colleague helped me find the file.",
              "phrase": "colleague",
              "color": "#ff8a63"
            },
            {
              "text": "I had a productive morning and finished early.",
              "phrase": "productive",
              "color": "#1fc4b6"
            },
            {
              "text": "I felt distracted by my phone all afternoon.",
              "phrase": "distracted",
              "color": "#1ca8a2"
            },
            {
              "text": "Let's wrap up the meeting for today.",
              "phrase": "wrap up",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Don't confuse activity with progress."
        }
      },
      {
        "id": "ep238",
        "ep": "EP238",
        "title": "Exercise",
        "current": false,
        "cover": "/covers/sentence-builder-ep238.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "My lifestyle has become a bit too sedentary.",
              "phrase": "sedentary",
              "color": "#f6479a"
            },
            {
              "text": "Walking every day helped me build endurance.",
              "phrase": "endurance",
              "color": "#8b6cff"
            },
            {
              "text": "I felt a lot of exertion after the climb.",
              "phrase": "exertion",
              "color": "#ff8a63"
            },
            {
              "text": "Daily stretching really improves my mobility.",
              "phrase": "mobility",
              "color": "#1fc4b6"
            },
            {
              "text": "After weeks of training, I hit a plateau.",
              "phrase": "plateau",
              "color": "#1ca8a2"
            },
            {
              "text": "Don't overdo it on your first day back.",
              "phrase": "overdo",
              "color": "#57e6c4"
            }
          ],
          "keeper": "The best exercise isn't the perfect one — it's the one you'll actually repeat."
        }
      },
      {
        "id": "ep235",
        "ep": "EP235",
        "title": "Family",
        "current": false,
        "cover": "/covers/sentence-builder-ep235.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "My upbringing shaped the person I am today.",
              "phrase": "upbringing",
              "color": "#f6479a"
            },
            {
              "text": "My family gives me a sense of belonging.",
              "phrase": "belonging",
              "color": "#8b6cff"
            },
            {
              "text": "Sometimes we disagree because of the generational gap.",
              "phrase": "generational gap",
              "color": "#ff8a63"
            },
            {
              "text": "I feel a strong sense of obligation to my family.",
              "phrase": "obligation",
              "color": "#1fc4b6"
            },
            {
              "text": "I called my brother to make amends.",
              "phrase": "make amends",
              "color": "#ffcd46"
            }
          ],
          "keeper": "In family, it's more important to make amends than to win every argument."
        }
      },
      {
        "id": "ep234",
        "ep": "EP234",
        "title": "Morning Routine",
        "current": false,
        "cover": "/covers/sentence-builder-ep234.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "Before my routine, I felt scattered every morning.",
              "phrase": "scattered",
              "color": "#f6479a"
            },
            {
              "text": "A cup of tea became my morning ritual.",
              "phrase": "ritual",
              "color": "#8b6cff"
            },
            {
              "text": "A calm start is the foundation of my day.",
              "phrase": "foundation",
              "color": "#ff8a63"
            },
            {
              "text": "You cultivate discipline one small day at a time.",
              "phrase": "cultivate",
              "color": "#1fc4b6"
            },
            {
              "text": "My morning English practice is my anchor.",
              "phrase": "anchor",
              "color": "#1ca8a2"
            },
            {
              "text": "Little by little, you rewire your brain.",
              "phrase": "rewire",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Real discipline isn't never falling — it's learning how to come back."
        }
      },
      {
        "id": "ep232",
        "ep": "EP232",
        "title": "Manage Your Time",
        "current": false,
        "cover": "/covers/sentence-builder-ep232.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "Don't let the whole morning slip away.",
              "phrase": "slip away",
              "color": "#f6479a"
            },
            {
              "text": "Try not to put off the hardest task.",
              "phrase": "put off",
              "color": "#8b6cff"
            },
            {
              "text": "She likes to make the most of small breaks.",
              "phrase": "make the most of",
              "color": "#ff8a63"
            },
            {
              "text": "A short list helps me stay on track.",
              "phrase": "stay on track",
              "color": "#1fc4b6"
            },
            {
              "text": "I carve out time for English every day.",
              "phrase": "carve out time",
              "color": "#1ca8a2"
            },
            {
              "text": "It's easy to get carried away on your phone.",
              "phrase": "get carried away",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Time management is about choosing better, not doing more."
        }
      },
      {
        "id": "ep231",
        "ep": "EP231",
        "title": "Maya's Tuesday",
        "current": false,
        "cover": "/covers/sentence-builder-ep231.png",
        "content": {
          "intro": "Tap the words into the right order to build each sentence. Hear it on every win.",
          "sentences": [
            {
              "text": "It was a really eventful day.",
              "phrase": "eventful",
              "color": "#f6479a"
            },
            {
              "text": "The day turned out better than expected.",
              "phrase": "turned out",
              "color": "#ff8a63"
            },
            {
              "text": "She ran into an old friend on the way home.",
              "phrase": "ran into",
              "color": "#8b6cff"
            },
            {
              "text": "Somehow she managed to finish on time.",
              "phrase": "managed to",
              "color": "#1fc4b6"
            },
            {
              "text": "It was a tiring but worthwhile day.",
              "phrase": "worthwhile",
              "color": "#ffcd46"
            },
            {
              "text": "Now she can look back on it with a smile.",
              "phrase": "look back on",
              "color": "#57e6c4"
            }
          ],
          "keeper": "Yesterday is a story only you can tell."
        }
      }
    ]
  }
];

export function findGame(type, ep) {
  const gt = ARCADE.find((g) => g.type === type);
  const e = gt ? gt.episodes.find((x) => x.id === ep) : null;
  return { gt, e };
}
