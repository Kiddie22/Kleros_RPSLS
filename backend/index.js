import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/connectDB.js";
import gameRoute from "./routes/game.route.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api/game", gameRoute);

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: err.stack,
    status: err.status,
  });
});

app.listen(3000, () => {
  connectDB();
  console.log("Server is running on port 3000");
});
