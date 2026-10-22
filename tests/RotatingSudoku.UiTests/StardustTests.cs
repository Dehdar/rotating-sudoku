using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class StardustTests : SudokuTest
{
    private const int ReactionSeconds = 4;

    [Test]
    public async Task StardustSpeaksWhenTheGameOpens()
    {
        await Game.OpenAsync(new SavedGame());

        await Expect(Game.StardustSpeech).ToBeVisibleAsync();
    }

    [Test]
    public async Task StardustGoesQuietAfterAFewSeconds()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.WaitSecondsAsync(ReactionSeconds);

        await Expect(Game.StardustSpeech).ToBeHiddenAsync();
    }

    [Test]
    public async Task StardustComfortsAfterAWrongPicture()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.SelectCellAsync(Cell.TopLeft);
        await Game.WaitSecondsAsync(ReactionSeconds);
        var wrongDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.PictureButton(Symbols.NameOf(wrongDigit)).ClickAsync();

        await Expect(Game.StardustSpeech).ToBeVisibleAsync();
    }

    [Test]
    public async Task StardustReactsWhenARowIsCompleted()
    {
        await Game.OpenAsync(new SavedGame { EmptyCells = [Cell.TopLeft, Cell.BelowTopLeft] });
        await Game.SelectCellAsync(Cell.TopLeft);
        await Game.WaitSecondsAsync(ReactionSeconds);
        var rightDigit = SavedGame.SolutionAt(Cell.TopLeft);

        await Game.PictureButton(Symbols.NameOf(rightDigit)).ClickAsync();

        await Expect(Game.StardustSpeech).ToBeVisibleAsync();
    }

    // With Math.random at 0 the old cat would always have shoved the board after a wrong picture
    [Test]
    public async Task StardustNeverShakesTheBoard()
    {
        await Game.FixRandomAsync(0);
        await Game.OpenAsync(new SavedGame());
        var wrongDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.EnterDigitAsync(Cell.TopLeft, wrongDigit);

        await Expect(Game.StardustSpeech).ToBeVisibleAsync();
        await Expect(Game.BoardFrame).ToHaveCSSAsync("animation-name", "none");
    }

    [TestCase("en")]
    [TestCase("da")]
    public async Task StardustHasLinesForEveryEventInBothLanguages(string language)
    {
        await Game.OpenAsync(new SavedGame());
        var stardust = new StardustLines(Page);

        var events = await stardust.EventsAsync();
        var lines = await stardust.LinesInAsync(language);

        Assert.That(events, Is.SubsetOf(lines.Keys));
        Assert.That(events.Select(evt => lines[evt]), Has.All.Not.Empty);
    }

    // The board shows pictures, so a line about a number would make no sense to the child
    [TestCase("en")]
    [TestCase("da")]
    public async Task NoLineMentionsADigit(string language)
    {
        await Game.OpenAsync(new SavedGame());

        var lines = await new StardustLines(Page).LinesInAsync(language);

        Assert.That(lines.Values.SelectMany(eventLines => eventLines), Has.None.Matches<string>(line => line.Any(char.IsDigit)));
    }

    [Test]
    public async Task ThePageIsCalledRainbowKingdomSudoku()
    {
        await Game.OpenAsync(new SavedGame());

        await Expect(Page).ToHaveTitleAsync("Rainbow Kingdom Sudoku");
        await Expect(Game.Heading("Rainbow Kingdom Sudoku")).ToBeVisibleAsync();
    }

    // Reloading shows the same board, so a "new puzzle" line would be untrue
    [Test]
    public async Task StardustWelcomesThePlayerBackToTheSameBoard()
    {
        await Game.OpenAsync(new SavedGame());

        var welcomeBackLines = (await new StardustLines(Page).LinesInAsync("en"))["resume"];

        await Expect(Game.StardustSpeech).ToHaveTextAsync(OneOf(welcomeBackLines));
    }

    [Test]
    public async Task StardustAnnouncesANewPuzzleWhenTheNextLevelStarts()
    {
        await Game.OpenAsync(new SavedGame { EmptyCells = [Cell.TopLeft] });
        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));

        await Game.Button("Next level").ClickAsync();

        var startLines = (await new StardustLines(Page).LinesInAsync("en"))["start"];
        await Expect(Game.StardustSpeech).ToHaveTextAsync(OneOf(startLines));
    }

    private static Regex OneOf(IEnumerable<string> lines) => new($"^({string.Join("|", lines.Select(Regex.Escape))})$");
}