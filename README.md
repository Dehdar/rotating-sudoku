# Rainbow Kingdom Sudoku

A calm picture sudoku for children aged 6–12. The board grows from 4x4 to 9x9, twirls now and then, and Stardust the unicorn cheers you on. There is no timer and no game over; finishing a level earns stars. Written in plain HTML, CSS and JavaScript — no frameworks, no build step, no dependencies.

**▶ [Play it in your browser](https://dehdar.github.io/rotating-sudoku/)**

## Rules

- **A first lesson, learnt by playing:** on a first visit, two tiny 4x4 boards show that each picture goes once in every row, column and box (the row, column and box around the empty cell light up). It can be skipped, is never scored, has its own language button, and can be played again from the **?** button.
- **No timer and no game over.** Take as long as you like; a level only ends when you solve it.
- **Pictures instead of numbers:** heart, star, moon and flower on 4x4 boards; raindrop and crown join on 6x6; gem, rainbow and unicorn complete the nine on 9x9. Every picture has its own shape, so the game works without telling colours apart. Each picture goes once in every row, column and box.
- **The board grows with you** over 20 levels: 4x4 on levels 1–5, 6x6 (boxes two rows tall and three columns wide) on levels 6–15, and the classic 9x9 on levels 16–20. Within each size the levels give fewer pictures as you go.
- Every puzzle is generated fresh and is guaranteed to have exactly one solution.
- Finishing a level earns **stars**: one for finishing, and a second "careful" star if you made 2 oopsies or fewer (an oops is a picture that is not the right answer, even if you fix it later). Replaying a level can earn more stars but never takes any away.
- Your game and your stars are saved in the browser, so you continue where you left off. The **Reset game** button starts over from level 1 and keeps your stars.
- From level 3 the board does a **twirl**: after every few correct pictures it turns a quarter turn clockwise. The pictures stay upright. The board glows when one more correct picture will twirl it. Levels 1 and 2 never twirl, and wrong pictures do not count towards a twirl.
- Two of the same picture in a row, column or box get a dotted plum ring, and a picture that is not the right answer gives a little wobble (with reduced motion: a brief ring instead).
- Fill in a whole row, column or box correctly and it lights up with a **sweep**. The banner names lines the way you see them, so on a board turned on its side a row is called a column.
- **Stardust**, a young unicorn who is still learning magic, keeps you company. She cheers when you work something out, comforts you after a mistake, and blames her own wobbly spells when the board twirls.
- Available in English and Danish (toggle in the game).

## Controls

- Tap a cell to select it, then tap a picture button. On a keyboard, the digits work too: **1** is the heart, **2** the star, and so on (**1–4**, **1–6** or **1–9**, depending on the board).
- **Backspace**, **Delete**, **0** or the **Erase** button clears a picture.

## Running it locally

Open `index.html` directly in a browser — that's it.

Alternatively, serve the folder with any static file server. The repo includes one that needs only PowerShell 7:

```bash
pwsh -File tools/serve.ps1
```

Then open <http://localhost:5173/>. Any other static server works too, such as `npx serve` or `python -m http.server`.

## Project structure

```
rotating-sudoku/
├── index.html        Page markup, the picture sprite and Stardust's mood SVGs
├── style.css         Styling and animations
├── storage.js        Safe localStorage access
├── dom.js            Small DOM/animation helpers
├── i18n.js           English and Danish translations
├── sudoku.js         Pure board logic: generating, solving, checking
├── symbols.js        The pictures that stand for the digits (drawn from the SVG sprite in index.html)
├── cells.js          How a board cell is drawn, shared by the game and the lesson
├── mascot.js         Stardust the unicorn and her lines
├── lesson.js         The first lesson, learnt by playing
├── game.js           Game flow, stars and rendering
├── tests/            UI tests (.NET + Playwright, NUnit)
├── tools/serve.ps1   Tiny static server for local play (PowerShell 7)
├── CLAUDE.md         Guidance for Claude Code
└── LICENSE           The Unlicense (public domain)
```

## UI tests

The UI tests live in `tests/RotatingSudoku.UiTests` and use [Playwright for .NET](https://playwright.dev/dotnet/) with NUnit. They require the .NET 10 SDK:

```bash
dotnet test tests/RotatingSudoku.UiTests
```

The first time on a new machine, build once and install the test browser:

```bash
pwsh tests/RotatingSudoku.UiTests/bin/Debug/net10.0/playwright.ps1 install chromium
```

The tests open the game straight from disk, so no server is needed. They use a fake clock and a fixed `Math.random`, so they run in a few seconds and give the same result every time.

## License

This project is released into the public domain under [The Unlicense](LICENSE). You are free to use, copy, modify, publish and distribute everything here, for any purpose, without asking and without giving credit.
