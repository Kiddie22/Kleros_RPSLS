import express from "express";
import { createNewGame, getAllGames } from "../controllers/game.controller.js";

const router = express.Router();

router.post("/new-game", createNewGame);
router.get("/all", getAllGames);

export default router;
