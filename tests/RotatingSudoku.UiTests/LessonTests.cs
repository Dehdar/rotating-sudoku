using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class LessonTests : SudokuTest
{
    [Test]
    public async Task AFirstVisitStartsWithTheLesson()
    {
        await Game.OpenNewGameAsync();

        await Expect(Game.Lesson).ToBeVisibleAsync();
    }

    [Test]
    public async Task TheLessonStartsWithOneEmptyCell()
    {
        await Game.OpenNewGameAsync();

        await Expect(Game.LessonEmptyCells).ToHaveCountAsync(1);
    }

    [Test]
    public async Task AWrongPictureIsNotPlacedInTheLesson()
    {
        await Game.OpenNewGameAsync();

        await Game.LessonButton("Star").ClickAsync();

        await Expect(Game.LessonEmptyCells).ToHaveCountAsync(1);
    }

    [Test]
    public async Task TheSecondLessonBoardHasTwoEmptyCells()
    {
        await Game.OpenNewGameAsync();

        await Game.LessonButton("Heart").ClickAsync();

        await Expect(Game.LessonEmptyCells).ToHaveCountAsync(2);
    }

    [Test]
    public async Task FinishingTheLessonLeadsToLevelOne()
    {
        await Game.OpenNewGameAsync();

        await Game.PlayTheLessonAsync();

        await Expect(Game.Lesson).ToBeHiddenAsync();
        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task TheLessonCanBeSkipped()
    {
        await Game.OpenNewGameAsync();

        await Game.LessonButton("Skip").ClickAsync();

        await Expect(Game.Lesson).ToBeHiddenAsync();
    }

    [Test]
    public async Task ASkippedLessonIsNotShownAgain()
    {
        await Game.OpenNewGameAsync();
        await Game.LessonButton("Skip").ClickAsync();

        await Game.ReloadAsync();

        await Expect(Game.Lesson).ToBeHiddenAsync();
    }

    [Test]
    public async Task ALessonLeftHalfwayIsShownAgainAfterReloading()
    {
        await Game.OpenNewGameAsync();
        await Game.LessonButton("Heart").ClickAsync();

        await Game.ReloadAsync();

        await Expect(Game.Lesson).ToBeVisibleAsync();
    }

    [Test]
    public async Task TheLessonCanBeReplayedFromTheHowToPlayButton()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.Button("How to play").ClickAsync();

        await Expect(Game.Lesson).ToBeVisibleAsync();
    }

    [Test]
    public async Task MistakesInTheLessonNeverCountAsOopsies()
    {
        await Game.OpenAsync(new SavedGame { EmptyCells = [Cell.TopLeft] });
        await Game.Button("How to play").ClickAsync();
        foreach (var wrongName in new[] { "Star", "Moon", "Flower" }) await Game.LessonButton(wrongName).ClickAsync();
        await Game.PlayTheLessonAsync();

        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));

        await Expect(Game.Text("You have 2 of 2 stars on this level.")).ToBeVisibleAsync();
    }

    [Test]
    public async Task APlayerWithStarsFromBeforeTheLessonDoesNotSeeIt()
    {
        await Game.OpenAsync(SavedProgress.WithStars(level: 1, stars: 1));

        await Expect(Game.Lesson).ToBeHiddenAsync();
    }

    [Test]
    public async Task APlayerWithAGameFromBeforeTheLessonDoesNotSeeIt()
    {
        await Game.OpenAsync(new SavedGame());

        await Expect(Game.Lesson).ToBeHiddenAsync();
    }

    // The game behind the lesson is inert, so the lesson has its own language button
    [Test]
    public async Task TheLessonCanBeSwitchedToDanish()
    {
        await Game.OpenNewGameAsync();

        await Game.LessonButton("Dansk").ClickAsync();

        await Expect(Game.LessonButton("Spring over")).ToBeVisibleAsync();
        await Expect(Game.LessonButton("Hjerte")).ToBeVisibleAsync();
    }

    [Test]
    public async Task AWrongPictureInTheLessonIsMarkedWithoutMotionUnderReducedMotion()
    {
        await Game.UseReducedMotionAsync();
        await Game.OpenNewGameAsync();

        await Game.LessonButton("Star").ClickAsync();

        await Expect(Game.LessonEmptyCells.Locator("span")).ToHaveCSSAsync("animation-name", "oops-flash");
    }
}