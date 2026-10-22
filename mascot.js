// Stardust, a young unicorn who is still learning magic and cheers the player on.
// Her spells go slightly wrong, so the child is the expert and she is the happy helper.
// She praises how the child worked things out, comforts after a mistake, and never nags.

const REACTION_DURATION_MS = 3500;
const COMMENT_CHANCE = 0.5;
const RESTING_MOOD = "happy";

// Events that happen so often that she only comments on some of them
const FREQUENT_EVENTS = ["select", "right", "rotate"];
const GAME_START_EVENTS = ["start", "resume"];
const GAME_OVER_EVENTS = ["won", "finished"];

// The board shows pictures, so no line mentions numbers
const LINES = {
  da: {
    start: [
      "En ny opgave! Jeg holder farverne, du tænker.",
      "Uh, nye billeder! Hvor skal vi starte?",
      "Jeg har pudset mit horn til den her. Klar, når du er!",
      "Lad os finde ud af, hvor hvert billede bor.",
      "Jeg prøvede at trylle den løst. Den blev til suppe. Din tur!",
    ],
    resume: [
      "Nej, hej! Billederne er lige der, hvor du forlod dem.",
      "Tilbage til vores opgave! Jeg passede godt på hvert felt.",
      "Klar til at fortsætte? Jeg nøs kun glimmer på den én gang.",
      "Her er brættet, ligesom før. Hvor skal vi kigge?",
      "Lad os fortsætte, hvor vi slap.",
    ],
    select: [
      "Hmm, den der? Lad os kigge på rækken.",
      "Godt valgt. Hvad mangler der i boksen?",
      "Uh, et mysteriefelt!",
      "Kig ned ad kolonnen. Hvilket billede gemmer sig?",
      "Jeg ville gætte på en kage. Derfor er det dig, der bestemmer.",
      "Lad os se, hvem der bor ved siden af.",
      "Tryk på et billede, når du er sikker.",
    ],
    right: [
      "Ja! Min manke krøllede helt ekstra.",
      "Lige i øjet! Du tjekkede både række og kolonne.",
      "Det billede ser ud til at føle sig hjemme.",
      "Glimmer-godt!",
      "Du kiggede grundigt, og det virkede!",
      "Det trick skriver jeg ned i min tryllebog.",
      "Godt tænkt! Endnu et billede på plads.",
    ],
    sweep: [
      "En hel linje! Nu laver jeg min glade hovdans!",
      "Du fyldte det hele ud. Se, hvor det skinner!",
      "Hvert billede på sin plads. Magi!",
      "Den linje funkler. Du tjekkede hvert eneste felt.",
    ],
    wrong: [
      "Hmm, det billede ser lidt faret vild ud. Skal vi finde et nyt hjem til det?",
      "Hovsa! Selv mine trylleformularer vakler nogle gange.",
      "Ikke helt. Kig efter en tvilling i rækken.",
      "Tæt på! Kig på boksen en gang til.",
      "Sådan lærer man. Prøv et andet billede.",
      "Mit horn siger: kig på kolonnen.",
      "Bare rolig. Fejl er bare øvelse i forklædning.",
    ],
    erase: [
      "Puf! Væk, ligesom mine lektier.",
      "En frisk start til det felt.",
      "God idé at prøve igen.",
    ],
    rotate: [
      "Atju! Jeg nøs glimmer, og så snurrede brættet rundt.",
      "Ups, min tryllestav smuttede. Wiii!",
      "Snurretid! Billederne bliver stående, det lover jeg.",
      "Jeg ville trylle en regnbue. Det blev en snurretur.",
      "Rundt vi går! Rækker er kolonner nu, hvor sjovt.",
    ],
    won: [
      "Du klarede det! Løst, ét billede ad gangen.",
      "Hurra! Jeg slår vejrmøller. Altså, hovmøller.",
      "Wow, du gav ikke op. Det er ægte magi.",
    ],
    finished: ["Hver eneste opgave i hele kongeriget er løst! Det fortæller jeg hele regnbuen."],
  },
  en: {
    start: [
      "A new puzzle! I'll hold the crayons. You do the thinking.",
      "Ooh, fresh pictures! Where shall we start?",
      "I polished my horn for this one. Ready when you are!",
      "Let's find where every picture lives.",
      "I tried to solve this with magic. It turned into soup. Your turn!",
    ],
    resume: [
      "Oh hello! Your pictures are right where you left them.",
      "Back to our puzzle! I kept every square safe.",
      "Ready to carry on? I only sneezed glitter on it once.",
      "Here's the board, just like before. Where shall we look?",
      "Let's pick up where we stopped.",
    ],
    select: [
      "Hmm, that one? Let's look at its row.",
      "Good spot. What's missing in that box?",
      "Ooh, a mystery square!",
      "Peek at the column. Which picture is hiding?",
      "I'd guess a cupcake. That's why you're in charge.",
      "Let's see who lives next door.",
      "Tap a picture when you're sure.",
    ],
    right: [
      "Yes! My mane just went extra curly.",
      "Spot on! You checked the row and the column.",
      "That picture looks right at home.",
      "Sparkle-tastic!",
      "You looked carefully, and it worked!",
      "I'm writing that trick down in my spell book.",
      "Neat thinking! Another one fits.",
    ],
    sweep: [
      "A whole line! Time for my happy hoof-dance!",
      "You filled it all in. Look at it shine!",
      "Every picture in its place. Magic!",
      "That line sparkles. You checked every square.",
    ],
    wrong: [
      "Hmm, that one looks a bit lost. Shall we find it a new home?",
      "Oopsie! Even my spells wobble sometimes.",
      "Not quite. Check the row for a twin.",
      "Close! Peek at the box once more.",
      "That's how we learn. Try another picture.",
      "My horn says: look at the column.",
      "No worries. Mistakes are just practice in disguise.",
    ],
    erase: [
      "Poof! Gone, like my homework.",
      "A fresh start for that square.",
      "Good idea to try again.",
    ],
    rotate: [
      "Achoo! I sneezed glitter and the board did a twirl.",
      "Oops, my wand slipped. Wheee!",
      "Twirl time! The pictures stay standing, I promise.",
      "I meant to make a rainbow. I made a spin instead.",
      "Round we go! Rows are columns now, how fun.",
    ],
    won: [
      "You did it! Solved, one picture at a time.",
      "Hooray! I'm doing a cartwheel. Well, a hoofwheel.",
      "Wow, you didn't give up. That's real magic.",
    ],
    finished: ["Every puzzle in the kingdom, solved! I'll tell the whole rainbow."],
  },
};

