// Rainbow Kingdom Sudoku: a calm sudoku with no clock and no game over. Finishing a level earns stars.
// The board grows from 4x4 to 6x6 to 9x9, and from level 3 on it twirls a quarter turn
// after every few correct digits.

const FIRST_LEVEL = 1;
const SAVE_KEY = "rainbow-kingdom";
const PROGRESS_KEY = "rainbow-kingdom-progress";

const LANDS = Object.freeze({
  RAINBOW_MEADOW: "rainbowMeadow",
  CRYSTAL_LAKE: "crystalLake",
  CLOUD_CASTLE: "cloudCastle",
  STARLIGHT_PALACE: "starlightPalace",
});

// One dial changes at a time: the twirl arrives on a level with the same clues as the one before,
// the first level on a bigger board gets plenty of clues and a slow twirl, and the last level
// of a land is a milestone: a faster twirl on the small 4x4 board, a bigger drop in clues on 6x6.
// twirlEvery is the number of correct digits between two twirls; null means the board stays still.
const LEVELS = Object.freeze([
  { land: LANDS.RAINBOW_MEADOW, shape: BOARD_SHAPES.FOUR_BY_FOUR, clues: 12, twirlEvery: null },
  { land: LANDS.RAINBOW_MEADOW, shape: BOARD_SHAPES.FOUR_BY_FOUR, clues: 10, twirlEvery: null },
  { land: LANDS.RAINBOW_MEADOW, shape: BOARD_SHAPES.FOUR_BY_FOUR, clues: 10, twirlEvery: 3 },
  { land: LANDS.RAINBOW_MEADOW, shape: BOARD_SHAPES.FOUR_BY_FOUR, clues: 8, twirlEvery: 3 },
  { land: LANDS.RAINBOW_MEADOW, shape: BOARD_SHAPES.FOUR_BY_FOUR, clues: 7, twirlEvery: 2 },
  { land: LANDS.CRYSTAL_LAKE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 26, twirlEvery: 4 },
  { land: LANDS.CRYSTAL_LAKE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 23, twirlEvery: 4 },
  { land: LANDS.CRYSTAL_LAKE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 21, twirlEvery: 4 },
  { land: LANDS.CRYSTAL_LAKE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 19, twirlEvery: 3 },
  { land: LANDS.CRYSTAL_LAKE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 18, twirlEvery: 3 },
  { land: LANDS.CLOUD_CASTLE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 17, twirlEvery: 3 },
  { land: LANDS.CLOUD_CASTLE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 16, twirlEvery: 3 },
  { land: LANDS.CLOUD_CASTLE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 15, twirlEvery: 3 },
  { land: LANDS.CLOUD_CASTLE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 14, twirlEvery: 3 },
  { land: LANDS.CLOUD_CASTLE, shape: BOARD_SHAPES.SIX_BY_SIX, clues: 12, twirlEvery: 3 },
  { land: LANDS.STARLIGHT_PALACE, shape: BOARD_SHAPES.NINE_BY_NINE, clues: 46, twirlEvery: 6 },
  { land: LANDS.STARLIGHT_PALACE, shape: BOARD_SHAPES.NINE_BY_NINE, clues: 42, twirlEvery: 6 },
  { land: LANDS.STARLIGHT_PALACE, shape: BOARD_SHAPES.NINE_BY_NINE, clues: 38, twirlEvery: 5 },
  { land: LANDS.STARLIGHT_PALACE, shape: BOARD_SHAPES.NINE_BY_NINE, clues: 34, twirlEvery: 5 },
  { land: LANDS.STARLIGHT_PALACE, shape: BOARD_SHAPES.NINE_BY_NINE, clues: 30, twirlEvery: 4 },
]);
const LEVEL_COUNT = LEVELS.length;

const STATUS = Object.freeze({ PLAYING: "playing", WON: "won", FINISHED: "finished" });
const ERASE_KEYS = ["Backspace", "Delete", "0"];

function levelSettings(level) {
  return LEVELS[level - FIRST_LEVEL];
}

function currentShape() {
  return levelSettings(state.level).shape;
}

// ---------- Game state ----------

