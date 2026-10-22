// The first lesson, learnt by playing: a 4x4 board with one empty cell, then one with two.
// The row, column and box around the empty cell light up, to show that each picture goes
// once in every row, column and box. It is practice only: it never counts oopsies or stars.

const LESSON_SHAPE = BOARD_SHAPES.FOUR_BY_FOUR;
const LESSON_SOLUTION = Object.freeze([1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1]);
const LESSON_STEPS = Object.freeze([{ emptyCells: [6] }, { emptyCells: [1, 11] }]);

const lessonEl = document.getElementById("lesson");
const gameEl = document.querySelector("main");
const lessonBoardEl = document.getElementById("lesson-board");
const lessonPicturesEl = document.getElementById("lesson-pictures");
const lessonFinishedEl = document.getElementById("lesson-finished");
const lessonSkipEl = document.getElementById("lesson-skip");
let lessonBoard = [];
let lessonStep = 0;
let lessonCells = [];
let whenLessonCloses = null;

function openLesson(onClose) {
  whenLessonCloses = onClose;
  showLessonInsteadOfGame(true);
  createLessonCells();
  createLessonPictureButtons();
  startLessonStep(0);
}

// The pictures' names are read aloud, so they follow a language switch during the lesson
function translateLesson() {
  if (!isLessonOpen()) return;
  createLessonPictureButtons();
  renderLesson();
}

function isLessonOpen() {
  return !lessonEl.hidden;
}

function closeLesson() {
  showLessonInsteadOfGame(false);
  whenLessonCloses();
}

// The game behind the lesson can be neither clicked nor read out while the lesson is open
function showLessonInsteadOfGame(isLessonShown) {
  lessonEl.hidden = !isLessonShown;
  gameEl.inert = isLessonShown;
}

function createLessonCells() {
  lessonBoardEl.style.setProperty("--board-size", LESSON_SHAPE.size);
  lessonCells = LESSON_SOLUTION.map((_, cellIndex) => {
    const cell = createCell(LESSON_SHAPE, cellIndex);
    cell.setAttribute("role", "img");
    return cell;
  });
  lessonBoardEl.replaceChildren(...lessonCells);
}

function createLessonPictureButtons() {
  lessonPicturesEl.replaceChildren(...digitsOf(LESSON_SHAPE).map((digit) => {
    const button = document.createElement("button");
    button.append(createIcon(symbolSpriteIdFor(digit)));
    button.setAttribute("aria-label", symbolNameFor(digit));
    button.addEventListener("click", () => tryLessonPicture(digit));
    return button;
  }));
}

function startLessonStep(step) {
  lessonStep = step;
  lessonBoard = LESSON_SOLUTION.map((digit, cellIndex) => (LESSON_STEPS[step].emptyCells.includes(cellIndex) ? EMPTY : digit));
  renderLesson();
}

// The first empty cell is the one to fill, so the child never has to pick a cell
function activeLessonCell() {
  return lessonBoard.indexOf(EMPTY);
}

// A wrong picture is not placed: the cell wobbles and the child simply tries again
function tryLessonPicture(digit) {
  const cellIndex = activeLessonCell();
  if (digit !== LESSON_SOLUTION[cellIndex]) {
    restartAnimation(lessonCells[cellIndex], "wobble");
    return;
  }
  lessonBoard[cellIndex] = digit;
  const isStepDone = activeLessonCell() === -1;
  if (isStepDone && lessonStep + 1 < LESSON_STEPS.length) startLessonStep(lessonStep + 1);
  else renderLesson();
}

function renderLesson() {
  const activeCell = activeLessonCell();
  const isFinished = activeCell === -1;
  const focusedCells = isFinished ? [] : unitsThrough(LESSON_SHAPE, activeCell).flatMap((unit) => unit.cells);
  lessonCells.forEach((cell, cellIndex) => {
    showCellPicture(cell, lessonBoard[cellIndex]);
    cell.classList.toggle("given", !isLessonAnswer(cellIndex));
    cell.classList.toggle("selected", cellIndex === activeCell);
    cell.classList.toggle("related", cellIndex !== activeCell && focusedCells.includes(cellIndex));
  });
  lessonPicturesEl.hidden = isFinished;
  lessonFinishedEl.hidden = !isFinished;
  lessonSkipEl.hidden = isFinished;
}

function isLessonAnswer(cellIndex) {
  return LESSON_STEPS[lessonStep].emptyCells.includes(cellIndex);
}

lessonSkipEl.addEventListener("click", closeLesson);
document.getElementById("lesson-play").addEventListener("click", closeLesson);
