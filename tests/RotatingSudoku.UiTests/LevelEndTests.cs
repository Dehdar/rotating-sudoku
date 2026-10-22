using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class LevelEndTests : SudokuTest
{
    private const int LastLevel = 20;

    private static readonly SavedGame OneCellFromSolved = new() { EmptyCells = [Cell.TopLeft] };

    [Test]
    public async Task SolvingTheBoardShowsLevelComplete()
    {
        await Game.OpenAsync(OneCellFromSolved);

        await SolveLastCellAsync();

        await Expect(Game.Heading("Level 16 complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task NextLevelButtonStartsTheNextLevel()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await SolveLastCellAsync();

        await Game.Button("Next level").ClickAsync();

        await Expect(Game.Text("17 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task SolvingTheLastLevelShowsAllLevelsComplete()
    {
        await Game.OpenAsync(OneCellFromSolved with { Level = LastLevel });

        await SolveLastCellAsync();

        await Expect(Game.Heading("You beat all 20 levels!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task PlayAgainAfterTheLastLevelStartsOverFromLevelOne()
    {
        await Game.OpenAsync(OneCellFromSolved with { Level = LastLevel });
        await SolveLastCellAsync();

        await Game.Button("Play again").ClickAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    private async Task SolveLastCellAsync() =>
        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));

    // Filling the top-left cell completes a row, column and box; the banner would still be up
    // when the last cell solves the level, right over the stars
    [Test]
    public async Task TheSweepBannerIsGoneWhenTheLevelIsComplete()
    {
        var shape = BoardShape.FourByFour;
        await Game.OpenAsync(new SavedGame { Level = 1, Shape = shape, EmptyCells = [Cell.TopLeft, Cell.BottomRightOf(shape)] });
        await Game.EnterDigitAsync(Cell.TopLeft, shape.SolutionAt(Cell.TopLeft));

        await Game.EnterDigitAsync(Cell.BottomRightOf(shape), shape.SolutionAt(Cell.BottomRightOf(shape)));

        await Expect(Game.Heading("Level 1 complete!")).ToBeVisibleAsync();
        await Expect(Game.Text("Row + Column + Box complete!")).ToBeHiddenAsync();
    }
}