// { level, puzzle, solution, board, oopsies, wandsUsed, twirls, status }. Saved as JSON, so the keys must not be renamed.
// wandsUsed is reserved for the magic wand hint and stays 0 until it exists.
// twirls is how many quarter turns the board has made on this level.
let state = null;
let selectedCellIndex = null;

function saveGame() {
  writeStorage(SAVE_KEY, JSON.stringify(state));
}

function loadSavedGame() {
  const saved = withMissingTwirlsCounted(parseStoredJson(SAVE_KEY));
  return isValidSave(saved) ? saved : null;
}

function parseStoredJson(key) {
  try {
    return JSON.parse(readStorage(key));
  } catch {
    return null;
  }
}

// Saves from before the twirl have no twirls, and their board never turned
function withMissingTwirlsCounted(saved) {
  return saved && saved.twirls === undefined ? { ...saved, twirls: 0 } : saved;
}

function isValidSave(saved) {
  if (!saved || !isLevel(saved.level)) return false;
  const cellCount = cellCountOf(levelSettings(saved.level).shape);
  return [saved.puzzle, saved.solution, saved.board].every((board) => isBoardOfSize(board, cellCount)) &&
    isCount(saved.oopsies) &&
    isCount(saved.wandsUsed) &&
    isCount(saved.twirls) &&
    Object.values(STATUS).includes(saved.status);
}

function isLevel(value) {
  return Number.isInteger(value) && value >= FIRST_LEVEL && value <= LEVEL_COUNT;
}

