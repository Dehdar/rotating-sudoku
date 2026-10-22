using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class GrowingBoardsTests : SudokuTest
{
    private const string ThickLine = "3px";
    private const string ThinLine = "1px";
    private const int LastFourByFourLevel = 5;
    private const int FirstSixBySixLevel = 6;
    private const int PhoneWidth = 375;
    private const int PhoneHeight = 812;
    private const int LaptopWidth = 800;
    private const int LaptopHeight = 609;
    private const float SmallestNineByNineCellOnAPhone = 39;

    private static readonly SavedGame FourByFourLevel = new() { Level = 1, Shape = BoardShape.FourByFour };
    private static readonly SavedGame SixBySixLevel = new() { Level = FirstSixBySixLevel, Shape = BoardShape.SixBySix };

    [Test]
    public async Task ANewGameStartsOnAFourByFourBoard()
    {
        await Game.OpenNewGameAsync();

        await Expect(Game.Cells).ToHaveCountAsync(BoardShape.FourByFour.CellCount);
    }

    [Test]
    public async Task AFourByFourBoardHasPictureButtonsUpToTheFlower()
    {
        await Game.OpenAsync(FourByFourLevel);

        await Expect(Game.PictureButton("Flower")).ToBeVisibleAsync();
        await Expect(Game.PictureButton("Raindrop")).ToHaveCountAsync(0);
    }

    [Test]
    public async Task ASixBySixBoardHasThirtySixCellsAndPictureButtonsUpToTheCrown()
    {
        await Game.OpenAsync(SixBySixLevel);

        await Expect(Game.Cells).ToHaveCountAsync(BoardShape.SixBySix.CellCount);
        await Expect(Game.PictureButton("Crown")).ToBeVisibleAsync();
        await Expect(Game.PictureButton("Gem")).ToHaveCountAsync(0);
    }

    [Test]
    public async Task BoxesOnAFourByFourBoardAreTwoByTwo()
    {
        await Game.OpenAsync(FourByFourLevel);

        await Expect(Game.CellAt(new Cell(0, 1))).ToHaveCSSAsync("border-right-width", ThickLine);
        await Expect(Game.CellAt(new Cell(1, 0))).ToHaveCSSAsync("border-bottom-width", ThickLine);
    }

    [Test]
    public async Task BoxesOnASixBySixBoardAreThreeWideAndTwoTall()
    {
        await Game.OpenAsync(SixBySixLevel);

        await Expect(Game.CellAt(new Cell(0, 1))).ToHaveCSSAsync("border-right-width", ThinLine);
        await Expect(Game.CellAt(new Cell(0, 2))).ToHaveCSSAsync("border-right-width", ThickLine);
        await Expect(Game.CellAt(new Cell(1, 0))).ToHaveCSSAsync("border-bottom-width", ThickLine);
        await Expect(Game.CellAt(new Cell(2, 0))).ToHaveCSSAsync("border-bottom-width", ThinLine);
    }

    [Test]
    public async Task KeysAboveTheBoardSizeAreIgnored()
    {
        await Game.OpenAsync(FourByFourLevel);

        await Game.TypeKeyAsync(Cell.TopLeft, "5");

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync(Symbols.EmptyCell);
    }

    [Test]
    public async Task SolvingAFourByFourBoardCompletesTheLevel()
    {
        await Game.OpenAsync(FourByFourLevel with { EmptyCells = [Cell.TopLeft] });

        await Game.EnterDigitAsync(Cell.TopLeft, BoardShape.FourByFour.SolutionAt(Cell.TopLeft));

        await Expect(Game.Heading("Level 1 complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task TheBoardGrowsToSixBySixAfterTheLastFourByFourLevel()
    {
        await Game.OpenAsync(FourByFourLevel with { Level = LastFourByFourLevel, EmptyCells = [Cell.TopLeft] });
        await Game.EnterDigitAsync(Cell.TopLeft, BoardShape.FourByFour.SolutionAt(Cell.TopLeft));

        await Game.Button("Next level").ClickAsync();

        await Expect(Game.Cells).ToHaveCountAsync(BoardShape.SixBySix.CellCount);
    }

    [Test]
    public async Task NineByNineCellsUseNearlyTheWholePhoneWidth()
    {
        await Game.ResizeWindowAsync(PhoneWidth, PhoneHeight);

        await Game.OpenAsync(new SavedGame());

        var cell = await Game.CellAt(Cell.TopLeft).BoundingBoxAsync();
        Assert.That(cell!.Width, Is.GreaterThanOrEqualTo(SmallestNineByNineCellOnAPhone));
    }

    [Test]
    public async Task ThePictureButtonsFitInAShortLaptopWindow()
    {
        await Game.ResizeWindowAsync(LaptopWidth, LaptopHeight);

        await Game.OpenAsync(FourByFourLevel);

        await Expect(Game.PictureButton("Heart")).ToBeInViewportAsync(new() { Ratio = 1 });
        await Expect(Game.Button("Erase")).ToBeInViewportAsync(new() { Ratio = 1 });
    }
}