// Which face belongs to which event
const MOODS = {
  start: RESTING_MOOD, resume: RESTING_MOOD,
  select: "thinking",
  right: "celebrating", sweep: "celebrating", won: "celebrating", finished: "celebrating",
  wrong: "comforting", erase: "comforting",
  rotate: "oops",
};

const mascotEl = document.getElementById("mascot");
const bubbleEl = document.getElementById("mascot-bubble");
let lastLine = "";
let calmDownTimer = null;
let isGameRunning = false;

// Called from the game with one of the events in MOODS
function stardust(event) {
  trackGameProgress(event);
  if (wantsToComment(event)) react(event);
}

function trackGameProgress(event) {
  if (GAME_START_EVENTS.includes(event)) isGameRunning = true;
  if (GAME_OVER_EVENTS.includes(event)) isGameRunning = false;
}

// A comment on every single tap would drown the game, so frequent moments get one only now and then
function wantsToComment(event) {
  return !FREQUENT_EVENTS.includes(event) || Math.random() < COMMENT_CHANCE;
}

function react(event) {
  clearTimeout(calmDownTimer);
  setMood(MOODS[event]);
  say(pickLine(event));
  // After the level ends she keeps celebrating
  if (isGameRunning) calmDownTimer = setTimeout(calmDown, REACTION_DURATION_MS);
}

function calmDown() {
  setMood(RESTING_MOOD);
  say("");
}

// Picks a different line than last time so she does not repeat herself
function pickLine(event) {
  const lines = LINES[currentLanguage][event];
  const freshLines = lines.filter((line) => line !== lastLine);
  lastLine = freshLines[Math.floor(Math.random() * freshLines.length)] || lines[0];
  return lastLine;
}

// The mood is cleared first so the face animation restarts
function setMood(mood) {
  mascotEl.dataset.mood = "";
  forceReflow(mascotEl);
  mascotEl.dataset.mood = mood;
}

function say(text) {
  bubbleEl.textContent = text;
  restartAnimation(bubbleEl, "pop");
}

// When the language changes or the lesson opens she must not keep talking
function silenceStardust() {
  say("");
}
