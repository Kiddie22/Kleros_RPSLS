import Game from "../models/game.model.js";

const createNewGame = async (req, res) => {
  const { contractAddress, stake, player1, player2 } = req.body;
  const game = new Game({ contractAddress, stake, player1, player2 });
  await game.save();
  res.status(201).json(game);
};

const getAllGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const totalGames = await Game.countDocuments();
    const totalPages = Math.ceil(totalGames / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const games = await Game.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      games,
      pagination: {
        currentPage: page,
        totalPages,
        totalGames,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createNewGame, getAllGames };