function isBoardOfSize(board, cellCount) {
  return Array.isArray(board) && board.length === cellCount;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function startLevel(level) {
  const { shape, clues } = levelSettings(level);
  const puzzle = makePuzzle(shape, clues);
  const solution = solvePuzzle(shape, puzzle);
  state = { level, puzzle, solution, board: [...puzzle], oopsies: 0, wandsUsed: 0, twirls: 0, status: STATUS.PLAYING };
  selectedCellIndex = null;
  saveGame();
  showLevel();
  stardust("start");
}

function resumeOrStartGame() {
  const saved = loadSavedGame();
  if (!saved) {
    startLevel(FIRST_LEVEL);
    return;
  }
  state = saved;
  showLevel();
  // The same board as before, so she welcomes the child back instead of announcing a new puzzle
  stardust(state.status === STATUS.PLAYING ? "resume" : state.status);
}

// A new level may have a different board size, so the cells and number buttons are built for it
function showLevel() {
  createCellsOnBoard();
  createNumpadButtons();
  refreshGameWithoutAnimation();
}

function selectCell(cellIndex) {
  if (state.status !== STATUS.PLAYING) return;
  selectedCellIndex = cellIndex;
  renderBoard();
  if (state.puzzle[cellIndex] === EMPTY) stardust("select");
}

function enterDigit(digit) {
  if (!canEditSelectedCell() || state.board[selectedCellIndex] === digit) return;
  state.board[selectedCellIndex] = digit;
  if (isOops(digit)) countOops();
  if (isSolved(currentShape(), state.board)) finishLevel();
  const twirled = isTwirlDue();
  if (twirled) state.twirls++;
  saveGame();
  refreshGame();
  const sweptUnits = unitsSweptAt(selectedCellIndex);
  if (sweptUnits.length > 0) celebrateSweep(sweptUnits);
  if (twirled) playTwirl();
  stardust(stardustReactionTo(digit, { swept: sweptUnits.length > 0, twirled }));
}

// The picture wobbles so the child notices, without a red error mark
function countOops() {
  state.oopsies++;
  restartAnimation(cells[selectedCellIndex], "wobble");
}

function isOops(digit) {
  return digit !== EMPTY && digit !== state.solution[selectedCellIndex];
}

function finishLevel() {
  state.status = state.level === LEVEL_COUNT ? STATUS.FINISHED : STATUS.WON;
  keepBestStars(state.level, starsEarnedWith(state.oopsies));
}

// Solving the whole level has its own celebration, so a sweep only counts mid-level
function unitsSweptAt(cellIndex) {
  if (state.status !== STATUS.PLAYING) return [];
  return completedUnitsThrough(currentShape(), state.board, state.solution, cellIndex);
}

function canEditSelectedCell() {
  return state.status === STATUS.PLAYING && selectedCellIndex !== null && state.puzzle[selectedCellIndex] === EMPTY;
}

// The biggest moment wins: the level ending, then a sweep, then a twirl, then the digit itself
function stardustReactionTo(digit, { swept, twirled }) {
  if (state.status !== STATUS.PLAYING) return state.status;
  if (swept) return "sweep";
  if (twirled) return "rotate";
  if (digit === EMPTY) return "erase";
  return isOops(digit) ? "wrong" : "right";
}

// ---------- Twirl: a quarter turn after every few correct digits ----------

// Counted from the board rather than from entries, so erasing and re-entering a digit cannot farm twirls
function correctDigitsPlaced() {
  return state.board.filter((digit, cellIndex) => state.puzzle[cellIndex] === EMPTY && digit === state.solution[cellIndex]).length;
}

// How many correct digits the next twirl needs, or null on a level that does not twirl
function correctDigitsForNextTwirl() {
  const { twirlEvery } = levelSettings(state.level);
  return twirlEvery === null ? null : (state.twirls + 1) * twirlEvery;
}

function isTwirlDue() {
  const needed = correctDigitsForNextTwirl();
  return state.status === STATUS.PLAYING && needed !== null && correctDigitsPlaced() >= needed;
}

// One more correct digit and the board turns, so it glows as a warning
function isTwirlNext() {
  const needed = correctDigitsForNextTwirl();
  return state.status === STATUS.PLAYING && needed !== null && correctDigitsPlaced() === needed - 1;
}

// With reduced motion the board does not spin but fades into its new position
function playTwirl() {
  restartAnimation(boardEl, "twirled");
}

// ---------- Stars ----------

// Stars are earned in this order, so a level with n stars has the first n of them
const CAREFUL_OOPSIES_LIMIT = 2;
const STARS = [
  { spriteId: "award-finished", labelKey: "starFinished", isEarnedWith: () => true },
  { spriteId: "award-careful", labelKey: "starCareful", isEarnedWith: (oopsies) => oopsies <= CAREFUL_OOPSIES_LIMIT },
];

// { starsByLevel: { [level]: stars }, lessonDone }, kept separate from the game so starting a new puzzle never touches it.
// lessonDone is null for progress saved before the lesson existed, until the start-up decides it.
let progress = loadProgress();

function loadProgress() {
  const saved = parseStoredJson(PROGRESS_KEY);
  return {
    starsByLevel: validStarsByLevel(saved?.starsByLevel),
    lessonDone: typeof saved?.lessonDone === "boolean" ? saved.lessonDone : null,
  };
}

// Drops only the entries that make no sense, so one bad value does not cost the child every star
function validStarsByLevel(starsByLevel) {
  if (typeof starsByLevel !== "object" || starsByLevel === null) return {};
  return Object.fromEntries(Object.entries(starsByLevel).filter(([level, stars]) => isLevel(Number(level)) && isStarCount(stars)));
}

function isStarCount(value) {
  return Number.isInteger(value) && value >= 1 && value <= STARS.length;
}

function starsEarnedWith(oopsies) {
  return STARS.filter((star) => star.isEarnedWith(oopsies)).length;
}

function bestStarsFor(level) {
  return progress.starsByLevel[level] ?? 0;
}

// Replaying a level can add stars but never take them away
function keepBestStars(level, stars) {
  progress.starsByLevel[level] = Math.max(bestStarsFor(level), stars);
  saveProgress();
}

function saveProgress() {
  writeStorage(PROGRESS_KEY, JSON.stringify(progress));
}

// ---------- First lesson ----------

// Only a first visit gets the lesson. Older players have stars or a game in progress, so they skip it;
// the answer is saved at once, so a reload in the middle of the lesson shows it again.
function needsLesson() {
  if (progress.lessonDone === null) {
    progress.lessonDone = !isFirstVisit();
    saveProgress();
  }
  return !progress.lessonDone;
}

function isFirstVisit() {
  return !loadSavedGame() && Object.keys(progress.starsByLevel).length === 0;
}

function showLesson() {
  silenceStardust();
  openLesson(markLessonDone);
}

function markLessonDone() {
  progress.lessonDone = true;
  saveProgress();
}

// ---------- Rendering ----------

const boardEl = document.getElementById("board");
const numpadEl = document.getElementById("numpad");
const overlayEl = document.getElementById("overlay");
const overlayStarsEl = document.getElementById("overlay-stars");
let cells = [];

function createCellsOnBoard() {
  const shape = currentShape();
  boardEl.style.setProperty("--board-size", shape.size);
  cells = Array.from({ length: cellCountOf(shape) }, (_, cellIndex) => {
    const cell = createCell(shape, cellIndex);
    cell.dataset.testid = "cell";
    cell.setAttribute("role", "button");
    cell.addEventListener("click", () => selectCell(cellIndex));
    return cell;
  });
  boardEl.replaceChildren(...cells);
}

function refreshGame() {
  renderBoard();
  renderStats();
  renderTwirl();
  renderOverlay();
}

// On start and reload the board must be in place at once instead of twirling into position
function refreshGameWithoutAnimation() {
  boardEl.classList.add("no-anim");
  refreshGame();
  forceReflow(boardEl);
  boardEl.classList.remove("no-anim");
}

function renderBoard() {
  const conflicts = findConflicts(currentShape(), state.board);
  cells.forEach((cell, cellIndex) => renderCell(cell, cellIndex, conflicts));
}

function renderCell(cell, cellIndex, conflicts) {
  const digit = state.board[cellIndex];
  const isSelected = cellIndex === selectedCellIndex;
  const isRelated = !isSelected && selectedCellIndex !== null && isInSameRowColumnOrBox(currentShape(), cellIndex, selectedCellIndex);
  showCellPicture(cell, digit);
  cell.classList.toggle("given", state.puzzle[cellIndex] !== EMPTY);
  cell.classList.toggle("selected", isSelected);
  cell.classList.toggle("related", isRelated);
  cell.classList.toggle("same", !isSelected && digit !== EMPTY && digit === selectedDigit());
  cell.classList.toggle("conflict", conflicts.has(cellIndex));
}

function selectedDigit() {
  return selectedCellIndex === null ? EMPTY : state.board[selectedCellIndex];
}

function renderStats() {
  document.getElementById("level").textContent = `${state.level} / ${LEVEL_COUNT}`;
}

function renderTwirl() {
  boardEl.style.setProperty("--rot", state.twirls);
  boardEl.classList.toggle("twirl-soon", isTwirlNext());
}

// ---------- Sweep: a row, column or box completed ----------

const SWEEP_BANNER_MS = 1600; // matches the sweep-banner animation in style.css
const UNIT_NAME_KEYS = { row: "unitRow", column: "unitColumn", box: "unitBox" };
const UNIT_NAME_ORDER = Object.keys(UNIT_NAME_KEYS);
const sweepBannerEl = document.getElementById("sweep-banner");
let sweepBannerTimer = null;

function celebrateSweep(units) {
  playSweepWave(units);
  showSweepBanner(units);
}

// Each unit lights up cell by cell, like a wave running through it
function playSweepWave(units) {
  const stepByCell = new Map();
  for (const unit of units) {
    unit.cells.forEach((cellIndex, step) => {
      if (!stepByCell.has(cellIndex)) stepByCell.set(cellIndex, step);
    });
  }
  for (const [cellIndex, step] of stepByCell) {
    cells[cellIndex].style.setProperty("--sweep-step", step);
    restartAnimation(cells[cellIndex], "swept");
  }
}

function showSweepBanner(units) {
  const visibleKinds = units.map(visibleKindOf);
  visibleKinds.sort((first, second) => UNIT_NAME_ORDER.indexOf(first) - UNIT_NAME_ORDER.indexOf(second));
  const names = visibleKinds.map((kind) => translate(UNIT_NAME_KEYS[kind]));
  sweepBannerEl.textContent = translate("sweep", names);
  restartAnimation(sweepBannerEl, "show");
  clearTimeout(sweepBannerTimer);
  sweepBannerTimer = setTimeout(hideSweepBanner, SWEEP_BANNER_MS);
}

function hideSweepBanner() {
  clearTimeout(sweepBannerTimer);
  sweepBannerEl.textContent = "";
}

// After a quarter or three-quarter turn a row runs up and down the screen,
// so the banner names the line the way the player sees it
function visibleKindOf(unit) {
  const isTurnedSideways = state.twirls % 2 === 1;
  if (!isTurnedSideways || unit.kind === "box") return unit.kind;
  return unit.kind === "row" ? "column" : "row";
}

function renderOverlay() {
  const screen = overlayScreenFor(state.status);
  overlayEl.hidden = !screen;
  if (!screen) return;
  // A sweep from the move before the last would otherwise cover the stars
  hideSweepBanner();
  document.getElementById("overlay-title").textContent = screen.title;
  document.getElementById("overlay-text").textContent = translate("starsText", bestStarsFor(state.level), STARS.length);
  renderStarList(bestStarsFor(state.level));
  const button = document.getElementById("overlay-button");
  button.textContent = screen.button;
  button.onclick = screen.action;
}

// Every star is listed, the missing ones dimmed, so the child sees how to earn them
function renderStarList(earnedStars) {
  overlayStarsEl.replaceChildren(...STARS.map((star, index) => {
    const item = document.createElement("li");
    item.className = index < earnedStars ? "star earned" : "star missing";
    item.append(createIcon(star.spriteId), translate(star.labelKey, CAREFUL_OOPSIES_LIMIT));
    return item;
  }));
}

// While playing there is no overlay
function overlayScreenFor(status) {
  const screens = {
    [STATUS.WON]: {
      title: translate("wonTitle", state.level),
      button: translate("wonButton"),
      action: () => startLevel(state.level + 1),
    },
    [STATUS.FINISHED]: {
      title: translate("finishedTitle"),
      button: translate("finishedButton"),
      action: () => startLevel(FIRST_LEVEL),
    },
  };
  return screens[status];
}

// ---------- Input ----------

// The picture buttons fit on one row while they are few enough to stay big on a phone
const MOST_NUMPAD_BUTTONS_IN_ONE_ROW = 5;

function createNumpadButtons() {
  const buttons = [...digitsOf(currentShape()), EMPTY].map(createNumpadButton);
  numpadEl.style.setProperty("--numpad-columns", numpadColumnsFor(buttons.length));
  numpadEl.replaceChildren(...buttons);
}

function createNumpadButton(digit) {
  const button = document.createElement("button");
  if (digit === EMPTY) {
    button.dataset.i18n = "erase";
    button.textContent = translate("erase");
  } else {
    button.append(createIcon(symbolSpriteIdFor(digit)));
    button.setAttribute("aria-label", symbolNameFor(digit));
  }
  button.addEventListener("click", () => enterDigit(digit));
  return button;
}

function numpadColumnsFor(buttonCount) {
  return buttonCount <= MOST_NUMPAD_BUTTONS_IN_ONE_ROW ? buttonCount : Math.ceil(buttonCount / 2);
}

function handleKeyDown(event) {
  if (isLessonOpen()) return;
  const digit = Number(event.key);
  if (digitsOf(currentShape()).includes(digit)) enterDigit(digit);
  else if (ERASE_KEYS.includes(event.key)) enterDigit(EMPTY);
}

// Stars are kept: a reset only starts the journey over
function confirmAndResetGame() {
  if (confirm(translate("resetConfirm"))) startLevel(FIRST_LEVEL);
}

// The pictures' names are read aloud, so they change language too
function switchLanguage() {
  toggleLanguage();
  createNumpadButtons();
  renderBoard();
  renderOverlay();
  translateLesson();
  silenceStardust();
}

document.addEventListener("keydown", handleKeyDown);
document.getElementById("reset").addEventListener("click", confirmAndResetGame);
document.getElementById("lang").addEventListener("click", switchLanguage);
// The lesson covers the game, so it has its own language button
document.getElementById("lesson-lang").addEventListener("click", switchLanguage);
document.getElementById("how-to-play").addEventListener("click", showLesson);

// ---------- Start ----------

const isLessonNeeded = needsLesson(); // decided before the game is saved, which would end the first visit
resumeOrStartGame();
if (isLessonNeeded) showLesson();
