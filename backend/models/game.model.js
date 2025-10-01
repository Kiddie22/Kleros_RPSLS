import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true,
  },
  player1: {
    type: String,
    required: true,
  },
  player2: {
    type: String,
    required: true,
  },
  stake: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
